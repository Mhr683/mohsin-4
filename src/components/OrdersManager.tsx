import React, { useState } from 'react';
import {
  RefreshCw,
  Truck,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  PhoneCall,
  MessageSquare,
  Search,
  Filter,
  Package,
  ArrowRight,
  ExternalLink,
  MapPin,
  Clock,
  DollarSign,
  UserCheck,
  Send,
  MessageCircle,
  Eye,
  Check,
  Printer,
  UploadCloud,
  Share2,
  Copy,
  Zap,
} from 'lucide-react';
import { Order, OrderStatus, User, ChatMessage } from '../types';
import {
  getCourierTrackingUrl,
  getWhatsAppTrackingShareUrl,
} from '../utils/courierTracking';
import { SupplierTrackingUploadModal } from './SupplierTrackingUploadModal';
import { OrderTimeline } from './OrderTimeline';

interface OrdersManagerProps {
  currentUser: User;
  orders: Order[];
  onVerifyCod: (orderId: string) => void;
  onDispatchOrder: (orderId: string, courierName: string, trackingNumber?: string) => void;
  onDeliverOrder: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onSendMessage?: (orderId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  onOpenBatchPrint?: () => void;
  onBulkDispatchOrders?: (dispatches: { orderId: string; courierName: string; trackingNumber: string }[]) => void;
  onOpenWhatsAppVerification?: (order: Order) => void;
  onOpenCourierBooking?: (order: Order) => void;
  onOpenThermalSlip?: (order: Order) => void;
}

export const OrdersManager: React.FC<OrdersManagerProps> = ({
  currentUser,
  orders,
  onVerifyCod,
  onDispatchOrder,
  onDeliverOrder,
  onCancelOrder,
  onSendMessage,
  onOpenBatchPrint,
  onBulkDispatchOrders,
  onOpenWhatsAppVerification,
  onOpenCourierBooking,
  onOpenThermalSlip,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);

  // Active Chat State
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const [expandedTimelineOrderId, setExpandedTimelineOrderId] = useState<string | null>(null);

  // Supplier Tracking Upload Modal state
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);

  // Filter orders based on user role for strict isolation
  const roleFilteredOrders = orders.filter((o) => {
    if (currentUser?.role === 'ADMIN') return true;
    if (currentUser?.role === 'SUPPLIER') return o.supplierId === currentUser?.id;
    if (currentUser?.role === 'RESELLER') return o.resellerId === currentUser?.id;
    return true;
  });

