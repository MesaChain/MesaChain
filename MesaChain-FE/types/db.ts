import { DBSchema } from "idb";

export interface Order {
  id: string;
  status: "pending" | "completed" | "cancelled" | "refunded";
  paymentStatus: "unpaid" | "partial" | "paid" | "refunded";
  totalAmount: number;
  paidAmount: number;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
  isLocked: boolean; 
  version: number;  
}

export interface LineItem {
  id: string;
  orderId: string;
  menuItemId?: string;
  name: string;
  quantity: number;
  price: number;
}

export interface PaymentIntent {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: "cash" | "stellar" | "credit_card";
  status: "pending" | "completed" | "failed" | "refunded";
  createdAt: string;
  synced: boolean;
  isPartial: boolean;
}

export interface MesaChainDBSchema extends DBSchema {
  orders: {
    key: string;
    value: Order;
    indexes: { "by-synced": number };
  };
  LineItems: {
    key: string;
    value: LineItem;
    indexes: { "by-orderId": string };
  };
  PaymentIntent: {
    key: string;
    value: PaymentIntent;
    indexes: { "by-orderId": string; "by-synced": number };
  };
}