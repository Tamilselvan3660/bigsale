import { create } from 'zustand';
import api from '../lib/api';
import { Product, ApiResponse } from '../types';

interface WishlistState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (product: Product) => Promise<boolean>; // returns true if added, false if removed
  isInWishlist: (productId: string) => boolean;
  removeItem: (productId: string) => Promise<void>;
}

const getStoredWishlist = (): Product[] => {
  try {
    const raw = localStorage.getItem('bigsale_wishlist');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredWishlist = (items: Product[]) => {
  localStorage.setItem('bigsale_wishlist', JSON.stringify(items));
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: getStoredWishlist(),
  isLoading: false,
  error: null,

  isInWishlist: (productId: string) => {
    return get().items.some((p) => p.id === productId);
  },

  fetchWishlist: async () => {
    const token = localStorage.getItem('bigsale_token');
    if (!token) {
      set({ items: getStoredWishlist() });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.get<ApiResponse<{
        wishlist: {
          items: Array<{ id: string; product: Product }>;
        };
      }>>('/wishlist');

      const products = response.data.data.wishlist.items.map((item) => item.product);
      saveStoredWishlist(products);
      set({ items: products, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  toggleWishlist: async (product: Product) => {
    const isPresent = get().isInWishlist(product.id);
    const token = localStorage.getItem('bigsale_token');

    if (isPresent) {
      await get().removeItem(product.id);
      return false;
    } else {
      if (!token) {
        const next = [product, ...get().items];
        saveStoredWishlist(next);
        set({ items: next });
        return true;
      }

      try {
        await api.post('/wishlist', { productId: product.id });
        const next = [product, ...get().items];
        saveStoredWishlist(next);
        set({ items: next });
        return true;
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Failed to add to wishlist');
      }
    }
  },

  removeItem: async (productId: string) => {
    const token = localStorage.getItem('bigsale_token');
    const filtered = get().items.filter((p) => p.id !== productId);
    saveStoredWishlist(filtered);
    set({ items: filtered });

    if (token) {
      try {
        await api.delete(`/wishlist/${productId}`);
      } catch (err) {
        // silent fail on backend delete
      }
    }
  },
}));
