import { getDB } from './db';
import { getUnsyncedOrders } from './services/orderservice'; 

const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; 


const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

export const syncOfflineData = async (onLog?: (msg: string) => void) => {
  const db = await getDB();
  const pendingOrders = await getUnsyncedOrders();

  if (pendingOrders.length === 0) {
    onLog?.("There are no pending orders.");
    return;
  }

  for (const order of pendingOrders) {
    let attempt = 0;
    let success = false;
    let delay = INITIAL_DELAY; 

    while (attempt < MAX_RETRIES && !success) {
      try {
        
        if (!order.isLocked) {
          order.isLocked = true;
          await db.put('orders', { ...order, updatedAt: new Date().toISOString() });
        }

        onLog?.(`Attempting sync for order ${order.id.slice(0,8)}... (Attempt ${attempt + 1})`);
        
        
        await wait(800); 
        
        
        const updatedOrder = { 
          ...order, 
          synced: true, 
          isLocked: true, 
          updatedAt: new Date().toISOString() 
        };
        
        await db.put('orders', updatedOrder);
        success = true;

        onLog?.(`Success: Order ${order.id.slice(0,8)} synchronized correctly.`); 

      } catch (error) {
        attempt++;
        
        if (attempt < MAX_RETRIES) {
          
          onLog?.(`Sync failed. Retrying in ${delay / 1000}s...`);
          await wait(delay);
          delay *= 2; 
        } else {
          
          onLog?.(`Error: Failure to communicate with the server after ${MAX_RETRIES} attempts.`); 
        }
      }
    }
  }
};