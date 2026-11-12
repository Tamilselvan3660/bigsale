import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  Globe,
  Warehouse,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import api from '../lib/api';

export const AdminAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const resp = await api.get('/enterprise/analytics');
        if (resp.data.success) {
          setData(resp.data.data);
        }
      } catch (err) {
        // fail gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-500 text-xs">
        Compiling enterprise telemetry data...
      </div>
    );
  }

  if (!data) return null;

  const { summary, salesTrend, warehouses, currencies, riskQueue } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-accent-600" />
            <span>EXECUTIVE BUSINESS INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Enterprise Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time financial telemetry, multi-warehouse stock reservations, risk mitigation, and global currency exchange.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">${summary.grossRevenue.toLocaleString()}.00</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs previous month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Average Order</span>
            <TrendingUp className="w-4 h-4 text-accent-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">${summary.averageOrderValue}.00</p>
          <p className="text-[11px] text-slate-500">Across verified consumer transactions</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Conversion Rate</span>
            <Globe className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{summary.conversionRate}</p>
          <p className="text-[11px] text-slate-500">Repeat customer rate: {summary.repeatCustomerRate}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock SKUs</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600">{summary.lowStockCount} Items</p>
          <p className="text-[11px] text-slate-500">Threshold: Less than 15 units</p>
        </div>
      </div>

      {/* Warehouses & Currency Markets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Multi-Warehouse Node Management */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-accent-600" />
            <h3 className="text-base font-bold text-slate-900">Multi-Node Fulfillment Centers</h3>
          </div>
          <div className="space-y-3 text-xs">
            {warehouses.map((wh: any) => (
              <div key={wh.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{wh.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Active Stock: {wh.stockCount} Units</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  Capacity: {wh.capacityUsage}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Global Multi-Currency Rates */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-600" />
            <h3 className="text-base font-bold text-slate-900">Active FX Currency Pegs (USD Base)</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {currencies.map((c: any) => (
              <div key={c.code} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">{c.name}</span>
                <p className="text-sm font-black text-slate-900">
                  {c.symbol} 1.00 USD = {c.rate.toFixed(2)} {c.code}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fraud & Risk Monitoring Review Queue */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <h3 className="text-base font-bold text-slate-900">Risk & Fraud Mitigation Queue</h3>
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          {riskQueue.map((item: any) => (
            <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{item.orderNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.score === 'LOW' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.score} RISK ({item.riskPct}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.flag} • User: {item.customer}</p>
              </div>
              <button
                type="button"
                className="self-start sm:self-auto text-xs font-bold text-accent-600 hover:underline"
              >
                Inspect Telemetry
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
