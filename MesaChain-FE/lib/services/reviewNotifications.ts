// ...existing code...
import { useState, useEffect } from 'react';
import { Socket, io } from 'socket.io-client';
import { toast } from '../../components/ui/use-toast';

type NotificationEvent =
  | 'review-submitted'
  | 'review-approved'
  | 'review-rejected'
  | 'feedback-submitted'
  | 'feedback-responded';

type NotificationHandler = (data: unknown) => void;

class ReviewNotificationService {
  private currentUserId: string | null = null;
  private connectionListenerMap: Map<
    (connected: boolean) => void,
    { onConnect: () => void; onDisconnect: () => void }
  > = new Map();
  public isConnected(): boolean {
    return !!this.socket?.connected;
  }

  public subscribeConnection(callback: (connected: boolean) => void) {
    if (!this.socket) return;
    const onConnect = () => callback(true);
    const onDisconnect = () => callback(false);
    this.connectionListenerMap.set(callback, { onConnect, onDisconnect });
    this.socket.on('connect', onConnect);
    this.socket.on('disconnect', onDisconnect);
  }

  public unsubscribeConnection(callback: (connected: boolean) => void) {
    if (!this.socket) return;
    const listeners = this.connectionListenerMap.get(callback);
    if (listeners) {
      this.socket.off('connect', listeners.onConnect);
      this.socket.off('disconnect', listeners.onDisconnect);
      this.connectionListenerMap.delete(callback);
    }
  }
  private static instance: ReviewNotificationService;
  private socket: Socket | null = null;
  private handlers: Map<NotificationEvent, Set<NotificationHandler>> = new Map();
  // Removed manual reconnect logic; use socket.io built-in reconnection

  private constructor() {
    // Private constructor for singleton pattern
  }

  static getInstance(): ReviewNotificationService {
    if (!ReviewNotificationService.instance) {
      ReviewNotificationService.instance = new ReviewNotificationService();
    }
    return ReviewNotificationService.instance;
  }

  connect(userId: string) {
    if (this.currentUserId !== userId && this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentUserId = null;
    }
    if (this.socket?.connected && this.currentUserId === userId) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_BACKEND || 'http://localhost:3000';
    this.socket = io(`${baseUrl}/reviews`, {
      auth: { userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    this.currentUserId = userId;
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to review notification service');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from review notification service');
      this.currentUserId = null;
      // No manual reconnect; socket.io will handle it
    });

    this.socket.on('error', (error) => {
      console.error('Review notification service error:', error);
      toast({
        title: 'Notification Error',
        description: 'Failed to connect to notification service',
        variant: 'destructive',
      });
    });

    // Set up handlers for different notification types
    const notificationEvents: NotificationEvent[] = [
      'review-submitted',
      'review-approved',
      'review-rejected',
      'feedback-submitted',
      'feedback-responded',
    ];

    notificationEvents.forEach((event) => {
      this.socket?.on(event, (data) => {
        this.notifyHandlers(event, data);
        this.showToast(event, data);
      });
    });
  }

  // Removed manual attemptReconnect logic

  subscribe(event: NotificationEvent, handler: NotificationHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)?.add(handler);
  }

  unsubscribe(event: NotificationEvent, handler: NotificationHandler) {
    this.handlers.get(event)?.delete(handler);
  }

  private notifyHandlers(event: NotificationEvent, data: unknown) {
    this.handlers.get(event)?.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in notification handler for ${event}:`, error);
      }
    });
  }

  private showToast(event: NotificationEvent, data: unknown) {
    const notifications = {
      'review-submitted': {
        title: 'New Review',
  description: `A new review has been submitted for ${typeof data === 'object' && data && 'itemType' in data && typeof (data as { itemType?: string }).itemType === 'string' ? (data as { itemType: string }).itemType.toLowerCase() : ''}`,
      },
      'review-approved': {
        title: 'Review Approved',
        description: 'Your review has been approved and is now visible',
      },
      'review-rejected': {
        title: 'Review Not Approved',
        description: 'Your review could not be approved at this time',
      },
      'feedback-submitted': {
        title: 'New Feedback',
  description: `New feedback received in ${typeof data === 'object' && data && 'category' in data && typeof (data as { category?: string }).category === 'string' ? (data as { category: string }).category.toLowerCase() : ''} category`,
      },
      'feedback-responded': {
        title: 'Feedback Response',
        description: 'Your feedback has received a new response',
      },
    };

    const notification = notifications[event];
    if (notification) {
      toast({
        title: notification.title,
        description: notification.description,
      });
    }
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.handlers.clear();
  }
}

export function useReviewNotifications(userId: string) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const service = ReviewNotificationService.getInstance();
    service.connect(userId);

    setIsConnected(service.isConnected());

    const connectionCallback = (connected: boolean) => {
      setIsConnected(connected);
    };
    service.subscribeConnection(connectionCallback);

    return () => {
      service.unsubscribeConnection(connectionCallback);
    };
  }, [userId]);

  const subscribe = (event: NotificationEvent, handler: NotificationHandler) => {
    ReviewNotificationService.getInstance().subscribe(event, handler);
  };

  const unsubscribe = (event: NotificationEvent, handler: NotificationHandler) => {
    ReviewNotificationService.getInstance().unsubscribe(event, handler);
  };

  return {
    isConnected,
    subscribe,
    unsubscribe,
  };
}

// Example usage in a component:
/*
function ReviewComponent({ userId }) {
  const { isConnected, subscribe, unsubscribe } = useReviewNotifications(userId);

  useEffect(() => {
    const handleNewReview = (data) => {
      // Handle new review notification
      console.log('New review:', data);
    };

    subscribe('review-submitted', handleNewReview);

    return () => {
      unsubscribe('review-submitted', handleNewReview);
    };
  }, []);

  return (
    <div>
      {isConnected ? 'Connected to notifications' : 'Connecting...'}
      // Rest of the component
    </div>
  );
}
*/