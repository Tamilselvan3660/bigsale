import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  ChevronDown,
  Sparkles,
  Wrench,
  Camera,
  Zap,
  ShieldCheck,
  Scale,
  Cpu,
  Truck,
  Award,
  HelpCircle,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const cartItemCount = useCartStore((s) => s.itemCount);
  const wishlistItems = useWishlistStore((s) => s.items);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm transition-all duration-200">
      {/* Top Announcement Bar */}
      <div className="bg-navy-900 text-white text-xs py-2 px-4 text-center font-medium tracking-wide">
        <span className="inline-block animate-pulse mr-1">🌍</span>
        Free Worldwide Shipping on orders over $99 | Use code <span className="text-secondary-400 font-bold">BIGSALE</span> for 25% off
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-slate-700 hover:text-navy-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-navy-900 group-hover:bg-accent-600 flex items-center justify-center text-white shadow-md transition-colors duration-200">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-navy-900 leading-none">
                BIG<span className="text-accent-600">SALE</span>
              </span>
              <span className="text-[10px] tracking-widest text-slate-400 font-semibold uppercase leading-tight">
                Upgrade Your World
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-6 relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full bg-slate-100 border border-transparent focus:border-accent-500 focus:bg-white text-slate-900 pl-4 pr-10 py-2.5 rounded-full text-sm outline-none transition-all duration-200 shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-accent-600 hover:bg-accent-700 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Actions: Wishlist, Cart, Account */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-700 hover:text-accent-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-700 hover:text-accent-600 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
              title="Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:inline text-xs font-semibold text-slate-700">Cart</span>
            </Link>

            {/* Account */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center text-xs font-bold uppercase">
                      {user.firstName ? user.firstName[0] : 'U'}
                    </div>
                    <span className="hidden sm:inline text-xs font-semibold text-slate-700 pr-1">
                      {user.firstName}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/cart"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Cart ({cartItemCount})
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    to="/login"
                    className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-accent-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-block text-xs font-semibold bg-navy-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center justify-between border-t border-slate-100 py-2.5 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-accent-600 transition-colors py-1">
              Home
            </Link>
            <Link to="/shop" className="hover:text-accent-600 transition-colors py-1">
              Shop All
            </Link>
            <Link to="/shop?isFeatured=true" className="hover:text-accent-600 transition-colors py-1">
              Featured Deals
            </Link>
            <Link to="/renew" className="hover:text-emerald-600 transition-colors font-bold text-emerald-700 flex items-center gap-1.5 py-1">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Renew & Trade-in</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-black">SAVE 45%</span>
            </Link>

            {/* Smart Hardware Tools Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setToolsDropdownOpen(true)}
              onMouseLeave={() => setToolsDropdownOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 py-1 hover:text-accent-600 transition-colors"
              >
                <span>Smart Hardware Tools</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {toolsDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in duration-100 space-y-1">
                  <Link
                    to="/builder"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-accent-600 flex items-center justify-center shrink-0">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">PC & Setup Builder</p>
                      <p className="text-[10px] text-slate-400">Custom workstation assembly</p>
                    </div>
                  </Link>

                  <Link
                    to="/visual-search"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Visual & Barcode Search</p>
                      <p className="text-[10px] text-slate-400">AI image & UPC catalog lookup</p>
                    </div>
                  </Link>

                  <Link
                    to="/compare"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Scale className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Product Comparison</p>
                      <p className="text-[10px] text-slate-400">Side-by-side technical specs</p>
                    </div>
                  </Link>

                  <Link
                    to="/compatibility"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Hardware Compatibility</p>
                      <p className="text-[10px] text-slate-400">Connector & wattage engine</p>
                    </div>
                  </Link>

                  <Link
                    to="/energy"
                    onClick={() => setToolsDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Energy Calculator</p>
                      <p className="text-[10px] text-slate-400">Power draw & electricity costs</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Services & Trust Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 py-1 hover:text-accent-600 transition-colors"
              >
                <span>Services & Trust</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute top-full left-0 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in duration-100 space-y-1">
                  <Link
                    to="/trust-center"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Trust & Verification</p>
                      <p className="text-[10px] text-slate-400">Cryptographic authenticity check</p>
                    </div>
                  </Link>

                  <Link
                    to="/track"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Courier Tracking</p>
                      <p className="text-[10px] text-slate-400">Real-time airway bill milestones</p>
                    </div>
                  </Link>

                  <Link
                    to="/warranty"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Digital Warranty</p>
                      <p className="text-[10px] text-slate-400">2-Year protection certificates</p>
                    </div>
                  </Link>

                  <Link
                    to="/rewards"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Loyalty Rewards</p>
                      <p className="text-[10px] text-slate-400">Points ledger & VIP benefits</p>
                    </div>
                  </Link>

                  <Link
                    to="/support"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">Support & Repair Hub</p>
                      <p className="text-[10px] text-slate-400">Service tickets & repair pickup</p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-secondary-600 bg-secondary-50 px-2.5 py-1 rounded-full border border-secondary-200 text-[11px] font-bold">
              ⚡ Flash Deals: Up to 50% Off
            </span>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-slate-100 border border-transparent text-slate-900 pl-4 pr-10 py-2 rounded-lg text-sm outline-none"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-3 bg-accent-600 text-white rounded-md flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
          <div className="flex flex-col space-y-2 font-medium text-slate-700">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50">
              Home
            </Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50">
              Shop All
            </Link>
            <Link to="/shop?isFeatured=true" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50">
              Featured Deals
            </Link>
            <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-50">
              Cart ({cartItemCount})
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
