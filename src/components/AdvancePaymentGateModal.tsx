import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Smartphone,
  CreditCard,
  Building,
  ArrowRight,
  X,
  FileText
} from 'lucide-react';
import { RiskAssessment } from '../types';

interface AdvancePaymentGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  riskAssessment: RiskAssessment;
  orderTotalPKR: number;
  customerPhone: string;
  onConfirmAdvancePayment: (receiptRef: string) => void;
}

export const AdvancePaymentGateModal: React.FC<AdvancePaymentGateModalProps> = ({
  isOpen,
  onClose,
  riskAssessment,
  orderTotalPKR,
  customerPhone,
  onConfirmAdvancePayment,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'JAZZCASH' | 'EASYPAISA' | 'RAAST'>('JAZZCASH');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState(customerPhone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const ADVANCE_FEE_PKR = 200;
  const remainingCodPKR = Math.max(0, orderTotalPKR - ADVANCE_FEE_PKR);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        onConfirmAdvancePayment(transactionId);
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600/30 via-slate-900 to-slate-900 p-6 border-b border-amber-500/30 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-wide">Advance Delivery Fee Required</h3>
                <span className="bg-amber-500/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-amber-500/30">
                  Risk Score {riskAssessment.riskScore}%
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                COD Dispatch Protection Engine — Anti-RTO Loss Shield
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Risk Advisory */}
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Why is advance delivery fee required?</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              {riskAssessment.reasons.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
            <div className="text-xs text-amber-200/80 pt-1 font-medium">
              Note: The Rs. {ADVANCE_FEE_PKR} will be deducted from your parcel COD amount. You only pay Rs. {remainingCodPKR} to courier rider at doorstep!
            </div>
          </div>

          {/* Amount Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-400">Payable Now (Advance)</div>
              <div className="text-2xl font-black text-amber-400">Rs. {ADVANCE_FEE_PKR}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Locks Parcel Dispatch</div>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-400">Balance on Doorstep (COD)</div>
              <div className="text-2xl font-black text-emerald-400">Rs. {remainingCodPKR}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Pay Rider in Cash</div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Select Advance Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'JAZZCASH', name: 'JazzCash', no: '0304-4589211', title: 'YourMart Escrow Hub' },
                { id: 'EASYPAISA', name: 'EasyPaisa', no: '0342-9988123', title: 'YourMart Logistics Hub' },
                { id: 'RAAST', name: 'Raast ID', no: '03044589211', title: 'YourMart Escrow Direct' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMethod(m.id as any)}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedMethod === m.id
                      ? 'border-emerald-500 bg-emerald-950/30 text-white'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-sm">{m.name}</div>
                  <div className="text-[11px] font-mono text-emerald-400 mt-0.5">{m.no}</div>
                  <div className="text-[10px] text-slate-400 truncate">{m.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">
                Sender Mobile / Account Number
              </label>
              <input
                type="text"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                placeholder="03XXXXXXXXX"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1 font-medium">
                Transaction ID (TID / Reference Number)
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. 02938472918"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-mono uppercase"
                required
              />
            </div>

            {success && (
              <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Rs. 200 Advance verified successfully! Dispatching order with remaining Rs. {remainingCodPKR} COD invoice.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || success}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50 text-sm"
            >
              {isSubmitting ? (
                <span>Verifying Escrow Receipt...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Verify Advance Fee & Approve Order</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
