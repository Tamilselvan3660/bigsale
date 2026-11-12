import React, { useEffect, useState } from 'react';
import { Package, Plus, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../../lib/api';
import { useCartStore } from '../../stores/cartStore';
import toast from 'react-hot-toast';

export const SmartBundlesSection: React.FC<{ productId?: string }> = ({ productId }) => {
  const [bundles, setBundles] = useState<any[]>([]);
  const [addingId, setAddingId] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const resp = await api.get(`/bundles${productId ? `?productId=${productId}` : ''}`);
        if (resp.data.success) {
          setBundles(resp.data.data.bundles);
        }
      } catch (err) {
        // fail gracefully
      }
    };
    fetchBundles();
  }, [productId]);

  const handleAddBundle = async (bundle: any) => {
    setAddingId(bundle.id);
    try {
      for (const prod of bundle.products) {
        await addItem(prod, 1);
      }
      toast.success(`Bundle "${bundle.title}" added to cart with ${bundle.discountPercent}% combo discount!`, { icon: '🎁' });
    } catch (err: any) {
      toast.error('Failed to add bundle to cart');
    } finally {
      setAddingId(null);
    }
  };

  if (bundles.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-600 mb-1">
            <Package className="w-4 h-4" />
            <span>Hardware Synergy Packs</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            Frequently Bought Together & Smart Bundles
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {bundles.map((bundle) => (
          <div
            key={bundle.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 flex flex-col justify-between space-y-5 hover:border-slate-300 hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  SAVE {bundle.discountPercent}% COMBO
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  Save ${bundle.savings}.00 instantly
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-2">{bundle.title}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{bundle.description}</p>
            </div>

            {/* Product items in bundle */}
            <div className="flex items-center gap-3 overflow-x-auto py-2">
              {bundle.products.map((prod: any, idx: number) => {
                const img = prod.images && prod.images.length > 0 ? prod.images[0].url : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
                return (
                  <React.Fragment key={prod.id}>
                    <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-slate-50 border border-slate-200/80 shrink-0 max-w-[200px]">
                      <img src={img} alt={prod.name} className="w-12 h-12 object-contain rounded-xl bg-white p-1" />
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-900 truncate">{prod.name}</p>
                        <p className="text-xs font-black text-navy-900">${Number(prod.price).toFixed(2)}</p>
                      </div>
                    </div>
                    {idx < bundle.products.length - 1 && (
                      <span className="text-slate-400 font-bold shrink-0">
                        <Plus className="w-4 h-4" />
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Pricing & CTA */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Bundle Price</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-navy-900">${bundle.bundlePrice}.00</span>
                  <span className="text-xs text-slate-400 line-through">${bundle.originalPrice}.00</span>
                </div>
              </div>

              <button
                type="button"
                disabled={addingId === bundle.id}
                onClick={() => handleAddBundle(bundle)}
                className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{addingId === bundle.id ? 'Adding Items...' : 'Add Both to Cart'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SmartBundlesSection;

