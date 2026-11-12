import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useCartStore } from '../stores/cartStore';
import { Product, ProductVariant } from '../types';

export const useCart = () => {
  const cartStore = useCartStore();

  useEffect(() => {
    cartStore.fetchCart();
  }, []);

  const handleAddToCart = async (
    product: Product,
    quantity = 1,
    variant: ProductVariant | null = null
  ) => {
    try {
      await cartStore.addItem(product, quantity, variant);
      toast.success(`Added ${product.name} to cart!`, {
        icon: '🛒',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add item to cart');
    }
  };

  const handleUpdateQty = async (itemId: string, quantity: number) => {
    try {
      await cartStore.updateQty(itemId, quantity);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update quantity');
    }
  };

  const handleRemoveItem = async (itemId: string, productName?: string) => {
    try {
      await cartStore.removeItem(itemId);
      toast.success(productName ? `Removed ${productName} from cart` : 'Item removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove item');
    }
  };

  const handleApplyCoupon = async (code: string) => {
    try {
      await cartStore.applyCoupon(code);
      toast.success(`Coupon "${code}" applied!`);
    } catch (err: any) {
      toast.error(err.message || 'Invalid coupon code');
      throw err;
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await cartStore.removeCoupon();
      toast.success('Coupon removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove coupon');
    }
  };

  return {
    ...cartStore,
    addToCart: handleAddToCart,
    updateQty: handleUpdateQty,
    removeItem: handleRemoveItem,
    applyCoupon: handleApplyCoupon,
    removeCoupon: handleRemoveCoupon,
  };
};
