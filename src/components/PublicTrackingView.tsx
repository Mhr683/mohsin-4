import React, { useState } from 'react';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Building2,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { Order } from '../types';
import { courierManager } from '../services/couriers/courierManager';
import { TrackingResult } from '../types/courier';

interface PublicTrackingViewProps {
  orders: Order[];
}

export const PublicTrackingView: React.FC<PublicTrackingViewProps> = ({ orders }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(() => {
    return orders.find((o) => o.trackingNumber) || orders[0] || null;
  });
  const [courierResult, setCourierResult] = useState<TrackingResult | null>(null);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    const queryLower = query.toLowerCase();
    const found = orders.find(
      (o) =>
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(queryLower)) ||
        (o.orderNumber && o.orderNumber.toLowerCase().includes(queryLower)) ||
        (o.customerPhone && o.customerPhone.includes(query))
    );

    if (found) {
      setSearchedOrder(found);
      setCourierResult(null);
      setSearchNotFound(false);
    } else {
      setIsLoadingTracking(true);
      try {
        const res = await courierManager.trackShipment(query);
        if (res && res.checkpoints && res.checkpoints.length > 0) {
          setCourierResult(res);
          setSearchedOrder(null);
          setSearchNotFound(false);
        } else {
          setSearchedOrder(null);
          setCourierResult(null);
          setSearchNotFound(true);
        }
      } catch {
        setSearchedOrder(null);
        setCourierResult(null);
        setSearchNotFound(true);
      } finally {
        setIsLoadingTracking(false);
      }
    }
  };

  // Tracking steps definition
  const getStepStatus = (stepIndex: number, orderStatus: string) => {
    const statusMap: Record<string, number> = {
      PENDING_VERIFICATION: 0,
      COD_CONFIRMED: 1,
      DISPATCHED: 2,
      IN_TRANSIT: 3,
      OUT_FOR_DELIVERY: 3,
      DELIVERED: 4,
    };
    const currentStep = statusMap[orderStatus] ?? 2;
    if (stepIndex < currentStep) return 'COMPLETED';
    if (stepIndex === currentStep) return 'CURRENT';
    return 'UPCOMING';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 sm:p-8 text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-black text-indigo-400 border border-indigo-500/30">
          <Truck className="h-3.5 w-3.5" />
          <span>PAKISTAN LIVE PARCEL TRACKING PORTAL</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Track Your COD Order in Real-Time
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Apna Tracking ID (CN Number), Order Number ya Mobile Number enter karein aur dekhein parcel is waqt kahan pohancha hai.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto pt-2 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. TRX-84920194, PEX-982341, YM-9481, or 0300..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-3 text-sm text-white font-medium focus:border-indigo-500 focus:outline-none shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-900/40 transition cursor-pointer"
          >
            Track Parcel
          </button>
        </form>

        {searchNotFound && (
          <div className="max-w-xl mx-auto rounded-xl border border-amber-500/30 bg-amber-950/30 p-2.5 text-xs text-amber-300 flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Koi order match nahi hua. Baraye meherbani durust tracking ya phone number enter karein.</span>
          </div>
        )}
      </div>

      {/* Tracking Result Card */}
      {searchedOrder && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Top Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-black text-white">
                  {searchedOrder.trackingNumber || searchedOrder.orderNumber || 'PEX-98234192'}
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                  {searchedOrder.status.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Courier: <strong className="text-slate-200">{searchedOrder.courierName || 'PostEx Express'}</strong></span>
                <span>•</span>
                <span>Destination: <strong className="text-slate-200">{searchedOrder.customerCity}</strong></span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Cash on Delivery (COD) Total:</span>
              <span className="text-xl font-black font-mono text-emerald-400">
                PKR {searchedOrder.sellingPricePKR.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Visual Tracking Stepper */}
          <div className="py-4">
            <h3 className="text-xs uppercase font-extrabold text-slate-400 mb-6 tracking-wider">
              Live Parcel Journey & Movement
            </h3>

            <div className="relative pl-6 border-l-2 border-slate-800 space-y-8">
              {/* Step 1: Order Verified */}
              <div className="relative group">
                <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-lg">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Order Verified & Booked</span>
                    <span className="text-[10px] text-slate-500 font-mono">Day 1</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Customer contact verified via WhatsApp. Parcel assigned to warehouse packing team.
                  </p>
                </div>
              </div>

              {/* Step 2: Picked up by Courier */}
              <div className="relative group">
                <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-lg">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Picked Up from Central Warehouse (Lahore Hub)</span>
                    <span className="text-[10px] text-slate-500 font-mono">Day 1 - 06:40 PM</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sealed in secure flyer. Handed over to {searchedOrder.courierName || 'PostEx'} dispatch van.
                  </p>
                </div>
              </div>

              {/* Step 3: Trunk Transit */}
              <div className="relative group">
                <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-lg animate-pulse">
                  🚚
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                    <span>In Transit (Express Highway Trunk Route)</span>
                    <span className="rounded bg-indigo-950 border border-indigo-700 text-[9px] font-bold text-indigo-300 px-1.5 py-0.2">
                      CURRENT LOCATION
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    En route to destination delivery station in {searchedOrder.customerCity}. Expected arrival within 24 hours.
                  </p>
                </div>
              </div>

              {/* Step 4: Out for Delivery */}
              <div className="relative group opacity-60">
                <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs border border-slate-700">
                  4
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-300">Out for Delivery (Courier Rider Assigned)</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Rider will contact customer on {searchedOrder.customerPhone} before reaching doorstep.
                  </p>
                </div>
              </div>

              {/* Step 5: Delivered */}
              <div className="relative group opacity-40">
                <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs border border-slate-700">
                  5
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-300">Delivered & Cash Collected</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Customer receives item and pays cash PKR {searchedOrder.sellingPricePKR.toLocaleString()}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address & Help Banner */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-bold block mb-1">Delivery Address:</span>
              <p className="font-semibold text-slate-200">{searchedOrder.customerName}</p>
              <p className="text-slate-400">{searchedOrder.customerAddress}, {searchedOrder.customerCity}</p>
              <p className="font-mono text-slate-400 mt-1">{searchedOrder.customerPhone}</p>
            </div>

            <div className="sm:border-l border-slate-800 sm:pl-4 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-slate-500 font-bold block mb-1">Need help with this order?</span>
                <p className="text-slate-400 text-[11px]">
                  Rider na pohanche ya delivery address change karwana ho to foran WhatsApp par contact karein.
                </p>
              </div>

              <a
                href={`https://wa.me/923001234567?text=${encodeURIComponent(
                  `Help needed for Order #${searchedOrder.orderNumber} (Tracking: ${searchedOrder.trackingNumber || 'CN'})`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Contact WhatsApp Helpline</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* External Courier Direct Tracking Result */}
      {courierResult && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-black text-white">
                  {courierResult.trackingNumber}
                </span>
                <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                  {courierResult.currentStatus.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>Courier Network: <strong className="text-white">{courierResult.courier} Logistics</strong></span>
                <span>•</span>
                <span>Route: <strong className="text-slate-200">{courierResult.originCity} ➔ {courierResult.destinationCity}</strong></span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Overview:</span>
              <span className="text-sm font-bold text-cyan-300">
                {courierResult.currentStatusText}
              </span>
            </div>
          </div>

          <div className="py-2">
            <h3 className="text-xs uppercase font-extrabold text-slate-400 mb-6 tracking-wider">
              Real-Time Courier Hub Checkpoints
            </h3>

            <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
              {courierResult.checkpoints.map((checkpoint, idx) => (
                <div key={idx} className="relative group">
                  <div className={`absolute -left-[31px] top-0 h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs shadow-lg ${
                    idx === courierResult.checkpoints.length - 1
                      ? 'bg-cyan-500 text-slate-950 animate-pulse'
                      : 'bg-emerald-500 text-slate-950'
                  }`}>
                    {idx === courierResult.checkpoints.length - 1 ? '🚚' : '✓'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span>{checkpoint.statusText}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(checkpoint.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Location: <span className="text-slate-300 font-medium">{checkpoint.location}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Direct Courier API Abstraction Layer query verified. Last updated: {new Date(courierResult.lastUpdated).toLocaleTimeString()}
            </span>
            <a
              href={`https://wa.me/923001234567?text=${encodeURIComponent(
                `Inquiry for Courier Tracking: ${courierResult.trackingNumber} (${courierResult.courier})`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp Rider Support</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
