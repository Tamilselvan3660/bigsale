import React, { useState } from 'react';
import { Truck, MapPin, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import api from '../../lib/api';

interface DeliveryCheckerProps {
  productId?: string;
}

export const DeliveryChecker: React.FC<DeliveryCheckerProps> = ({ productId }) => {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await api.get(`/shipping/check?pincode=${encodeURIComponent(pincode.trim())}${productId ? `&productId=${productId}` : ''}`);
      if (resp.data.success) {
        setResult(resp.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to check postal code availability.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center gap-2">
        <Truck className="w-4 h-4 text-accent-600" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Delivery Availability & Shipping Estimates
        </h4>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="Enter Postal / ZIP Code (e.g. 10001)"
            maxLength={10}
            className="w-full text-xs pl-8 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !pincode.trim()}
          className="px-4 py-2.5 bg-navy-900 hover:bg-navy-800 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shrink-0"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-2 pt-1 border-t border-slate-200/80 text-xs">
          {result.isServiceable ? (
            <>
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <CheckCircle className="w-4 h-4" />
                <span>Express Service Available for {result.pincode} ({result.city})</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {result.methods.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{m.name}</p>
                        <p className="text-[10px] text-slate-500">Delivered by {m.formattedDeliveryDate}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-800">
                      {m.cost === 0 ? <span className="text-emerald-600">FREE</span> : `$${m.cost.toFixed(2)}`}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{result.message}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryChecker;

