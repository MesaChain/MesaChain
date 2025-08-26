export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  USER = 'USER'
}

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

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

// Default permissions by role
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
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