import React, { useState } from 'react';
import { Camera, Barcode, Upload, Search, CheckCircle2, ArrowRight, ShoppingBag } from 'lucide-react';
import api from '../lib/api';
import { useCartStore } from '../stores/cartStore';
import toast from 'react-hot-toast';

export const VisualSearchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'barcode'>('image');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImagePreview(base64);
        performVisualSearch(base64, null, 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    performVisualSearch(null, barcodeInput.trim(), 'barcode');
  };

  const performVisualSearch = async (imageBase64: string | null, barcode: string | null, mode: string) => {
    setLoading(true);
    setResults([]);
    setMeta(null);
    try {
      const resp = await api.post('/search/visual', {
        imageBase64,
        barcode,
        searchMode: mode,
      });
      if (resp.data.success) {
        setResults(resp.data.data.results);
        setMeta(resp.data.data);
      }
    } catch (err: any) {
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-accent-700 text-xs font-bold px-3.5 py-1 rounded-full">
          <Camera className="w-3.5 h-3.5" />
          <span>AI VISION & BARCODE DISCOVERY</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Visual Product Search & Barcode Lookup
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Upload an image of any gadget or scan a product packaging barcode to automatically identify the item in our verified electronics catalog.
        </p>
      </div>

      {/* Switcher */}
      <div className="flex justify-center">
        <div className="bg-slate-200/80 p-1.5 rounded-2xl inline-flex gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('image');
              setResults([]);
            }}
            className={`px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'image' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-accent-600" />
            <span>AI Image Recognition</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('barcode');
              setResults([]);
            }}
            className={`px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'barcode' ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Barcode className="w-4 h-4 text-accent-600" />
            <span>Barcode & UPC Scan</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Image Upload Box */}
      {activeTab === 'image' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-8 text-center space-y-6 max-w-xl mx-auto">
          <label className="border-2 border-dashed border-slate-300 hover:border-accent-500 rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 cursor-pointer bg-slate-50 hover:bg-blue-50/40 transition-all">
            <Upload className="w-8 h-8 text-accent-600" />
            <div>
              <p className="text-xs font-bold text-slate-800">Click to upload photo or drag & drop</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Supports PNG, JPG, WEBP up to 10MB</p>
            </div>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          {imagePreview && (
            <div className="relative inline-block border rounded-xl overflow-hidden shadow-sm">
              <img src={imagePreview} alt="Search Preview" className="w-32 h-32 object-contain bg-slate-50 p-2" />
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Barcode Input */}
      {activeTab === 'barcode' && (
        <form onSubmit={handleBarcodeSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-md p-3 flex gap-2 max-w-xl mx-auto">
          <input
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            placeholder="Enter Barcode, UPC, or SKU (e.g. APL-IP16PM-256)"
            required
            className="flex-1 text-xs px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono"
          />
          <button
            type="submit"
            disabled={loading || !barcodeInput.trim()}
            className="px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold transition-all shadow shrink-0 flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>
      )}

      {/* Search Results Display */}
      {loading && (
        <div className="text-center py-12 space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-accent-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Extracting visual features & scanning catalog...</p>
        </div>
      )}

      {meta && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Visual Matches Detected ({results.length})
              </h3>
              {meta.detectedCategory && (
                <p className="text-xs text-accent-600 font-semibold mt-0.5">
                  AI Classification: {meta.detectedCategory} ({(meta.confidence * 100).toFixed(0)}% Confidence)
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((p) => {
              const img = p.images && p.images.length > 0 ? p.images[0].url : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800';
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between space-y-3">
                  <div>
                    <div className="relative pt-[75%] bg-slate-50 rounded-xl overflow-hidden mb-3">
                      {p.visualMatchConfidence && (
                        <span className="absolute top-2 left-2 bg-navy-900 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          {(p.visualMatchConfidence * 100).toFixed(0)}% MATCH
                        </span>
                      )}
                      <img src={img} alt={p.name} className="absolute inset-0 w-full h-full object-contain p-3" />
                    </div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">{p.brand?.name || 'Electronics'}</span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5">{p.name}</h4>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900">${Number(p.price).toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        await addItem(p, 1);
                        toast.success(`${p.name} added to cart!`);
                      }}
                      className="px-3.5 py-1.5 bg-accent-600 hover:bg-accent-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualSearchPage;

