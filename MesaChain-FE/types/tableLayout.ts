export type TableShape = 'square' | 'round';
export type TableStatus = 'available' | 'reserved' | 'occupied' | 'out-of-service';

export interface Table {
  id: string;
  name: string;
  capacity: number;
  shape: TableShape;
  status: TableStatus;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  bookings?: Booking[];
  orders?: Order[];
  isVisible: boolean;
}

export interface Booking {
  id: string;
  tableId: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  reservationTime: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid';
  createdAt: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface TableLayout {
  id: string;
  name: string;
  tables: Table[];
  createdAt: string;
  updatedAt: string;
}

export interface TableTemplate {
  id: string;
  name: string;
  capacity: number;
  shape: TableShape;
  defaultSize: {
    w: number;
    h: number;
  };
}

export interface LayoutState {
  tables: Table[];
  selectedTableId: string | null;
  isDragging: boolean;
  isResizing: boolean;
  zoom: number;
  gridSize: number;
} 