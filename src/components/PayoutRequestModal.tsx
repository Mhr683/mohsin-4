import React, { useState } from 'react';
import {
  X,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
  Smartphone
} from 'lucide-react';
import { payoutService, PayoutChannel } from '../services/payoutService';
import { walletLedgerService } from '../services/walletLedgerService';

interface PayoutRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  resellerId: string;
  resellerName: string;
  onSuccess?: () => void;
}

export const PayoutRequestModal: React.FC<PayoutRequestModalProps> = ({
  isOpen,
  onClose,
  resellerId,
  resellerName,
  onSuccess
}) => {
  if (!isOpen) return null;

  const wallet = walletLedgerService.getWalletSummary(resellerId);
  const [amount, setAmount] = useState<number>(wallet.availableBalancePKR > 500 ? wallet.availableBalancePKR : 500);
  const [channel, setChannel] = useState<PayoutChannel>('JAZZCASH');
  const [accountTitle, setAccountTitle] = useState(resellerName || '');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('Meezan Bank');
  const [iban, setIban] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accountNumber.trim()) {
      setError('Please enter your account / mobile number.');
      return;
    }

    if (!accountTitle.trim()) {
      setError('Please enter account title name.');
      return;
    }

    setIsSubmitting(true);
    const res = payoutService.requestPayout({
      resellerId,
      resellerName,
      amountPKR: amount,
      channel,
      accountTitle,
      accountNumber,
      bankName: channel === 'BANK_TRANSFER' ? bankName : undefined,
      iban: channel === 'BANK_TRANSFER' ? iban : undefined
    });

    setIsSubmitting(false);
    if (!res.success) {
      setError(res.error || 'Failed to submit payout request.');
    } else {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Request Profit Payout</h3>
              <p className="text-xs text-slate-400">
                Cleared Balance: <span className="font-mono text-emerald-400 font-bold">Rs. {wallet.availableBalancePKR.toLocaleString()}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-300 font-semibold">Withdrawal Amount (PKR):</label>
              <button
                type="button"
                onClick={() => setAmount(wallet.availableBalancePKR)}
                className="text-[11px] text-emerald-400 hover:underline"
              >
                Max (Rs. {wallet.availableBalancePKR})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold">Rs.</span>
              <input
                type="number"
                min={500}
                max={wallet.availableBalancePKR}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">Minimum withdrawal: Rs. 500</span>
          </div>

          {/* Channel Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Payout Method in Pakistan:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'JAZZCASH', name: 'JazzCash', sub: 'Instant Mobile Account' },
                { id: 'EASYPAISA', name: 'EasyPaisa', sub: 'Instant Mobile Account' },
                { id: 'RAAST', name: 'Raast P2P', sub: 'Instant Bank Raast ID' },
                { id: 'BANK_TRANSFER', name: 'Bank Transfer', sub: 'IBAN Direct Clearance' }
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setChannel(opt.id as PayoutChannel)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition ${
                    channel === opt.id
                      ? 'border-emerald-500 bg-emerald-950/20 text-white'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-xs text-white">{opt.name}</p>
                  <p className="text-[10px] text-slate-400">{opt.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Account Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Beneficiary Account Title:</label>
            <input
              type="text"
              value={accountTitle}
              onChange={(e) => setAccountTitle(e.target.value)}
              placeholder="e.g. Muhammad Mohsin"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Mobile or Account Number */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {channel === 'BANK_TRANSFER' ? 'Account Number / IBAN' : 'Mobile Account Number (03XX-XXXXXXX):'}
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder={channel === 'BANK_TRANSFER' ? 'PKXX MEZN 0000 0000 0000 0000' : '03001234567'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {channel === 'BANK_TRANSFER' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bank Name:</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Meezan Bank, HBL, Bank Alfalah"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || wallet.availableBalancePKR < 500}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-900/30 text-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Payout Request (Rs. {amount.toLocaleString()})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
