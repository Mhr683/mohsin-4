import React from 'react';
import { Truck, Clock, AlertTriangle, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { calculateComprehensiveShippingRate } from '../utils/shippingRateCalculator';
import { CourierProviderCode } from '../types/courier';

interface ShippingRatePreviewProps {
  originCity?: string;
  destinationCity: string;
  weightKg: number;
  codAmountPKR?: number;
  selectedCourier?: CourierProviderCode | 'AUTO';
  onSelectCourier?: (courier: CourierProviderCode) => void;
}

export const ShippingRatePreview: React.FC<ShippingRatePreviewProps> = ({
  originCity = 'Lahore',
  destinationCity,
  weightKg,
  codAmountPKR = 0,
  selectedCourier = 'AUTO',
  onSelectCourier
}) => {
  const calculation = calculateComprehensiveShippingRate({
    originCity,
    destinationCity,
    weightKg,
    codAmountPKR
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-200 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">Live Courier Shipping Rate Engine</h4>
            <p className="text-[11px] text-slate-400">
              {originCity} → {destinationCity || 'Select City'} • {calculation.estimatedDeliveryTime}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Total Delivery Cost</span>
          <p className="text-base font-extrabold text-emerald-400 font-mono">
            Rs. {calculation.totalDeliveryCostPKR.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Warnings & Notices */}
      {calculation.warnings.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            {calculation.warnings.map((w, idx) => (
              <p key={idx}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* Rate Breakdown Items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Base Fare (1kg)</span>
          <p className="font-bold text-slate-200 font-mono mt-0.5">Rs. {calculation.baseDeliveryFeePKR}</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Extra Wt ({calculation.weightBreakdown.extraWeightKg}kg)</span>
          <p className="font-bold text-slate-200 font-mono mt-0.5">Rs. {calculation.extraWeightFeePKR}</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">COD Collection (1.5%)</span>
          <p className="font-bold text-slate-200 font-mono mt-0.5">Rs. {calculation.codFeePKR}</p>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Remote Surcharge</span>
          <p className="font-bold text-slate-200 font-mono mt-0.5">Rs. {calculation.remoteSurchargePKR}</p>
        </div>
      </div>

      {/* Multi-Courier Comparison */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Courier Partner Comparison</span>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Recommended: {calculation.recommendedCourier}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {calculation.courierOptions.map((option) => {
            const isSelected = selectedCourier === option.courier;
            return (
              <div
                key={option.courier}
                onClick={() => onSelectCourier && onSelectCourier(option.courier)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{option.courierDisplayName}</span>
                    {option.courier === calculation.recommendedCourier && (
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded font-semibold">
                        Best Rate
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {option.estimatedDays}
                    </span>
                    <span>•</span>
                    <span>Base Rs. {option.baseRatePKR}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold font-mono text-emerald-400 text-sm">
                    Rs. {option.totalCostPKR}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
