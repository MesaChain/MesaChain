"use client"
import { useState, useCallback } from 'react';
import { createPaymentTransaction, submitTransaction, convertUSDToXLM } from '@/lib/stellar';
import { STELLAR_CONFIG } from '@/config/stellar';

export interface PaymentIntent {
  id: string;
  orderId: string;
  amount: number; 
  xlmAmount: string; 
  currency: string;
  stellarAddress?: string;
  destinationAddress?: string;
  status: 'pending' | 'processing' | 'confirmed' | 'failed' | 'cancelled';
  transactionHash?: string;
  transactionXDR?: string;
  createdAt: Date;
  expiresAt: Date;
}

export const usePaymentIntent = () => {
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPaymentIntent = useCallback(async (orderId: string, usdAmount: number) => {
    try {
      setLoading(true);
      setError(null);

      // Convert USD amount to XLM
      const xlmAmount = convertUSDToXLM(usdAmount);
      
      console.log('Creating XLM payment intent:', {
        orderId,
        usdAmount: `$${usdAmount}`,
        xlmAmount: `${xlmAmount} XLM`
      });

      // Create the payment intent
      const newIntent: PaymentIntent = {
        id: `pi_${Date.now()}`,
        orderId,
        amount: usdAmount, 
        xlmAmount,
        currency: 'XLM',
        status: 'pending',
        destinationAddress: STELLAR_CONFIG.RESTAURANT_STELLAR_ADDRESS,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      };

      setIntent(newIntent);
      
      // Emit event for status tracking
      window.dispatchEvent(new CustomEvent('checkout_started', { 
        detail: { 
          intentId: newIntent.id, 
          orderId, 
          usdAmount, 
          xlmAmount 
        } 
      }));

      return newIntent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create payment intent';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const processPayment = useCallback(async (stellarAddress: string, signTransaction: (xdr: string) => Promise<string>) => {
    if (!intent) throw new Error('No payment intent found');

    try {
      setLoading(true);
      setError(null);

      console.log('Processing XLM payment:', {
        from: stellarAddress,
        to: intent.destinationAddress,
        usdAmount: `$${intent.amount}`,
        xlmAmount: `${intent.xlmAmount} XLM`
      });

      // Step 1: Update intent status to processing
      const processingIntent = { 
        ...intent, 
        stellarAddress, 
        status: 'processing' as const 
      };
      setIntent(processingIntent);

      // Emit processing event
      window.dispatchEvent(new CustomEvent('payment_processing', { 
        detail: { intentId: processingIntent.id } 
      }));

      // Step 2: Create the XLM transaction XDR
      console.log('Creating XLM payment transaction...');
      const transactionXDR = await createPaymentTransaction(
        stellarAddress,
        intent.destinationAddress!,
        intent.xlmAmount
      );

      // Update intent with transaction XDR
      const xdrIntent = { 
        ...processingIntent, 
        transactionXDR 
      };
      setIntent(xdrIntent);

      // Step 3: Sign the transaction using the connected wallet
      console.log('Signing XLM transaction with wallet...');
      const signedTransactionXDR = await signTransaction(transactionXDR);

      // Step 4: Submit the signed transaction to Stellar testnet
      console.log('Submitting signed XLM transaction to testnet...');
      const transactionHash = await submitTransaction(signedTransactionXDR);

      console.log('XLM payment successful! Transaction hash:', transactionHash);

      // Step 5: IMMEDIATELY update intent with success (this was missing!)
      const confirmedIntent = {
        ...xdrIntent,
        status: 'confirmed' as const,
        transactionHash,
      };
      
      console.log('Setting payment status to CONFIRMED:', confirmedIntent);
      setIntent(confirmedIntent);
      
      // Step 6: Emit success event AFTER updating the intent
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('payment_confirmed', { 
          detail: { 
            intentId: confirmedIntent.id, 
            transactionHash: confirmedIntent.transactionHash,
            xlmAmount: confirmedIntent.xlmAmount,
            status: 'confirmed' 
          } 
        }));
      }, 100); // Small delay to ensure state update propagates
      
      return confirmedIntent;

    } catch (err) {
      console.error('XLM payment processing failed:', err);
      
      // Update intent with failure
      const failedIntent = { 
        ...intent, 
        stellarAddress,
        status: 'failed' as const 
      };
      setIntent(failedIntent);
      
      let errorMessage = 'XLM payment processing failed';
      
      if (err instanceof Error) {
        if (err.message.includes('insufficient')) {
          errorMessage = 'Insufficient XLM balance in your wallet';
        } else if (err.message.includes('not found')) {
          errorMessage = 'Wallet not found on Stellar testnet. Please fund your wallet first.';
        } else if (err.message.includes('rejected') || err.message.includes('cancelled')) {
          errorMessage = 'Payment cancelled by user';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      
      // Emit failure event
      window.dispatchEvent(new CustomEvent('payment_failed', { 
        detail: { 
          intentId: failedIntent.id, 
          error: errorMessage 
        } 
      }));
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [intent]);

  const cancelPayment = useCallback(() => {
    if (intent && intent.status === 'pending') {
      const cancelledIntent = { 
        ...intent, 
        status: 'cancelled' as const 
      };
      setIntent(cancelledIntent);
      
      window.dispatchEvent(new CustomEvent('payment_cancelled', { 
        detail: { intentId: cancelledIntent.id } 
      }));
    }
  }, [intent]);

  return {
    intent,
    loading,
    error,
    createPaymentIntent,
    processPayment,
    cancelPayment,
  };
};