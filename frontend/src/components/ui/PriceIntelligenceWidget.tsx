import React, { useEffect, useState } from 'react';
import { TrendingDown, Bell, Check, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface PriceIntelligenceWidgetProps {
  productId: string;
  currentPrice: number;
}

export const PriceIntelligenceWidget: React.FC<PriceIntelligenceWidgetProps> = ({ productId, currentPrice }) => {
  const [data, setData] = useState<any>(null);
  const [targetPrice, setTargetPrice] = useState<number | string>(Math.round(currentPrice * 0.9));
  const [submittingAlert, setSubmittingAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const resp = await api.get(`/price-history/${productId}`);
        if (resp.data.success) {
          setData(resp.data.data);
        }
      } catch (err) {
        // Fallback silently if offline
      }
    };
    fetchHistory();
  }, [productId]);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAlert(true);
    try {
      await api.post('/price-alerts', {
        productId,
        targetPrice: Number(targetPrice),
      });
      setAlertSuccess(true);
      toast.success('Price drop tracking activated!');
    } catch (err: any) {
      toast.error('Unable to set price alert');
    } finally {
      setSubmittingAlert(false);
    }
  };

  if (!data) return null;

  const history = data.history || [];
  const maxPrice = Math.max(...history.map((h: any) => h.price), currentPrice * 1.05);
  const minPrice = Math.min(...history.map((h: any) => h.price), currentPrice * 0.95);
  const range = maxPrice - minPrice || 1;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Price Intelligence & Trend
          </h4>
        </div>
        {data.isAllTimeLow && (
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black px-2.5 py-0.5 rounded-full">
            ALL-TIME LOW
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-xl border border-slate-100">
        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Current</p>
          <p className="text-sm font-black text-slate-900">${data.currentPrice}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase">6-Mo Low</p>
          <p className="text-sm font-black text-emerald-600">${data.lowestPrice}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Average</p>
          <p className="text-sm font-black text-slate-700">${data.averagePrice}</p>
        </div>
      </div>

      {/* SVG Historical Price Trend Sparkline */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase text-slate-400">6-Month Price Movement</p>
        <div className="h-20 w-full relative pt-2">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 300 70">
            {/* Grid Line */}
            <line x1="0" y1="65" x2="300" y2="65" stroke="#e2e8f0" strokeDasharray="3 3" />
            
            {/* Sparkline Polyline */}
            {history.length > 1 && (
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={history
                  .map((h: any, idx: number) => {
                    const x = (idx / (history.length - 1)) * 300;
                    const y = 60 - ((h.price - minPrice) / range) * 50;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
            )}

            {/* Dots */}
            {history.map((h: any, idx: number) => {
              const x = (idx / (history.length - 1)) * 300;
              const y = 60 - ((h.price - minPrice) / range) * 50;
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="3.5"
                  className="fill-blue-600 stroke-white stroke-2"
                />
              );
            })}
          </svg>
          <div className="flex justify-between text-[9px] text-slate-400 pt-1 font-mono">
            {history.map((h: any, idx: number) => (
              <span key={idx}>{h.month}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Price Drop Alert Trigger */}
      <div className="pt-2 border-t border-slate-100">
        {alertSuccess ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
            <Check className="w-4 h-4" />
            <span>Drop alert active for ${targetPrice}. We'll notify your account.</span>
          </div>
        ) : (
          <form onSubmit={handleCreateAlert} className="flex gap-2 items-center">
            <input
              type="number"
              min="1"
              max={currentPrice}
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-24 text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold"
              placeholder="Target $"
            />
            <button
              type="submit"
              disabled={submittingAlert}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-accent-700 bg-accent-50 hover:bg-accent-100 active:scale-95 py-2 px-3 rounded-xl border border-accent-200 transition-all"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{submittingAlert ? 'Activating...' : 'Alert Me If Price Drops'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PriceIntelligenceWidget;

