import { apiBaseUrlBackend } from './config';
import { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/auth';

const API_BASE = apiBaseUrlBackend;

class AuthService {
  private getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  async logout(token: string): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      console.warn('Logout request failed, but continuing with local logout');
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return response.json();
  }

  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }

    return response.json();
  }

  async updateProfile(token: string, updates: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE}/users/${updates.id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Update failed' }));
      throw new Error(error.message || 'Update failed');
    }

    return response.json();
  }
}

export const authService = new AuthService();