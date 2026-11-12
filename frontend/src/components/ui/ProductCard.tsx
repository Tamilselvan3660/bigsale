import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Scale } from 'lucide-react';
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
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col space-y-3">
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
      toast.success(`${product.name} added to cart!`);
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
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {discountPercent && (
          <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[10px] tracking-wide shadow-sm">
            -{discountPercent}%
          </span>
        )}
        {product.isFeatured && (
          <span className="px-2 py-0.5 rounded-md bg-navy-900 text-white font-bold text-[10px] tracking-wide shadow-sm">
            HOT
          </span>
        )}
      </div>

      {/* Wishlist and Compare Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`p-2 rounded-full transition-colors ${
            inWishlist
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/90 text-slate-400 hover:text-rose-600 hover:bg-white shadow-sm'
          }`}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-600' : ''}`} />
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
                toast.success('Added to comparison');
              } else {
                toast.error('Maximum 4 items in comparison');
              }
            }
          }}
          className={`p-2 rounded-full transition-colors ${
            isInComparison(product.id)
              ? 'bg-blue-600 text-white'
              : 'bg-white/90 text-slate-400 hover:text-blue-600 hover:bg-white shadow-sm'
          }`}
          title="Compare specifications"
        >
          <Scale className="w-4 h-4" />
        </button>
      </div>

      {/* Product Image */}
      <Link to={`/product/${product.slug || product.id}`} className="block relative overflow-hidden bg-slate-50 pt-[100%]">
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
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {product.brand?.name || 'Electronics'}
          </div>

          <Link
            to={`/product/${product.slug || product.id}`}
            className="block font-semibold text-slate-900 group-hover:text-accent-600 transition-colors line-clamp-2 text-sm leading-snug min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </Link>

          <div className="flex items-center gap-1.5 mt-1.5">
            <StarRating rating={Number(product.rating || 4.5)} size={14} />
            <span className="text-xs text-slate-400 font-medium">
              ({product.reviewCount || 1})
            </span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-black text-slate-900">
              ${price.toFixed(2)}
            </div>
            {compareAtPrice && compareAtPrice > price && (
              <div className="text-xs text-slate-400 line-through">
                ${compareAtPrice.toFixed(2)}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isAdding}
            className="px-3.5 py-2 bg-accent-600 hover:bg-accent-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            {isAdding ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
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
