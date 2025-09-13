import { openDB, DBSchema, IDBPDatabase } from "idb";

// -----------------------------
// Types
// -----------------------------
export interface LineItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
  orderId?: string; // linking to order
  synced?: boolean;
}

export interface Order {
  id: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "completed" | "synced";
  createdAt: Date;
  completedAt?: Date;
  syncedAt?: Date;
  synced?: boolean;
}

export interface PaymentIntent {
  id: string;
  orderId: string;
  method: "cash" | "card" | "digital";
  amount: number;
  status: "pending" | "completed" | "synced";
  createdAt: Date;
  syncedAt?: Date;
  synced?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
}

// -----------------------------
// DBSchema
// -----------------------------
interface POSDBSchema extends DBSchema {
  orders: {
    key: string;
    value: Order;
    indexes: { "by-status": string; "by-created": Date; "by-synced": boolean };
  };
  lineItems: {
    key: string;
    value: LineItem;
    indexes: { "by-orderId": string };
  };
  paymentIntents: {
    key: string;
    value: PaymentIntent;
    indexes: { "by-orderId": string; "by-status": string; "by-synced": boolean };
  };
  products: {
    key: string;
    value: Product;
    indexes: { "by-category": string };
  };
}

// -----------------------------
// Sample Data
// -----------------------------
const sampleProducts: Product[] = [
  { id: "1", name: "Coffee", price: 3.5, category: "Beverages", available: true },
  { id: "2", name: "Sandwich", price: 8.99, category: "Food", available: true },
  { id: "3", name: "Pastry", price: 4.25, category: "Food", available: true },
  { id: "4", name: "Tea", price: 2.75, category: "Beverages", available: true },
  { id: "5", name: "Salad", price: 12.5, category: "Food", available: true },
  { id: "6", name: "Juice", price: 4.0, category: "Beverages", available: true },
];

// -----------------------------
// DB Manager
// -----------------------------
class POSDatabaseManager {
  private db: IDBPDatabase<POSDBSchema> | null = null;

  async init() {
    if (typeof window === "undefined") {
      throw new Error("indexedDB can only be used in the browser");
    }

    this.db = await openDB<POSDBSchema>("MesaChainDB", 1, {
      upgrade(db) {
        // Orders
        if (!db.objectStoreNames.contains("orders")) {
          const store = db.createObjectStore("orders", { keyPath: "id" });
          store.createIndex("by-status", "status");
          store.createIndex("by-created", "createdAt");
          store.createIndex("by-synced", "synced");
        }

        // LineItems
        if (!db.objectStoreNames.contains("lineItems")) {
          const store = db.createObjectStore("lineItems", { keyPath: "id" });
          store.createIndex("by-orderId", "orderId");
        }

        // Payment Intents
        if (!db.objectStoreNames.contains("paymentIntents")) {
          const store = db.createObjectStore("paymentIntents", { keyPath: "id" });
          store.createIndex("by-orderId", "orderId");
          store.createIndex("by-status", "status");
          store.createIndex("by-synced", "synced");
        }

        // Products
        if (!db.objectStoreNames.contains("products")) {
          const store = db.createObjectStore("products", { keyPath: "id" });
          store.createIndex("by-category", "category");
        }
      },
    });

    await this.initializeProducts();
  }

  private async initializeProducts() {
    if (!this.db) return;
    const existing = await this.db.getAll("products");
    if (existing.length === 0) {
      const tx = this.db.transaction("products", "readwrite");
      for (const product of sampleProducts) {
        await tx.store.add(product);
      }
      await tx.done;
    }
  }

  // -----------------------------
  // Orders
  // -----------------------------
  async createOrder(order: Order) {
    if (!this.db) throw new Error("DB not initialized");
    await this.db.add("orders", order);
  }

  async updateOrder(order: Order) {
    if (!this.db) throw new Error("DB not initialized");
    await this.db.put("orders", order);
  }

  async getOrder(id: string) {
    if (!this.db) throw new Error("DB not initialized");
    return await this.db.get("orders", id);
  }

  async getOrdersByStatus(status: string) {
    if (!this.db) throw new Error("DB not initialized");
    return await this.db.getAllFromIndex("orders", "by-status", status);
  }

  async getAllOrders() {
    if (!this.db) throw new Error("DB not initialized");
    return await this.db.getAll("orders");
  }

  // -----------------------------
  // LineItems
  // -----------------------------
  async addLineItem(item: LineItem) {
    if (!this.db) throw new Error("DB not initialized");
    await this.db.add("lineItems", item);
  }

  async getLineItemsByOrder(orderId: string) {
    if (!this.db) throw new Error("DB not initialized");
    return await this.db.getAllFromIndex("lineItems", "by-orderId", orderId);
  }

  // -----------------------------
  // Payment Intents
  // -----------------------------
  async createPaymentIntent(payment: PaymentIntent) {
    if (!this.db) throw new Error("DB not initialized");
    await this.db.add("paymentIntents", payment);
  }

  async updatePaymentIntent(payment: PaymentIntent) {
    if (!this.db) throw new Error("DB not initialized");
    await this.db.put("paymentIntents", payment);
  }

  async getPaymentIntentsByOrder(orderId: string) {
    if (!this.db) throw new Error("DB not initialized");
    return await this.db.getAllFromIndex("paymentIntents", "by-orderId", orderId);
  }

  async getPaymentIntentsByStatus(status: string) {
    if (!this.db) throw new Error("DB not initialized");
    return await this.db.getAllFromIndex("paymentIntents", "by-status", status);
  }

  // -----------------------------
  // Products
  // -----------------------------
  async getAllProducts() {
    if (!this.db) throw new Error("DB not initialized");
    return await this.db.getAll("products");
  }

  async getProductsByCategory(category: string) {
    if (!this.db) throw new Error("DB not initialized");
    return await this.db.getAllFromIndex("products", "by-category", category);
  }

  // -----------------------------
  // Sync Helper
  // -----------------------------
  async getUnsyncedData() {
    if (!this.db) throw new Error("DB not initialized");
    const unsyncedOrders = await this.getOrdersByStatus("completed");
    const unsyncedPayments = await this.getPaymentIntentsByStatus("completed");
    return { orders: unsyncedOrders, paymentIntents: unsyncedPayments };
  }
}

export const posDB = new POSDatabaseManager();
