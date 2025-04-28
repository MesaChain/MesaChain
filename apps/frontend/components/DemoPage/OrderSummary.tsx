import { OrderItem } from '../../types/index';

interface OrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export default function OrderSummary({ 
  items, 
  subtotal, 
  tax, 
  total,
  onRemoveItem,
  onUpdateQuantity
}: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h2 className="text-lg font-medium mb-4">Current Order</h2>
      
      {items.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No items in order</div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{item.quantity}x</span> {item.name}
                </div>
                <div className="flex items-center">
                  <span className="text-purple-600 mr-4">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="text-gray-500 px-2"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span className="mx-2">{item.quantity}</span>
                  <button 
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="text-gray-500 px-2"
                  >
                    +
                  </button>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="ml-2 text-red-500"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax:</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
