import { useCallback } from 'react';
import { useNotificationContext } from '../contexts/NotificationContext';
import { NotificationOptions, NotificationType } from '@/types/notification';

export function useNotifications() {
  const context = useNotificationContext();

  const notify = useCallback((
    type: NotificationType,
    message: string,
    options?: NotificationOptions
  ) => {
    context.addNotification(type, message, options);
  }, [context]);

  const success = useCallback((message: string, options?: NotificationOptions) => {
    notify('success', message, options);
  }, [notify]);

  const error = useCallback((message: string, options?: NotificationOptions) => {
    notify('error', message, options);
  }, [notify]);

  const warning = useCallback((message: string, options?: NotificationOptions) => {
    notify('warning', message, options);
  }, [notify]);

  const info = useCallback((message: string, options?: NotificationOptions) => {
    notify('info', message, options);
  }, [notify]);

  return {
    // Core functions
    notify,
    success,
    error,
    warning,
    info,
    
    // State and actions from context
    notifications: context.notifications,
    history: context.history,
    unreadCount: context.unreadCount,
    showHistory: context.showHistory,
    removeNotification: context.removeNotification,
    markAsRead: context.markAsRead,
    markAllAsRead: context.markAllAsRead,
    clearHistory: context.clearHistory,
    toggleHistory: context.toggleHistory,
  };
}

// Create a standalone notify object for global usage
let globalContext: ReturnType<typeof useNotificationContext> | null = null;

export const setGlobalNotificationContext = (context: ReturnType<typeof useNotificationContext>) => {
  globalContext = context;
};

export const notify = {
  success: (message: string, options?: NotificationOptions) => {
    if (globalContext) {
      globalContext.addNotification('success', message, options);
    } else {
      console.warn('Notification context not available. Make sure NotificationProvider is rendered.');
    }
  },
  error: (message: string, options?: NotificationOptions) => {
    if (globalContext) {
      globalContext.addNotification('error', message, options);
    } else {
      console.warn('Notification context not available. Make sure NotificationProvider is rendered.');
    }
  },
  warning: (message: string, options?: NotificationOptions) => {
    if (globalContext) {
      globalContext.addNotification('warning', message, options);
    } else {
      console.warn('Notification context not available. Make sure NotificationProvider is rendered.');
    }
  },
  info: (message: string, options?: NotificationOptions) => {
    if (globalContext) {
      globalContext.addNotification('info', message, options);
    } else {
      console.warn('Notification context not available. Make sure NotificationProvider is rendered.');
    }
  },
};