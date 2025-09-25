import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@radix-ui/react-select';
import { Users, Calculator, DollarSign, Minus, Plus } from 'lucide-react';
import { Order  } from '@/hooks/useOrder';

interface BillSplitterProps {
  order: Order;
  tipAmount: number;
  onSplitChange: (splits: PayerSplit[]) => void;
}

export interface PayerSplit {
  id: string;
  name: string;
  amount: number;
  items?: string[]; // Item IDs for item-based splitting
  percentage?: number; // For percentage-based splitting
}

export const BillSplitter = ({ order, tipAmount, onSplitChange }: BillSplitterProps) => {
  const [splitMode, setSplitMode] = useState<'equal' | 'items' | 'custom'>('equal');
  const [numberOfPayers, setNumberOfPayers] = useState(2);
  const [payers, setPayers] = useState<PayerSplit[]>([]);

  const totalWithTip = order.total + tipAmount;
  const networkFeePerPayer = 0.00001; // XLM fee per transaction

  // Initialize payers when numberOfPayers changes
  useEffect(() => {
    const newPayers: PayerSplit[] = Array.from({ length: numberOfPayers }, (_, i) => ({
      id: `payer-${i + 1}`,
      name: `Person ${i + 1}`,
      amount: 0,
      items: [],
      percentage: 0,
    }));
    setPayers(newPayers);
  }, [numberOfPayers]);

  // Recalculate splits when mode or data changes
  useEffect(() => {
    let updatedPayers = [...payers];

    switch (splitMode) {
      case 'equal':
        const equalAmount = totalWithTip / numberOfPayers;
        updatedPayers = updatedPayers.map(payer => ({
          ...payer,
          amount: equalAmount,
          percentage: 100 / numberOfPayers,
        }));
        break;
      
      case 'items':
        // Reset to equal split for items mode (users will assign items manually)
        updatedPayers = updatedPayers.map(payer => ({
          ...payer,
          amount: 0,
          items: [],
        }));
        break;
      
      case 'custom':
        // Keep current amounts but ensure they don't exceed total
        const totalAssigned = updatedPayers.reduce((sum, payer) => sum + payer.amount, 0);
        if (totalAssigned > totalWithTip) {
          const factor = totalWithTip / totalAssigned;
          updatedPayers = updatedPayers.map(payer => ({
            ...payer,
            amount: payer.amount * factor,
          }));
        }
        break;
    }

    setPayers(updatedPayers);
    onSplitChange(updatedPayers);
    
    // Emit split update event
    window.dispatchEvent(new CustomEvent('split_updated', {
      detail: { mode: splitMode, payers: updatedPayers, total: totalWithTip }
    }));
  }, [splitMode, numberOfPayers, totalWithTip, tipAmount]);

  const updatePayerAmount = (payerId: string, amount: number) => {
    const updatedPayers = payers.map(payer => 
      payer.id === payerId ? { ...payer, amount } : payer
    );
    setPayers(updatedPayers);
    onSplitChange(updatedPayers);
  };

  const assignItemToPayer = (itemId: string, payerId: string) => {
    const item = order.items.find(i => i.id === itemId);
    if (!item) return;

    const updatedPayers = payers.map(payer => {
      // Remove item from other payers
      const itemsWithoutCurrent = payer.items?.filter(id => id !== itemId) || [];
      
      if (payer.id === payerId) {
        // Add item to this payer
        const newItems = [...itemsWithoutCurrent, itemId];
        const itemsTotal = newItems.reduce((sum, id) => {
          const orderItem = order.items.find(i => i.id === id);
          return sum + (orderItem ? orderItem.price * orderItem.quantity : 0);
        }, 0);
        
        // Add proportional tip and fees
        const itemsRatio = itemsTotal / order.subtotal;
        const payerTip = tipAmount * itemsRatio;
        const payerTax = order.tax * itemsRatio;
        const payerServiceFee = order.serviceFee * itemsRatio;
        
        return {
          ...payer,
          items: newItems,
          amount: itemsTotal + payerTip + payerTax + payerServiceFee,
        };
      }
      
      // Recalculate amount for other payers
      const itemsTotal = itemsWithoutCurrent.reduce((sum, id) => {
        const orderItem = order.items.find(i => i.id === id);
        return sum + (orderItem ? orderItem.price * orderItem.quantity : 0);
      }, 0);
      
      const itemsRatio = itemsTotal / order.subtotal;
      const payerTip = tipAmount * itemsRatio;
      const payerTax = order.tax * itemsRatio;
      const payerServiceFee = order.serviceFee * itemsRatio;
      
      return {
        ...payer,
        items: itemsWithoutCurrent,
        amount: itemsTotal + payerTip + payerTax + payerServiceFee,
      };
    });

    setPayers(updatedPayers);
    onSplitChange(updatedPayers);
  };

  const renderEqualSplit = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Label htmlFor="payers">Number of people</Label>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNumberOfPayers(Math.max(2, numberOfPayers - 1))}
            disabled={numberOfPayers <= 2}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="w-8 text-center font-semibold">{numberOfPayers}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNumberOfPayers(Math.min(8, numberOfPayers + 1))}
            disabled={numberOfPayers >= 8}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        {payers.map((payer, index) => (
          <div key={payer.id} className="bg-muted/50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">{payer.name}</span>
              <div className="text-right">
                <div className="font-semibold">${payer.amount.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">
                  + ${networkFeePerPayer.toFixed(5)} XLM fee
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderItemSplit = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Tap items to assign them to different people
      </p>
      
      <div className="space-y-3">
        {order.items.map((item) => {
          const assignedPayer = payers.find(p => p.items?.includes(item.id));
          return (
            <div key={item.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    ${item.price.toFixed(2)} × {item.quantity}
                  </div>
                </div>
                <div className="font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {payers.map((payer) => (
                  <Button
                    key={payer.id}
                    variant={assignedPayer?.id === payer.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => assignItemToPayer(item.id, payer.id)}
                  >
                    {payer.name}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => assignItemToPayer(item.id, '')}
                  className="text-muted-foreground"
                >
                  Unassign
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      <div className="space-y-3">
        {payers.map((payer) => (
          <div key={payer.id} className="bg-muted/50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{payer.name}</span>
              <div className="font-semibold">${payer.amount.toFixed(2)}</div>
            </div>
            <div className="text-xs text-muted-foreground">
              {payer.items?.length || 0} items • + ${networkFeePerPayer.toFixed(5)} XLM fee
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCustomSplit = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enter custom amounts for each person
      </p>
      
      <div className="space-y-3">
        {payers.map((payer, index) => (
          <div key={payer.id} className="space-y-2">
            <Label htmlFor={`payer-${index}`}>{payer.name}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                id={`payer-${index}`}
                type="number"
                placeholder="0.00"
                value={payer.amount.toFixed(2)}
                onChange={(e) => updatePayerAmount(payer.id, parseFloat(e.target.value) || 0)}
                className="pl-8"
                step="0.01"
                min="0"
                max={totalWithTip}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-3">
        <div className="flex justify-between text-sm">
          <span>Total assigned</span>
          <span>${payers.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Remaining</span>
          <span>${(totalWithTip - payers.reduce((sum, p) => sum + p.amount, 0)).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="w-full card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Split Bill
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose how to divide the payment
        </p>
      </CardHeader>
      
      <CardContent>
        <Tabs value={splitMode} onValueChange={(value) => setSplitMode(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="equal" className="text-xs">
              <Users className="w-4 h-4 mr-1" />
              Equal
            </TabsTrigger>
            <TabsTrigger value="items" className="text-xs">
              <Calculator className="w-4 h-4 mr-1" />
              By Items
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-xs">
              <DollarSign className="w-4 h-4 mr-1" />
              Custom
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="equal" className="mt-4">
            {renderEqualSplit()}
          </TabsContent>
          
          <TabsContent value="items" className="mt-4">
            {renderItemSplit()}
          </TabsContent>
          
          <TabsContent value="custom" className="mt-4">
            {renderCustomSplit()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};