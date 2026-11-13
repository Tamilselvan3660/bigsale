import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Lock,
  Zap,
  Award,
  RefreshCw,
  Share2,
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
  const navigate = useNavigate();
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 h-96 bg-slate-200 rounded-2xl" />
          <div className="lg:col-span-4 space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/3" />
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-24 bg-slate-200 rounded" />
          </div>
          <div className="lg:col-span-3 h-80 bg-slate-200 rounded-2xl" />
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
        <Link to="/shop" className="inline-flex items-center gap-2 bg-[#0F1B2D] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-[#152A45] transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [
    { id: '1', productId: product.id, url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', altText: product.name, isPrimary: true, sortOrder: 0 }
  ];

  const selectedImage = images[selectedImageIndex] || images[0];
  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const effectivePrice = selectedVariant?.price != null ? Number(selectedVariant.price) : Number(product.price);
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent = compareAtPrice && compareAtPrice > effectivePrice
    ? Math.round(((compareAtPrice - effectivePrice) / compareAtPrice) * 100)
    : null;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async () => {
    try {
      await addItem(product.id, quantity, selectedVariantId || undefined);
      toast.success(`Added ${quantity}x "${product.name}" to cart!`);
    } catch {
      toast.error('Failed to add product to cart');
    }
  };

  const handleBuyNow = async () => {
    try {
      await addItem(product.id, quantity, selectedVariantId || undefined);
      navigate('/checkout');
    } catch {
      toast.error('Failed to initiate checkout');
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
    if (!inWishlist) {
      toast.success('Saved to your Wishlist!');
    } else {
      toast('Removed from your Wishlist');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      toast.error('Please fill in both title and comment');
      return;
    }

    try {
      await addReviewMutation.mutateAsync({
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      toast.success('Your review was posted successfully!');
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
    } catch {
      toast.error('Failed to post review. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto py-1">
        <Link to="/" className="hover:text-[#FF9900] transition-colors shrink-0">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <Link to="/shop" className="hover:text-[#FF9900] transition-colors shrink-0">Shop</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <Link to={`/shop?categoryId=${product.categoryId}`} className="hover:text-[#FF9900] transition-colors shrink-0">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        <span className="text-slate-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 3-Column Marketplace Product View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Sticky Gallery */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="relative bg-white rounded-2xl border border-[#D9E0E8] overflow-hidden shadow-sm pt-[90%]">
            {discountPercent !== null && (
              <span className="absolute top-4 left-4 z-10 bg-[#D93025] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
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
                    selectedImageIndex === idx
                      ? 'border-[#FF9900] shadow-md ring-2 ring-[#FF9900]/20'
                      : 'border-[#D9E0E8] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="thumbnail" className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center Column (4 cols): Product Details & Tech Specs */}
        <div className="lg:col-span-4 space-y-5">
          <div>
            {product.brand && (
              <p className="text-xs font-black uppercase tracking-wider text-[#FF9900] mb-1">
                {product.brand.name}
              </p>
            )}
            <h1 className="text-xl sm:text-2xl font-black text-[#172337] leading-tight">
              {product.name}
            </h1>

            {/* Badge: BIGSALE's Choice */}
            <div className="mt-2.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-[#0F1B2D] text-white text-[11px] font-bold px-2 py-0.5 rounded">
                <span>BIGSALE's</span>
                <span className="text-[#FF9900]">Choice</span>
              </span>
              <span className="text-xs text-slate-500">for "{product.category?.name || 'Electronics'}"</span>
            </div>

            {/* Ratings and SKU */}
            <div className="flex flex-wrap items-center gap-3 mt-3 pb-3 border-b border-[#D9E0E8]">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} showScore size="sm" />
              <span className="text-xs text-slate-300">|</span>
              <span className="text-xs text-slate-500 font-mono">SKU: {product.sku}</span>
            </div>
          </div>

          {/* Price Tag */}
          <div className="pb-3 border-b border-[#D9E0E8]">
            <div className="flex items-baseline gap-2">
              {discountPercent && (
                <span className="text-2xl font-light text-[#D93025]">-{discountPercent}%</span>
              )}
              <span className="text-3xl font-black text-[#172337]">${effectivePrice.toFixed(2)}</span>
            </div>
            {compareAtPrice && compareAtPrice > effectivePrice && (
              <p className="text-xs text-slate-500 mt-1">
                Typical price: <span className="line-through">${compareAtPrice.toFixed(2)}</span>
              </p>
            )}
          </div>

          {/* Feature Highlights */}
          <div className="space-y-2 text-xs text-slate-700">
            <h4 className="font-bold text-[#172337] uppercase text-[11px] tracking-wider">About this item</h4>
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed">
              <li>Engineered for high performance with genuine certified components.</li>
              <li>Official 2-Year International BIGSALE Hardware Warranty coverage.</li>
              <li>Fully compatible with multi-device ecosystems and standard accessories.</li>
              <li>Eligible for 30-day no-questions-asked refund or replacement.</li>
            </ul>
          </div>

          {/* Variants Selector (if any) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#D9E0E8]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#172337]">
                Configuration / Variant:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id === selectedVariantId ? null : v.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedVariantId === v.id
                        ? 'border-[#FF9900] bg-orange-50 text-slate-900 ring-2 ring-[#FF9900]/20'
                        : 'border-[#D9E0E8] bg-white text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <span>{v.name}</span>
                    {v.price && (
                      <span className="ml-1 text-slate-400 font-normal">
                        (${Number(v.price).toFixed(2)})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Phase 1 Trust Widgets: Delivery & Price Intelligence */}
          <div className="space-y-4 pt-3 border-t border-[#D9E0E8]">
            <DeliveryChecker productId={product.id} />
            <PriceIntelligenceWidget productId={product.id} currentPrice={effectivePrice} />
          </div>
        </div>

        {/* Right Column (3 cols): Amazon-Style Buy Box */}
        <div className="lg:col-span-3">
          <div className="bg-white p-5 rounded-2xl border border-[#D9E0E8] shadow-sm space-y-4">
            {/* Price in Buy Box */}
            <div>
              <span className="text-2xl font-black text-[#172337]">${effectivePrice.toFixed(2)}</span>
              <p className="text-xs text-slate-600 mt-1">
                FREE Delivery on eligible orders over $99.
              </p>
            </div>

            {/* Stock status */}
            <div>
              {product.stock > 0 ? (
                <div>
                  <span className="text-sm font-bold text-[#168A43]">In Stock</span>
                  {product.stock < 10 && (
                    <p className="text-xs text-[#D93025] font-semibold mt-0.5">
                      Only {product.stock} left in stock - order soon.
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-sm font-bold text-[#D93025]">Currently Unavailable</span>
              )}
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-semibold text-slate-600">Quantity:</span>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-slate-50 border border-[#D9E0E8] rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#FF9900]"
                >
                  {Array.from({ length: Math.min(product.stock, 10) }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={product.stock === 0}
                onClick={handleAddToCart}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FFD814] hover:bg-[#f7ca00] active:bg-[#f0c14b] text-[#0F1B2D] font-bold text-xs shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                disabled={product.stock === 0}
                onClick={handleBuyNow}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FF9900] hover:bg-[#e68a00] active:bg-[#cc7a00] text-[#0F1B2D] font-bold text-xs shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Buy Box Fulfillment Metadata */}
            <div className="space-y-1.5 text-[11px] pt-3 border-t border-slate-100 text-slate-600">
              <div className="flex justify-between">
                <span>Ships from</span>
                <span className="font-semibold text-slate-900">BIGSALE Global</span>
              </div>
              <div className="flex justify-between">
                <span>Sold by</span>
                <span className="font-semibold text-slate-900">{product.brand?.name || 'BIGSALE Retail'}</span>
              </div>
              <div className="flex justify-between">
                <span>Returns</span>
                <span className="font-semibold text-[#168A43]">30-Day Refund</span>
              </div>
              <div className="flex justify-between">
                <span>Payment</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#168A43]" /> Secure transaction
                </span>
              </div>
            </div>

            {/* Trade-in Promo Card */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <RefreshCw className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>BIGSALE Trade-In</span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1">
                Trade in your old device for up to $150 credit towards this purchase.
              </p>
              <Link to="/renew" className="inline-block mt-1 text-[11px] font-bold text-emerald-700 hover:underline">
                Calculate value →
              </Link>
            </div>

            {/* Wishlist Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`w-full py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                  inWishlist
                    ? 'border-red-300 bg-red-50 text-red-600'
                    : 'border-[#D9E0E8] bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-red-500' : ''}`} />
                <span>{inWishlist ? 'In your Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Overview, Specs, Reviews */}
      <div className="border-t border-[#D9E0E8] pt-10">
        <div className="flex items-center gap-6 border-b border-[#D9E0E8] pb-px mb-8">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'overview'
                ? 'text-[#0F1B2D] border-b-2 border-[#FF9900]'
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
                ? 'text-[#0F1B2D] border-b-2 border-[#FF9900]'
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
                ? 'text-[#0F1B2D] border-b-2 border-[#FF9900]'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Customer Reviews ({product.reviews?.length || product.reviewCount || 0})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white p-8 rounded-2xl border border-[#D9E0E8] shadow-sm text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="bg-white p-8 rounded-2xl border border-[#D9E0E8] shadow-sm">
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
                <span className="font-semibold text-slate-500">Stock Availability</span>
                <span className="text-slate-900">{product.stock} units in warehouse</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="font-semibold text-slate-500">Warranty</span>
                <span className="text-slate-900">Standard 2-Year International Coverage</span>
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
                    className="bg-white p-6 rounded-2xl border border-[#D9E0E8] shadow-sm space-y-2"
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
                <div className="text-center py-8 bg-white rounded-2xl border border-[#D9E0E8] text-slate-500 text-xs">
                  No customer reviews yet. Be the first to share your experience!
                </div>
              )}
            </div>

            {/* Review Form */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#D9E0E8] shadow-sm max-w-xl">
              <h4 className="text-base font-bold text-slate-900 mb-4">Write a Verified Review</h4>
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
                      placeholder="e.g. Outstanding build quality and speedy delivery"
                      required
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-[#D9E0E8] rounded-lg outline-none focus:border-[#FF9900]"
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
                      placeholder="Share your detailed feedback with the community..."
                      required
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-[#D9E0E8] rounded-lg outline-none focus:border-[#FF9900]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addReviewMutation.isPending}
                    className="py-2.5 px-6 rounded-xl bg-[#FF9900] hover:bg-[#e68a00] text-[#0F1B2D] font-bold text-xs shadow transition-colors"
                  >
                    Submit Review
                  </button>
                </form>
              ) : (
                <div className="text-xs text-slate-500">
                  Please{' '}
                  <Link to="/login" className="text-[#FF9900] font-bold underline">
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
      <div className="border-t border-[#D9E0E8] pt-10">
        <SmartBundlesSection productId={product.id} />
      </div>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="border-t border-[#D9E0E8] pt-14">
          <h3 className="text-xl font-black text-[#172337] mb-6">Related Products & Recommendations</h3>
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
