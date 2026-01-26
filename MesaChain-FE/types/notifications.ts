export type NotificationType = "success" | "error" | "warning" | "info";

export type NotificationPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

export type NotificationAction = {
  id: string;
  label: string;
  variant?: "primary" | "secondary";
};

export type NotificationSound = {
  url?: string;
  tone?: number;
  volume?: number;
};

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  icon?: string;
  actions?: NotificationAction[];
  progress?: number;
  duration?: number;
  createdAt: number;
  readAt?: number;
  dismissedAt?: number;
  sound?: NotificationSound;
  source?: "realtime" | "system" | "user";
};

export type NotificationInput = Omit<NotificationItem, "id" | "createdAt" | "readAt" | "dismissedAt"> & {
  id?: string;
  createdAt?: number;
};

export type NotificationSoundConfig = Record<NotificationType, NotificationSound | null>;

export type NotificationSettings = {
  maxVisible: number;
  position: NotificationPosition;
  autoDismissMs: number;
  historyLimit: number;
  soundsEnabled: boolean;
  soundConfig: NotificationSoundConfig;
};
