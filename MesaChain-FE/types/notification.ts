export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export interface NotificationOptions {
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
  onClick?: () => void;
  progress?: boolean;
  sound?: boolean;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  timestamp: number;
  read: boolean;
  persistent: boolean;
  duration: number;
  actions?: NotificationAction[];
  onClick?: () => void;
  progress?: boolean;
  sound?: boolean;
}

export interface NotificationHubProps {
  position?: NotificationPosition;
  maxVisible?: number;
  autoDismiss?: number;
  storageKey?: string;
  enableWebSocket?: boolean;
  webSocketUrl?: string;
  enableSounds?: boolean;
}

export interface NotificationState {
  notifications: Notification[];
  history: Notification[];
  unreadCount: number;
  showHistory: boolean;
}