

import { v4 as uuidV4 } from "uuid";
import { getDB } from "../db";
import { Order, LineItem, PaymentIntent } from "@/types/db";

export const createOrder = async (
  orderData: { totalAmount: number; customerName?: string },
  items: Omit<LineItem, "id" | "orderId">[],
  paymentMethod: PaymentIntent["paymentMethod"]
): Promise<Order> => {
  const db = await getDB();
  const orderId = uuidV4();
  const now = new Date().toISOString();

  const newOrder: Order = {
    ...orderData,
    id: orderId,
    paidAmount: 0,
    status: "pending",
    paymentStatus: "unpaid",
    createdAt: now,
    updatedAt: now,
    synced: false,
    isLocked: false,
    version: 1,
  };

  const tx = db.transaction(["orders", "LineItems"], "readwrite");
  await tx.objectStore("orders").put(newOrder);
  for (const item of items) {
    await tx.objectStore("LineItems").put({ ...item, id: uuidV4(), orderId });
  }
  await tx.done;
  return newOrder;
};

export const addPaymentIntent = async (
  orderId: string, 
  amount: number, 
  method: PaymentIntent["paymentMethod"]
) => {
  const db = await getDB();
  const tx = db.transaction(["orders", "PaymentIntent"], "readwrite");
  const order = await tx.objectStore("orders").get(orderId);

  if (!order || order.isLocked) throw new Error("Order locked or not found");

  const newPayment: PaymentIntent = {
    id: uuidV4(),
    orderId,
    amount,
    paymentMethod: method,
    status: "completed",
    createdAt: new Date().toISOString(),
    synced: false,
    isPartial: amount < (order.totalAmount - order.paidAmount),
  };

  order.paidAmount += amount;
  order.paymentStatus = order.paidAmount >= order.totalAmount ? "paid" : "partial";
  order.updatedAt = new Date().toISOString();
  order.version += 1;
  if (order.paymentStatus === "paid") {
    order.status = "completed";
    order.isLocked = true; 
  }

  await tx.objectStore("PaymentIntent").put(newPayment);
  await tx.objectStore("orders").put(order);
  await tx.done;
};

export const getUnsyncedOrders = async () => {
  const db = await getDB();
  return db.getAllFromIndex("orders", "by-synced", 0);
};