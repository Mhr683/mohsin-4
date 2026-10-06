import React, { useState } from 'react';
import { PayoutRequest, User } from '../types';
import { PayoutRequestModal } from './PayoutRequestModal';
import {
  Wallet,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Filter,
  DollarSign,
  ShieldCheck,
  Send,
  Plus
} from 'lucide-react';

interface ResellerPayoutsDeskViewProps {
  currentUser: User;
  allUsers?: User[];
  payoutRequests: PayoutRequest[];
  onRequestPayout: (amountOrData: any, details?: string) => void;
  onApprovePayout: (payoutId: string, note?: string) => void;
  onRejectPayout: (payoutId: string, reason: string) => void;
  onLogAudit?: (action: string, details: string, status?: 'SUCCESS' | 'WARNING' | 'FAILED') => void;
}

export const ResellerPayoutsDeskView: React.FC<ResellerPayoutsDeskViewProps> = ({
  currentUser,
  allUsers = [],
  payoutRequests,
  onRequestPayout,
  onApprovePayout,
  onRejectPayout,
  onLogAudit,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [newAmount, setNewAmount] = useState<number>(5000);
  const [newDetails, setNewDetails] = useState('');
  const [newMethod, setNewMethod] = useState('JazzCash');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  const visiblePayouts = payoutRequests.filter((p) => {
    if (!isAdmin && p.userId !== currentUser.id && p.resellerId !== currentUser.id) return false;
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    return true;
  });

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount || newAmount <= 0) return;
    if (newAmount > currentUser.walletBalancePKR) {
      alert('Insufficient wallet balance!');
      return;
    }
    onRequestPayout(newAmount, `${newMethod}: ${newDetails}`);
    setNewDetails('');
    alert('Payout request submitted successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-block mb-2">
            Automated Pakistani Remittance Engine
          </span>
          <h2 className="text-2xl font-black">Reseller Profit Payouts & Banking Desk</h2>
          <p className="text-xs text-slate-400 mt-1">
            Same-day Raast, JazzCash, Easypaisa & Direct IBFT Settlements.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
          <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 text-right">
            <span className="text-[10px] text-slate-400 block font-semibold">Your Wallet Balance</span>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              PKR {Number(currentUser.walletBalancePKR || 0).toLocaleString()}
            </div>
          </div>

          {!isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-900/30"
            >
              <Plus className="w-4 h-4" />
              <span>Fast Withdrawal Modal</span>
            </button>
          )}
        </div>
      </div>

      <PayoutRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        resellerId={currentUser.id}
        resellerName={currentUser.name}
      />

      {/* Reseller Request Box */}
      {!isAdmin && (
        <form onSubmit={handleCreateRequest} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Request Profit Payout</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-slate-600 block mb-1 font-semibold">Payout Method</label>
              <select
                value={newMethod}
                onChange={(e) => setNewMethod(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold"
              >
                <option value="JazzCash">JazzCash Wallet</option>
                <option value="Easypaisa">Easypaisa Wallet</option>
                <option value="Raast">Raast Instant ID</option>
                <option value="Meezan Bank">Meezan Bank IBFT</option>
                <option value="HBL">HBL Bank IBFT</option>
              </select>
            </div>
            <div>
              <label className="text-slate-600 block mb-1 font-semibold">Amount (PKR)</label>
              <input
                type="number"
                required
                min={500}
                max={currentUser.walletBalancePKR}
                value={newAmount}
                onChange={(e) => setNewAmount(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1 font-semibold">Account / Mobile Number</label>
              <input
                type="text"
                required
                placeholder="0321-xxxxxxx or IBAN"
                value={newDetails}
                onChange={(e) => setNewDetails(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
              />
            </div>
          </div>
          <button
            type="submit"
            className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
          >
            Submit Payout Request
          </button>
        </form>
      )}

      {/* Payouts Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            {isAdmin ? 'All Platform Payout Requests' : 'Your Payout Requests History'}
          </h3>
          <div className="flex items-center gap-2">
            {(['ALL', 'PENDING', 'PAID', 'REJECTED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  filterStatus === s
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {visiblePayouts.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400">No payout records found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {visiblePayouts.map((p) => (
              <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      PKR {p.amountPKR.toLocaleString()}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : p.status === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Beneficiary: <strong className="text-slate-800">{p.userName || p.resellerName || 'Reseller'}</strong> • {p.bankDetails || p.accountDetails || p.paymentMethod}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">Requested: {p.requestedAt || 'Recent'}</p>
                </div>

                {isAdmin && p.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onApprovePayout(p.id, 'Dispatched via Raast')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                    >
                      Approve & Pay (Raast)
                    </button>
                    <button
                      onClick={() => onRejectPayout(p.id, 'Account title mismatch')}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
