import { useState, useEffect } from 'react';
import { Socket, io } from 'socket.io-client';
import { toast } from '../../components/ui/use-toast';

type NotificationEvent =
  | 'review-submitted'
  | 'review-approved'
  | 'review-rejected'
  | 'feedback-submitted'
  | 'feedback-responded';

type NotificationHandler = (data: any) => void;

class ReviewNotificationService {
  private static instance: ReviewNotificationService;
  private socket: Socket | null = null;
  private handlers: Map<NotificationEvent, Set<NotificationHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second delay

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
    if (this.socket?.connected) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_BACKEND || 'http://localhost:3000';
    this.socket = io(`${baseUrl}/reviews`, {
      auth: { userId },
      transports: ['websocket'],
    });

    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to review notification service');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from review notification service');
      this.attemptReconnect();
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

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      toast({
        title: 'Connection Error',
        description: 'Failed to reconnect to notification service',
        variant: 'destructive',
      });
      return;
    }

    setTimeout(() => {
      this.reconnectAttempts++;
      this.socket?.connect();
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
  }

  subscribe(event: NotificationEvent, handler: NotificationHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)?.add(handler);
  }

  unsubscribe(event: NotificationEvent, handler: NotificationHandler) {
    this.handlers.get(event)?.delete(handler);
  }

  private notifyHandlers(event: NotificationEvent, data: any) {
    this.handlers.get(event)?.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in notification handler for ${event}:`, error);
      }
    });
  }

  private showToast(event: NotificationEvent, data: any) {
    const notifications = {
      'review-submitted': {
        title: 'New Review',
        description: `A new review has been submitted for ${data.itemType.toLowerCase()}`,
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
        description: `New feedback received in ${data.category.toLowerCase()} category`,
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

    const checkConnection = () => {
      setIsConnected(service['socket']?.connected ?? false);
    };

    // Check initial connection
    checkConnection();

    // Subscribe to connection status changes
    service['socket']?.on('connect', checkConnection);
    service['socket']?.on('disconnect', checkConnection);

    return () => {
      service['socket']?.off('connect', checkConnection);
      service['socket']?.off('disconnect', checkConnection);
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