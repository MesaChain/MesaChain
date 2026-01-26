"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "../lib/utils";
import {
  defaultSoundForType,
  useNotificationStore,
} from "../store/useNotificationStore";
import {
  NotificationItem,
  NotificationPosition,
  NotificationType,
} from "../types/notifications";
import { useNotificationSocket } from "../lib/hooks/useNotificationSocket";

const typeStyles: Record<NotificationType, string> = {
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-900",
  error: "border-rose-500/40 bg-rose-500/10 text-rose-900",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-900",
  info: "border-sky-500/40 bg-sky-500/10 text-sky-900",
};

const typeIcons: Record<NotificationType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const positionStyles: Record<NotificationPosition, string> = {
  "top-right": "top-6 right-6 items-end",
  "top-left": "top-6 left-6 items-start",
  "bottom-right": "bottom-6 right-6 items-end",
  "bottom-left": "bottom-6 left-6 items-start",
};

const historyDateFilters = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "month", label: "Last 30 days" },
] as const;

type HistoryDateFilter = (typeof historyDateFilters)[number]["value"];

type NotificationHubProps = {
  maxVisible?: number;
  position?: NotificationPosition;
  enableSocket?: boolean;
  socketRoom?: string;
  socketEventName?: string;
  showHistory?: boolean;
  onAction?: (actionId: string, notification: NotificationItem) => void;
};

const formatTimestamp = (value: number) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const matchesDateFilter = (value: number, filter: HistoryDateFilter) => {
  if (filter === "all") return true;
  const now = new Date();
  const date = new Date(value);

  if (filter === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return date >= start;
  }

  if (filter === "week") {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= start;
  }

  const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return date >= start;
};

