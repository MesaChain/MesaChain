import { posDB, Order, PaymentIntent } from './db';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt?: Date;
  syncError?: string;
  pendingCount: number;
}

export class SyncManager {
  private listeners: ((status: SyncStatus) => void)[] = [];
  private status: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
  };
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor() {
    this.setupNetworkListeners();
    this.updatePendingCount();
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.updateStatus({ isOnline: true, syncError: undefined });
      this.autoSync();
    });

    window.addEventListener('offline', () => {
      this.updateStatus({ isOnline: false });
      this.clearRetryTimeouts();
    });
  }

  private updateStatus(updates: Partial<SyncStatus>) {
    this.status = { ...this.status, ...updates };
    this.listeners.forEach(listener => listener(this.status));
  }

  private async updatePendingCount() {
    try {
      const { orders, paymentIntents } = await posDB.getUnsyncedData();
      this.updateStatus({ pendingCount: orders.length + paymentIntents.length });
    } catch (error) {
      console.error('Failed to update pending count:', error);
    }
  }

  subscribe(listener: (status: SyncStatus) => void) {
    this.listeners.push(listener);
    listener(this.status);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  async manualSync(): Promise<boolean> {
    if (!this.status.isOnline) {
      this.updateStatus({ syncError: 'No internet connection' });
      return false;
    }

    return this.performSync();
  }

  private async autoSync(): Promise<void> {
    if (this.status.isOnline && !this.status.isSyncing) {
      await this.performSync();
    }
  }

  private async performSync(): Promise<boolean> {
    if (this.status.isSyncing) return false;

    this.updateStatus({ isSyncing: true, syncError: undefined });

    try {
      const { orders, paymentIntents } = await posDB.getUnsyncedData();
      
      if (orders.length === 0 && paymentIntents.length === 0) {
        this.updateStatus({ 
          isSyncing: false, 
          lastSyncAt: new Date(),
          pendingCount: 0 
        });
        return true;
      }

      // Simulate API calls (replace with actual backend calls)
      await this.syncOrders(orders);
      await this.syncPaymentIntents(paymentIntents);

      this.updateStatus({ 
        isSyncing: false, 
        lastSyncAt: new Date(),
        pendingCount: 0 
      });

      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      this.updateStatus({ 
        isSyncing: false, 
        syncError: error instanceof Error ? error.message : 'Sync failed' 
      });
      this.scheduleRetry();
      return false;
    }
  }

  private async syncOrders(orders: Order[]): Promise<void> {
    for (const order of orders) {
      try {
        // Simulate API call
        await this.mockApiCall(`/api/orders`, order);
        
        // Mark as synced
        const syncedOrder = { 
          ...order, 
          status: 'synced' as const, 
          syncedAt: new Date() 
        };
        await posDB.updateOrder(syncedOrder);
      } catch (error) {
        console.error(`Failed to sync order ${order.id}:`, error);
        throw error;
      }
    }
  }

  private async syncPaymentIntents(paymentIntents: PaymentIntent[]): Promise<void> {
    for (const payment of paymentIntents) {
      try {
        // Simulate API call
        await this.mockApiCall(`/api/payments`, payment);
        
        // Mark as synced
        const syncedPayment = { 
          ...payment, 
          status: 'synced' as const, 
          syncedAt: new Date() 
        };
        await posDB.updatePaymentIntent(syncedPayment);
      } catch (error) {
        console.error(`Failed to sync payment ${payment.id}:`, error);
        throw error;
      }
    }
  }

  private async mockApiCall(endpoint: string, data: Order | PaymentIntent): Promise<void> {
    // Simulate network delay and potential failures
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    // Simulate 10% failure rate for testing
    if (Math.random() < 0.1) {
      throw new Error('Network error');
    }
    
    console.log(`Mock API call to ${endpoint}:`, data);
  }

  private scheduleRetry(attempt: number = 1): void {
    if (attempt > 5) return; // Max 5 retries

    const delay = Math.min(1000 * Math.pow(2, attempt), 30000); // Exponential backoff, max 30s
    
    const timeout = setTimeout(() => {
      if (this.status.isOnline) {
        this.performSync().then(success => {
          if (!success) {
            this.scheduleRetry(attempt + 1);
          }
        });
      }
    }, delay);

    this.retryTimeouts.push(timeout);
  }

  private clearRetryTimeouts(): void {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts = [];
  }

  getStatus(): SyncStatus {
    return this.status;
  }
}

export const syncManager = new SyncManager();