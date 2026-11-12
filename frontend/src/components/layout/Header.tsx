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
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';

export const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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
        <nav className="hidden md:flex items-center justify-between border-t border-slate-100 py-3 text-sm font-medium text-slate-600">
          <div className="flex items-center gap-8">
            <Link to="/" className="hover:text-accent-600 transition-colors">
              Home
            </Link>
            <Link to="/shop" className="hover:text-accent-600 transition-colors">
              Shop All
            </Link>
            <Link to="/shop?isFeatured=true" className="hover:text-accent-600 transition-colors">
              Featured Deals
            </Link>
            <Link to="/shop?sortBy=newest" className="hover:text-accent-600 transition-colors">
              New Arrivals
            </Link>
            <Link to="/compare" className="hover:text-accent-600 transition-colors">
              Compare
            </Link>
            <Link to="/compatibility" className="hover:text-accent-600 transition-colors">
              Compatibility
            </Link>
            <Link to="/track" className="hover:text-accent-600 transition-colors">
              Track Order
            </Link>
            <Link to="/warranty" className="hover:text-accent-600 transition-colors">
              Warranty
            </Link>
            <Link to="/rewards" className="hover:text-accent-600 transition-colors">
              Rewards
            </Link>
            <Link to="/support" className="hover:text-accent-600 transition-colors">
              Support
            </Link>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-secondary-600 bg-secondary-50 px-2.5 py-1 rounded-full border border-secondary-200">
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
