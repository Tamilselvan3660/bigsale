import { create } from 'zustand';
import api from '../lib/api';
import { CartItem, Product, ProductVariant, ApiResponse } from '../types';

interface CartState {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string | null;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant | null) => Promise<void>;
  updateQty: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
}

const getGuestCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem('bigsale_guest_cart');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items: CartItem[]) => {
  localStorage.setItem('bigsale_guest_cart', JSON.stringify(items));
};

const computeTotals = (items: CartItem[], couponCode: string | null = null, discount = 0) => {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const p = item.variant?.price != null ? Number(item.variant.price) : Number(item.product.price);
    return sum + p * item.quantity;
  }, 0);
  const total = Math.max(0, subtotal - discount);
  return { itemCount, subtotal, discount, total, couponCode };
};

export const useCartStore = create<CartState>((set, get) => {
  const initialGuestItems = getGuestCart();
  const initialTotals = computeTotals(initialGuestItems);

  return {
    items: initialGuestItems,
    itemCount: initialTotals.itemCount,
    subtotal: initialTotals.subtotal,
    discount: 0,
    total: initialTotals.total,
    couponCode: null,
    isLoading: false,
    error: null,

    fetchCart: async () => {
      const token = localStorage.getItem('bigsale_token');
      if (!token) {
        const guestItems = getGuestCart();
        const totals = computeTotals(guestItems, get().couponCode, get().discount);
        set({ items: guestItems, ...totals });
        return;
      }

      set({ isLoading: true, error: null });
      try {
        const response = await api.get<ApiResponse<{
          cart: { id: string; couponCode?: string; items: CartItem[] };
          summary: {
            itemCount: number;
            subtotal: string;
            discount: string;
            total: string;
            coupon?: any;
          };
        }>>('/cart');

        const { cart, summary } = response.data.data;
        set({
          items: cart.items || [],
          itemCount: summary.itemCount,
          subtotal: parseFloat(summary.subtotal) || 0,
          discount: parseFloat(summary.discount) || 0,
          total: parseFloat(summary.total) || 0,
          couponCode: cart.couponCode || null,
          isLoading: false,
        });
      } catch (err: any) {
        set({ isLoading: false, error: err.message });
      }
    },

    addItem: async (product, quantity = 1, variant = null) => {
      const token = localStorage.getItem('bigsale_token');

      if (!token) {
        // Guest mode
        const items = [...get().items];
        const existingIndex = items.findIndex(
          (i) => i.productId === product.id && (variant ? i.variantId === variant.id : !i.variantId)
        );

        if (existingIndex > -1) {
          items[existingIndex].quantity += quantity;
        } else {
          items.push({
            id: `guest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            cartId: 'guest',
            productId: product.id,
            variantId: variant ? variant.id : null,
            quantity,
            price: variant?.price != null ? variant.price : product.price,
            product,
            variant,
          });
        }

        saveGuestCart(items);
        const totals = computeTotals(items, get().couponCode, get().discount);
        set({ items, ...totals });
        return;
      }

      // Logged in mode
      try {
        await api.post('/cart/items', {
          productId: product.id,
          variantId: variant ? variant.id : undefined,
          quantity,
        });
        await get().fetchCart();
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Failed to add item to cart');
      }
    },

    updateQty: async (itemId, quantity) => {
      const token = localStorage.getItem('bigsale_token');
      if (quantity < 1) {
        await get().removeItem(itemId);
        return;
      }

      if (!token) {
        const items = get().items.map((i) => (i.id === itemId ? { ...i, quantity } : i));
        saveGuestCart(items);
        const totals = computeTotals(items, get().couponCode, get().discount);
        set({ items, ...totals });
        return;
      }

      try {
        await api.put(`/cart/items/${itemId}`, { quantity });
        await get().fetchCart();
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Failed to update quantity');
      }
    },

    removeItem: async (itemId) => {
      const token = localStorage.getItem('bigsale_token');
      if (!token) {
        const items = get().items.filter((i) => i.id !== itemId);
        saveGuestCart(items);
        const totals = computeTotals(items, get().couponCode, get().discount);
        set({ items, ...totals });
        return;
      }

      try {
        await api.delete(`/cart/items/${itemId}`);
        await get().fetchCart();
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Failed to remove item');
      }
    },

    clearCart: async () => {
      const token = localStorage.getItem('bigsale_token');
      if (!token) {
        localStorage.removeItem('bigsale_guest_cart');
        set({
          items: [],
          itemCount: 0,
          subtotal: 0,
          discount: 0,
          total: 0,
          couponCode: null,
        });
        return;
      }

      try {
        await api.delete('/cart');
        set({
          items: [],
          itemCount: 0,
          subtotal: 0,
          discount: 0,
          total: 0,
          couponCode: null,
        });
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Failed to clear cart');
      }
    },

    applyCoupon: async (code) => {
      const token = localStorage.getItem('bigsale_token');
      if (!token) {
        // Mock coupon for guest
        if (code.toUpperCase() === 'BIGSALE') {
          const subtotal = get().subtotal;
          const discount = Math.round(subtotal * 0.25 * 100) / 100;
          const totals = computeTotals(get().items, 'BIGSALE', discount);
          set({ ...totals, couponCode: 'BIGSALE', discount });
          return;
        }
        throw new Error('Please login to apply coupon code');
      }

      try {
        await api.post('/cart/apply-coupon', { code });
        await get().fetchCart();
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Invalid coupon code');
      }
    },

    removeCoupon: async () => {
      const token = localStorage.getItem('bigsale_token');
      if (!token) {
        const totals = computeTotals(get().items, null, 0);
        set({ ...totals, couponCode: null, discount: 0 });
        return;
      }

      try {
        await api.delete('/cart/coupon');
        await get().fetchCart();
      } catch (err: any) {
        throw new Error(err.response?.data?.message || 'Failed to remove coupon');
      }
    },
  };
});
