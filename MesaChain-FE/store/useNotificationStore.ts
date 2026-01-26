import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import {
  NotificationInput,
  NotificationItem,
  NotificationSettings,
  NotificationSoundConfig,
  NotificationType,
} from "../types/notifications";

const defaultSoundConfig: NotificationSoundConfig = {
  success: { tone: 560, volume: 0.12 },
  error: { tone: 280, volume: 0.16 },
  warning: { tone: 420, volume: 0.14 },
  info: { tone: 360, volume: 0.12 },
};

const defaultSettings: NotificationSettings = {
  maxVisible: 4,
  position: "top-right",
  autoDismissMs: 5000,
  historyLimit: 120,
  soundsEnabled: true,
  soundConfig: defaultSoundConfig,
};

interface NotificationState {
  notifications: NotificationItem[];
  lastAddedId: string | null;
  settings: NotificationSettings;
  addNotification: (input: NotificationInput) => NotificationItem;
  dismissNotification: (id: string) => void;
  removeNotification: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearHistory: () => void;
  setSettings: (settings: Partial<NotificationSettings>) => void;
  getUnreadCount: () => number;
}

const sortByNewest = (items: NotificationItem[]) =>
  [...items].sort((a, b) => b.createdAt - a.createdAt);

const trimHistory = (items: NotificationItem[], limit: number) => {
  if (items.length <= limit) return items;
  return sortByNewest(items).slice(0, limit);
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      lastAddedId: null,
      settings: defaultSettings,
      addNotification: (input) => {
        const settings = get().settings;
        const notification: NotificationItem = {
          id: input.id ?? uuidv4(),
          type: input.type ?? "info",
          message: input.message ?? "",
          title: input.title,
          icon: input.icon,
          actions: input.actions,
          progress: input.progress,
          duration: input.duration ?? settings.autoDismissMs,
          createdAt: input.createdAt ?? Date.now(),
          sound: input.sound,
          source: input.source ?? "system",
        };

        set((state) => {
          const merged = trimHistory(
            [notification, ...state.notifications],
            state.settings.historyLimit
          );
          return {
            notifications: merged,
            lastAddedId: notification.id,
          };
        });

        return notification;
      },
      dismissNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id
              ? {
                  ...notification,
                  dismissedAt: notification.dismissedAt ?? Date.now(),
                  readAt: notification.readAt ?? Date.now(),
                }
              : notification
          ),
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter(
            (notification) => notification.id !== id
          ),
        })),
      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id
              ? { ...notification, readAt: notification.readAt ?? Date.now() }
              : notification
          ),
        })),
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            readAt: notification.readAt ?? Date.now(),
          })),
        })),
      clearHistory: () =>
        set(() => ({
          notifications: [],
          lastAddedId: null,
        })),
      setSettings: (settings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings,
            soundConfig: {
              ...state.settings.soundConfig,
              ...(settings.soundConfig ?? {}),
            },
          },
        })),
      getUnreadCount: () =>
        get().notifications.filter((notification) => !notification.readAt)
          .length,
    }),
    {
      name: "notification-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        notifications: state.notifications,
        settings: state.settings,
      }),
    }
  )
);

export const notify = (input: NotificationInput) =>
  useNotificationStore.getState().addNotification(input);

export const defaultSoundForType = (
  type: NotificationType,
  settings: NotificationSettings
) => settings.soundConfig[type];
