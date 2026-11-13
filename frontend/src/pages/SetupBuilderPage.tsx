import React, { useEffect, useState } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ShoppingBag, Zap, RefreshCw, Layers } from 'lucide-react';
import api from '../lib/api';
import { useCartStore } from '../stores/cartStore';
import toast from 'react-hot-toast';

export const SetupBuilderPage: React.FC = () => {
  const [components, setComponents] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Selected components
  const [selectedCpu, setSelectedCpu] = useState<any>(null);
  const [selectedMb, setSelectedMb] = useState<any>(null);
  const [selectedGpu, setSelectedGpu] = useState<any>(null);
  const [selectedRam, setSelectedRam] = useState<any>(null);
  const [selectedStorage, setSelectedStorage] = useState<any>(null);
  const [selectedPsu, setSelectedPsu] = useState<any>(null);
  const [selectedCase, setSelectedCase] = useState<any>(null);

  // Compatibility validation state
  const [validation, setValidation] = useState<any>(null);
  const [validating, setValidating] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const resp = await api.get('/setup-builder/components');
        if (resp.data.success) {
          setComponents(resp.data.data.components);
          // Set sensible defaults
          const c = resp.data.data.components;
          setSelectedCpu(c.processors[0]);
          setSelectedMb(c.motherboards[0]);
          setSelectedGpu(c.graphicsCards[1]);
          setSelectedRam(c.memory[0]);
          setSelectedStorage(c.storage[0]);
          setSelectedPsu(c.powerSupplies[0]);
          setSelectedCase(c.cabinets[0]);
        }
      } catch (err) {
        // fail gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchComponents();
  }, []);

  // Revalidate compatibility on selection change
  useEffect(() => {
    if (!selectedCpu && !selectedMb && !selectedGpu) return;

    const runValidation = async () => {
      setValidating(true);
      try {
        const resp = await api.post('/setup-builder/validate', {
          cpu: selectedCpu,
          motherboard: selectedMb,
          gpu: selectedGpu,
          ram: selectedRam,
          psu: selectedPsu,
          caseItem: selectedCase,
        });
        if (resp.data.success) {
          setValidation(resp.data.data);
        }
      } catch (err) {
        // fail silently
      } finally {
        setValidating(false);
      }
    };
    runValidation();
  }, [selectedCpu, selectedMb, selectedGpu, selectedRam, selectedPsu, selectedCase]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-slate-500">
        Loading PC & Workstation Component Library...
      </div>
    );
  }

  const selectedParts = [
    selectedCpu,
    selectedMb,
    selectedGpu,
    selectedRam,
    selectedStorage,
    selectedPsu,
    selectedCase,
  ].filter(Boolean);

  const totalPrice = selectedParts.reduce((sum, part) => sum + (Number(part.price) || 0), 0);

  const handleAddEntireSetup = async () => {
    if (validation && !validation.isCompatible) {
      toast.error('Cannot purchase incompatible setup! Please resolve hardware socket/clearance errors.');
      return;
    }
    try {
      for (const part of selectedParts) {
        await addItem(
          {
            id: part.id,
            name: part.name,
            slug: part.id,
            sku: `CMP-${part.id.toUpperCase()}`,
            price: part.price,
            stock: part.stock || 10,
            isActive: true,
            isFeatured: false,
            rating: 4.9,
            reviewCount: 8,
            categoryId: 'components',
            images: [{ id: '1', productId: part.id, url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600', isPrimary: true, sortOrder: 0 }],
            description: part.name,
          },
          1
        );
      }
      toast.success(`Complete Custom Setup (${selectedParts.length} components) added to cart!`, { icon: '🖥️' });
    } catch (err: any) {
      toast.error('Failed to add parts to cart');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-accent-700 text-xs font-bold px-3.5 py-1 rounded-full">
          <Layers className="w-3.5 h-3.5" />
          <span>REAL-TIME SOCKET, WATTAGE & CLEARANCE VALIDATION</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Intelligent Setup & PC Builder
        </h1>
        <p className="text-sm text-slate-500">
          Configure high-performance gaming rigs, programming workstations, or creative studio PCs with guaranteed hardware interface compatibility.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Component Selector Columns */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-black text-slate-900">Custom Component Selection</h3>

          {/* CPU Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">1. Processor (CPU)</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {components.processors.map((c: any) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCpu(c)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedCpu?.id === c.id ? 'border-accent-600 bg-accent-50/50 ring-2 ring-accent-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Socket: {c.socket} • TDP: {c.tdp}</p>
                  <p className="text-xs font-black text-navy-900 mt-2">${c.price}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Motherboard Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">2. Motherboard</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {components.motherboards.map((mb: any) => (
                <button
                  key={mb.id}
                  type="button"
                  onClick={() => setSelectedMb(mb)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedMb?.id === mb.id ? 'border-accent-600 bg-accent-50/50 ring-2 ring-accent-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 truncate">{mb.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Socket: {mb.socket} • {mb.ramType}</p>
                  <p className="text-xs font-black text-navy-900 mt-2">${mb.price}</p>
                </button>
              ))}
            </div>
          </div>

          {/* GPU Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">3. Graphics Card (GPU)</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {components.graphicsCards.map((gpu: any) => (
                <button
                  key={gpu.id}
                  type="button"
                  onClick={() => setSelectedGpu(gpu)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedGpu?.id === gpu.id ? 'border-accent-600 bg-accent-50/50 ring-2 ring-accent-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 truncate">{gpu.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Min PSU: {gpu.minPsuWatt}W • {gpu.lengthMm}mm</p>
                  <p className="text-xs font-black text-navy-900 mt-2">${gpu.price}</p>
                </button>
              ))}
            </div>
          </div>

          {/* RAM & Storage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">4. Memory (RAM)</label>
              <select
                value={selectedRam?.id}
                onChange={(e) => setSelectedRam(components.memory.find((r: any) => r.id === e.target.value))}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold"
              >
                {components.memory.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.name} — ${r.price}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">5. Storage (SSD)</label>
              <select
                value={selectedStorage?.id}
                onChange={(e) => setSelectedStorage(components.storage.find((s: any) => s.id === e.target.value))}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold"
              >
                {components.storage.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} — ${s.price}</option>
                ))}
              </select>
            </div>
          </div>

          {/* PSU & Case */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">6. Power Supply (PSU)</label>
              <select
                value={selectedPsu?.id}
                onChange={(e) => setSelectedPsu(components.powerSupplies.find((p: any) => p.id === e.target.value))}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold"
              >
                {components.powerSupplies.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">7. Cabinet / Chassis</label>
              <select
                value={selectedCase?.id}
                onChange={(e) => setSelectedCase(components.cabinets.find((c: any) => c.id === e.target.value))}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold"
              >
                {components.cabinets.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name} — ${c.price}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Bill of Materials & Compatibility Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 space-y-5">
            <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100">
              Hardware Configuration Summary
            </h3>

            {/* Validation Banner */}
            {validation && (
              <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                validation.isCompatible
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {validation.isCompatible ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  <span>{validation.isCompatible ? '100% Hardware Compatible' : 'Compatibility Conflict Detected'}</span>
                </div>
                {validation.errors && validation.errors.map((err: string, i: number) => (
                  <p key={i} className="text-[11px] leading-tight text-rose-700 font-medium">{err}</p>
                ))}
                <div className="pt-1 text-[11px] text-slate-500 font-mono">
                  Estimated Peak Load: ~{validation.estimatedTotalWattage}W (Recommended: {validation.recommendedPsuWattage}W+)
                </div>
              </div>
            )}

            {/* Itemized Parts List */}
            <div className="divide-y divide-slate-100 text-xs">
              {selectedParts.map((part) => (
                <div key={part.id} className="py-2.5 flex justify-between items-center">
                  <span className="text-slate-700 truncate pr-2">{part.name}</span>
                  <span className="font-mono font-bold text-slate-900 shrink-0">${part.price}</span>
                </div>
              ))}
            </div>

            {/* Total & CTA */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400">Total Setup Cost</span>
                <p className="text-2xl font-black text-navy-900">${totalPrice}.00</p>
              </div>
              <button
                type="button"
                onClick={handleAddEntireSetup}
                className="inline-flex items-center gap-1.5 bg-accent-600 hover:bg-accent-700 active:scale-95 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add Complete Rig</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupBuilderPage;

