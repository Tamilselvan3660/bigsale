import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  Check,
  ChevronRight,
  Package,
} from 'lucide-react';
import { useProduct, useAddReview, useRelatedProducts } from '../hooks/useProduct';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import StarRating from '../components/ui/StarRating';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';
import DeliveryChecker from '../components/ui/DeliveryChecker';
import PriceIntelligenceWidget from '../components/ui/PriceIntelligenceWidget';
import SmartBundlesSection from '../components/ui/SmartBundlesSection';
import toast from 'react-hot-toast';

export const ProductDetailPage: React.FC = () => {
  const { identifier, slug } = useParams<{ identifier?: string; slug?: string }>();
  const productKey = slug || identifier;
  const { data: product, isLoading, error } = useProduct(productKey);
  const { data: relatedProducts } = useRelatedProducts(product?.categoryId, product?.id);

  const addItem = useCartStore((s) => s.addItem);
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { user } = useAuthStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews'>('overview');

  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const addReviewMutation = useAddReview(product?.id || '');

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-96 bg-slate-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-24 bg-slate-200 rounded" />
            <div className="h-12 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The product you are looking for does not exist or has been removed.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-navy-900 text-white font-bold text-xs px-6 py-3 rounded-xl">
          Return to Shop
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [
    { id: '1', productId: product.id, url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', altText: product.name, isPrimary: true, sortOrder: 0 }
  ];

  const selectedImage = images[selectedImageIndex] || images[0];

  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId) || null;

  const effectivePrice = selectedVariant?.price != null ? Number(selectedVariant.price) : Number(product.price);
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent = compareAtPrice && compareAtPrice > effectivePrice
    ? Math.round(((compareAtPrice - effectivePrice) / compareAtPrice) * 100)
    : null;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async () => {
    try {
      await addItem(product, quantity, selectedVariant);
      toast.success(`Added ${quantity} x ${product.name} to cart!`, { icon: '🛒' });
    } catch (err: any) {
      toast.error(err.message || 'Could not add to cart');
    }
  };

  const handleToggleWishlist = async () => {
    try {
      const added = await toggleWishlist(product);
      if (added) {
        toast.success(`Added ${product.name} to wishlist!`, { icon: '❤️' });
      } else {
        toast.success(`Removed ${product.name} from wishlist`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not update wishlist');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to post a review');
      return;
    }
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      toast.error('Please fill in title and review comment');
      return;
    }

    try {
      await addReviewMutation.mutateAsync({
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      toast.success('Thank you! Your review has been submitted.');
      setReviewTitle('');
      setReviewComment('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-accent-600 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-accent-600 transition-colors">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/shop?categoryId=${product.categoryId}`} className="hover:text-accent-600 transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm pt-[85%]">
            {discountPercent !== null && (
              <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                -{discountPercent}% OFF
              </span>
            )}
            <img
              src={selectedImage.url}
              alt={selectedImage.altText || product.name}
              className="absolute inset-0 w-full h-full object-contain p-6 hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl bg-white border-2 overflow-hidden shrink-0 transition-all ${
                    selectedImageIndex === idx ? 'border-accent-600 shadow-md ring-2 ring-accent-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="thumbnail" className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            {product.brand && (
              <p className="text-xs font-bold uppercase tracking-wider text-accent-600 mb-1">
                {product.brand.name}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Ratings and SKU */}
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} showScore size="md" />
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-500 font-mono">SKU: {product.sku}</span>
              <span className="text-xs text-slate-400">|</span>
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <Check className="w-3.5 h-3.5" /> In Stock ({product.stock} units)
                </span>
              ) : (
                <span className="text-xs font-semibold text-red-500">Out of Stock</span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 pb-4 border-b border-slate-100">
            <span className="text-3xl font-black text-navy-900">${effectivePrice.toFixed(2)}</span>
            {compareAtPrice && compareAtPrice > effectivePrice && (
              <span className="text-base text-slate-400 line-through">
                ${compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.shortDescription || product.description.slice(0, 200) + '...'}
          </p>

          {/* Variants Selector (if any) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Options / Variants:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id === selectedVariantId ? null : v.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedVariantId === v.id
                        ? 'border-accent-600 bg-accent-50 text-accent-700 ring-2 ring-accent-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{v.name}</span>
                    {v.price && (
                      <span className="ml-1.5 text-slate-400 font-normal">
                        (${Number(v.price).toFixed(2)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-slate-600 hover:text-navy-900 font-bold"
                >
                  -
                </button>
                <span className="px-3 py-2 text-sm font-bold text-slate-900 min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="px-3.5 py-2 text-slate-600 hover:text-navy-900 font-bold"
                >
                  +
                </button>
              </div>

              <Button
                variant="accent"
                size="lg"
                disabled={product.stock === 0}
                onClick={handleAddToCart}
                leftIcon={<ShoppingBag className="w-5 h-5" />}
                className="flex-1 font-bold shadow-md shadow-blue-600/20"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`p-3.5 rounded-xl border transition-all shadow-sm ${
                  inWishlist
                    ? 'border-red-300 bg-red-50 text-red-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:text-red-600'
                }`}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Value Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
              <Truck className="w-4 h-4 text-accent-600 shrink-0" />
              <span>Fast Express Dispatch</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
              <RotateCcw className="w-4 h-4 text-accent-600 shrink-0" />
              <span>30 Days Free Return</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
              <ShieldCheck className="w-4 h-4 text-accent-600 shrink-0" />
              <span>2 Year Guarantee</span>
            </div>
          </div>

          {/* Phase 1 Trust Widgets: Delivery & Price Intelligence */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <DeliveryChecker productId={product.id} />
            <PriceIntelligenceWidget productId={product.id} currentPrice={effectivePrice} />
          </div>
        </div>
      </div>

      {/* Tabs: Overview, Specs, Reviews */}
      <div className="border-t border-slate-200 pt-10">
        <div className="flex items-center gap-6 border-b border-slate-200 pb-px mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'overview'
                ? 'text-navy-900 border-b-2 border-navy-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Product Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'specs'
                ? 'text-navy-900 border-b-2 border-navy-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Technical Specifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'reviews'
                ? 'text-navy-900 border-b-2 border-navy-900'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Customer Reviews ({product.reviews?.length || product.reviewCount || 0})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="prose prose-slate max-w-none text-slate-700 text-sm leading-relaxed whitespace-pre-line bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            {product.description}
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="divide-y divide-slate-100 max-w-2xl text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="font-semibold text-slate-500">Brand</span>
                <span className="font-bold text-slate-900">{product.brand?.name || 'N/A'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-semibold text-slate-500">Category</span>
                <span className="font-bold text-slate-900">{product.category?.name || 'General'}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-semibold text-slate-500">SKU Number</span>
                <span className="font-mono text-slate-900">{product.sku}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-semibold text-slate-500">Available Stock</span>
                <span className="text-slate-900">{product.stock} units</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-semibold text-slate-500">Warranty</span>
                <span className="text-slate-900">Standard 2-Year International</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-8">
            {/* Reviews List */}
            <div className="space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StarRating rating={rev.rating} size="sm" />
                        <span className="font-bold text-slate-900 text-sm">{rev.title}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                      <span>By {rev.user?.firstName || 'Customer'}</span>
                      {rev.isVerifiedPurchase && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  No customer reviews yet. Be the first to share your thoughts!
                </div>
              )}
            </div>

            {/* Review Form */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm max-w-xl">
              <h4 className="text-base font-bold text-slate-900 mb-4">Write a Review</h4>
              {user ? (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Your Rating:
                    </label>
                    <StarRating
                      rating={reviewRating}
                      interactive
                      size="md"
                      onRatingChange={(r) => setReviewRating(r)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Review Title:
                    </label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Absolutely outstanding performance!"
                      required
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-accent-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Review Description:
                    </label>
                    <textarea
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your detailed feedback..."
                      required
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-accent-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="accent"
                    size="sm"
                    isLoading={addReviewMutation.isPending}
                  >
                    Submit Review
                  </Button>
                </form>
              ) : (
                <div className="text-xs text-slate-500">
                  Please{' '}
                  <Link to="/login" className="text-accent-600 font-bold underline">
                    sign in
                  </Link>{' '}
                  to leave a verified product review.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Smart Bundles Section */}
      <div className="border-t border-slate-200 pt-10">
        <SmartBundlesSection productId={product.id} />
      </div>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="border-t border-slate-200 pt-14">
          <h3 className="text-xl font-black text-slate-900 mb-6">You May Also Like</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
