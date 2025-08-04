

 /**
     * Creates a new order in the local database.
      * Generates a unique ID and sets initial values.
      */

import { Order } from "@/types/db";
import { getDB } from "../db";
import { v4 as uuidV4 } from "uuid";

export const createOrder = async(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'synced' | 'status'>):Promise<Order> =>{
const db = await getDB()
const newOrder: Order ={
    ...orderData,
    id: uuidV4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'pending',
    synced: false,
    customerName: orderData.customerName || ''
}

await db.put('orders', newOrder)
return newOrder
}


// Retrieves a single order by its ID

export const getOrder = async (id: string): Promise<Order | undefined> => {
    const db = await getDB()
    return db.get('orders', id)
}

// updates an existing order and Automatically update the 'updatedAt' timestamp
export const updateOrder = async(order:Order): Promise<Order>=>{
const db = await getDB()
const updateOrderData ={
    ...order,
    updatedAt: new Date().toISOString(),
    synced: false
}
await db.put('orders', updateOrderData)
return updateOrderData
}

//Deletes an order from the local database
export const deleteOrder = async(id: string): Promise<void>=>{
const db = await getDB()
await db.delete('orders', id)
}

//Retrieves all unsynced orders, this is crucial for the sync manager
export const getUnsyncedOrders = async(): Promise<Order[]>=>{
const db = await getDB()
return db.getAllFromIndex('orders', 'by-synced', false)
}
