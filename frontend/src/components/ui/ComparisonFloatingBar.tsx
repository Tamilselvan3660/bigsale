import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, X, ArrowRight } from 'lucide-react';
import { useComparisonStore } from '../../stores/comparisonStore';

export const ComparisonFloatingBar: React.FC = () => {
  const { selectedProducts, removeProduct, clearComparison } = useComparisonStore();

  if (selectedProducts.length === 0) return null;

  return (
    <aside aria-label="Product comparison tray" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-navy-950/95 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl shadow-2xl px-5 py-3.5 flex items-center gap-4 sm:gap-6 max-w-2xl w-[92vw]">
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-accent-600/30 text-accent-400 flex items-center justify-center">
          <Scale className="w-4 h-4" />
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-bold leading-tight">Compare Products</p>
          <p className="text-[10px] text-slate-400">{selectedProducts.length} of 4 selected</p>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex items-center gap-2 flex-1 overflow-x-auto py-1">
        {selectedProducts.map((p) => {
          const img = p.images && p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
          return (
            <div key={p.id} className="relative group shrink-0">
              <img
                src={img}
                alt={p.name}
                className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1 border border-white/20"
              />
              <button
                type="button"
                onClick={() => removeProduct(p.id)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] hover:bg-red-600 shadow"
                title="Remove"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={clearComparison}
          className="text-[11px] text-slate-400 hover:text-white underline underline-offset-2 px-2"
        >
          Clear
        </button>
        <Link
          to={`/compare?ids=${selectedProducts.map((p) => p.id).join(',')}`}
          className="inline-flex items-center gap-1.5 bg-accent-600 hover:bg-accent-500 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all"
        >
          <span>Compare</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
};

export default ComparisonFloatingBar;

