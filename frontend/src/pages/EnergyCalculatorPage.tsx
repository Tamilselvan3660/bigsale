import React, { useState } from 'react';
import { Zap, DollarSign, Calculator, Leaf, Info, ArrowRight } from 'lucide-react';
import api from '../lib/api';

export const EnergyCalculatorPage: React.FC = () => {
  const [powerWatts, setPowerWatts] = useState(120);
  const [dailyHours, setDailyHours] = useState(8);
  const [operatingDays, setOperatingDays] = useState(30);
  const [tariffRate, setTariffRate] = useState(0.16); // $/kWh

  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const resp = await api.post('/energy/calculate', {
        powerWatts,
        dailyHours,
        operatingDays,
        tariffRate,
      });
      if (resp.data.success) {
        setCalculation(resp.data.data);
      }
    } catch (err) {
      // fail gracefully
    } finally {
      setLoading(false);
    }
  };

  // Run on mount
  React.useEffect(() => {
    handleCalculate();
  }, []);

  const appliancePresets = [
    { name: 'Gaming Rig + Ultra Monitor', watts: 550, hours: 6 },
    { name: 'MacBook Pro / Office Laptop', watts: 65, hours: 9 },
    { name: 'Smart OLED Television 65"', watts: 140, hours: 5 },
    { name: 'Studio Monitor Speakers', watts: 80, hours: 4 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3.5 py-1 rounded-full">
          <Leaf className="w-3.5 h-3.5" />
          <span>SUSTAINABILITY & RUNNING COST INTELLIGENCE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          BIGSALE Energy Consumption & Operating Cost Calculator
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Estimate kilowatt-hour (kWh) power draw and monthly electricity expenditure across consumer appliances and computer workstations before making a purchase.
        </p>
      </div>

      {/* Preset Quick Selectors */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="font-bold text-slate-400 uppercase text-[10px] mr-1">Load Presets:</span>
        {appliancePresets.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => {
              setPowerWatts(preset.watts);
              setDailyHours(preset.hours);
            }}
            className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
          >
            {preset.name} ({preset.watts}W)
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Input Parameters Form */}
        <form onSubmit={handleCalculate} className="md:col-span-6 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-accent-600" />
            <span>Operating Parameters</span>
          </h3>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Hardware Power Rating (Watts)</span>
              <span className="font-mono text-accent-600">{powerWatts} Watts</span>
            </div>
            <input
              type="range"
              min="10"
              max="1500"
              step="10"
              value={powerWatts}
              onChange={(e) => setPowerWatts(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Daily Operating Hours</span>
              <span className="font-mono text-accent-600">{dailyHours} Hours/Day</span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full accent-accent-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Operating Days</label>
              <input
                type="number"
                min="1"
                max="365"
                value={operatingDays}
                onChange={(e) => setOperatingDays(Number(e.target.value))}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Tariff Rate ($/kWh)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="2.00"
                value={tariffRate}
                onChange={(e) => setTariffRate(Number(e.target.value))}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs py-3.5 rounded-xl shadow transition-all"
          >
            <span>{loading ? 'Computing Energy Models...' : 'Calculate Electricity Projections'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Projection Results */}
        {calculation && (
          <div className="md:col-span-6 space-y-6">
            <div className="bg-gradient-to-br from-emerald-950 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Estimated Monthly Cost</span>
                  <p className="text-4xl font-black text-white mt-1">
                    ${calculation.projections.monthlyCost}
                  </p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Consuming ~{calculation.projections.monthlyKwh} kWh / month
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                  <Zap className="w-6 h-6" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs">
                <div>
                  <p className="text-slate-300 text-[10px] uppercase font-bold">Annual Energy Cost</p>
                  <p className="text-lg font-black text-white mt-0.5">${calculation.projections.annualCost}</p>
                  <p className="text-[10px] text-slate-400">{calculation.projections.annualKwh} kWh / year</p>
                </div>
                <div>
                  <p className="text-slate-300 text-[10px] uppercase font-bold">Carbon Footprint</p>
                  <p className="text-lg font-black text-emerald-400 mt-0.5">~{calculation.projections.annualCarbonLbs} lbs</p>
                  <p className="text-[10px] text-slate-400">CO2 equivalent per annum</p>
                </div>
              </div>
            </div>

            {/* Efficiency Tips */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Info className="w-4 h-4 text-emerald-600" />
                <span>Operating Cost Reduction Recommendations</span>
              </div>
              <ul className="space-y-2 text-slate-600">
                {calculation.energyEfficiencyTips.map((tip: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnergyCalculatorPage;

