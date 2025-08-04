import { DBSchema } from "idb";

/**
 * Represents a single customer order.
 * 'status' tracks the order's lifecycle (pending, completed, cancelled).
 * 'synced' is crucial for our offline-first strategy.
 */
export interface Order {
  id: string;
  status: "pending" | "completed" | "cancelled";
  totalAmount: number;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

/**
 * Represents a single item within an order.
 */
export interface LineItem {
  id: string;
  orderId: string;
  menuItemId?: string;
  name: string;
  quantity: number;
  price: number;
}

/**
 * Represents a payment attempt associated with an order.
 * This allows for handling partial payments or multiple payment methods.
 */
export interface PaymentIntent {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: "credit_card" | "paypal" | "bank_transfer";
  status: "pending" | "completed" | "failed";
  createdAt: string;
  synced: boolean;
}

export interface MesaChainDBSchema extends DBSchema {
  orders: {
    key: string;
    value: Order;
    indexes: {
      "by-status": "status";
      "by-synced": "synced";
    };
  };
  LineItems: {
    key: string;
    value: LineItem;
    indexes: {
      "by-orderId": "orderId";
    };
  };
  PaymentIntent: {
    key: string;
    value: PaymentIntent;
    indexes: {
      "by-orderId": "orderId";
      "by-synced": "synced";
    };
  };
}
