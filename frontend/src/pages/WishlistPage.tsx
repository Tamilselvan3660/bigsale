import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlistStore } from '../stores/wishlistStore';
import { useCartStore } from '../stores/cartStore';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

export const WishlistPage: React.FC = () => {
  const { items, fetchWishlist } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleAddAllToCart = async () => {
    if (items.length === 0) return;
    try {
      for (const product of items) {
        await addItem(product, 1);
      }
      toast.success(`Added all ${items.length} items to your shopping bag!`, { icon: '🛒' });
    } catch {
      toast.error('Failed to add some items to cart');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Your Wishlist is Empty</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-8">
          Save your favorite products to your wishlist so you can quickly find them and purchase later.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-navy-900 hover:bg-slate-800 text-white font-bold text-xs px-8 py-3.5 rounded-xl shadow-md transition-all"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Saved Wishlist</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            You have {items.length} {items.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={handleAddAllToCart}
          leftIcon={<ShoppingBag className="w-4 h-4" />}
          className="font-bold"
        >
          Add All to Cart
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