export default function NotificationHub({
  maxVisible,
  position,
  enableSocket = true,
  socketRoom,
  socketEventName,
  showHistory = true,
  onAction,
}: NotificationHubProps) {
  const notifications = useNotificationStore((state) => state.notifications);
  const settings = useNotificationStore((state) => state.settings);
  const lastAddedId = useNotificationStore((state) => state.lastAddedId);
  const dismissNotification = useNotificationStore(
    (state) => state.dismissNotification
  );
  const addNotification = useNotificationStore((state) => state.addNotification);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const clearHistory = useNotificationStore((state) => state.clearHistory);
  const setSettings = useNotificationStore((state) => state.setSettings);

  useNotificationSocket({
    enabled: enableSocket,
    room: socketRoom,
    eventName: socketEventName,
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">(
    "all"
  );
  const [dateFilter, setDateFilter] = useState<HistoryDateFilter>("all");
  const [announcement, setAnnouncement] = useState<string>("");
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

  const timersRef = useRef(
    new Map<
      string,
      { timeoutId: number | null; remaining: number; startedAt: number | null }
    >()
  );
  const pausedIds = useRef(new Set<string>());
  const playedSoundIds = useRef(new Set<string>());
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (maxVisible || position) {
      setSettings({
        maxVisible: maxVisible ?? settings.maxVisible,
        position: position ?? settings.position,
      });
    }
  }, [maxVisible, position, setSettings, settings.maxVisible, settings.position]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    (window as Window & { notify?: typeof addNotification }).notify =
      addNotification;
    return () => {
      delete (window as Window & { notify?: typeof addNotification }).notify;
    };
  }, [addNotification]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readAt).length,
    [notifications]
  );

  const activeNotifications = useMemo(
    () =>
      notifications
        .filter((notification) => !notification.dismissedAt)
        .sort((a, b) => b.createdAt - a.createdAt),
    [notifications]
  );

  const visibleCount = maxVisible ?? settings.maxVisible;
  const isBottomPosition = (position ?? settings.position).startsWith("bottom");
  const isRightPosition = (position ?? settings.position).includes("right");

  const visibleNotifications = activeNotifications.slice(0, visibleCount);
  const displayedNotifications = isBottomPosition
    ? [...visibleNotifications].reverse()
    : visibleNotifications;

  const historyNotifications = useMemo(() => {
    return notifications
      .filter((notification) => {
        const typeMatches =
          typeFilter === "all" || notification.type === typeFilter;
        const dateMatches = matchesDateFilter(
          notification.createdAt,
          dateFilter
        );
        return typeMatches && dateMatches;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [notifications, typeFilter, dateFilter]);

  const queueCount = Math.max(0, activeNotifications.length - visibleCount);

  useEffect(() => {
    if (!lastAddedId) return;
    const latest = notifications.find((item) => item.id === lastAddedId);
    if (!latest) return;
    if (playedSoundIds.current.has(latest.id)) return;

    const message = latest.title
      ? `${latest.title}. ${latest.message}`
      : latest.message;
    setAnnouncement(message);
    playedSoundIds.current.add(latest.id);

    if (!settings.soundsEnabled) return;
    const sound = latest.sound ?? defaultSoundForType(latest.type, settings);
    if (!sound) return;

    const volume = sound.volume ?? 0.12;

    if (sound.url) {
      const audio = new Audio(sound.url);
      audio.volume = Math.min(Math.max(volume, 0), 1);
      audio.play().catch(() => undefined);
      return;
    }

    if (!sound.tone) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = sound.tone;
      gain.gain.value = volume;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.18);
    } catch {
      // Ignore autoplay restrictions.
    }
  }, [lastAddedId, notifications, settings]);

  useEffect(() => {
    displayedNotifications.forEach((notification) => {
      const duration = notification.duration ?? settings.autoDismissMs;
      if (duration <= 0) return;

      const existing = timersRef.current.get(notification.id);
      if (!existing) {
        timersRef.current.set(notification.id, {
          timeoutId: null,
          remaining: duration,
          startedAt: null,
        });
      }

      if (pausedIds.current.has(notification.id)) return;
      const entry = timersRef.current.get(notification.id);
      if (!entry || entry.timeoutId) return;

      entry.startedAt = Date.now();
      entry.timeoutId = window.setTimeout(() => {
        handleDismiss(notification.id);
      }, entry.remaining);
    });

    timersRef.current.forEach((entry, id) => {
      const stillVisible = displayedNotifications.some(
        (notification) => notification.id === id
      );
      if (stillVisible) return;
      if (entry.timeoutId && entry.startedAt) {
        window.clearTimeout(entry.timeoutId);
        entry.remaining = Math.max(
          0,
          entry.remaining - (Date.now() - entry.startedAt)
        );
        entry.timeoutId = null;
        entry.startedAt = null;
      }
    });
  }, [displayedNotifications, settings.autoDismissMs]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((entry) => {
        if (entry.timeoutId) window.clearTimeout(entry.timeoutId);
      });
      timersRef.current.clear();
    };
  }, []);

  const handleDismiss = (id: string) => {
    if (exitingIds.has(id)) return;
    setExitingIds((prev) => new Set(prev).add(id));

    const entry = timersRef.current.get(id);
    if (entry?.timeoutId) {
      window.clearTimeout(entry.timeoutId);
    }
    timersRef.current.delete(id);

    window.setTimeout(() => {
      dismissNotification(id);
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 220);
  };

  const pauseTimer = (id: string) => {
    pausedIds.current.add(id);
    const entry = timersRef.current.get(id);
    if (!entry || !entry.timeoutId || !entry.startedAt) return;
    window.clearTimeout(entry.timeoutId);
    entry.timeoutId = null;
    entry.remaining = Math.max(0, entry.remaining - (Date.now() - entry.startedAt));
    entry.startedAt = null;
  };

  const resumeTimer = (id: string) => {
    pausedIds.current.delete(id);
    const entry = timersRef.current.get(id);
    if (!entry || entry.timeoutId || entry.remaining <= 0) return;
    entry.startedAt = Date.now();
    entry.timeoutId = window.setTimeout(() => {
      handleDismiss(id);
    }, entry.remaining);
  };

  const handleItemKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();

    const current = event.currentTarget.querySelector(
      "[data-notification-id]:focus"
    ) as HTMLElement | null;
    const currentId = current?.dataset.notificationId;
    const list = displayedNotifications.map((item) => item.id);
    if (list.length === 0) return;
    const currentIndex = currentId ? list.indexOf(currentId) : -1;
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = Math.min(
      Math.max(currentIndex + direction, 0),
      list.length - 1
    );
    const nextId = list[nextIndex];
    const nextEl = event.currentTarget.querySelector(
      `[data-notification-id="${nextId}"]`
    ) as HTMLElement | null;
    nextEl?.focus();
  };

  if (!notifications) return null;

  return (
    <div
      className={cn(
        "fixed z-50 flex w-[22rem] max-w-[90vw] flex-col gap-3",
        positionStyles[position ?? settings.position],
        isRightPosition ? "items-end" : "items-start"
      )}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      <div className="sr-only" role="status" aria-atomic="true">
        {announcement}
      </div>

      <div
        className={cn(
          "flex w-full items-center justify-between gap-2",
          isRightPosition ? "justify-end" : "justify-start"
        )}
      >
        <button
          type="button"
          onClick={() => setIsHistoryOpen((prev) => !prev)}
          className={cn(
            "relative inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-2 text-xs font-semibold text-foreground shadow-sm backdrop-blur",
            isRightPosition ? "flex-row" : "flex-row-reverse"
          )}
          aria-expanded={isHistoryOpen}
          aria-controls="notification-history"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          <span>Notifications</span>
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[0.65rem] font-semibold text-white">
              {unreadCount}
            </span>
          )}
        </button>
        {queueCount > 0 && (
          <span className="rounded-full bg-muted px-2 py-1 text-[0.65rem] font-semibold text-muted-foreground">
            {queueCount} queued
          </span>
        )}
      </div>

      <div
        className="flex w-full flex-col gap-3"
        onKeyDown={handleItemKeyDown}
        role="list"
      >
        {displayedNotifications.map((notification) => {
          const iconKey =
            notification.icon && notification.icon in typeIcons
              ? (notification.icon as NotificationType)
              : notification.type;
          const Icon = typeIcons[iconKey];
          const tone = typeStyles[notification.type];
          const isExiting = exitingIds.has(notification.id);
          const isUnread = !notification.readAt;

          return (
            <div
              key={notification.id}
              data-notification-id={notification.id}
              role="listitem"
              tabIndex={0}
              onMouseEnter={() => {
                pauseTimer(notification.id);
                markRead(notification.id);
              }}
              onMouseLeave={() => resumeTimer(notification.id)}
              onFocus={() => {
                pauseTimer(notification.id);
                markRead(notification.id);
              }}
              onBlur={() => resumeTimer(notification.id)}
              className={cn(
                "notification-card w-full rounded-2xl border px-4 py-3 text-sm shadow-lg outline-none transition-all",
                tone,
                isUnread ? "ring-1 ring-foreground/10" : "opacity-90",
                isExiting
                  ? "animate-notification-out"
                  : "animate-notification-in",
                "focus-visible:ring-2 focus-visible:ring-foreground/30"
              )}
              aria-live={notification.type === "error" ? "assertive" : "polite"}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded-full bg-background/70 p-1 text-foreground shadow-sm">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {notification.title && (
                        <p className="text-sm font-semibold">
                          {notification.title}
                        </p>
                      )}
                      <p className="text-sm text-foreground/80">
                        {notification.message}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDismiss(notification.id)}
                      className="rounded-full p-1 text-foreground/60 transition hover:text-foreground"
                      aria-label="Dismiss notification"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {typeof notification.progress === "number" && (
                    <div className="h-2 w-full rounded-full bg-black/10">
                      <div
                        className="h-2 rounded-full bg-foreground/70 transition-all"
                        style={{
                          width: `${Math.min(
                            Math.max(notification.progress, 0),
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  )}

                  {notification.actions && notification.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {notification.actions.map((action) => (
                        <button
                          key={action.id}
                          type="button"
                          onClick={() => onAction?.(action.id, notification)}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            action.variant === "secondary"
                              ? "border border-foreground/20 text-foreground/70"
                              : "bg-foreground text-background"
                          )}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-wide text-foreground/60">
                    <span>{formatTimestamp(notification.createdAt)}</span>
                    {notification.duration && notification.duration > 0 && (
                      <span>{Math.round(notification.duration / 1000)}s</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showHistory && isHistoryOpen && (
        <div
          id="notification-history"
          className={cn(
            "notification-card w-full rounded-2xl border border-border bg-background/95 p-4 text-sm shadow-xl backdrop-blur",
            isRightPosition ? "text-right" : "text-left"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Notification history</p>
              <p className="text-xs text-muted-foreground">
                {historyNotifications.length} notifications
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={markAllRead}
                className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
              >
                Mark all read
              </button>
              <button
                type="button"
                onClick={clearHistory}
                className="rounded-full border border-border px-3 py-1 text-xs font-semibold"
              >
                Clear history
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <select
              className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as NotificationType | "all")
              }
            >
              <option value="all">All types</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
            <select
              className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(event.target.value as HistoryDateFilter)
              }
            >
              {historyDateFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
            {historyNotifications.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No notifications match the filters.
              </p>
            )}
            {historyNotifications.map((notification) => {
              const iconKey =
                notification.icon && notification.icon in typeIcons
                  ? (notification.icon as NotificationType)
                  : notification.type;
              const Icon = typeIcons[iconKey];
              return (
                <div
                  key={notification.id}
                  className="flex items-start gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2"
                >
                  <span className="mt-0.5 rounded-full bg-background/80 p-1">
                    <Icon className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <p className="text-xs font-semibold">
                      {notification.title || notification.type.toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                  </div>
                  <span className="text-[0.6rem] text-muted-foreground">
                    {formatTimestamp(notification.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
