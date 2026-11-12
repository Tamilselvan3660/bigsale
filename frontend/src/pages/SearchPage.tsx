import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, RotateCcw, Sparkles } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ui/ProductCard';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data, isLoading } = useProducts({
    search: query,
    limit: 20,
  });

  const products = data?.products || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Search className="w-4 h-4 text-accent-600" />
            <span>Search Results</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {query ? (
              <span>
                Results for &ldquo;<span className="text-accent-600">{query}</span>&rdquo;
              </span>
            ) : (
              'All Catalog Products'
            )}
          </h1>
        </div>

        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full w-fit">
          {products.length} {products.length === 1 ? 'match' : 'matches'} found
        </span>
      </div>

      {/* Grid or Empty */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCard key={i} isLoading />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No matching products found</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            We couldn't find any products matching &ldquo;{query}&rdquo;. Check your spelling, try
            broader keywords, or explore our top categories.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-400">Popular searches:</span>
            {['Laptop', 'Phone', 'Headphones', 'Watch', 'Wireless'].map((tag) => (
              <Link
                key={tag}
                to={`/search?q=${tag}`}
                className="text-xs bg-slate-100 hover:bg-accent-50 hover:text-accent-600 text-slate-700 px-3 py-1 rounded-full font-medium transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>

          <div className="pt-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-navy-900 hover:bg-slate-800 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Browse All Products</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
