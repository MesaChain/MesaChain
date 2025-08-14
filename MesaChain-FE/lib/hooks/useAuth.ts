import { useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../auth';
import { LoginCredentials, RegisterCredentials } from '../../types/auth';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    setAuth,
    clearAuth,
    setLoading,
    setUser,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    getUserPermissions,
  } = useAuthStore();

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      setAuth(response.user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      toast.success('Login successful!');
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      const response = await authService.register(credentials);
      setAuth(response.user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      toast.success('Registration successful!');
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (tokens?.accessToken) {
        await authService.logout(tokens.accessToken);
      }
      clearAuth();
      toast.success('Logged out successfully');
    } catch (error) {
      // Still clear auth even if API call fails
      clearAuth();
      console.error('Logout error:', error);
    }
  };

  const refreshAuthToken = async () => {
    try {
      if (!tokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      const newTokens = await authService.refreshToken(tokens.refreshToken);
      setAuth(user!, newTokens);
      return newTokens;
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<typeof user>) => {
    try {
      if (!user || !tokens?.accessToken) {
        throw new Error('User not authenticated');
      }

      const updatedUser = await authService.updateProfile(tokens.accessToken, {
        ...updates,
        id: user.id,
      });
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed';
      toast.error(message);
      throw error;
    }
  };

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!tokens?.accessToken || !isAuthenticated) return;

    // Check if token needs refresh (every 10 minutes)
    const interval = setInterval(async () => {
      try {
        // Try to get user profile to check if token is still valid
        await authService.getProfile(tokens.accessToken);
      } catch (error) {
        // Token might be expired, try to refresh
        try {
          await refreshAuthToken();
        } catch (refreshError) {
          // Refresh failed, logout user
          clearAuth();
          toast.error('Session expired. Please login again.');
        }
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [tokens?.accessToken, isAuthenticated]);

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshAuthToken,
    updateProfile,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
    getUserPermissions,
  };
};