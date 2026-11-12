import { create } from 'zustand';
import api from '../lib/api';
import { User, ApiResponse } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

const getStoredToken = () => localStorage.getItem('bigsale_token');
const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem('bigsale_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  token: getStoredToken(),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>(
        '/auth/login',
        { email, password }
      );
      const { user, token } = response.data.data;
      localStorage.setItem('bigsale_token', token);
      localStorage.setItem('bigsale_user', JSON.stringify(user));
      set({ user, token, isLoading: false });
      return user;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>(
        '/auth/register',
        data
      );
      const { user, token } = response.data.data;
      localStorage.setItem('bigsale_token', token);
      localStorage.setItem('bigsale_user', JSON.stringify(user));
      set({ user, token, isLoading: false });
      return user;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed.';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout').catch(() => {});
    } finally {
      localStorage.removeItem('bigsale_token');
      localStorage.removeItem('bigsale_user');
      set({ user: null, token: null, error: null });
    }
  },

  checkAuth: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
      const user = response.data.data.user;
      localStorage.setItem('bigsale_user', JSON.stringify(user));
      set({ user });
    } catch (err) {
      // If token invalid, clear
      localStorage.removeItem('bigsale_token');
      localStorage.removeItem('bigsale_user');
      set({ user: null, token: null });
    }
  },

  updateUser: (updated) => {
    const current = get().user;
    if (!current) return;
    const nextUser = { ...current, ...updated };
    localStorage.setItem('bigsale_user', JSON.stringify(nextUser));
    set({ user: nextUser });
  },
}));
