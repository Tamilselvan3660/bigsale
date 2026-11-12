import React, { useState } from 'react';
import { ShieldCheck, Calendar, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../lib/api';
import { useProducts } from '../hooks/useProducts';
import toast from 'react-hot-toast';

export const WarrantyPage: React.FC = () => {
  const { data: productsData } = useProducts({ limit: 40 });
  const products = productsData?.products || [];

  const [productId, setProductId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredItem, setRegisteredItem] = useState<any>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !serialNumber.trim()) return;

    setLoading(true);
    try {
      const resp = await api.post('/warranty/register', {
        productId,
        serialNumber,
        invoiceNumber,
        purchaseDate,
      });
      if (resp.data.success) {
        setRegisteredItem(resp.data.data);
        toast.success('Digital warranty registered successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to register warranty.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>AUTHENTIC HARDWARE PROTECTION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          BIGSALE Digital Warranty Management
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Register your newly acquired smartphones, computers, displays, or audio gear for 2 full years of verified manufacturer warranty protection.
        </p>
      </div>

      {registeredItem ? (
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-xl p-8 space-y-6">
          <div className="flex items-center gap-3 text-emerald-600">
            <CheckCircle className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-black text-slate-900">Warranty Certificate Activated</h3>
              <p className="text-xs text-slate-500">Certificate ID: {registeredItem.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <p className="text-slate-400 font-semibold uppercase">Product</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{registeredItem.productName}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase">Hardware Serial Number</p>
              <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">{registeredItem.serialNumber}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase">Coverage Tier</p>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">{registeredItem.coverage}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase">Coverage Validity</p>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                {registeredItem.startDate} through <span className="text-accent-600">{registeredItem.expiryDate}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRegisteredItem(null)}
            className="text-xs font-bold text-accent-600 hover:underline"
          >
            ← Register Another Hardware Device
          </button>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Select Purchased Product
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                className="w-full text-xs p-3.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-accent-500 font-medium"
              >
                <option value="">— Choose your product from catalog —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.brand?.name} • {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Device Serial Number (S/N)
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. SN-8942-APL-2026"
                  required
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-accent-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Invoice / Receipt Reference
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="e.g. INV-948201"
                  className="w-full text-xs p-3.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-accent-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Purchase Date
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full sm:w-1/2 text-xs p-3.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-accent-500 font-medium"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Activating Warranty Protection...' : 'Register Digital Warranty'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WarrantyPage;

