import React, { useState } from 'react';
import { Cpu, CheckCircle2, XCircle, Search, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import api from '../lib/api';
import { useProducts } from '../hooks/useProducts';

export const CompatibilityPage: React.FC = () => {
  const { data: productsData } = useProducts({ limit: 40 });
  const allProducts = productsData?.products || [];

  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [selectedAccessory, setSelectedAccessory] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice || !selectedAccessory) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await api.get(`/compatibility/check?deviceId=${selectedDevice}&accessoryId=${selectedAccessory}`);
      if (resp.data.success) {
        setResult(resp.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-accent-700 text-xs font-bold px-3.5 py-1 rounded-full">
          <Cpu className="w-3.5 h-3.5" />
          <span>DETERMINISTIC HARDWARE RULE ENGINE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Device & Accessory Compatibility Checker
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Verify physical connector interfaces, power delivery wattage, wireless protocols, and ecosystem compatibility before purchasing.
        </p>
      </div>

      {/* Selector Card */}
      <form onSubmit={handleCheck} className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Main Device */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Select Primary Device (Host)
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              required
              className="w-full text-xs p-3.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-accent-500 font-semibold"
            >
              <option value="">— Choose Host Device (Smartphone, Laptop, PC) —</option>
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand?.name} • {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Accessory */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              2. Select Accessory or Peripheral
            </label>
            <select
              value={selectedAccessory}
              onChange={(e) => setSelectedAccessory(e.target.value)}
              required
              className="w-full text-xs p-3.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-accent-500 font-semibold"
            >
              <option value="">— Choose Accessory (Charger, Audio, Cable, Hub) —</option>
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.brand?.name} • {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={loading || !selectedDevice || !selectedAccessory}
            className="inline-flex items-center gap-2 bg-accent-600 hover:bg-accent-700 active:scale-95 disabled:opacity-50 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
          >
            <span>{loading ? 'Validating Hardware Protocols...' : 'Verify Compatibility'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Result Card */}
      {result && (
        <div className={`rounded-3xl border p-6 sm:p-8 space-y-5 animate-in fade-in duration-300 ${
          result.isCompatible
            ? 'bg-emerald-50/50 border-emerald-200'
            : 'bg-amber-50/50 border-amber-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 ${
              result.isCompatible ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
            }`}>
              {result.isCompatible ? <CheckCircle2 className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                  result.isCompatible ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {result.isCompatible ? 'VERIFIED COMPATIBLE' : 'POSSIBLE INCOMPATIBILITY'}
                </span>
                <span className="text-xs text-slate-400 font-semibold">Confidence: {result.confidence}</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                {result.device.name} + {result.accessory.name}
              </h3>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                {result.explanation}
              </p>
            </div>
          </div>

          {result.technicalDetails && result.technicalDetails.length > 0 && (
            <div className="bg-white/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Technical Protocols Verified:</p>
              <ul className="space-y-1.5 text-xs text-slate-600">
                {result.technicalDetails.map((detail: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-600 shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompatibilityPage;

