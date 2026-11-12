import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';

export const useAuth = () => {
  const authStore = useAuthStore();
  const fetchCart = useCartStore((s) => s.fetchCart);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);

  useEffect(() => {
    authStore.checkAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const user = await authStore.login(email, pass);
      toast.success(`Welcome back, ${user.firstName}!`);
      // Sync cart and wishlist after login
      fetchCart();
      fetchWishlist();
      return user;
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    try {
      const user = await authStore.register(data);
      toast.success(`Welcome to BIGSALE, ${user.firstName}!`);
      fetchCart();
      fetchWishlist();
      return user;
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authStore.logout();
      toast.success('Logged out successfully');
      fetchCart();
      fetchWishlist();
    } catch (err: any) {
      toast.error(err.message || 'Logout failed');
    }
  };

  return {
    ...authStore,
    login,
    register,
    logout,
  };
};
