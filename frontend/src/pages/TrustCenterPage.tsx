import React, { useState } from 'react';
import { ShieldCheck, Search, QrCode, CheckCircle2, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const TrustCenterPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setVerification(null);
    try {
      const resp = await api.post('/trust-center/verify', {
        serialNumber: identifier.trim(),
      });
      if (resp.data.success) {
        setVerification(resp.data.data);
      }
    } catch (err: any) {
      toast.error('Verification query failed. Check serial code format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-accent-700 text-xs font-bold px-3.5 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>CRYPTOGRAPHIC PRODUCT AUTHENTICITY LEDGER</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          BIGSALE Trust & Verification Centre
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Verify original manufacturer provenance, tamper-evident anti-counterfeit records, and warranty coverage status using your product serial or QR identifier.
        </p>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleVerify} className="bg-white rounded-2xl border border-slate-200 shadow-md p-3 flex gap-2 max-w-xl mx-auto">
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Enter Serial #, Barcode, or SKU (e.g. SN-9842-APL or APL-IP16)"
          required
          className="flex-1 text-xs px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-mono font-medium"
        />
        <button
          type="submit"
          disabled={loading || !identifier.trim()}
          className="px-6 py-3 bg-navy-900 hover:bg-navy-800 text-white rounded-xl text-xs font-bold transition-all shadow shrink-0 flex items-center gap-1.5"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Verifying...' : 'Verify Product'}</span>
        </button>
      </form>

      {/* Verification Certificate */}
      {verification && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${
                verification.verificationStatus === 'VERIFIED' ? 'bg-emerald-600' : 'bg-amber-600'
              }`}>
                {verification.verificationStatus === 'VERIFIED' ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>
              <div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                  verification.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {verification.verificationStatus}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {verification.product?.name || 'Identifier Not In Registry'}
                </h3>
              </div>
            </div>

            {verification.authenticityCertificate && (
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cryptographic Certificate</span>
                <p className="text-sm font-mono font-black text-accent-700">
                  {verification.authenticityCertificate.certificateId}
                </p>
              </div>
            )}
          </div>

          {verification.product && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">SKU / Model</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{verification.product.sku}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">OEM Brand</span>
                <p className="font-bold text-slate-900 mt-0.5">{verification.product.brand}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Production Batch</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{verification.product.factoryBatch}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Warranty Entitlement</span>
                <p className="font-bold text-emerald-600 mt-0.5">{verification.warranty.status}</p>
              </div>
            </div>
          )}

          {/* Cryptographic Supply Chain Audit Trail */}
          {verification.auditTrail && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Supply Chain & Verification Audit Trail
              </h4>
              <div className="space-y-2">
                {verification.auditTrail.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
                    <span className="font-medium text-slate-700">{item.step}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrustCenterPage;

