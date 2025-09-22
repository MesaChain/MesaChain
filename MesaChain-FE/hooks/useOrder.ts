import { useState, useEffect } from 'react';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  serviceFee: number;
  total: number;
  status: 'pending' | 'ready' | 'completed';
  createdAt: Date;
}

// Mock data
const mockOrders: Record<string, Order> = {
  'table-5-order-123': {
    id: 'table-5-order-123',
    tableNumber: 5,
    items: [
      { id: '1', name: 'Truffle Pasta', price: 28.50, quantity: 1, category: 'Main' },
      { id: '2', name: 'Caesar Salad', price: 16.00, quantity: 1, category: 'Starter' },
    ],
    subtotal: 44.50,
    tax: 4.01,          
    serviceFee: 2.23,   
    total: 50.74,
    status: 'ready',
    createdAt: new Date(),
  },
};


export const useOrder = (orderId: string | null) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        let foundOrder = mockOrders[orderId];
        
        if (!foundOrder) {
          foundOrder = mockOrders['table-5-order-123'];
        }
        
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError('Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  return { order, loading, error };
};