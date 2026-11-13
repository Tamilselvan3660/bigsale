import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Scale, Check, Truck, Zap } from 'lucide-react';
import { Product } from '../../types';
import StarRating from './StarRating';
import Skeleton from './Skeleton';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useComparisonStore } from '../../stores/comparisonStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product?: Product;
  isLoading?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, isLoading = false }) => {
  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { isInComparison, addProduct, removeProduct } = useComparisonStore();
  const [isAdding, setIsAdding] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  if (isLoading || !product) {
    return (
      <div className="bg-white rounded-2xl border border-[#D9E0E8] p-4 shadow-sm flex flex-col space-y-3">
        <Skeleton className="w-full pt-[100%] rounded-xl" />
        <Skeleton className="w-1/3 h-4" />
        <Skeleton className="w-3/4 h-5" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="w-1/2 h-6" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
    );
  }

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images.find((img) => img.isPrimary)?.url || product.images[0].url
      : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';

  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const compareAtPrice =
    typeof product.compareAtPrice === 'string'
      ? parseFloat(product.compareAtPrice)
      : product.compareAtPrice;

  const discountPercent =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : null;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsAdding(true);
      await addItem(product, 1);
      toast.success(`${product.name} added to cart!`, { icon: '🛒' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group bg-white rounded-2xl border border-[#D9E0E8] hover:border-[#FF9900] hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden relative">
      {/* Marketplace Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 pointer-events-none">
        {discountPercent && (
          <span className="px-2 py-0.5 rounded-md bg-[#D93025] text-white font-black text-[10px] tracking-wide shadow">
            {discountPercent}% OFF
          </span>
        )}
        {product.isFeatured && (
          <span className="px-2 py-0.5 rounded-md bg-[#0F1B2D] text-[#FFD814] font-black text-[10px] tracking-wide shadow flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5 fill-[#FFD814]" /> DEAL
          </span>
        )}
      </div>

      {/* Floating Action Controls */}
      <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`p-2 rounded-full transition-colors shadow-sm ${
            inWishlist
              ? 'bg-red-50 text-[#D93025]'
              : 'bg-white/90 text-slate-400 hover:text-[#D93025] hover:bg-white'
          }`}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#D93025]' : ''}`} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isInComparison(product.id)) {
              removeProduct(product.id);
              toast.success('Removed from comparison');
            } else {
              const added = addProduct(product);
              if (added) {
                toast.success('Added to comparison matrix');
              } else {
                toast.error('Maximum 4 items in comparison');
              }
            }
          }}
          className={`p-2 rounded-full transition-colors shadow-sm ${
            isInComparison(product.id)
              ? 'bg-[#0F1B2D] text-[#FFD814]'
              : 'bg-white/90 text-slate-400 hover:text-[#0F1B2D] hover:bg-white'
          }`}
          title="Compare specifications"
        >
          <Scale className="w-4 h-4" />
        </button>
      </div>

      {/* Product Image */}
      <Link to={`/product/${product.slug || product.id}`} className="block relative overflow-hidden bg-white pt-[85%] border-b border-slate-100">
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600';
          }}
        />
      </Link>

      {/* Content Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#667085] mb-0.5">
            {product.brand?.name || 'Electronics'}
          </div>

          <Link
            to={`/product/${product.slug || product.id}`}
            className="block font-bold text-[#172337] group-hover:text-[#FF9900] transition-colors line-clamp-2 text-xs leading-relaxed min-h-[2.4rem]"
            title={product.name}
          >
            {product.name}
          </Link>

          <div className="flex items-center gap-1.5 mt-1.5">
            <StarRating rating={Number(product.rating || 4.5)} size={13} />
            <span className="text-[11px] text-[#667085] font-semibold">
              ({product.reviewCount || 1})
            </span>
          </div>

          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#168A43] font-bold">
            <Check className="w-3 h-3" />
            <span>In Stock • Express Dispatch</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-[#D9E0E8] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-[#0F1B2D]">
                ${price.toFixed(2)}
              </span>
              {compareAtPrice && compareAtPrice > price && (
                <span className="text-xs text-[#667085] line-through">
                  ${compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="px-4 py-2 bg-[#FFD814] hover:bg-[#f7ca00] active:scale-95 text-[#0F1B2D] rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm border border-[#e2c000]"
          >
            {isAdding ? (
              <span className="inline-block w-4 h-4 border-2 border-[#0F1B2D] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#0F1B2D]" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
