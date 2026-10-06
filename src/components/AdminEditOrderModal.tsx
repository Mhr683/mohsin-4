import React, { useState } from 'react';
import {
  X,
  Save,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Truck,
  User as UserIcon,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { Order, OrderStatus, ProfitGuardConfig } from '../types';

interface AdminEditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSaveOrder: (updatedOrder: Order) => void;
  profitGuardConfig?: ProfitGuardConfig;
}

const COURIERS = [
  'TCS Express',
  'Leopards Courier',
  'PostEx Logistics',
  'Trax Courier',
  'CallCourier',
  'M&P Express Logistics',
  'Direct Rider Fulfillment',
];

const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'PENDING_VERIFICATION', label: 'Pending Verification', color: 'bg-amber-950 text-amber-300 border-amber-800' },
  { value: 'COD_CONFIRMED', label: 'COD Confirmed', color: 'bg-blue-950 text-blue-300 border-blue-800' },
  { value: 'DISPATCHED', label: 'Dispatched & In Transit', color: 'bg-indigo-950 text-indigo-300 border-indigo-800' },
  { value: 'DELIVERED', label: 'Delivered & Escrow Settled', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
  { value: 'RETURNED', label: 'Returned to Warehouse', color: 'bg-orange-950 text-orange-300 border-orange-800' },
  { value: 'CANCELLED', label: 'Cancelled by Customer/Admin', color: 'bg-rose-950 text-rose-300 border-rose-800' },
];

export const AdminEditOrderModal: React.FC<AdminEditOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onSaveOrder,
  profitGuardConfig,
}) => {
  if (!isOpen || !order) return null;

  const [formData, setFormData] = useState<Order>({ ...order });
  const [adminNote, setAdminNote] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Dynamic recalculation if selling price changes
  const processingFee = profitGuardConfig?.processingFeePKR ?? 30;
  const shippingFee = formData.shippingCostPKR || (profitGuardConfig?.defaultShippingCostPKR ?? 250);
  const platformPct = profitGuardConfig?.platformFeePct ?? 2.0;

  const calculatedPlatformFee = Math.round((formData.sellingPricePKR * platformPct) / 100);
  const calculatedResellerCommission =
    formData.sellingPricePKR -
    formData.supplierCostPKR -
    processingFee -
    shippingFee -
    calculatedPlatformFee;
  const calculatedMarginPct =
    formData.sellingPricePKR > 0
      ? Number(((calculatedResellerCommission / formData.sellingPricePKR) * 100).toFixed(1))
      : 0;

  const isSolvent = calculatedResellerCommission >= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let updatedMessages = [...formData.messages];
    if (adminNote.trim()) {
      updatedMessages.push({
        id: `msg-${Date.now()}`,
        senderRole: 'ADMIN',
        senderName: 'Central Administration',
        text: `Admin Update: ${adminNote.trim()}`,
        timestamp: new Date().toISOString(),
      });
    }

    const updatedOrder: Order = {
      ...formData,
      platformFeePKR: calculatedPlatformFee,
      resellerCommissionPKR: calculatedResellerCommission,
      netProfitPKR: calculatedResellerCommission,
      profitMarginPct: calculatedMarginPct,
      messages: updatedMessages,
    };

    onSaveOrder(updatedOrder);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-blue-500/40 bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                  ADMIN ORDER EDITOR
                </span>
                <span className="font-mono text-xs text-slate-400">#{order.orderNumber}</span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">
                Edit Order Details & Logistics
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status Selector */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2">
            <label className="text-xs font-semibold text-slate-300">Order Lifecycle Status</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ORDER_STATUSES.map((st) => (
                <button
                  type="button"
                  key={st.value}
                  onClick={() => setFormData({ ...formData, status: st.value })}
                  className={`p-2 rounded-xl text-left border text-xs font-semibold transition ${
                    formData.status === st.value
                      ? `${st.color} ring-1 ring-white/20 font-bold`
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Customer & Address Details */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
              <UserIcon className="h-4 w-4 text-blue-400" />
              <span>Customer Information & Delivery Destination</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Customer Phone (WhatsApp/SMS)</label>
                <input
                  type="text"
                  required
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Destination City</label>
                <input
                  type="text"
                  required
                  value={formData.customerCity}
                  onChange={(e) => setFormData({ ...formData, customerCity: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Reseller Store / Source</label>
                <input
                  type="text"
                  value={formData.syncedStore || 'Direct Reseller Order'}
                  onChange={(e) =>
                    setFormData({ ...formData, syncedStore: e.target.value as any })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-slate-300">Complete Delivery Address</label>
                <textarea
                  rows={2}
                  required
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Courier Logistics */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
              <Truck className="h-4 w-4 text-emerald-400" />
              <span>Courier Partner & Tracking Logistics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Courier Partner</label>
                <select
                  value={formData.courierName || 'TCS Express'}
                  onChange={(e) => setFormData({ ...formData, courierName: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                >
                  {COURIERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Tracking Number / AWB</label>
                <input
                  type="text"
                  placeholder="e.g. TCS-77889912 or PEX-9921"
                  value={formData.trackingNumber || ''}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-emerald-300 font-mono font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Financials & Profit Guard Recalculation */}
          <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-purple-400" />
                <span>Financials & Real-Time Margin Recalculation</span>
              </h3>
              <span className="text-[11px] font-mono text-purple-300 font-semibold">
                Platform Take: {platformPct}% • Processing: PKR {processingFee}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Selling Price to Customer (PKR)</label>
                <input
                  type="number"
                  min="100"
                  step="10"
                  required
                  value={formData.sellingPricePKR}
                  onChange={(e) =>
                    setFormData({ ...formData, sellingPricePKR: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-mono font-bold text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Supplier Escrow Cost (PKR)</label>
                <input
                  type="number"
                  disabled
                  value={formData.supplierCostPKR}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2 text-xs font-mono text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Courier Shipping Fee (PKR)</label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={shippingFee}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingCostPKR: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-mono text-slate-300 focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Calculated Breakdown Display */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Processing:</span>
                <span className="text-slate-200">PKR {processingFee}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Platform Take (2%):</span>
                <span className="text-purple-300">PKR {calculatedPlatformFee}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Reseller Commission:</span>
                <span className={`font-bold ${isSolvent ? 'text-emerald-400' : 'text-rose-400'}`}>
                  PKR {calculatedResellerCommission}
                </span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Net Margin:</span>
                <span className={`font-bold ${isSolvent ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {calculatedMarginPct}%
                </span>
              </div>
            </div>
          </div>

          {/* Verification & Overrides */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-emerald-300">
              <input
                type="checkbox"
                checked={formData.codOtpVerified}
                onChange={(e) => setFormData({ ...formData, codOtpVerified: e.target.checked })}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Customer COD OTP Verified</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-purple-300">
              <input
                type="checkbox"
                checked={formData.profitGuardApproved}
                onChange={(e) => setFormData({ ...formData, profitGuardApproved: e.target.checked })}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500"
              />
              <span>Profit Guard Clearance Override</span>
            </label>
          </div>

          {/* Admin Internal Memo */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-blue-400" />
              <span>Admin Audit Note (appended to order timeline)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Customer requested urgent evening delivery via TCS"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div>
              {isSaved && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Order updated successfully!
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2 text-xs font-bold text-white shadow-lg transition"
              >
                <Save className="h-4 w-4" />
                <span>Save Order Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
