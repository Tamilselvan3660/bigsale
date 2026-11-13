import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Globe,
  ChevronUp,
  CreditCard,
  Lock,
  Headphones,
  Award,
  Zap,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 text-slate-300 text-xs font-normal">
      {/* 1. BACK TO TOP BAR (Deep Navy #152A45) */}
      <button
        type="button"
        onClick={scrollToTop}
        className="w-full bg-[#152A45] hover:bg-[#1c385c] text-slate-200 py-3.5 text-center text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border-t border-slate-700/60"
      >
        <ChevronUp className="w-4 h-4 text-[#FF9900]" />
        <span>Back to top</span>
      </button>

      {/* 2. MAIN MARKETPLACE DIRECTORY (Midnight Navy #0F1B2D) */}
      <div className="bg-[#0F1B2D] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Column 1: Get to Know BIGSALE */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">
                Get to Know Us
              </h4>
              <ul className="space-y-2.5 text-slate-400">
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About BIGSALE
                  </Link>
                </li>
                <li>
                  <Link to="/trust-centre" className="hover:text-white transition-colors flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Trust & Authenticity</span>
                  </Link>
                </li>
                <li>
                  <Link to="/renew" className="hover:text-white transition-colors flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sustainability & Renew</span>
                  </Link>
                </li>
                <li>
                  <Link to="/press" className="hover:text-white transition-colors">
                    Press Releases
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="hover:text-white transition-colors">
                    BIGSALE Careers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Make Money with Us */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">
                Make Money with Us
              </h4>
              <ul className="space-y-2.5 text-slate-400">
                <li>
                  <Link to="/sell" className="hover:text-white transition-colors">
                    Sell on BIGSALE
                  </Link>
                </li>
                <li>
                  <Link to="/renew" className="hover:text-white transition-colors">
                    Trade-In Your Device
                  </Link>
                </li>
                <li>
                  <Link to="/affiliate" className="hover:text-white transition-colors">
                    Become an Affiliate
                  </Link>
                </li>
                <li>
                  <Link to="/fulfillment" className="hover:text-white transition-colors">
                    Fulfilment by BIGSALE
                  </Link>
                </li>
                <li>
                  <Link to="/advertise" className="hover:text-white transition-colors">
                    Advertise Your Tech
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Smart Tools & Services */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">
                Smart Tools & Tech
              </h4>
              <ul className="space-y-2.5 text-slate-400">
                <li>
                  <Link to="/builder" className="hover:text-white transition-colors">
                    PC & Setup Builder
                  </Link>
                </li>
                <li>
                  <Link to="/visual-search" className="hover:text-white transition-colors">
                    AI Visual & Barcode Search
                  </Link>
                </li>
                <li>
                  <Link to="/energy" className="hover:text-white transition-colors">
                    Energy & Cost Calculator
                  </Link>
                </li>
                <li>
                  <Link to="/compare" className="hover:text-white transition-colors">
                    Side-by-Side Comparison
                  </Link>
                </li>
                <li>
                  <Link to="/rewards" className="hover:text-white transition-colors">
                    Tech Rewards Points
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Let Us Help You */}
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-xs">
                Let Us Help You
              </h4>
              <ul className="space-y-2.5 text-slate-400">
                <li>
                  <Link to="/track" className="hover:text-white transition-colors">
                    Your Orders & Tracking
                  </Link>
                </li>
                <li>
                  <Link to="/shipping-rates" className="hover:text-white transition-colors">
                    Shipping Rates & Policies
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="hover:text-white transition-colors">
                    Returns & Replacements
                  </Link>
                </li>
                <li>
                  <Link to="/warranty" className="hover:text-white transition-colors">
                    Warranty Registration
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="hover:text-white transition-colors">
                    Help & Customer Care
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE BRAND AND REGION SELECTOR (Deep Navy #152A45) */}
      <div className="bg-[#152A45] py-8 border-b border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#FF9900] flex items-center justify-center text-[#0F1B2D] font-black group-hover:bg-[#FFD814] transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-black tracking-tight text-white leading-none">
                BIG<span className="text-[#FF9900]">SALE</span>
              </span>
              <span className="text-[9px] text-[#FFD814] font-bold ml-1 tracking-wider uppercase">.GLOBAL</span>
            </div>
          </Link>

          {/* Region / Currency / Language Buttons */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-slate-600 bg-[#0F1B2D]/40 text-slate-200 hover:border-slate-400 flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#FF9900]" />
              <span>English</span>
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-slate-600 bg-[#0F1B2D]/40 text-slate-200 hover:border-slate-400 flex items-center gap-1.5 transition-colors"
            >
              <span className="text-[#FF9900] font-bold">$</span>
              <span>USD - U.S. Dollar</span>
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-slate-600 bg-[#0F1B2D]/40 text-slate-200 hover:border-slate-400 flex items-center gap-1.5 transition-colors"
            >
              <span>🌐 United States</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. VALUE PROPOSITIONS & LEGAL FOOTER (Midnight Navy #0F1B2D) */}
      <div className="bg-[#0F1B2D] py-8 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-800 text-[11px]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#FF9900] shrink-0" />
              <span>Free Worldwide Express Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#FF9900] shrink-0" />
              <span>256-bit Bank Grade Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#FF9900] shrink-0" />
              <span>30 Days Money Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#FF9900] shrink-0" />
              <span>100% Verified Authentic Hardware</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <Link to="/conditions" className="hover:text-slate-300 transition-colors">
                Conditions of Use
              </Link>
              <Link to="/privacy" className="hover:text-slate-300 transition-colors">
                Privacy Notice
              </Link>
              <Link to="/interest-ads" className="hover:text-slate-300 transition-colors">
                Interest-Based Ads
              </Link>
              <Link to="/consumer-health" className="hover:text-slate-300 transition-colors">
                Consumer Health Data Privacy
              </Link>
            </div>
            <p className="text-center">
              © {new Date().getFullYear()} BIGSALE Global Electronics & Electricals Marketplace Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