  const displayOrders = roleFilteredOrders.filter((o) => {
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery) ||
      o.customerCity.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeChatOrder = orders.find((o) => o.id === activeChatOrderId);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'COD_CONFIRMED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'DISPATCHED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'DELIVERED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'RETURNED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'CANCELLED':
        return 'bg-slate-700 text-slate-400 border-slate-600';
    }
  };

  const handleSimulateCallVerification = (orderId: string) => {
    setVerifyingOrderId(orderId);
    setTimeout(() => {
      onVerifyCod(orderId);
      setVerifyingOrderId(null);
    }, 1000);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !activeChatOrderId || !onSendMessage) return;

    onSendMessage(activeChatOrderId, {
      senderRole: currentUser?.role || 'RESELLER',
      senderName: currentUser?.name || 'User',
      text: chatInputText.trim(),
    });

    setChatInputText('');
  };

  const handleSendQuickReply = (text: string) => {
    if (!activeChatOrderId || !onSendMessage) return;
    onSendMessage(activeChatOrderId, {
      senderRole: currentUser?.role || 'RESELLER',
      senderName: currentUser?.name || 'User',
      text,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                COD ORDER PIPELINE & CUSTOMER CHAT
              </span>
              <span className="text-xs text-slate-400">Isolated Role Access</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
              {currentUser?.role === 'SUPPLIER'
                ? 'Warehouse Dispatch & Packaging Orders'
                : currentUser?.role === 'RESELLER'
                ? 'My Customer Orders & Live Chat Center'
                : 'Platform Master Orders & Fee Audit'}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              {currentUser?.role === 'SUPPLIER'
                ? 'Fulfill verified wholesale orders and generate courier dispatch labels.'
                : 'Communicate directly with your customers, monitor COD delivery status, and receive net profits.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Supplier / Admin Tracking ID Upload Button */}
            {(currentUser?.role === 'SUPPLIER' || currentUser?.role === 'ADMIN') && (
              <button
                onClick={() => setIsTrackingModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-900/30 transition border border-purple-400/30"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload Tracking ID (CN)</span>
              </button>
            )}

            {onOpenBatchPrint && (
              <button
                onClick={onOpenBatchPrint}
                className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg transition"
              >
                <Printer className="h-4 w-4" />
                <span>Batch 4x6 Label Printer</span>
              </button>
            )}
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Viewing As:</span>
              <span className="rounded-lg bg-slate-800 px-2.5 py-1 font-bold text-emerald-400 border border-slate-700">
                {currentUser?.role || 'USER'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search order ID, customer name, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-9 pr-4 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {['ALL', 'PENDING_VERIFICATION', 'COD_CONFIRMED', 'DISPATCHED', 'DELIVERED', 'RETURNED'].map(
            (st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  filterStatus === st
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {displayOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-12 text-center text-slate-400">
            <Package className="mx-auto h-10 w-10 text-slate-600" />
            <p className="mt-3 text-sm font-semibold text-slate-300">No orders found in this view</p>
            <p className="text-xs text-slate-500">
              Place a new customer order from the Wholesale Catalog to see it live here.
            </p>
          </div>
        ) : (
          displayOrders.map((ord) => {
            const hasMessages = ord.messages && ord.messages.length > 0;
            const isSupplier = currentUser?.role === 'SUPPLIER';

            return (
              <div
                key={ord.id}
                className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl hover:border-slate-700 transition"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-bold text-white">
                      {ord.orderNumber}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${getStatusBadge(
                        ord.status
                      )}`}
                    >
                      {ord.status.replace('_', ' ')}
                    </span>
                    {ord.syncedStore && (
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-slate-700">
                        via {ord.syncedStore}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Order Timeline Button */}
                    <button
                      onClick={() => setExpandedTimelineOrderId(expandedTimelineOrderId === ord.id ? null : ord.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition ${
                        expandedTimelineOrderId === ord.id
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                      title="View Full Lifecycle & Audit Trail"
                    >
                      <Clock className="h-4 w-4 text-indigo-400" />
                      <span>Timeline</span>
                    </button>

                    {/* Live Chat Action Button */}
                    <button
                      onClick={() => setActiveChatOrderId(ord.id)}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 border border-slate-700 transition"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-400" />
                      <span>Customer Chat</span>
                      {hasMessages && (
                        <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                          {ord.messages?.length}
                        </span>
                      )}
                    </button>

                    <span className="text-slate-500 font-mono text-[11px]">
                      {new Date(ord.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Order Main Content */}
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  {/* Items & Customer / Fulfillment Info */}
                  <div className="space-y-3 lg:col-span-2">
                    {ord.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                        />
                        <div className="flex-1">
                          <div className="text-xs font-bold text-slate-100">{item.name}</div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-mono">
                            <span>
                              SKU: <b className="text-amber-400">{item.sku}</b>
                            </span>
                            <span>
                              Qty: <b className="text-white">{item.qty}</b>
                            </span>
                            {!isSupplier && (
                              <span>
                                Retail: <b className="text-emerald-400">PKR {item.sellingPricePKR}</b>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Customer Info (Privacy-filtered for Supplier) */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 text-xs text-slate-300 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                          {ord.customerName}
                        </span>
                        {!isSupplier && (
                          <span className="font-mono text-emerald-400">{ord.customerPhone}</span>
                        )}
                      </div>
                      <div className="text-slate-400 flex items-start gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span>
                          {ord.customerAddress} ({ord.customerCity})
                        </span>
                      </div>
                      {/* Order Tracking Information & Customer Live Tracking Link */}
                      {ord.trackingNumber ? (
                        <div className="pt-2 border-t border-slate-800 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-700/60">
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-purple-400" />
                              <div className="text-xs">
                                <span className="text-slate-400">Courier: </span>
                                <b className="text-white">{ord.courierName || 'Express Courier'}</b>
                                <span className="mx-1.5 text-slate-600">|</span>
                                <span className="text-slate-400">CN: </span>
                                <span className="font-mono font-bold text-amber-300">
                                  {ord.trackingNumber}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Copy Tracking ID */}
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(ord.trackingNumber || '');
                                  setCopiedTrackingId(ord.id || '');
                                  setTimeout(() => setCopiedTrackingId(null), 2000);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="Copy Consignment Number"
                              >
                                {copiedTrackingId === ord.id ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>

                              {/* 1-Click Official Live Courier Tracking Link */}
                              <a
                                href={getCourierTrackingUrl(ord.courierName, ord.trackingNumber)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 text-xs font-bold transition"
                                title="Open Live Official Courier Status"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>Track Live Parcel</span>
                              </a>
                            </div>
                          </div>

                          {/* Reseller WhatsApp Auto-Alert Button */}
                          {(!isSupplier || currentUser?.role === 'ADMIN') && ord.customerPhone && (
                            <a
                              href={getWhatsAppTrackingShareUrl(
                                ord.customerPhone,
                                ord.customerName,
                                ord.orderNumber || 'Order',
                                ord.courierName || 'Courier',
                                ord.trackingNumber,
                                ord.sellingPricePKR
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white shadow transition"
                              title="Send 1-Click WhatsApp Live Tracking Alert to Customer"
                            >
                              <Share2 className="h-3.5 w-3.5" />
                              <span>WhatsApp Customer Live Tracking Link</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="pt-1 text-[11px] text-slate-500 italic">
                          Awaiting warehouse dispatch & courier tracking ID generation.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Ledger & Actions */}
                  <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                    {/* Financial details */}
                    <div className="space-y-2 text-xs">
                      {isSupplier ? (
                        /* Supplier View: Only sees wholesale amount to be paid */
                        <div className="space-y-2">
                          <div className="flex justify-between text-slate-400">
                            <span>Wholesale Amount (Your Payout):</span>
                            <span className="font-mono font-bold text-amber-300 text-sm">
                              PKR {ord.supplierCostPKR.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Dispatched from your warehouse. Credited directly to your wallet upon courier delivery.
                          </div>
                        </div>
                      ) : (
                        /* Reseller & Admin View: Exact calculation formula */
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-slate-400">
                            <span>Customer COD Price:</span>
                            <span className="font-mono font-bold text-white">
                              PKR {ord.sellingPricePKR.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>- Supplier Base Cost:</span>
                            <span className="font-mono text-amber-300">
                              PKR {ord.supplierCostPKR.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>- Flat Processing Fee:</span>
                            <span className="font-mono text-slate-300">
                              PKR {ord.processingFeePKR ?? 30}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>- Courier Delivery:</span>
                            <span className="font-mono text-slate-300">
                              PKR {ord.shippingCostPKR}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>- 2% Platform Fee:</span>
                            <span className="font-mono text-slate-300">
                              PKR {ord.platformFeePKR ?? Math.round(ord.sellingPricePKR * 0.02)}
                            </span>
                          </div>

                          <div className="border-t border-slate-800 pt-2 flex justify-between font-bold">
                            <span className="text-emerald-400">Your Net Profit:</span>
                            <span className="font-mono text-sm text-emerald-400">
                              PKR {ord.resellerCommissionPKR.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Dynamic State Actions */}
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      {ord.status === 'PENDING_VERIFICATION' && (
                        <div className="space-y-1.5">
                          {onOpenWhatsAppVerification && (
                            <button
                              onClick={() => onOpenWhatsAppVerification(ord)}
                              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-2 text-xs font-black text-white shadow-md shadow-emerald-950/40 transition cursor-pointer"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              <span>🤖 Verify via WhatsApp Bot</span>
                            </button>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSimulateCallVerification(ord.id)}
                              disabled={verifyingOrderId === ord.id}
                              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 py-1.5 text-[11px] font-bold text-slate-200 border border-slate-700 transition disabled:opacity-50 cursor-pointer"
                            >
                              {verifyingOrderId === ord.id ? (
                                <>
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                  <span>Verifying...</span>
                                </>
                              ) : (
                                <>
                                  <PhoneCall className="h-3 w-3 text-emerald-400" />
                                  <span>Quick OTP</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => onCancelOrder(ord.id)}
                              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-[11px] text-slate-400 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {ord.status === 'COD_CONFIRMED' && (
                        <div className="space-y-1.5">
                          {onOpenCourierBooking ? (
                            <button
                              onClick={() => onOpenCourierBooking(ord)}
                              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-2 text-xs font-black text-white shadow-lg shadow-purple-950/40 transition cursor-pointer"
                            >
                              <Zap className="h-3.5 w-3.5" />
                              <span>⚡ 1-Click Book Courier & CN Slip</span>
                            </button>
                          ) : null}

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setIsTrackingModalOpen(true);
                              }}
                              className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 py-1.5 text-[11px] font-bold text-slate-300 border border-slate-700 transition cursor-pointer"
                            >
                              <Truck className="h-3 w-3" />
                              <span>Manual Tracking</span>
                            </button>
                            <button
                              onClick={() => onDispatchOrder(ord.id, 'TCS Express')}
                              className="rounded-xl border border-purple-500/40 bg-purple-950/40 px-2.5 py-1.5 text-[11px] font-semibold text-purple-300 hover:bg-purple-900/60 transition cursor-pointer"
                              title="Quick dispatch with default TCS Express"
                            >
                              Quick
                            </button>
                          </div>
                        </div>
                      )}

                      {ord.status === 'DISPATCHED' && (
                        <div className="space-y-1.5">
                          <button
                            onClick={() => onDeliverOrder(ord.id)}
                            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2 text-xs font-bold text-white shadow transition cursor-pointer"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Mark Delivered (Disburse Payouts)</span>
                          </button>

                          {onOpenThermalSlip && (
                            <button
                              onClick={() => onOpenThermalSlip(ord)}
                              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 py-1.5 text-[11px] font-bold text-purple-300 border border-purple-500/30 transition cursor-pointer"
                            >
                              <Printer className="h-3 w-3" />
                              <span>Print 4x6 Thermal Slip</span>
                            </button>
                          )}
                        </div>
                      )}

                      {ord.status === 'DELIVERED' && (
                        <div className="space-y-1.5">
                          <div className="rounded-xl bg-emerald-950/40 p-2.5 text-center text-xs font-bold text-emerald-400 border border-emerald-900/50">
                            ✓ Delivered & Net Profit Credited to Wallet
                          </div>
                          {onOpenThermalSlip && (
                            <button
                              onClick={() => onOpenThermalSlip(ord)}
                              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 py-1 text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
                            >
                              <Printer className="h-3 w-3" />
                              <span>View 4x6 Airway Bill</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible Full Lifecycle Timeline & Audit Trail */}
                {expandedTimelineOrderId === ord.id && (
                  <div className="mt-4 pt-4 border-t border-slate-800 bg-slate-950/40 p-4 rounded-2xl animate-fadeIn">
                    <OrderTimeline orderId={ord.id} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Customer & Reseller Order Chat Modal */}
      {activeChatOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl flex flex-col h-[600px] max-h-[90vh]">
            {/* Chat Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Chat: {activeChatOrder.customerName}</span>
                    <span className="font-mono text-[11px] text-amber-400">
                      ({activeChatOrder.orderNumber})
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Order Status: <b className="text-emerald-400">{activeChatOrder.status}</b>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveChatOrderId(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
              {(!activeChatOrder.messages || activeChatOrder.messages.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center p-6">
                  <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                  <span>No chat messages yet for this order.</span>
                  <span className="text-[11px] text-slate-600 mt-1">
                    Send a message to update the customer or ask for delivery confirmation.
                  </span>
                </div>
              ) : (
                activeChatOrder.messages.map((msg) => {
                  const isMe = msg.senderRole === currentUser?.role;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-400">
                        <span className="font-bold text-slate-300">{msg.senderName}</span>
                        <span>•</span>
                        <span className="rounded bg-slate-800 px-1 py-0.2 font-mono text-[9px] text-slate-400">
                          {msg.senderRole}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-br-sm'
                            : 'bg-slate-800 text-slate-100 rounded-bl-sm border border-slate-700'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Preset Buttons */}
            <div className="border-t border-slate-800 pt-2 pb-1">
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
                <span className="text-slate-500 text-[10px] whitespace-nowrap">Quick:</span>
                <button
                  onClick={() => handleSendQuickReply('Aapka order verify ho chuka hai aur packing mein hai!')}
                  className="rounded-full bg-slate-800 hover:bg-slate-700 px-2.5 py-0.5 text-slate-300 whitespace-nowrap border border-slate-700 text-[10px]"
                >
                  Order Verified
                </button>
                <button
                  onClick={() => handleSendQuickReply('Aapka parcel TCS se dispatch ho chuka hai.')}
                  className="rounded-full bg-slate-800 hover:bg-slate-700 px-2.5 py-0.5 text-slate-300 whitespace-nowrap border border-slate-700 text-[10px]"
                >
                  TCS Dispatched
                </button>
                <button
                  onClick={() => handleSendQuickReply('Rider delivery ke liye phonchne wala hai, please cash ready rakhen.')}
                  className="rounded-full bg-slate-800 hover:bg-slate-700 px-2.5 py-0.5 text-slate-300 whitespace-nowrap border border-slate-700 text-[10px]"
                >
                  Cash on Delivery Ready
                </button>
              </div>
            </div>

            {/* Message Input Bar */}
            <form onSubmit={handleSendChatMessage} className="mt-2 flex gap-2">
              <input
                type="text"
                placeholder="Type your message to the customer..."
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow flex items-center gap-1"
              >
                <Send className="h-4 w-4" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Tracking ID Upload Modal */}
      <SupplierTrackingUploadModal
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
        currentUser={currentUser}
        orders={orders}
        onDispatchOrder={(orderId, courierName, trackingNumber) => {
          onDispatchOrder(orderId, courierName, trackingNumber);
        }}
        onBulkDispatchOrders={(dispatches) => {
          if (onBulkDispatchOrders) {
            onBulkDispatchOrders(dispatches);
          } else {
            dispatches.forEach((d) => {
              onDispatchOrder(d.orderId, d.courierName, d.trackingNumber);
            });
          }
        }}
      />
    </div>
  );
};
