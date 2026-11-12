import React, { useEffect, useState } from 'react';
import { Award, Gift, Sparkles, Copy, Check, Users, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export const RewardsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLoyalty = async () => {
      try {
        const resp = await api.get('/loyalty/profile');
        if (resp.data.success) {
          setData(resp.data.data);
        }
      } catch (err) {
        // graceful fallback
      }
    };
    fetchLoyalty();
  }, []);

  const handleCopyCode = () => {
    if (data?.referralCode && navigator.clipboard) {
      navigator.clipboard.writeText(data.referralCode);
      setCopied(true);
      toast.success('Referral code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Hero Tier Card */}
      <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-400/30 text-cyan-300 text-xs font-bold px-3 py-1 rounded-full">
              <Award className="w-3.5 h-3.5" />
              <span>{data.tier} VIP MEMBER STATUS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              BIGSALE Rewards & Loyalty Ledger
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-md">
              Earn redeemable electronic credits on every purchase, access exclusive hardware releases, and enjoy complimentary express freight.
            </p>
          </div>

          <div className="md:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Available Points Balance</p>
            <p className="text-4xl sm:text-5xl font-black text-white">{data.pointsBalance.toLocaleString()}</p>
            <p className="text-xs text-slate-300">
              Equivalent to <span className="text-cyan-300 font-bold">${data.cashEquivalent.toFixed(2)}</span> instant checkout discount
            </p>
          </div>
        </div>
      </div>

      {/* Benefits and Referral */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tier Benefits */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 text-slate-900">
            <Sparkles className="w-5 h-5 text-accent-600" />
            <h3 className="text-lg font-bold">Active Tier Privileges</h3>
          </div>
          <ul className="space-y-3 text-xs text-slate-600">
            {data.tierBenefits.map((benefit: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  ✓
                </span>
                <span className="leading-relaxed">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Referral Section */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900">
              <Users className="w-5 h-5 text-cyan-600" />
              <h3 className="text-lg font-bold">Refer a Tech Colleague</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Give your peers $25 off their initial hardware purchase and earn 250 bonus reward points deposited directly into your ledger.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Your Shareable Code</p>
              <p className="text-base font-mono font-black text-slate-900">{data.referralCode}</p>
            </div>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rewards History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Points Activity Audit Trail</h3>
        <div className="divide-y divide-slate-100 text-xs">
          {data.history.map((h: any) => (
            <div key={h.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800">{h.description}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{h.date}</p>
              </div>
              <span className="font-mono font-bold text-emerald-600 text-sm">
                +{h.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;

