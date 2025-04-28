import { OrderItem } from '../types/index';
export const TAX_RATE = 0.0825; // 8.25% tax rate
  
  export const calculateOrderTotals = (items: OrderItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    
    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  };
  