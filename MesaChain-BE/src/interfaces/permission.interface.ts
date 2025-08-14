import { UserRole } from './user.interface';

export enum Permission {
  // Admin permissions
  ADMIN = 'admin',

  // Staff management
  STAFF_MANAGEMENT = 'staff',

  // POS and order management
  POS = 'pos',

  // Menu management
  MENU_MANAGEMENT = 'menu',

  // Reports and analytics
  REPORTS = 'reports',

  // Kitchen operations
  KITCHEN = 'kitchen',

  // Bar operations
  BAR = 'bar',

  // Payment processing
  PAYMENTS = 'payments',

  // Customer management
  CUSTOMERS = 'customers',

  // View own profile
  VIEW_PROFILE = 'view_profile',

  // Order history
  ORDER_HISTORY = 'order_history',

  // Reservations
  RESERVATIONS = 'reservations'
}

export interface UserPermissions {
  userId: string;
  permissions: Permission[];
}

// Default permissions by role
export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.ADMIN,
    Permission.STAFF_MANAGEMENT,
    Permission.POS,
    Permission.MENU_MANAGEMENT,
    Permission.REPORTS,
    Permission.KITCHEN,
    Permission.BAR,
    Permission.PAYMENTS,
    Permission.CUSTOMERS,
    Permission.VIEW_PROFILE,
    Permission.ORDER_HISTORY,
    Permission.RESERVATIONS
  ],
  [UserRole.STAFF]: [
    Permission.POS,
    Permission.MENU_MANAGEMENT,
    Permission.REPORTS,
    Permission.CUSTOMERS,
    Permission.VIEW_PROFILE,
    Permission.ORDER_HISTORY,
    Permission.RESERVATIONS
  ],
  [UserRole.USER]: [
    Permission.VIEW_PROFILE,
    Permission.ORDER_HISTORY,
    Permission.RESERVATIONS
  ]
};