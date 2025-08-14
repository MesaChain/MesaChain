import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthTokens, UserRole, Permission, DEFAULT_ROLE_PERMISSIONS } from '../types/auth';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setAuth: (user: User, tokens: AuthTokens) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: User) => void;

  // Utility methods
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  getUserPermissions: () => Permission[];
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user: User, tokens: AuthTokens) => {
        set({
          user,
          tokens,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setUser: (user: User) => {
        set({ user });
      },

      hasRole: (role: UserRole): boolean => {
        const { user } = get();
        return user?.role === role;
      },

      hasPermission: (permission: Permission): boolean => {
        const { user } = get();
        if (!user) return false;

        const userPermissions = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
        return userPermissions.includes(permission);
      },

      hasAnyRole: (roles: UserRole[]): boolean => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
      },

      hasAnyPermission: (permissions: Permission[]): boolean => {
        const { user } = get();
        if (!user) return false;

        const userPermissions = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
        return permissions.some(permission => userPermissions.includes(permission));
      },

      getUserPermissions: (): Permission[] => {
        const { user } = get();
        if (!user) return [];
        return DEFAULT_ROLE_PERMISSIONS[user.role] || [];
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);