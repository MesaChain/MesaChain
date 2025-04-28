// components/PaymentModal.tsx
import { useState } from 'react';
import { PaymentMethod, Order } from '../../types/index';
import Calculator from './Calculator';

interface PaymentModalProps {
  order: Order;
  onClose: () => void;
  onCompletePayment: (method: PaymentMethod, amountPaid: number) => void;
}

export default function PaymentModal({ order, onClose, onCompletePayment }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [amountPaid, setAmountPaid] = useState<number | null>(null);

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    
    if (method !== 'Cash') {
      setAmountPaid(order.total);
    }
  };

  const handleAmountEntered = (amount: number) => {
    setAmountPaid(amount);
  };

  const handleCompletePayment = () => {
    if (paymentMethod && amountPaid !== null) {
      onCompletePayment(paymentMethod, amountPaid);
    }
  };

  const getChange = () => {
    if (paymentMethod === 'Cash' && amountPaid !== null) {
      return Math.max(0, amountPaid - order.total);
    }
    return 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-medium mb-4">Payment</h2>
        
        <div className="mb-6">
          <h3 className="text-gray-600 mb-2">Total Amount Due</h3>
          <div className="text-3xl font-medium">${order.total.toFixed(2)}</div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-gray-600 mb-2">Select Payment Method</h3>
          <div className="grid grid-cols-3 gap-3">
            {(['Cash', 'Credit', 'Debit'] as PaymentMethod[]).map(method => (
              <button 
                key={method}
                onClick={() => handlePaymentMethodSelect(method)}
                className={`py-3 px-4 rounded-lg border ${
                  paymentMethod === method 
                    ? 'bg-purple-100 border-purple-500' 
                    : 'border-gray-300'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>
        
        {paymentMethod === 'Cash' && (
          <div className="mb-6">
            <Calculator 
              label="Enter Amount Received"
              onValueEntered={handleAmountEntered}
              initialValue={order.total.toString()}
            />
            
            {amountPaid !== null && (
              <div className="mt-4">
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span>${amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Change:</span>
                  <span>${getChange().toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button 
            onClick={handleCompletePayment}
            disabled={!paymentMethod || amountPaid === null || (paymentMethod === 'Cash' && amountPaid < order.total)}
            className={`px-4 py-2 rounded-lg ${
              !paymentMethod || amountPaid === null || (paymentMethod === 'Cash' && amountPaid < order.total)
                ? 'bg-gray-300 text-gray-500'
                : 'bg-purple-600 text-white'
            }`}
          >
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  );
}
