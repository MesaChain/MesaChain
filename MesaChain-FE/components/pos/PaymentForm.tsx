import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { PaymentIntent, Order } from '@/lib/db';
import { CreditCard, DollarSign, Smartphone, ArrowLeft } from 'lucide-react';

interface PaymentFormProps {
  order: Order;
  onPaymentComplete: (payment: PaymentIntent) => void;
  onBack: () => void;
}

export function PaymentForm({ order, onPaymentComplete, onBack }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital'>('cash');
  const [amount, setAmount] = useState(order.total.toString());
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: DollarSign },
    { value: 'card', label: 'Card', icon: CreditCard },
    { value: 'digital', label: 'Digital Wallet', icon: Smartphone },
  ] as const;

  const handlePayment = async () => {
    const paymentAmount = parseFloat(amount);
    
    if (paymentAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (paymentAmount > order.total) {
      const change = paymentAmount - order.total;
      const confirmed = confirm(`Change due: $${change.toFixed(2)}. Continue?`);
      if (!confirmed) return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const payment: PaymentIntent = {
        id: `payment-${Date.now()}`,
        orderId: order.id,
        method: paymentMethod,
        amount: paymentAmount,
        status: 'completed',
        createdAt: new Date(),
      };

      onPaymentComplete(payment);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const change = parseFloat(amount) > order.total ? parseFloat(amount) - order.total : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Payment</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Order Summary</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total Due:</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div>
          <Label className="text-base font-medium">Payment Method</Label>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as 'cash' | 'card' | 'digital')}
            className="mt-3"
          >
            {paymentMethods.map(method => {
              const Icon = method.icon;
              return (
                <div key={method.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={method.value} id={method.value} />
                  <Label 
                    htmlFor={method.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Icon className="h-4 w-4" />
                    {method.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        {/* Amount Input */}
        <div>
          <Label htmlFor="amount" className="text-base font-medium">
            Amount {paymentMethod === 'cash' ? 'Received' : 'to Charge'}
          </Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.01"
            min="0"
            className="mt-2 text-lg"
            placeholder="0.00"
          />
        </div>

        {/* Change Calculation */}
        {paymentMethod === 'cash' && change > 0 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex justify-between items-center">
              <span className="font-medium text-green-800">Change Due:</span>
              <span className="text-xl font-bold text-green-600">
                ${change.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Process Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={isProcessing || parseFloat(amount) < order.total}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            'Processing Payment...'
          ) : (
            `Process Payment - $${parseFloat(amount || '0').toFixed(2)}`
          )}
        </Button>

        {parseFloat(amount) < order.total && (
          <p className="text-sm text-red-600 text-center">
            Amount must be at least ${order.total.toFixed(2)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}