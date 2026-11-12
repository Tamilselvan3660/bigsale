import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Smartphone,
  Laptop,
  Tv,
  Gamepad,
  Camera,
  Layers,
} from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import SmartBundlesSection from '../components/ui/SmartBundlesSection';
import { useProducts, useFeaturedProducts, useCategories } from '../hooks/useProducts';

export const HomePage: React.FC = () => {
  const { data: featuredProducts, isLoading: loadingFeatured } = useFeaturedProducts(8);
  const { data: trendingData, isLoading: loadingTrending } = useProducts({ limit: 8, sortBy: 'rating' });
  const { data: categories } = useCategories();

  const trendingProducts = trendingData?.products || [];

  const categoryIcons: Record<string, any> = {
    Smartphones: Smartphone,
    Computers: Laptop,
    Audio: Headphones,
    Displays: Tv,
    Gaming: Gamepad,
    Cameras: Camera,
  };

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-slate-900 text-white overflow-hidden py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-accent-500/10 border border-accent-400/20 px-3.5 py-1.5 rounded-full text-accent-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                <span>GLOBAL ELECTRONICS MARKETPLACE</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Upgrade Your World with <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                  BIGSALE
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
                Discover flagship smartphones, high-performance laptops, studio-grade audio, and smart home appliances with guaranteed worldwide express shipping.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-bold text-sm px-8 py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/shop?isFeatured=true"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-8 py-4 rounded-xl border border-white/20 transition-all"
                >
                  <Zap className="w-4 h-4 text-secondary-400" />
                  <span>Featured Deals</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-800/40 p-4">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                  alt="Featured Electronics"
                  className="w-full h-80 object-cover rounded-2xl"
                />
                <div className="p-4 space-y-1">
                  <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Premium Sound</span>
                  <h3 className="text-lg font-bold text-white">Spatial Audio Headphones</h3>
                  <p className="text-xs text-slate-400">Starting from $299.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-accent-600 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Global Shipping</h4>
              <p className="text-xs text-slate-500">Fast delivery worldwide</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Secure Payments</h4>
              <p className="text-xs text-slate-500">256-bit encrypted checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Easy Returns</h4>
              <p className="text-xs text-slate-500">30-day money back</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">24/7 Support</h4>
              <p className="text-xs text-slate-500">Dedicated assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Shop by Category</h2>
            <p className="text-sm text-slate-500">Browse devices engineered for peak performance</p>
          </div>
          <Link to="/shop" className="text-xs font-bold text-accent-600 hover:text-accent-700 flex items-center gap-1 group">
            View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {(categories && categories.length > 0
            ? categories.slice(0, 6)
            : [
                { id: '1', name: 'Smartphones', slug: 'smartphones' },
                { id: '2', name: 'Computers', slug: 'computers' },
                { id: '3', name: 'Audio', slug: 'audio' },
                { id: '4', name: 'Displays', slug: 'displays' },
                { id: '5', name: 'Gaming', slug: 'gaming' },
                { id: '6', name: 'Cameras', slug: 'cameras' },
              ]
          ).map((cat: any) => {
            const Icon = categoryIcons[cat.name] || Layers;
            return (
              <Link
                key={cat.id}
                to={`/shop?categoryId=${cat.id}`}
                className="bg-white rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-3 border border-slate-200/80 hover:border-accent-400 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center group-hover:bg-accent-50 group-hover:text-accent-600 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-accent-600 transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Trending Hardware</h2>
            <p className="text-sm text-slate-500">Top-rated items loved by tech enthusiasts</p>
          </div>
          <Link to="/shop?sortBy=rating" className="text-xs font-bold text-accent-600 hover:text-accent-700 flex items-center gap-1 group">
            Browse All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingTrending
            ? Array.from({ length: 4 }).map((_, i) => <ProductCard key={i} isLoading={true} />)
            : trendingProducts.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      {/* 5. FEATURED DEALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Featured Deals</h2>
            <p className="text-sm text-slate-500">Handpicked promotions with limited quantities</p>
          </div>
          <Link to="/shop?isFeatured=true" className="text-xs font-bold text-accent-600 hover:text-accent-700 flex items-center gap-1 group">
            All Deals <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingFeatured
            ? Array.from({ length: 4 }).map((_, i) => <ProductCard key={i} isLoading={true} />)
            : (featuredProducts || []).slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      {/* 6. SMART BUNDLES & COMBO SAVINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SmartBundlesSection />
      </section>
    </div>
  );
};

export default HomePage;
