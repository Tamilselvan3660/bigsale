import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Scale, Check, X, ShoppingBag, ArrowLeft, Trash2, ShieldCheck, Share2 } from 'lucide-react';
import api from '../lib/api';
import { useCartStore } from '../stores/cartStore';
import { useComparisonStore } from '../stores/comparisonStore';
import StarRating from '../components/ui/StarRating';
import toast from 'react-hot-toast';

export const ComparisonPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const idsParam = searchParams.get('ids') || '';
  const { removeProduct, clearComparison } = useComparisonStore();
  const addItem = useCartStore((s) => s.addItem);

  const [products, setProducts] = useState<any[]>([]);
  const [specKeys, setSpecKeys] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparison = async () => {
      if (!idsParam) {
        setIsLoading(false);
        setProducts([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const resp = await api.get(`/compare?ids=${idsParam}`);
        if (resp.data.success) {
          setProducts(resp.data.data.products);
          setSpecKeys(resp.data.data.specKeys);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load product comparison.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchComparison();
  }, [idsParam]);

  const handleRemove = (id: string) => {
    removeProduct(id);
    const remaining = products.filter((p) => p.id !== id).map((p) => p.id);
    if (remaining.length > 0) {
      setSearchParams({ ids: remaining.join(',') });
    } else {
      setSearchParams({});
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Comparison link copied to clipboard!');
    }
  };

  const handleAddToCart = async (prod: any) => {
    try {
      await addItem(prod, 1);
      toast.success(`${prod.name} added to cart!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to add item');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="inline-block w-8 h-8 border-4 border-accent-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Comparing technical specifications...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-accent-600 mx-auto flex items-center justify-center">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">No Products Selected For Comparison</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Add up to 4 compatible products from our catalog to compare specifications, ratings, and features side by side.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Electronics Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-accent-600 font-bold uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            <span>Specification Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Compare Devices & Hardware
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Analyzing {products.length} electronic products across {specKeys.length} hardware attributes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl shadow-sm transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Link</span>
          </button>
          <button
            type="button"
            onClick={() => {
              clearComparison();
              setSearchParams({});
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="overflow-x-auto pb-6">
        <table className="w-full border-collapse bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-left min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="p-4 w-48 text-xs font-bold text-slate-500 uppercase tracking-wider align-top">
                Product Details
              </th>
              {products.map((p) => {
                const img = p.images && p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
                return (
                  <th key={p.id} className="p-5 align-top w-64 border-l border-slate-100">
                    <div className="relative space-y-3">
                      <button
                        type="button"
                        onClick={() => handleRemove(p.id)}
                        className="absolute -top-1 -right-1 p-1 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <Link to={`/product/${p.slug || p.id}`} className="block w-full pt-[75%] relative bg-slate-50 rounded-xl overflow-hidden">
                        <img src={img} alt={p.name} className="absolute inset-0 w-full h-full object-contain p-3" />
                      </Link>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-accent-600">
                          {p.brand?.name || 'Electronics'}
                        </span>
                        <Link
                          to={`/product/${p.slug || p.id}`}
                          className="block text-xs font-bold text-slate-900 hover:text-accent-600 line-clamp-2 mt-0.5"
                        >
                          {p.name}
                        </Link>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <StarRating rating={p.rating || 4.5} size={12} />
                        <span className="text-[11px] text-slate-400 font-medium">({p.reviewCount || 1})</span>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                        <div>
                          <p className="text-base font-black text-slate-900">${Number(p.price).toFixed(2)}</p>
                          {p.compareAtPrice && Number(p.compareAtPrice) > Number(p.price) && (
                            <p className="text-[10px] text-slate-400 line-through">${Number(p.compareAtPrice).toFixed(2)}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(p)}
                          className="px-3 py-1.5 bg-accent-600 hover:bg-accent-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {/* General Highlights */}
            <tr className="bg-slate-50/50">
              <td colSpan={products.length + 1} className="p-3 font-black text-slate-800 text-[11px] uppercase tracking-wider">
                Availability & Warranty
              </td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-slate-600">Stock Status</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 border-l border-slate-100">
                  {p.stock > 0 ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <Check className="w-3.5 h-3.5" /> In Stock ({p.stock} units)
                    </span>
                  ) : (
                    <span className="text-red-500 font-bold">Out of Stock</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-4 font-bold text-slate-600">SKU Identifier</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 border-l border-slate-100 font-mono text-slate-500">
                  {p.sku}
                </td>
              ))}
            </tr>

            {/* Technical Specifications */}
            <tr className="bg-slate-50/50">
              <td colSpan={products.length + 1} className="p-3 font-black text-slate-800 text-[11px] uppercase tracking-wider">
                Hardware Specifications
              </td>
            </tr>
            {specKeys.map((key) => (
              <tr key={key} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-4 font-bold text-slate-700">{key}</td>
                {products.map((p) => {
                  const val = p.specs ? p.specs[key] : '—';
                  return (
                    <td key={p.id} className="p-4 border-l border-slate-100 text-slate-600 leading-relaxed">
                      {val || '—'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonPage;

