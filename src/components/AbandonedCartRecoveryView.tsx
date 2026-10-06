import React, { useState } from 'react';
import {
  ShoppingCart,
  MessageCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Percent,
  RefreshCw,
  Search,
  ExternalLink,
  Zap,
  ArrowRight
} from 'lucide-react';
import { AbandonedCartSession, Order } from '../types';

interface AbandonedCartRecoveryViewProps {
  onRecoverToOrder: (session: AbandonedCartSession) => void;
}

const INITIAL_ABANDONED_CARTS: AbandonedCartSession[] = [
  {
    id: 'cart-ab-1',
    customerName: 'Khurram Shahzad',
    customerPhone: '0302-8491029',
    customerCity: 'Rawalpindi',
    productName: 'T9 Vintage Hair Trimmer (Gold Heavy Duty)',
    cartTotalPKR: 1650,
    itemsCount: 1,
    abandonedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    recoveryStatus: 'PENDING',
  },
  {
    id: 'cart-ab-2',
    customerName: 'Samina Bibi',
    customerPhone: '0333-9182391',
    customerCity: 'Multan',
    productName: 'Automatic Electric Dumpling Samosa Maker',
    cartTotalPKR: 2850,
    itemsCount: 2,
    abandonedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    recoveryStatus: 'MESSAGE_SENT',
    discountOfferedPct: 5,
  },
  {
    id: 'cart-ab-3',
    customerName: 'Fahad Mehmood',
    customerPhone: '0315-7729102',
    customerCity: 'Lahore',
    productName: 'Magnetic Wireless Power Bank 10000mAh Fast Charging',
    cartTotalPKR: 3400,
    itemsCount: 1,
    abandonedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    recoveryStatus: 'PENDING',
  },
  {
    id: 'cart-ab-4',
    customerName: 'Zainab Fatima',
    customerPhone: '0300-1122334',
    customerCity: 'Karachi',
    productName: 'Professional 4-in-1 Hair Dryer Hot Air Brush',
    cartTotalPKR: 2950,
    itemsCount: 1,
    abandonedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    recoveryStatus: 'RECOVERED',
    discountOfferedPct: 10,
  },
];

