"use client"
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
    
    console.log('Status stream updating:', newStatus);
    
    setStatus(prev => {
      const updated = prev ? {
        ...prev,
        ...newStatus,
        lastUpdated: new Date(),
      } : {
        intentId,
        status: 'pending' as const,
        lastUpdated: new Date(),
        ...newStatus,
      };
      
      console.log('Status stream updated to:', updated);
      return updated;
    });
  }, [intentId]);

  useEffect(() => {
    if (!intentId) {
      setStatus(null);
      setIsConnected(false);
      return;
    }

    console.log('Status stream initialized for intent:', intentId);

    // Initialize status
    setStatus({
      intentId,
      status: 'pending',
      lastUpdated: new Date(),
    });
    setIsConnected(true);

    // Listen for payment events
    const handleCheckoutStarted = (event: CustomEvent) => {
      console.log('Status stream: checkout_started event', event.detail);
      if (event.detail.intentId === intentId) {
        updateStatus({
          status: 'pending',
        });
      }
    };

    const handlePaymentProcessing = (event: CustomEvent) => {
      console.log('Status stream: payment_processing event', event.detail);
      if (event.detail.intentId === intentId) {
        updateStatus({
          status: 'processing',
        });
      }
    };

    const handlePaymentConfirmed = (event: CustomEvent) => {
      console.log('Status stream: payment_confirmed event', event.detail);
      if (event.detail.intentId === intentId) {
        updateStatus({
          status: 'confirmed',
          transactionHash: event.detail.transactionHash,
          blockConfirmations: 1,
        });
      }
    };

    const handlePaymentFailed = (event: CustomEvent) => {
      console.log('Status stream: payment_failed event', event.detail);
      if (event.detail.intentId === intentId) {
        updateStatus({
          status: 'failed',
        });
      }
    };

    const handlePaymentCancelled = (event: CustomEvent) => {
      console.log('Status stream: payment_cancelled event', event.detail);
      if (event.detail.intentId === intentId) {
        updateStatus({
          status: 'cancelled',
        });
      }
    };

    // Add event listeners
    window.addEventListener('checkout_started', handleCheckoutStarted as EventListener);
    window.addEventListener('payment_processing', handlePaymentProcessing as EventListener);
    window.addEventListener('payment_confirmed', handlePaymentConfirmed as EventListener);
    window.addEventListener('payment_failed', handlePaymentFailed as EventListener);
    window.addEventListener('payment_cancelled', handlePaymentCancelled as EventListener);

    return () => {
      console.log('Status stream cleanup for intent:', intentId);
      window.removeEventListener('checkout_started', handleCheckoutStarted as EventListener);
      window.removeEventListener('payment_processing', handlePaymentProcessing as EventListener);
      window.removeEventListener('payment_confirmed', handlePaymentConfirmed as EventListener);
      window.removeEventListener('payment_failed', handlePaymentFailed as EventListener);
      window.removeEventListener('payment_cancelled', handlePaymentCancelled as EventListener);
      setIsConnected(false);
    };
  }, [intentId, updateStatus]);

  // Debug effect to log status changes
  useEffect(() => {
    if (status) {
      console.log('Status stream state changed:', status);
    }
  }, [status]);

  return {
    status,
    isConnected,
    updateStatus,
  };
};