import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  PackageX,
  Sparkles,
} from 'lucide-react';
import ProductCard from '../components/ui/ProductCard';
import StarRating from '../components/ui/StarRating';
import { useProducts, useCategories, useBrands } from '../hooks/useProducts';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state from URL query or defaults
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 12;
  const categoryId = searchParams.get('categoryId') || '';
  const brandId = searchParams.get('brandId') || '';
  const minPriceStr = searchParams.get('minPrice') || '';
  const maxPriceStr = searchParams.get('maxPrice') || '';
  const ratingStr = searchParams.get('rating') || '';
  const isFeatured = searchParams.get('isFeatured') === 'true';
  const sortBy = (searchParams.get('sortBy') as any) || '';
  const order = (searchParams.get('order') as any) || '';
  const search = searchParams.get('search') || '';

  // Local state for price inputs
  const [minPrice, setMinPrice] = useState(minPriceStr);
  const [maxPrice, setMaxPrice] = useState(maxPriceStr);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    setMinPrice(minPriceStr);
    setMaxPrice(maxPriceStr);
  }, [minPriceStr, maxPriceStr]);

  // Fetch queries
  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();

  const { data, isLoading } = useProducts({
    page,
    limit,
    categoryId: categoryId || undefined,
    brandId: brandId || undefined,
    minPrice: minPriceStr ? parseFloat(minPriceStr) : undefined,
    maxPrice: maxPriceStr ? parseFloat(maxPriceStr) : undefined,
    rating: ratingStr ? parseFloat(ratingStr) : undefined,
    isFeatured: isFeatured || undefined,
    sortBy: sortBy || undefined,
    order: order || undefined,
    search: search || undefined,
  });

  const updateFilters = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    if (!('page' in updates)) {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
    });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setMinPrice('');
    setMaxPrice('');
  };

  const categories = categoriesData || [];
  const brands = brandsData || [];
  const products = data?.products || [];
  const pagination = data?.pagination;

  // Active filters array for tags
  const activeTags: Array<{ label: string; onRemove: () => void }> = [];
  if (categoryId) {
    const cat = categories.find((c: any) => c.id === categoryId);
    activeTags.push({
      label: `Category: ${cat ? cat.name : categoryId}`,
      onRemove: () => updateFilters({ categoryId: null }),
    });
  }
  if (brandId) {
    const br = brands.find((b: any) => b.id === brandId);
    activeTags.push({
      label: `Brand: ${br ? br.name : brandId}`,
      onRemove: () => updateFilters({ brandId: null }),
    });
  }
  if (minPriceStr || maxPriceStr) {
    activeTags.push({
      label: `Price: $${minPriceStr || 0} - $${maxPriceStr || '∞'}`,
      onRemove: () => {
        setMinPrice('');
        setMaxPrice('');
        updateFilters({ minPrice: null, maxPrice: null });
      },
    });
  }
  if (ratingStr) {
    activeTags.push({
      label: `${ratingStr}+ Stars`,
      onRemove: () => updateFilters({ rating: null }),
    });
  }
  if (isFeatured) {
    activeTags.push({
      label: 'Deals Only',
      onRemove: () => updateFilters({ isFeatured: null }),
    });
  }
  if (search) {
    activeTags.push({
      label: `Search: "${search}"`,
      onRemove: () => updateFilters({ search: null }),
    });
  }

  const renderFilterSidebar = () => (
    <div className="space-y-6 text-xs">
      {/* Header / Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-[#D9E0E8]">
        <h3 className="font-bold text-[#172337] text-sm flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#FF9900]" />
          <span>Filter Results</span>
        </h3>
        {activeTags.length > 0 && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-[#D93025] hover:underline font-semibold flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-bold uppercase tracking-wider text-[#172337] mb-3">Departments</h4>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => updateFilters({ categoryId: null })}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
              !categoryId
                ? 'bg-amber-50 text-[#FF9900] font-black'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>All Departments</span>
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateFilters({ categoryId: cat.id })}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                categoryId === cat.id
                  ? 'bg-amber-50 text-[#FF9900] font-black'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="truncate">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="pt-4 border-t border-[#D9E0E8]">
        <h4 className="font-bold uppercase tracking-wider text-[#172337] mb-3">Brands</h4>
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {brands.map((brand: any) => (
            <label
              key={brand.id}
              className="flex items-center gap-2 px-1 py-1 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <input
                type="radio"
                name="brandFilter"
                checked={brandId === brand.id}
                onChange={() => updateFilters({ brandId: brand.id })}
                className="w-3.5 h-3.5 text-[#FF9900] rounded border-slate-300 focus:ring-[#FF9900]"
              />
              <span className="truncate">{brand.name}</span>
            </label>
          ))}
          {brandId && (
            <button
              type="button"
              onClick={() => updateFilters({ brandId: null })}
              className="text-[11px] text-[#FF9900] font-semibold hover:underline mt-1 block"
            >
              Clear brand filter
            </button>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div className="pt-4 border-t border-[#D9E0E8]">
        <h4 className="font-bold uppercase tracking-wider text-[#172337] mb-3">Price Range ($)</h4>
        <form onSubmit={handleApplyPrice} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full bg-slate-50 border border-[#D9E0E8] rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:border-[#FF9900] outline-none"
            />
            <span className="text-slate-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-slate-50 border border-[#D9E0E8] rounded-lg px-2.5 py-1.5 text-xs focus:bg-white focus:border-[#FF9900] outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#FF9900] hover:bg-[#e68a00] text-[#0F1B2D] text-xs font-bold py-1.5 rounded-lg transition-colors shadow-sm"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* Customer Reviews */}
      <div className="pt-4 border-t border-[#D9E0E8]">
        <h4 className="font-bold uppercase tracking-wider text-[#172337] mb-3">Customer Reviews</h4>
        <div className="space-y-1">
          {[4, 3, 2].map((stars) => (
            <button
              key={stars}
              type="button"
              onClick={() => updateFilters({ rating: ratingStr === stars.toString() ? null : stars.toString() })}
              className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors ${
                ratingStr === stars.toString()
                  ? 'bg-amber-50 text-amber-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <StarRating rating={stars} size="sm" />
                <span className="text-slate-700">& Up</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Deals & Discounts */}
      <div className="pt-4 border-t border-[#D9E0E8]">
        <h4 className="font-bold uppercase tracking-wider text-[#172337] mb-2">Deals & Offers</h4>
        <label className="flex items-center gap-2 px-1 py-1 text-slate-600 hover:text-slate-900 cursor-pointer">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => updateFilters({ isFeatured: e.target.checked ? 'true' : null })}
            className="w-3.5 h-3.5 text-[#FF9900] rounded border-slate-300 focus:ring-[#FF9900]"
          />
          <span className="flex items-center gap-1 font-semibold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9900]" /> Today's Deals Only
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Marketplace Results Strip */}
      <div className="bg-white p-4 rounded-2xl border border-[#D9E0E8] shadow-sm mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 bg-slate-50 border border-[#D9E0E8] text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#FF9900]" />
            <span>Filters ({activeTags.length})</span>
          </button>
          <div>
            <span className="text-xs text-slate-600 font-medium">
              Showing <strong className="text-slate-900">{products.length}</strong> {pagination ? `of ${pagination.total}` : ''} products
            </span>
          </div>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label htmlFor="sortSelect" className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Sort by:
          </label>
          <div className="relative">
            <select
              id="sortSelect"
              value={sortBy ? `${sortBy}-${order || 'desc'}` : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  updateFilters({ sortBy: null, order: null });
                } else {
                  const [sb, ord] = val.split('-');
                  updateFilters({ sortBy: sb, order: ord });
                }
              }}
              className="appearance-none bg-slate-50 border border-[#D9E0E8] text-slate-800 pl-3 pr-8 py-2 rounded-xl text-xs font-bold focus:outline-none focus:border-[#FF9900] shadow-sm"
            >
              <option value="">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Avg. Customer Review</option>
              <option value="newest-desc">Newest Arrivals</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-slate-500 font-bold">Active filters:</span>
          {activeTags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 bg-amber-50 border border-[#FF9900]/30 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm"
            >
              <span>{tag.label}</span>
              <button
                type="button"
                onClick={tag.onRemove}
                className="hover:text-amber-950 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-[#D93025] hover:underline font-bold ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 bg-white p-6 rounded-2xl border border-[#D9E0E8] shadow-sm h-fit sticky top-28">
          {renderFilterSidebar()}
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-[#D9E0E8] mb-4">
                <h3 className="font-bold text-[#172337] text-base">Filter Products</h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderFilterSidebar()}
              <div className="mt-8 pt-4 border-t border-[#D9E0E8]">
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2.5 bg-[#FF9900] text-[#0F1B2D] font-bold text-xs rounded-xl shadow"
                >
                  Show Results
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductCard key={i} isLoading />
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#D9E0E8] p-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <PackageX className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#172337] mb-1">No products found</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
                We couldn't find any items matching your selected criteria. Try broadening your price range
                or resetting filters.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 bg-[#FF9900] hover:bg-[#e68a00] text-[#0F1B2D] font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => updateFilters({ page: (page - 1).toString() })}
                    className="p-2 rounded-xl border border-[#D9E0E8] bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: pagination.totalPages }).map((_, i) => {
                    const pNum = i + 1;
                    if (
                      pNum === 1 ||
                      pNum === pagination.totalPages ||
                      (pNum >= page - 1 && pNum <= page + 1)
                    ) {
                      return (
                        <button
                          key={pNum}
                          type="button"
                          onClick={() => updateFilters({ page: pNum.toString() })}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors shadow-sm ${
                            page === pNum
                              ? 'bg-[#0F1B2D] text-white border-transparent'
                              : 'bg-white border border-[#D9E0E8] text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    }
                    if (pNum === page - 2 || pNum === page + 2) {
                      return (
                        <span key={pNum} className="text-slate-400 text-xs px-1">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    type="button"
                    disabled={!pagination.hasNextPage}
                    onClick={() => updateFilters({ page: (page + 1).toString() })}
                    className="p-2 rounded-xl border border-[#D9E0E8] bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-sm"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
