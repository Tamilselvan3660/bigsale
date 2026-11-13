import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  ChevronDown,
  Sparkles,
  Camera,
  Zap,
  ShieldCheck,
  Scale,
  Cpu,
  Truck,
  Award,
  HelpCircle,
  RefreshCw,
  RotateCcw,
  Clock,
  CheckCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import api from '../../lib/api';

interface SearchSuggestion {
  id: string;
  name: string;
  slug: string;
  price: number | string;
  image: string | null;
}

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // Search autocomplete state
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const cartItemCount = useCartStore((s) => s.itemCount);
  const cartSubtotal = useCartStore((s) => s.subtotal);
  const wishlistItems = useWishlistStore((s) => s.items);

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions as query changes
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.get(`/search/suggestions?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.data?.success && res.data.data?.suggestions) {
          setSuggestions(res.data.data.suggestions);
          setShowSuggestions(true);
        }
      } catch {
        // Fallback gracefully
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      let url = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      if (selectedCategory !== 'All') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      navigate(url);
      setMobileMenuOpen(false);
    }
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/product/${suggestion.slug || suggestion.id}`);
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* 1. TOP ANNOUNCEMENT STRIP (Deep Navy #152A45) */}
      <div className="bg-[#152A45] border-b border-slate-700/60 text-xs py-1.5 px-4 text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-200">
              <Truck className="w-3.5 h-3.5 text-[#FF9900]" />
              <span className="font-medium">Free Worldwide Express Delivery on Orders over $99</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Genuine Certified Hardware</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-[#FFD814]" />
              <span>30-Day Hassle-Free Returns</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium text-slate-300">
            <span className="text-[#FFD814] font-bold">Use Coupon: BIGSALE for 25% Off</span>
            <span className="hidden sm:inline text-slate-500">|</span>
            <Link to="/support" className="hover:text-white transition-colors flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Customer Support</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN MARKETPLACE NAVIGATION BAR (Midnight Navy #0F1B2D) */}
      <div className="bg-[#0F1B2D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-[#152A45]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* BIGSALE Logo */}
            <Link to="/" className="flex items-center gap-2 group shrink-0">
              <div className="w-10 h-10 rounded-xl bg-[#FF9900] flex items-center justify-center text-[#0F1B2D] font-black shadow-md group-hover:bg-[#FFD814] transition-all">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="text-2xl font-black tracking-tight text-white leading-none">
                    BIG<span className="text-[#FF9900]">SALE</span>
                  </span>
                  <span className="text-[10px] text-[#FFD814] font-bold ml-1 tracking-wider uppercase">.GLOBAL</span>
                </div>
                <span className="text-[9px] tracking-widest text-slate-400 font-semibold uppercase leading-tight">
                  Electronics Marketplace
                </span>
              </div>
            </Link>

            {/* Global Marketplace Search Bar with Category Dropdown & Autocomplete */}
            <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-2xl mx-2 relative">
              <form onSubmit={handleSearch} className="flex w-full rounded-xl overflow-hidden shadow-lg border-2 border-transparent focus-within:border-[#FF9900] transition-all bg-white">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-100 text-slate-700 text-xs px-3 py-2.5 font-semibold outline-none border-r border-slate-300 cursor-pointer hover:bg-slate-200 shrink-0"
                >
                  <option value="All">All Categories</option>
                  <option value="Computers">Computers & Laptops</option>
                  <option value="Smartphones">Mobiles & Tablets</option>
                  <option value="Audio">Audio & Headphones</option>
                  <option value="Displays">TV & Displays</option>
                  <option value="Renewed">BIGSALE Renew</option>
                </select>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                  placeholder="Search products, brands, models, technical specs..."
                  className="flex-1 text-slate-900 text-xs px-4 py-2.5 outline-none placeholder:text-slate-400 font-medium"
                />

                <button
                  type="submit"
                  className="bg-[#FF9900] hover:bg-[#e68a00] active:bg-[#cc7a00] text-[#0F1B2D] px-5 py-2.5 flex items-center justify-center transition-colors font-bold shadow-inner shrink-0"
                  title="Search Products"
                >
                  <Search className="w-5 h-5 text-[#0F1B2D]" />
                </button>
              </form>

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-2 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold px-3">
                    <span>Products matching "{searchQuery}"</span>
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full p-2.5 px-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0 p-1 flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-[#FF9900] font-black">${Number(item.price).toFixed(2)}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">View Details →</span>
                      </button>
                    ))}
                  </div>
                  <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="text-xs font-bold text-[#FF9900] hover:text-[#e68a00]"
                    >
                      See all results for "{searchQuery}" →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Marketplace Actions */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Account and Login */}
              <div className="relative">
                {user ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 p-1.5 px-2 rounded-xl hover:bg-[#152A45] transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#FF9900] text-[#0F1B2D] flex items-center justify-center text-xs font-black uppercase shadow">
                        {user.firstName ? user.firstName[0] : 'U'}
                      </div>
                      <div className="hidden sm:flex flex-col leading-tight">
                        <span className="text-[10px] text-slate-400">Hello, {user.firstName}</span>
                        <span className="text-xs font-bold text-white flex items-center gap-1">
                          Account & Lists <ChevronDown className="w-3 h-3 text-slate-400" />
                        </span>
                      </div>
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white text-slate-800 border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in duration-100">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Signed in as</p>
                          <p className="text-xs font-black text-slate-900 truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-[10px] font-bold bg-[#FFD814]/30 text-amber-900 px-2 py-0.5 rounded-full">
                            {user.role} Member
                          </span>
                        </div>

                        <div className="py-1 text-xs">
                          <Link
                            to="/track"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                          >
                            <Package className="w-3.5 h-3.5 text-[#FF9900]" /> Your Orders
                          </Link>
                          <Link
                            to="/wishlist"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                          >
                            <Heart className="w-3.5 h-3.5 text-[#FF9900]" /> Your Wishlist
                          </Link>
                          <Link
                            to="/rewards"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                          >
                            <Award className="w-3.5 h-3.5 text-[#FF9900]" /> Rewards Points
                          </Link>
                          <Link
                            to="/warranty"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#FF9900]" /> Digital Warranties
                          </Link>
                          {user.role === 'ADMIN' && (
                            <Link
                              to="/admin/analytics"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                            >
                              <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold text-accent-600">⚡</span> Admin Dashboard
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-slate-100 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#D93025] hover:bg-red-50 text-left font-bold"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Link
                      to="/login"
                      className="flex flex-col text-left px-2 py-1 hover:bg-[#152A45] rounded-xl text-white transition-colors"
                    >
                      <span className="text-[10px] text-slate-400">Hello, Sign In</span>
                      <span className="text-xs font-bold flex items-center gap-0.5">
                        Account & Lists <ChevronDown className="w-3 h-3 text-slate-400" />
                      </span>
                    </Link>
                    <Link
                      to="/register"
                      className="hidden xl:inline-block text-xs font-black bg-[#FFD814] hover:bg-[#f7ca00] text-[#0F1B2D] px-3 py-1.5 rounded-xl shadow-md transition-all"
                    >
                      Join
                    </Link>
                  </div>
                )}
              </div>

              {/* Returns & Orders link (Amazon-style) */}
              <Link
                to="/track"
                className="hidden sm:flex flex-col text-left px-2 py-1 hover:bg-[#152A45] rounded-xl text-white transition-colors"
                title="Returns & Orders"
              >
                <span className="text-[10px] text-slate-400 leading-tight">Returns</span>
                <span className="text-xs font-bold leading-tight">& Orders</span>
              </Link>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative p-2 text-slate-300 hover:text-white hover:bg-[#152A45] rounded-xl transition-colors"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#D93025] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Shopping Cart with Live Count & Subtotal */}
              <Link
                to="/cart"
                className="flex items-center gap-2 p-1.5 px-3 rounded-xl hover:bg-[#152A45] text-white transition-colors border border-slate-700/50"
                title="Shopping Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-6 h-6 text-[#FF9900]" />
                  <span className="absolute -top-1.5 -right-2 bg-[#FFD814] text-[#0F1B2D] text-[11px] font-black rounded-full px-1.5 py-0.2 shadow">
                    {cartItemCount}
                  </span>
                </div>
                <div className="hidden lg:flex flex-col text-left leading-tight pl-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Cart Total</span>
                  <span className="text-xs font-black text-[#FF9900]">${Number(cartSubtotal).toFixed(2)}</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECONDARY NAVIGATION STRIP (Deep Navy #152A45) */}
      <nav className="bg-[#152A45] border-t border-slate-700/80 px-4 sm:px-6 lg:px-8 py-2 text-xs font-semibold text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5 sm:gap-6 overflow-x-auto py-0.5 scrollbar-none">
            {/* All Categories */}
            <Link
              to="/shop"
              className="flex items-center gap-1.5 text-white hover:text-[#FFD814] transition-colors shrink-0"
            >
              <Menu className="w-4 h-4 text-[#FF9900]" />
              <span className="font-bold">All Categories</span>
            </Link>

            {/* Today's Deals */}
            <Link
              to="/shop?isFeatured=true"
              className="text-slate-200 hover:text-[#FFD814] transition-colors shrink-0 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFD814]" />
              <span>Today's Deals</span>
            </Link>

            {/* BIGSALE Renew */}
            <Link
              to="/renew"
              className="text-white hover:text-emerald-300 font-bold flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>BIGSALE Renew</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded font-black">
                SAVE 45%
              </span>
            </Link>

            {/* Visual Search */}
            <Link
              to="/visual-search"
              className="text-slate-200 hover:text-[#FFD814] transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-[#FF9900]" />
              <span>Visual Search</span>
            </Link>

            {/* Setup Builder */}
            <Link
              to="/builder"
              className="text-slate-200 hover:text-[#FFD814] transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Cpu className="w-3.5 h-3.5 text-[#FF9900]" />
              <span>Setup Builder</span>
            </Link>

            {/* Energy Calculator */}
            <Link
              to="/energy"
              className="text-slate-200 hover:text-[#FFD814] transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-[#FFD814]" />
              <span>Energy Calculator</span>
            </Link>

            {/* Trust Centre */}
            <Link
              to="/trust-centre"
              className="text-slate-200 hover:text-[#FFD814] transition-colors shrink-0 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trust Centre</span>
            </Link>

            {/* Customer Support */}
            <Link
              to="/support"
              className="text-slate-200 hover:text-[#FFD814] transition-colors shrink-0 flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
              <span>Customer Support</span>
            </Link>
          </div>

          {/* Flash Deals Pill */}
          <Link
            to="/shop?isFeatured=true"
            className="hidden xl:flex items-center gap-1.5 text-[11px] font-black bg-gradient-to-r from-[#FF9900] to-[#FFD814] text-[#0F1B2D] px-3 py-1 rounded-full shadow hover:scale-105 transition-all shrink-0"
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>FLASH SALE: UP TO 50% OFF</span>
          </Link>
        </div>
      </nav>

      {/* 4. MOBILE SLIDEOUT DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-sm bg-[#0F1B2D] text-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 bg-[#152A45] border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF9900] flex items-center justify-center text-[#0F1B2D] font-black">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="font-black text-lg text-white">
                  BIG<span className="text-[#FF9900]">SALE</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-slate-800">
              <form onSubmit={handleSearch} className="flex rounded-xl overflow-hidden shadow bg-white">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 text-slate-900 text-xs px-3 py-2 outline-none font-medium"
                />
                <button
                  type="submit"
                  className="bg-[#FF9900] text-[#0F1B2D] px-3.5 py-2 font-bold flex items-center justify-center"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Navigation Sections */}
            <div className="p-4 space-y-6 text-xs flex-1">
              <div>
                <p className="text-[10px] font-bold text-[#FFD814] uppercase tracking-wider mb-2">Shop Departments</p>
                <div className="space-y-1">
                  <Link
                    to="/shop"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-slate-200 hover:bg-[#152A45]"
                  >
                    <Menu className="w-4 h-4 text-[#FF9900]" /> All Products
                  </Link>
                  <Link
                    to="/shop?isFeatured=true"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-slate-200 hover:bg-[#152A45]"
                  >
                    <Sparkles className="w-4 h-4 text-[#FFD814]" /> Today's Deals
                  </Link>
                  <Link
                    to="/renew"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-2 rounded-xl text-white hover:bg-[#152A45] font-bold"
                  >
                    <span className="flex items-center gap-2.5">
                      <RefreshCw className="w-4 h-4 text-emerald-400" /> BIGSALE Renew
                    </span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-black">
                      45% OFF
                    </span>
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#FFD814] uppercase tracking-wider mb-2">Smart Innovation Tools</p>
                <div className="space-y-1">
                  <Link
                    to="/builder"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-slate-200 hover:bg-[#152A45]"
                  >
                    <Cpu className="w-4 h-4 text-[#FF9900]" /> PC & Setup Builder
                  </Link>
                  <Link
                    to="/visual-search"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-slate-200 hover:bg-[#152A45]"
                  >
                    <Camera className="w-4 h-4 text-[#FF9900]" /> Visual & Barcode Search
                  </Link>
                  <Link
                    to="/energy"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-slate-200 hover:bg-[#152A45]"
                  >
                    <Zap className="w-4 h-4 text-[#FFD814]" /> Energy Calculator
                  </Link>
                  <Link
                    to="/trust-centre"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-slate-200 hover:bg-[#152A45]"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Trust Centre & Authenticity
                  </Link>
                  <Link
                    to="/compare"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-slate-200 hover:bg-[#152A45]"
                  >
                    <Scale className="w-4 h-4 text-[#FF9900]" /> Side-by-Side Comparison
                  </Link>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-[#FFD814] uppercase tracking-wider mb-2">Customer & Account</p>
                <div className="space-y-1">
                  <Link
                    to="/track"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-slate-200 hover:bg-[#152A45]"
                  >
                    <Package className="w-4 h-4 text-[#FF9900]" /> Returns & Orders
                  </Link>
                  <Link
                    to="/warranty"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-slate-200 hover:bg-[#152A45]"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#FF9900]" /> Digital Warranties
                  </Link>
                  <Link
                    to="/rewards"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-slate-200 hover:bg-[#152A45]"
                  >
                    <Award className="w-4 h-4 text-[#FF9900]" /> Rewards Points
                  </Link>
                  <Link
                    to="/support"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl text-slate-200 hover:bg-[#152A45]"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400" /> Customer Support
                  </Link>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-[#152A45] border-t border-slate-700">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#FF9900] text-[#0F1B2D] flex items-center justify-center font-bold text-xs">
                      {user.firstName ? user.firstName[0] : 'U'}
                    </div>
                    <span className="text-xs font-bold text-white">{user.firstName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs text-[#D93025] font-bold flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 bg-slate-800 text-white font-bold rounded-xl text-xs hover:bg-slate-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 bg-[#FFD814] text-[#0F1B2D] font-bold rounded-xl text-xs hover:bg-[#f7ca00]"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
