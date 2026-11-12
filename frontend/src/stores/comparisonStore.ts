import { create } from 'zustand';
import { Product } from '../types';

interface ComparisonState {
  selectedProducts: Product[];
  addProduct: (product: Product) => boolean;
  removeProduct: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
}

const STORAGE_KEY = 'bigsale_comparison_items';

const getStored = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  selectedProducts: getStored(),

  addProduct: (product: Product) => {
    const current = get().selectedProducts;
    if (current.some((p) => p.id === product.id)) {
      return false;
    }
    if (current.length >= 4) {
      return false;
    }
    const updated = [...current, product];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ selectedProducts: updated });
    return true;
  },

  removeProduct: (productId: string) => {
    const updated = get().selectedProducts.filter((p) => p.id !== productId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({ selectedProducts: updated });
  },

  clearComparison: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ selectedProducts: [] });
  },

  isInComparison: (productId: string) => {
    return get().selectedProducts.some((p) => p.id === productId);
  },
}));

