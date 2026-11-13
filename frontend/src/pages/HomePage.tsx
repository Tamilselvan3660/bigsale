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
  CheckCircle,
  RefreshCw,
  Cpu,
  Award,
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
    <div className="space-y-10 pb-16 bg-[#F3F5F8]">
      {/* 1. HERO PROMOTIONAL BANNER */}
      <section className="bg-gradient-to-r from-[#0F1B2D] via-[#152A45] to-[#0F1B2D] text-white py-12 lg:py-16 border-b border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#FF9900]/20 border border-[#FF9900]/40 px-3.5 py-1 rounded-full text-[#FFD814] text-xs font-black">
                <Zap className="w-3.5 h-3.5 fill-[#FFD814]" />
                <span>BIGSALE MEGA SHOPPING EVENT • UP TO 50% OFF</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
                Everything Electronic. <br />
                <span className="text-[#FF9900]">Everything You Need.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed">
                Discover flagship smartphones, high-efficiency laptops, studio monitoring audio, and certified refurbished hardware backed by authentic warranties and express courier freight.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3.5 justify-center lg:justify-start pt-2">
                <Link
                  to="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FFD814] hover:bg-[#f7ca00] text-[#0F1B2D] font-black text-sm px-8 py-3.5 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 border border-[#e2c000]"
                >
                  <span>Shop Today's Deals</span>
                  <ArrowRight className="w-4 h-4 text-[#0F1B2D]" />
                </Link>

                <Link
                  to="/renew"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3.5 rounded-xl border border-white/20 transition-all"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>Explore Refurbished (Save 45%)</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-2 border-[#FF9900]/30 bg-[#152A45] p-4">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                  alt="Featured Electronics"
                  className="w-full h-72 object-cover rounded-2xl"
                />
                <div className="p-3.5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-[#FFD814] uppercase tracking-wider">Editor's Choice</span>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">SAVE $120</span>
                  </div>
                  <h3 className="text-base font-bold text-white">Spatial Wireless ANC Headphones</h3>
                  <p className="text-xs text-slate-300">
                    From <span className="text-[#FF9900] font-black text-sm">$299.00</span> <span className="line-through text-slate-500 text-[11px]">$419.00</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST INFORMATION STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl p-5 sm:p-6 border border-[#D9E0E8] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#FF9900] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#172337]">Free Express Delivery</h4>
              <p className="text-[11px] text-[#667085]">On orders over $99.00</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#168A43] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#172337]">100% Genuine Hardware</h4>
              <p className="text-[11px] text-[#667085]">Cryptographic OEM verification</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#172337]">30-Day Easy Returns</h4>
              <p className="text-[11px] text-[#667085]">Risk-free money-back guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#172337]">2-Year Warranty</h4>
              <p className="text-[11px] text-[#667085]">Full international coverage</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BIGSALE 5 SMART SHOPPING INNOVATION TILES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-xl font-black text-[#172337]">BIGSALE Intelligent Hardware Services</h2>
          <p className="text-xs text-[#667085]">Next-generation shopping utilities engineered for tech buyers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            to="/renew"
            className="bg-white rounded-2xl border border-[#D9E0E8] hover:border-emerald-500 hover:shadow-md p-4 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-[#172337] group-hover:text-emerald-700">BIGSALE Renew</h3>
              <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">Certified refurbished gadgets & trade-in cash valuation.</p>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 mt-3 flex items-center gap-1">
              Explore Renew →
            </span>
          </Link>

          <Link
            to="/builder"
            className="bg-white rounded-2xl border border-[#D9E0E8] hover:border-[#FF9900] hover:shadow-md p-4 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#FF9900] flex items-center justify-center mb-3">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-[#172337] group-hover:text-[#FF9900]">PC Setup Builder</h3>
              <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">Assemble custom rigs with real-time socket & wattage validation.</p>
            </div>
            <span className="text-[11px] font-bold text-[#FF9900] mt-3 flex items-center gap-1">
              Build Rig →
            </span>
          </Link>

          <Link
            to="/visual-search"
            className="bg-white rounded-2xl border border-[#D9E0E8] hover:border-blue-500 hover:shadow-md p-4 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-[#172337] group-hover:text-blue-700">Visual & Barcode Search</h3>
              <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">Upload a product photo or scan retail barcode instantly.</p>
            </div>
            <span className="text-[11px] font-bold text-blue-600 mt-3 flex items-center gap-1">
              Scan Photo →
            </span>
          </Link>

          <Link
            to="/energy"
            className="bg-white rounded-2xl border border-[#D9E0E8] hover:border-amber-500 hover:shadow-md p-4 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-[#172337] group-hover:text-yellow-700">Energy Calculator</h3>
              <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">Calculate monthly kWh draw and electricity operating costs.</p>
            </div>
            <span className="text-[11px] font-bold text-yellow-700 mt-3 flex items-center gap-1">
              Calculate Cost →
            </span>
          </Link>

          <Link
            to="/trust-center"
            className="bg-white rounded-2xl border border-[#D9E0E8] hover:border-indigo-500 hover:shadow-md p-4 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-[#172337] group-hover:text-indigo-700">Trust Centre</h3>
              <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">Verify OEM serial numbers and view supply-chain authenticity.</p>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 mt-3 flex items-center gap-1">
              Verify Serial →
            </span>
          </Link>
        </div>
      </section>

      {/* 4. FEATURED HARDWARE CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-[#172337]">Shop by Department</h2>
            <p className="text-xs text-[#667085]">Explore high-performance electronics engineered for creators & consumers</p>
          </div>
          <Link to="/shop" className="text-xs font-bold text-[#FF9900] hover:underline flex items-center gap-1">
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
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
                className="bg-white rounded-2xl p-4 text-center flex flex-col items-center justify-center space-y-2 border border-[#D9E0E8] hover:border-[#FF9900] hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-50 text-[#0F1B2D] flex items-center justify-center group-hover:bg-amber-50 group-hover:text-[#FF9900] transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#172337] group-hover:text-[#FF9900] transition-colors">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. TODAY'S DEALS & BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D93025] animate-ping" />
            <h2 className="text-xl font-black text-[#172337]">Today's Mega Deals & Promotions</h2>
          </div>
          <Link to="/shop?isFeatured=true" className="text-xs font-bold text-[#FF9900] hover:underline flex items-center gap-1">
            See All Deals <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loadingFeatured
            ? Array.from({ length: 4 }).map((_, i) => <ProductCard key={i} isLoading={true} />)
            : (featuredProducts || []).slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      {/* 6. SMART BUNDLES & COMBO PACKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SmartBundlesSection />
      </section>

      {/* 7. TRENDING HARDWARE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-[#172337]">Trending Electronics</h2>
            <p className="text-xs text-[#667085]">Top-rated by verified consumer benchmarks</p>
          </div>
          <Link to="/shop?sortBy=rating" className="text-xs font-bold text-[#FF9900] hover:underline flex items-center gap-1">
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loadingTrending
            ? Array.from({ length: 4 }).map((_, i) => <ProductCard key={i} isLoading={true} />)
            : trendingProducts.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
