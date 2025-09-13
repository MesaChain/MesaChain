import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { posDB, LineItem, Order, PaymentIntent, Product } from '@/lib/db';
import { useOfflineSync } from '@/lib/hooks/useOfflineSync';

export default function POSTerminal() {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [cartItems, setCartItems] = useState<LineItem[]>([]);
  const { isOnline, isSyncing, manualSync } = useOfflineSync();

  // Sample products matching the design exactly
  const sampleProducts = [
    { id: '1', name: 'Espresso', price: 2.50, category: 'Coffee', available: true },
    { id: '2', name: 'Latte', price: 3.50, category: 'Coffee', available: true },
    { id: '3', name: 'Cappuccino', price: 3.50, category: 'Coffee', available: true },
    { id: '4', name: 'Muffin', price: 2.75, category: 'Food', available: true },
    { id: '5', name: 'Croissant', price: 2.25, category: 'Food', available: true },
    { id: '6', name: 'Iced Coffee', price: 3.00, category: 'Coffee', available: true },
    { id: '7', name: 'Tea', price: 2.00, category: 'Beverages', available: true },
    { id: '8', name: 'Sandwich', price: 6.50, category: 'Food', available: true },
  ];

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await posDB.init();
      setProducts(sampleProducts);
      createNewOrder();
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  const createNewOrder = () => {
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      status: 'draft',
      createdAt: new Date(),
    };
    setCurrentOrder(newOrder);
    setCartItems([]);
  };

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(
        item => item.productId === product.id
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prev];
        const existingItem = updatedItems[existingItemIndex];
        existingItem.quantity += 1;
        existingItem.total = existingItem.quantity * existingItem.price;
        return updatedItems;
      } else {
        const newItem: LineItem = {
          id: `${product.id}-${Date.now()}`,
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: 1,
          total: product.price,
        };
        return [...prev, newItem];
      }
    });
  };

  const total = cartItems.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">POS Terminal</h1>
          <div className="flex items-center gap-4">
            {/* Online/Offline Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            
            {/* Sync Button */}
            <Button 
              onClick={manualSync}
              disabled={isSyncing || !isOnline}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Products */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Products</h2>
          
          <div className="grid grid-cols-4 gap-4">
            {products.map(product => (
              <Card 
                key={product.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-4 text-center">
                  <div className="h-16 bg-gray-100 rounded mb-3 flex items-center justify-center border">
                    <div className="text-gray-400 text-xs">Image</div>
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 font-medium">${product.price.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Panel - Current Order */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Current Order</h2>
            <Button 
              onClick={createNewOrder}
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1"
            >
              New Order
            </Button>
          </div>

          {/* Order Items */}
          <div className="flex-1 mb-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 italic text-sm">Add products to start an order.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{item.productName}</h4>
                      <p className="text-xs text-gray-600">${item.price.toFixed(2)} x {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 text-sm">${item.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-gray-900">Total:</span>
              <span className="text-base font-bold text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Proceed to Payment Button */}
          <Button 
            className="w-full bg-gray-400 hover:bg-gray-500 text-white"
            disabled={cartItems.length === 0}
            size="lg"
          >
            Proceed to Payment
          </Button>
        </div>
      </div>

      {/* Sync Log - Bottom Panel */}
      <div className="bg-white border-t px-6 py-3 flex-shrink-0">
        <div className="text-xs text-gray-600">
          <div className="font-medium mb-1">Sync Log</div>
          <div className="space-y-0.5 font-mono">
            <div>[8:05:44 PM] No new data to sync.</div>
            <div>[8:05:44 PM] Starting synchronization...</div>
            <div>[8:05:44 PM] Connection restored. System is online.</div>
            <div>[8:05:44 PM] Product catalog seeded.</div>
          </div>
        </div>
      </div>
    </div>
  );
}