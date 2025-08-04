import { MesaChainDBSchema } from "@/types/db";
import { IDBPDatabase, openDB } from "idb";

const DB_NAME = "MesaChainDB";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MesaChainDBSchema>> | null = null;

const initDB = () => {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = openDB<MesaChainDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      if (!db.objectStoreNames.contains("orders")) {
        const ordersStore = db.createObjectStore("orders", {
          keyPath: "id",
        });

        ordersStore.createIndex("by-status", "status");
        ordersStore.createIndex("by-synced", "synced");
      }

      if (!db.objectStoreNames.contains("LineItems")) {
        const lineItemStore = db.createObjectStore("LineItems", {
          keyPath: "id",
        });
        lineItemStore.createIndex("by-orderId", "orderId");
      }
      if (!db.objectStoreNames.contains("PaymentIntent")) {
        const paymentIntentStore = db.createObjectStore("PaymentIntent", {
          keyPath: "id",
        });
        paymentIntentStore.createIndex("by-orderId", "orderId");
        paymentIntentStore.createIndex("by-synced", "synced");
      }
    },
  });
  return dbPromise
};

export const getDB = () =>{
    if(typeof window === 'undefined'){
        throw new Error('indexedDB can only be used in the browser')
    }
    return initDB()
}

