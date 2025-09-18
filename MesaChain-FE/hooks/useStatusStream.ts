import { useState, useEffect, useCallback } from 'react';

export interface PaymentStatus {
  intentId: string;
  status: 'pending' | 'processing' | 'confirmed' | 'failed' | 'cancelled';
  transactionHash?: string;
  blockConfirmations?: number;
  estimatedConfirmationTime?: number;
  lastUpdated: Date;
}

export const useStatusStream = (intentId: string | null) => {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const updateStatus = useCallback((newStatus: Partial<PaymentStatus>) => {
    if (!intentId) return;
    
    setStatus(prev => prev ? {
      ...prev,
      ...newStatus,
      lastUpdated: new Date(),
    } : {
      intentId,
      status: 'pending',
      lastUpdated: new Date(),
      ...newStatus,
    });
  }, [intentId]);

  useEffect(() => {
    if (!intentId) {
      setStatus(null);
      setIsConnected(false);
      return;
    }

    // Initialize status
    setStatus({
      intentId,
      status: 'pending',
      lastUpdated: new Date(),
    });
    setIsConnected(true);

    // Listen for custom events (simulating real-time updates)
    const handlePaymentConfirmed = (event: CustomEvent) => {
      if (event.detail.intentId === intentId) {
        updateStatus({
          status: 'confirmed',
          transactionHash: event.detail.transactionHash,
          blockConfirmations: 1,
        });
      }
    };

    const handlePaymentFailed = (event: CustomEvent) => {
      if (event.detail.intentId === intentId) {
        updateStatus({
          status: 'failed',
        });
      }
    };

    window.addEventListener('payment_confirmed', handlePaymentConfirmed as EventListener);
    window.addEventListener('payment_failed', handlePaymentFailed as EventListener);

    // Simulate periodic status updates for processing payments
    const interval = setInterval(() => {
      if (status?.status === 'processing') {
        // Simulate block confirmations
        updateStatus({
          blockConfirmations: Math.min((status.blockConfirmations || 0) + 1, 6),
          estimatedConfirmationTime: Math.max(0, (status.estimatedConfirmationTime || 30) - 5),
        });
      }
    }, 5000);

    return () => {
      window.removeEventListener('payment_confirmed', handlePaymentConfirmed as EventListener);
      window.removeEventListener('payment_failed', handlePaymentFailed as EventListener);
      clearInterval(interval);
      setIsConnected(false);
    };
  }, [intentId, updateStatus, status?.status, status?.blockConfirmations, status?.estimatedConfirmationTime]);

  return {
    status,
    isConnected,
    updateStatus,
  };
};