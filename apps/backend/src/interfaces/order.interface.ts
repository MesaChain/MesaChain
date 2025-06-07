export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum MenuCategory {
  FOOD = 'FOOD',
  DRINKS = 'DRINKS'
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: MenuCategory;
  imageUrl?: string;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: Date;
  menuItem?: MenuItem;
}

export interface Order {
  id: string;
  orderNumber: string;
  staffId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  statusHistory?: OrderStatusHistory[];
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  notes?: string;
  changedBy: string;
  createdAt: Date;
}

export interface CreateOrderRequest {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

export interface UpdateOrderRequest {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  items?: CreateOrderItemRequest[];
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  staffId?: string;
  search?: string;
} 