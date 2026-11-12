import React, { useState } from 'react';
import { Search, Truck, CheckCircle2, Clock, MapPin, PackageCheck, AlertCircle } from 'lucide-react';
import api from '../lib/api';

export const TrackingPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const resp = await api.get(`/shipments/track/${encodeURIComponent(orderNumber.trim())}`);
      if (resp.data.success) {
        setData(resp.data.data);
      }
    } catch (err: any) {
      setError('Shipment record not found. Please verify your order number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-accent-700 text-xs font-bold px-3.5 py-1 rounded-full">
          <Truck className="w-3.5 h-3.5" />
          <span>GLOBAL COURIER DISPATCH MONITOR</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Track Your Shipment in Real Time
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Enter your BIGSALE order reference or tracking airway bill number to view status updates and estimated delivery milestones.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleTrack} className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-3 flex gap-2 max-w-xl mx-auto">
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Enter Order / Tracking # (e.g. ORD-10029 or BIG-EXP-948)"
          required
          className="flex-1 text-xs px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-accent-500 font-mono font-medium"
        />
        <button
          type="submit"
          disabled={loading || !orderNumber.trim()}
          className="px-6 py-3 bg-navy-900 hover:bg-navy-800 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 shadow"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Tracking...' : 'Track'}</span>
        </button>
      </form>

      {error && (
        <div className="max-w-xl mx-auto flex items-center gap-2 p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Result */}
      {data && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent-600">
                Carrier: {data.carrier}
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-0.5">
                Airway Bill: {data.trackingNumber}
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-bold text-slate-400 block">Estimated Arrival</span>
              <span className="text-base font-black text-emerald-600">{data.estimatedDelivery}</span>
            </div>
          </div>

          {/* Timeline Milestones */}
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {data.timeline.map((step: any, idx: number) => (
              <div key={idx} className="relative flex items-start gap-4">
                <div className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 ${
                  step.completed
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                    : 'bg-white border-slate-300 text-slate-300'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <h4 className={`text-xs sm:text-sm font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{step.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackingPage;

