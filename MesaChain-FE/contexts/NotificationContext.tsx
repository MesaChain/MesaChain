"use client"
import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { Notification, NotificationState, NotificationOptions, NotificationType } from '@/types/notification';
import { saveNotifications, loadNotifications } from '@/utils/storage';

type NotificationAction = 
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'TOGGLE_HISTORY' }
  | { type: 'LOAD_NOTIFICATIONS'; payload: Notification[] };

interface NotificationContextType extends NotificationState {
  addNotification: (type: NotificationType, message: string, options?: NotificationOptions) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearHistory: () => void;
  toggleHistory: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const initialState: NotificationState = {
  notifications: [],
  history: [],
  unreadCount: 0,
  showHistory: false,
};

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'ADD_NOTIFICATION': {
      const newNotification = action.payload;
      const updatedHistory = [newNotification, ...state.history];
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
        history: updatedHistory,
        unreadCount: state.unreadCount + 1,
      };
    }
    case 'REMOVE_NOTIFICATION': {
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    }
    case 'MARK_AS_READ': {
      const updatedHistory = state.history.map(n =>
        n.id === action.payload ? { ...n, read: true } : n
      );
      return {
        ...state,
        history: updatedHistory,
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }
    case 'MARK_ALL_AS_READ': {
      const updatedHistory = state.history.map(n => ({ ...n, read: true }));
      return {
        ...state,
        history: updatedHistory,
        unreadCount: 0,
      };
    }
    case 'CLEAR_HISTORY': {
      return {
        ...state,
        history: [],
        unreadCount: 0,
      };
    }
    case 'TOGGLE_HISTORY': {
      return {
        ...state,
        showHistory: !state.showHistory,
      };
    }
    case 'LOAD_NOTIFICATIONS': {
      const unreadCount = action.payload.filter(n => !n.read).length;
      return {
        ...state,
        history: action.payload,
        unreadCount,
      };
    }
    default:
      return state;
  }
}

interface NotificationProviderProps {
  children: React.ReactNode;
  storageKey?: string;
  maxVisible?: number;
  enableWebSocket?: boolean;
  webSocketUrl?: string;
}

export function NotificationProvider({
  children,
  storageKey = 'notifications',
  maxVisible = 5,
  enableWebSocket = false,
  webSocketUrl,
}: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const ws = useRef<WebSocket | null>(null);
  const timeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Load notifications from storage on mount
  useEffect(() => {
    const savedNotifications = loadNotifications(storageKey);
    if (savedNotifications.length > 0) {
      dispatch({ type: 'LOAD_NOTIFICATIONS', payload: savedNotifications });
    }
  }, [storageKey]);

  // Save notifications to storage when history changes
  useEffect(() => {
    saveNotifications(state.history, storageKey);
  }, [state.history, storageKey]);

  // WebSocket connection
  useEffect(() => {
    if (enableWebSocket && webSocketUrl) {
      ws.current = new WebSocket(webSocketUrl);
      
      ws.current.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          addNotification(notification.type, notification.message, notification.options);
        } catch (error) {
          console.error('Failed to parse WebSocket notification:', error);
        }
      };

      return () => {
        ws.current?.close();
      };
    }
    return undefined;
  }, [enableWebSocket, webSocketUrl]);

  const generateId = () => `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addNotification = useCallback((
    type: NotificationType,
    message: string,
    options: NotificationOptions = {}
  ) => {
    const id = generateId();
    const notification: Notification = {
      id,
      type,
      message,
      timestamp: Date.now(),
      read: false,
      persistent: options.persistent || false,
      duration: options.duration || 5000,
      actions: options.actions,
      onClick: options.onClick,
      progress: options.progress,
      sound: options.sound,
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

    // Auto-dismiss if not persistent
    if (!notification.persistent && notification.duration > 0) {
      const timeout = setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
      
      timeouts.current.set(id, timeout);
    }

    // Limit visible notifications
    setTimeout(() => {
    //   const visibleNotifications = state.notifications.slice(0, maxVisible);
      const hiddenNotifications = state.notifications.slice(maxVisible);
      
      hiddenNotifications.forEach(n => {
        if (!n.persistent) {
          removeNotification(n.id);
        }
      });
    }, 100);
  }, [state.notifications, maxVisible]);

  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
    
    // Clear timeout if exists
    const timeout = timeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeouts.current.delete(id);
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  }, []);

  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  const toggleHistory = useCallback(() => {
    dispatch({ type: 'TOGGLE_HISTORY' });
  }, []);

  const contextValue: NotificationContextType = {
    ...state,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearHistory,
    toggleHistory,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}