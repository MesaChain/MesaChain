import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { LineItem } from '@/lib/db';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartProps {
  items: LineItem[];
  onUpdateItem: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
}

export function Cart({ items, onUpdateItem, onRemoveItem, onCheckout }: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      onRemoveItem(itemId);
    } else {
      onUpdateItem(itemId, newQuantity);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Current Order
          <span className="text-sm font-normal text-gray-500">
            {items.length} items
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Cart Items */}
        <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No items in cart
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.productName}</h4>
                  <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                    className="w-16 h-8 text-center"
                    min="0"
                  />
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="text-right">
                  <p className="font-medium">${item.total.toFixed(2)}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemoveItem(item.id)}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Summary */}
        {items.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              onClick={onCheckout}
              className="w-full mt-4"
              size="lg"
            >
              Proceed to Payment
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}