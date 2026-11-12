import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, ShieldCheck, RotateCcw } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-900 text-slate-400 text-xs mt-20 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white">BIGSALE</span>
            </Link>
            <p className="text-slate-400 text-xs">
              Everything Electronic. Everything You Need. Worldwide delivery for all your tech essentials.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/shop" className="hover:text-white transition-colors">Catalog</Link></li>
              <li><Link to="/shop?isFeatured=true" className="hover:text-white transition-colors">Deals</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Account</h4>
            <ul className="space-y-2">
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/checkout" className="hover:text-white transition-colors">Checkout</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider text-[11px]">Assurance</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-accent-400" /> Worldwide Dispatch</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-accent-400" /> Secure Encryption</li>
              <li className="flex items-center gap-1.5"><RotateCcw className="w-3.5 h-3.5 text-accent-400" /> 30-Day Returns</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 text-center text-slate-500 text-[11px]">
          © {new Date().getFullYear()} BIGSALE Global Electronics. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
