import { Order } from '@/hooks/useOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface OrderSummaryProps {
  order: Order;
}

export const OrderSummary = ({ order }: OrderSummaryProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-success text-white';
      case 'pending': return 'bg-warning text-white';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="w-full card-gradient">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Order Summary</CardTitle>
          <Badge className={getStatusColor(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Table {order.tableNumber} • {order.createdAt.toLocaleDateString()}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Items */}
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  ${item.price.toFixed(2)} × {item.quantity}
                </div>
              </div>
              <div className="font-semibold">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (9%)</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Service Fee (5%)</span>
            <span>${order.serviceFee.toFixed(2)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="gradient-text">${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-sm text-muted-foreground">
            Pay with USDC on Stellar Network
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Network fees apply (~$0.00001 XLM)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};