import React, { useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck, BatteryCharging, CheckCircle, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import api from '../lib/api';
import { useCartStore } from '../stores/cartStore';
import toast from 'react-hot-toast';

export const RenewPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [gradingStandards, setGradingStandards] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Trade-in form state
  const [tradeCategory, setTradeCategory] = useState('Smartphone');
  const [tradeBrand, setTradeBrand] = useState('Apple');
  const [tradeModel, setTradeModel] = useState('');
  const [tradeCondition, setTradeCondition] = useState('Good');
  const [tradeBattery, setTradeBattery] = useState('88');
  const [tradeValuation, setTradeValuation] = useState<any>(null);
  const [submittingTrade, setSubmittingTrade] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const fetchRenew = async () => {
      try {
        const resp = await api.get(`/renew/products${selectedGrade !== 'ALL' ? `?grade=${selectedGrade}` : ''}`);
        if (resp.data.success) {
          setProducts(resp.data.data.products);
          setGradingStandards(resp.data.data.gradingStandards);
        }
      } catch (err) {
        // fail gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchRenew();
  }, [selectedGrade]);

  const handleAddToCart = async (prod: any) => {
    try {
      await addItem(
        {
          id: prod.id,
          name: prod.name,
          slug: prod.slug,
          sku: `RNW-${prod.grade}-${prod.id}`,
          price: prod.renewPrice,
          compareAtPrice: prod.originalPrice,
          stock: prod.stock,
          isActive: true,
          isFeatured: false,
          rating: 4.8,
          reviewCount: 12,
          categoryId: 'renew_cat',
          images: [{ id: '1', productId: prod.id, url: prod.image, isPrimary: true, sortOrder: 0 }],
          description: `${prod.name}. Inspected and certified by BIGSALE Renew Lab. Includes ${prod.warranty}.`,
        },
        1
      );
      toast.success(`${prod.name} added to cart!`, { icon: '♻️' });
    } catch (err: any) {
      toast.error('Could not add refurbished item');
    }
  };

  const handleSubmitTradeIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeModel.trim()) return;

    setSubmittingTrade(true);
    try {
      const resp = await api.post('/renew/trade-in', {
        category: tradeCategory,
        brand: tradeBrand,
        model: tradeModel,
        condition: tradeCondition,
        batteryHealth: tradeBattery,
      });
      if (resp.data.success) {
        setTradeValuation(resp.data.data);
        toast.success('Instant Trade-in estimate generated!');
      }
    } catch (err: any) {
      toast.error('Failed to submit trade-in evaluation');
    } finally {
      setSubmittingTrade(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-navy-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>CERTIFIED REFURBISHED & TRADE-IN MARKETPLACE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            BIGSALE Renew. <br />
            <span className="text-emerald-400">Better for Your Wallet. Better for Earth.</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Every renewed device undergoes a rigorous 68-point diagnostic hardware bench test, backed by a 12-Month BIGSALE warranty and 30-day money-back assurance.
          </p>
        </div>
      </div>

      {/* Grading Standards Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gradingStandards.map((std: any) => (
          <div key={std.grade} className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-2 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                {std.grade}
              </span>
              <h4 className="text-xs font-bold uppercase text-slate-800">{std.title}</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{std.details}</p>
          </div>
        ))}
      </div>

      {/* Catalog & Filter Bar */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Certified Refurbished Hardware ({products.length})
            </h2>
            <p className="text-xs text-slate-500">Save up to 45% compared to brand new retail MSRP</p>
          </div>

          {/* Grade Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {['ALL', 'A', 'B', 'C'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGrade(g)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedGrade === g ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {g === 'ALL' ? 'All Grades' : `Grade ${g}`}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="relative pt-[70%] bg-slate-50 rounded-2xl overflow-hidden">
                  <span className="absolute top-3 left-3 z-10 bg-emerald-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow">
                    GRADE {p.grade} • SAVE {p.savingsPercent}%
                  </span>
                  <img src={p.image} alt={p.name} className="absolute inset-0 w-full h-full object-contain p-4" />
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">{p.brand}</span>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 mt-0.5">{p.name}</h3>
                  <p className="text-xs text-emerald-600 font-semibold mt-1">{p.conditionTitle}</p>
                </div>

                {/* Specs Snippets */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-[11px] text-slate-600">
                  {p.batteryHealth && (
                    <div className="flex items-center gap-1.5">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Battery Health: <strong>{p.batteryHealth}</strong> Verified</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-accent-600" />
                    <span>{p.inspectionScore}</span>
                  </div>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-base font-black text-slate-900">${p.renewPrice}.00</p>
                  <p className="text-[11px] text-slate-400 line-through">${p.originalPrice}.00</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddToCart(p)}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Buy Renew</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trade-in Evaluation Section */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-10 space-y-8">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-accent-600">
            <Sparkles className="w-4 h-4" />
            <span>INSTANT TRADE-IN ESTIMATOR</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Exchange Your Old Electronics for Cash or Store Credit</h2>
          <p className="text-xs text-slate-500">
            Get an instant valuation on your smartphones, laptops, and tablets. We provide complimentary insured courier pickup.
          </p>
        </div>

        {tradeValuation ? (
          <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <CheckCircle className="w-7 h-7" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Trade-In Offer Generated: #{tradeValuation.referenceNumber}
                </h3>
                <p className="text-xs text-slate-500">Device: {tradeValuation.device.brand} {tradeValuation.device.model} ({tradeValuation.device.condition})</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Estimated Credit Value</span>
                <p className="text-3xl font-black text-emerald-600">${tradeValuation.valuation.estimatedValue}.00</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  toast.success('Courier pickup booked for hardware inspection!');
                  setTradeValuation(null);
                }}
                className="px-5 py-2.5 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold transition-all shadow"
              >
                Accept & Book Free Pickup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitTradeIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Category</label>
              <select
                value={tradeCategory}
                onChange={(e) => setTradeCategory(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium"
              >
                <option value="Smartphone">Smartphone</option>
                <option value="Laptop">Laptop / MacBook</option>
                <option value="Tablet">Tablet / iPad</option>
                <option value="Smartwatch">Smartwatch</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Brand</label>
              <select
                value={tradeBrand}
                onChange={(e) => setTradeBrand(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium"
              >
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="Dell">Dell</option>
                <option value="Lenovo">Lenovo</option>
                <option value="Sony">Sony</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Device Model</label>
              <input
                type="text"
                value={tradeModel}
                onChange={(e) => setTradeModel(e.target.value)}
                placeholder="e.g. iPhone 14 Pro 128GB"
                required
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Physical Condition</label>
              <select
                value={tradeCondition}
                onChange={(e) => setTradeCondition(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-medium"
              >
                <option value="Flawless">Flawless (No scratches)</option>
                <option value="Good">Good (Light signs of use)</option>
                <option value="Fair">Fair (Noticeable scratches)</option>
                <option value="Poor">Poor (Minor functional flaws)</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 text-right pt-2">
              <button
                type="submit"
                disabled={submittingTrade}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-md transition-all"
              >
                <span>{submittingTrade ? 'Calculating Valuation...' : 'Calculate Trade-in Value'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RenewPage;