export const AbandonedCartRecoveryView: React.FC<AbandonedCartRecoveryViewProps> = ({
  onRecoverToOrder,
}) => {
  const [sessions, setSessions] = useState<AbandonedCartSession[]>(INITIAL_ABANDONED_CARTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionForModal, setSelectedSessionForModal] = useState<AbandonedCartSession | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(5);
  const [customCoupon, setCustomCoupon] = useState('YM5OFF');
  const [recoveryToast, setRecoveryToast] = useState<string | null>(null);

  const totalLostGMV = sessions.reduce((sum, s) => sum + s.cartTotalPKR, 0);
  const recoveredSessions = sessions.filter((s) => s.recoveryStatus === 'RECOVERED');
  const recoveredGMV = recoveredSessions.reduce((sum, s) => sum + s.cartTotalPKR, 0);
  const recoveryRate = Math.round((recoveredSessions.length / sessions.length) * 100);

  const handleSendWhatsAppRecovery = (session: AbandonedCartSession) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === session.id
          ? { ...s, recoveryStatus: 'MESSAGE_SENT', discountOfferedPct: discountPercent }
          : s
      )
    );
    setSelectedSessionForModal(null);
    setRecoveryToast(
      `WhatsApp Recovery alert dispatched to ${session.customerName} (${session.customerPhone})!`
    );
    setTimeout(() => setRecoveryToast(null), 3500);
  };

  const handleSimulateCustomerCheckout = (session: AbandonedCartSession) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === session.id ? { ...s, recoveryStatus: 'RECOVERED' } : s))
    );
    onRecoverToOrder(session);
    setRecoveryToast(
      `🎉 Customer completed order! PKR ${session.cartTotalPKR.toLocaleString()} successfully converted into Orders pipeline!`
    );
    setTimeout(() => setRecoveryToast(null), 4000);
  };

  const filteredSessions = sessions.filter(
    (s) =>
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerPhone.includes(searchQuery) ||
      s.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast */}
      {recoveryToast && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/60 p-3.5 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{recoveryToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-black text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>WHATSAPP ABANDONED CART RECOVERY BOT</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Incomplete Checkout Recovery Engine
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
              Jo khareedar cart me saman daal kar checkout chorr dete hain unhe automated WhatsApp message aur 5% discount bhej kar wapis convert karein.
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <span className="text-[11px] font-bold uppercase text-slate-400">Total Abandoned Sessions</span>
            <div className="mt-1 text-2xl font-black font-mono text-white">
              {sessions.length} Carts
            </div>
            <span className="text-[10px] text-slate-500">Uncompleted checkouts</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <span className="text-[11px] font-bold uppercase text-slate-400">At-Risk Lost GMV</span>
            <div className="mt-1 text-2xl font-black font-mono text-amber-400">
              PKR {totalLostGMV.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">Left in carts without payment</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <span className="text-[11px] font-bold uppercase text-slate-400">Recovery Rate</span>
            <div className="mt-1 text-2xl font-black font-mono text-emerald-400">
              {recoveryRate}%
            </div>
            <span className="text-[10px] text-slate-500">Pakistani industry avg: 18%</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <span className="text-[11px] font-bold uppercase text-slate-400">Recovered Revenue</span>
            <div className="mt-1 text-2xl font-black font-mono text-cyan-400">
              PKR {recoveredGMV.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">Converted back into orders</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Abandoned Sessions Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Live Abandoned Carts</h2>
          </div>
          <span className="text-xs font-mono text-slate-500">{filteredSessions.length} sessions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="px-4 py-3.5">Customer & City</th>
                <th className="px-4 py-3.5">Abandoned Items</th>
                <th className="px-4 py-3.5">Time Left</th>
                <th className="px-4 py-3.5 text-right">Cart Total</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white">{session.customerName}</div>
                    <div className="font-mono text-slate-400 text-[11px]">{session.customerPhone}</div>
                    <div className="text-[10px] text-slate-500">{session.customerCity || 'Pakistan'}</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-200 line-clamp-1">{session.productName}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{session.itemsCount} item in cart</div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                      <span>{new Date(session.abandonedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-right font-mono font-black text-sm text-emerald-400">
                    PKR {session.cartTotalPKR.toLocaleString()}
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        session.recoveryStatus === 'RECOVERED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : session.recoveryStatus === 'MESSAGE_SENT'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {session.recoveryStatus === 'RECOVERED' && '✓ Order Converted'}
                      {session.recoveryStatus === 'MESSAGE_SENT' && 'WhatsApp Sent'}
                      {session.recoveryStatus === 'PENDING' && 'Pending'}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    {session.recoveryStatus === 'PENDING' && (
                      <button
                        onClick={() => setSelectedSessionForModal(session)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] shadow transition cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <MessageCircle className="h-3 w-3" />
                        <span>Recover via WhatsApp</span>
                      </button>
                    )}

                    {session.recoveryStatus === 'MESSAGE_SENT' && (
                      <button
                        onClick={() => handleSimulateCustomerCheckout(session)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] shadow transition cursor-pointer flex items-center gap-1 ml-auto"
                        title="Simulate customer clicking WhatsApp link and completing checkout"
                      >
                        <Zap className="h-3 w-3" />
                        <span>Simulate Buyer Conversion</span>
                      </button>
                    )}

                    {session.recoveryStatus === 'RECOVERED' && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Converted</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Recovery WhatsApp preview */}
      {selectedSessionForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-emerald-400" />
              <span>Send WhatsApp Cart Recovery Offer</span>
            </h3>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-white">{selectedSessionForModal.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Item:</span>
                <span className="text-slate-200 font-semibold">{selectedSessionForModal.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cart Total:</span>
                <span className="font-bold font-mono text-emerald-400">
                  PKR {selectedSessionForModal.cartTotalPKR.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Incentive Coupon Code:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCoupon}
                    onChange={(e) => setCustomCoupon(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono font-bold"
                  />
                  <select
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-bold"
                  >
                    <option value={5}>5% Off</option>
                    <option value={10}>10% Off</option>
                    <option value={0}>Free Delivery</option>
                  </select>
                </div>
              </div>

              {/* Message Preview */}
              <div className="rounded-2xl border border-[#075E54] bg-[#0b141a] p-3 text-[11px] text-slate-100 font-sans space-y-1">
                <p>
                  "Assalam-o-Alaikum {selectedSessionForModal.customerName}! 🛍️ Aapka cart mehfooz hai."
                </p>
                <p className="text-slate-300">
                  Aapke order ({selectedSessionForModal.productName}) par {discountPercent}% extra discount coupon <strong>{customCoupon}</strong> unlock ho chuka hai!
                </p>
                <p className="text-emerald-400 font-semibold">
                  Abhi order complete karne ke liye reply me 1 likhein.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedSessionForModal(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSendWhatsAppRecovery(selectedSessionForModal)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow transition cursor-pointer"
              >
                Send WhatsApp Recovery Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
