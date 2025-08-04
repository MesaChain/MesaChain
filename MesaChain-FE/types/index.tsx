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
  
  // Table Layout Types
  export * from './tableLayout';
  
  // utils/
  export type TokenTransaction = {
    id: string
    type: "Earn" | "Redeem" | "Transfer"
    amount: number
    date: string // ISO date string
    description: string
    relatedRewardId: string | null
  }