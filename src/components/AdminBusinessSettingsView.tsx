import React, { useState } from 'react';
import {
  Sliders,
  Save,
  CheckCircle2,
  DollarSign,
  Truck,
  ShieldAlert,
  Percent,
  Clock,
  Settings,
  RotateCcw
} from 'lucide-react';
import { riskEngine, RiskRuleConfig } from '../services/riskEngine';

interface BusinessRulesState {
  // Shipping Rules
  baseShippingPKR: number;
  extraPerKgPKR: number;
  remoteAreaSurchargePKR: number;
  defaultCourier: string;
  // COD Rules
  codFeePct: number;
  minCodFeePKR: number;
  maxUnverifiedCodAmountPKR: number;
  advanceDepositRequiredAbovePKR: number;
  // Risk Engine Rules
  riskRules: RiskRuleConfig;
  // Platform & Payout Fees
  platformFeePct: number;
  orderProcessingFeePKR: number;
  minimumPayoutAmountPKR: number;
  rtoPenaltyChargePKR: number;
  // Operational Window
  cancellationGracePeriodMins: number;
}

export const AdminBusinessSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<BusinessRulesState>(() => {
    const saved = localStorage.getItem('ym_business_rules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      baseShippingPKR: 200,
      extraPerKgPKR: 60,
      remoteAreaSurchargePKR: 150,
      defaultCourier: 'TRAX',
      codFeePct: 1.5,
      minCodFeePKR: 35,
      maxUnverifiedCodAmountPKR: 5000,
      advanceDepositRequiredAbovePKR: 6000,
      riskRules: riskEngine.getConfig(),
      platformFeePct: 2.0,
      orderProcessingFeePKR: 30,
      minimumPayoutAmountPKR: 500,
      rtoPenaltyChargePKR: 250,
      cancellationGracePeriodMins: 30
    };
  });

  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('ym_business_rules', JSON.stringify(settings));
    riskEngine.updateConfig(settings.riskRules);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Centralized Platform Business Rules & Tariffs</h3>
            <p className="text-xs text-slate-400">
              Configure dynamic shipping tariffs, COD risk gates, and platform fee formulas across Pakistan.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-900/30"
        >
          <Save className="w-4 h-4" />
          <span>Save Master Rules</span>
        </button>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Platform business rules updated successfully across all operational modules.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Section 1: Logistics & Shipping Tariffs */}
        <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-slate-800">
            <Truck className="w-4 h-4 text-indigo-400" />
            <span>Courier & Shipping Tariffs (Pakistan)</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Base Delivery Rate (1kg):</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-500 font-bold">Rs.</span>
                <input
                  type="number"
                  value={settings.baseShippingPKR}
                  onChange={(e) => setSettings({ ...settings, baseShippingPKR: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-1.5 font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Extra per Kg Rate:</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-500 font-bold">Rs.</span>
                <input
                  type="number"
                  value={settings.extraPerKgPKR}
                  onChange={(e) => setSettings({ ...settings, extraPerKgPKR: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-1.5 font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Remote Area Surcharge:</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-500 font-bold">Rs.</span>
                <input
                  type="number"
                  value={settings.remoteAreaSurchargePKR}
                  onChange={(e) => setSettings({ ...settings, remoteAreaSurchargePKR: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-1.5 font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Default Fallback Courier:</label>
              <select
                value={settings.defaultCourier}
                onChange={(e) => setSettings({ ...settings, defaultCourier: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white"
              >
                <option value="TRAX">Trax Sonic COD</option>
                <option value="POSTEX">PostEx Rapid</option>
                <option value="TCS">TCS Express</option>
                <option value="LEOPARDS">Leopards Prime</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: COD & Verification Rules */}
        <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-slate-800">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Cash on Delivery (COD) Rules</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">COD Collection Fee %:</label>
              <input
                type="number"
                step="0.1"
                value={settings.codFeePct}
                onChange={(e) => setSettings({ ...settings, codFeePct: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 font-mono text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Minimum COD Charge:</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-500 font-bold">Rs.</span>
                <input
                  type="number"
                  value={settings.minCodFeePKR}
                  onChange={(e) => setSettings({ ...settings, minCodFeePKR: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-1.5 font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Force Verify Above:</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-500 font-bold">Rs.</span>
                <input
                  type="number"
                  value={settings.maxUnverifiedCodAmountPKR}
                  onChange={(e) => setSettings({ ...settings, maxUnverifiedCodAmountPKR: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-1.5 font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Require Advance Above:</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-500 font-bold">Rs.</span>
                <input
                  type="number"
                  value={settings.advanceDepositRequiredAbovePKR}
                  onChange={(e) => setSettings({ ...settings, advanceDepositRequiredAbovePKR: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-1.5 font-mono text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Risk Engine Thresholds */}
        <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-slate-800">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Fraud & Risk Thresholds (Score 0-100)</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-slate-400 block mb-1">Low Max Score:</label>
              <input
                type="number"
                value={settings.riskRules.lowThresholdMax}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    riskRules: { ...settings.riskRules, lowThresholdMax: Number(e.target.value) }
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 font-mono text-white text-center"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Medium Max Score:</label>
              <input
                type="number"
                value={settings.riskRules.mediumThresholdMax}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    riskRules: { ...settings.riskRules, mediumThresholdMax: Number(e.target.value) }
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 font-mono text-white text-center"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">High Max Score:</label>
              <input
                type="number"
                value={settings.riskRules.highThresholdMax}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    riskRules: { ...settings.riskRules, highThresholdMax: Number(e.target.value) }
                  })
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 font-mono text-white text-center"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-300">Auto-block blacklisted phone numbers:</span>
            <input
              type="checkbox"
              checked={settings.riskRules.autoBlockBlacklisted}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  riskRules: { ...settings.riskRules, autoBlockBlacklisted: e.target.checked }
                })
              }
              className="w-4 h-4 rounded text-emerald-500"
            />
          </div>
        </div>

        {/* Section 4: Platform Commission, Payout & RTO Fee */}
        <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-white font-bold pb-2 border-b border-slate-800">
            <Percent className="w-4 h-4 text-amber-400" />
            <span>Platform Fee, Payout Minimum & RTO</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Platform Software Fee %:</label>
              <input
                type="number"
                step="0.5"
                value={settings.platformFeePct}
                onChange={(e) => setSettings({ ...settings, platformFeePct: Number(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 font-mono text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Order Processing Fee:</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-500 font-bold">Rs.</span>
                <input
                  type="number"
                  value={settings.orderProcessingFeePKR}
                  onChange={(e) => setSettings({ ...settings, orderProcessingFeePKR: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-1.5 font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Minimum Payout Limit:</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-500 font-bold">Rs.</span>
                <input
                  type="number"
                  value={settings.minimumPayoutAmountPKR}
                  onChange={(e) => setSettings({ ...settings, minimumPayoutAmountPKR: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-1.5 font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">RTO Penalty Charge:</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-slate-500 font-bold">Rs.</span>
                <input
                  type="number"
                  value={settings.rtoPenaltyChargePKR}
                  onChange={(e) => setSettings({ ...settings, rtoPenaltyChargePKR: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-1.5 font-mono text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
