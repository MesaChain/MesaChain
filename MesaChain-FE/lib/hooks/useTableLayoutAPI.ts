import { useState } from 'react';
import { TableLayout, Table } from '@/types/tableLayout';

const mockAPI = {
  saveLayout: async (layout: TableLayout): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Use proper logging solution or remove for production
    // TODO: Replace with actual API call
  },

  loadLayout: async (layoutId: string): Promise<TableLayout> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: layoutId,
      name: 'Restaurant Layout',
      tables: [
        {
          id: 'table-1',
          name: 'T-1',
          capacity: 2,
          shape: 'square',
          status: 'available',
          position: { x: 0, y: 0, w: 2, h: 2 },
          bookings: [],
          orders: [],
          isVisible: true
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  getTableBookings: async (tableId: string): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 'booking-1',
        tableId,
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        partySize: 4,
        reservationTime: '2024-01-15T19:00:00Z',
        status: 'confirmed'
      }
    ];
  },

  getTableOrders: async (tableId: string): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id: 'order-1',
        tableId,
        items: [
          { id: 'item-1', name: 'Burger', quantity: 2, price: 12.99 },
          { id: 'item-2', name: 'Fries', quantity: 1, price: 4.99 }
        ],
        total: 30.97,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ];
  },

  updateTableStatus: async (tableId: string, status: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // TODO: Replace with actual API call
  }
};

export function useTableLayoutAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveLayout = async (layout: TableLayout): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await mockAPI.saveLayout(layout);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save layout');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loadLayout = async (layoutId: string): Promise<TableLayout | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await mockAPI.loadLayout(layoutId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load layout');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getTableBookings = async (tableId: string): Promise<any[]> => {
    setIsLoading(true);
    try {
      return await mockAPI.getTableBookings(tableId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load table bookings');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getTableOrders = async (tableId: string): Promise<any[]> => {
    setIsLoading(true);
    try {
      return await mockAPI.getTableOrders(tableId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load table orders');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const updateTableStatus = async (tableId: string, status: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await mockAPI.updateTableStatus(tableId, status);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update table status');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveLayout,
    loadLayout,
    getTableBookings,
    getTableOrders,
    updateTableStatus,
    isLoading,
    error
  };
} 