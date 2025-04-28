export interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: 'Food' | 'Drinks';
    image?: string;
  }
  
  export interface OrderItem extends MenuItem {
    quantity: number;
  }
  
  export type PaymentMethod = 'Cash' | 'Credit' | 'Debit';
  
  export interface Order {
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    customerName?: string;
    note?: string;
    paymentMethod?: PaymentMethod;
  }
  
  // utils/
  