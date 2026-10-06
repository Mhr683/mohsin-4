import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Pencil,
  Truck,
  User as UserIcon,
  CheckCircle2,
  AlertOctagon,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { Order, OrderStatus, ProfitGuardConfig } from '../types';
import { AdminEditOrderModal } from './AdminEditOrderModal';

interface AdminOrdersManagerProps {
  orders: Order[];
  onUpdateOrder: (order: Order) => void;
  profitGuardConfig: ProfitGuardConfig;
}

export const AdminOrdersManager: React.FC<AdminOrdersManagerProps> = ({
  orders,
  onUpdateOrder,
  profitGuardConfig,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [profitGuardFilter, setProfitGuardFilter] = useState<'ALL' | 'APPROVED' | 'BLOCKED'>('ALL');
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      o.customerCity.toLowerCase().includes(search.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(search.toLowerCase())) ||
      o.items.some((i) => i.productName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;

    let matchesProfitGuard = true;
    if (profitGuardFilter === 'APPROVED') matchesProfitGuard = o.profitGuardApproved;
    if (profitGuardFilter === 'BLOCKED') matchesProfitGuard = !o.profitGuardApproved;

    return matchesSearch && matchesStatus && matchesProfitGuard;
  });

  // KPI Metrics
  const totalGMV = orders.reduce((sum, o) => sum + o.sellingPricePKR, 0);
  const pendingOrders = orders.filter((o) => o.status === 'PENDING_VERIFICATION').length;
  const inTransitOrders = orders.filter((o) => o.status === 'DISPATCHED').length;
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;
  const blockedCount = orders.filter((o) => !o.profitGuardApproved).length;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'COD_CONFIRMED':
        return 'bg-blue-950/80 text-blue-300 border-blue-800';
      case 'DISPATCHED':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
      case 'DELIVERED':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'RETURNED':
        return 'bg-orange-950/80 text-orange-300 border-orange-800';
      case 'CANCELLED':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
              LOGISTICS & DISPATCH COMMAND
            </span>
            <span className="text-xs text-slate-400">Total Orders: {orders.length}</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight mt-0.5 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-400" />
            <span>Orders Dispatch Desk & Reseller Settlement Control</span>
          </h2>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <span className="text-[11px] text-slate-400 block">Total GMV Volume</span>
          <span className="text-xl font-bold font-mono text-emerald-300 mt-1 block">
            PKR {totalGMV.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{orders.length} Total Parcels</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <span className="text-[11px] text-slate-400 block">Pending Verification</span>
          <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
            {pendingOrders} Orders
          </span>
          <span className="text-[10px] text-amber-400/80 mt-0.5 block">Requires COD confirmation</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <span className="text-[11px] text-slate-400 block">In Transit / Dispatched</span>
          <span className="text-xl font-bold font-mono text-indigo-400 mt-1 block">
            {inTransitOrders} Parcels
          </span>
          <span className="text-[10px] text-indigo-400/80 mt-0.5 block">With TCS / Leopards / PostEx</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5">
          <span className="text-[11px] text-slate-400 block">Delivered & Settled</span>
          <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
            {deliveredOrders} Orders
          </span>
          <span className="text-[10px] text-emerald-400/80 mt-0.5 block">Escrow released to wallets</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order #, Customer Name, Phone, City, Tracking AWB..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="COD_CONFIRMED">COD Confirmed</option>
            <option value="DISPATCHED">Dispatched & In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="RETURNED">Returned</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Profit Guard Filter */}
          <select
            value={profitGuardFilter}
            onChange={(e) => setProfitGuardFilter(e.target.value as any)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="ALL">All Profit Guard States</option>
            <option value="APPROVED">Solvent (Approved)</option>
            <option value="BLOCKED">Deficit (Blocked)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3.5">Order # & Date</th>
              <th className="px-4 py-3.5">Customer & City</th>
              <th className="px-4 py-3.5">Items & Reseller</th>
              <th className="px-4 py-3.5 text-right">Retail Total</th>
              <th className="px-4 py-3.5 text-right">Reseller Profit</th>
              <th className="px-4 py-3.5 text-center">Profit Guard</th>
              <th className="px-4 py-3.5 text-center">Status</th>
              <th className="px-4 py-3.5 text-right">Admin Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 bg-slate-900/40">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No orders found matching your search.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-800/50 transition">
                  {/* Order Number & Date */}
                  <td className="px-4 py-3.5">
                    <div className="font-mono font-bold text-white">{ord.orderNumber}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Customer Info */}
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-white">{ord.customerName}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-500" />
                      <span>{ord.customerCity}</span>
                      <span className="text-slate-600">•</span>
                      <span className="font-mono text-[10px]">{ord.customerPhone}</span>
                    </div>
                  </td>

                  {/* Items */}
                  <td className="px-4 py-3.5">
                    <div className="text-slate-300 font-medium truncate max-w-[200px]" title={ord.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}>
                      {ord.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Store: <span className="text-slate-400">{ord.syncedStore || 'Direct Reseller'}</span>
                    </div>
                  </td>

                  {/* Retail Total */}
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-white">
                    PKR {ord.sellingPricePKR.toLocaleString()}
                  </td>

                  {/* Reseller Profit */}
                  <td className="px-4 py-3.5 text-right font-mono">
                    <span
                      className={`font-bold ${
                        ord.netProfitPKR >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      PKR {ord.netProfitPKR.toLocaleString()}
                    </span>
                    <div className="text-[10px] text-slate-500">
                      ({ord.profitMarginPct}%)
                    </div>
                  </td>

                  {/* Profit Guard Badge */}
                  <td className="px-4 py-3.5 text-center">
                    {ord.profitGuardApproved ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800">
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                        <span>Solvent</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-rose-950/80 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-800" title={ord.profitGuardReason}>
                        <ShieldAlert className="h-3 w-3 text-rose-400" />
                        <span>Blocked</span>
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getStatusBadge(
                        ord.status
                      )}`}
                    >
                      {ord.status.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedOrderForEdit(ord)}
                      className="flex items-center gap-1 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 px-2.5 py-1.5 text-xs font-bold transition shadow-sm ml-auto"
                      title="Edit order pricing, status, customer details & tracking"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Order Modal */}
      {selectedOrderForEdit && (
        <AdminEditOrderModal
          isOpen={!!selectedOrderForEdit}
          onClose={() => setSelectedOrderForEdit(null)}
          order={selectedOrderForEdit}
          onSaveOrder={(updated) => {
            onUpdateOrder(updated);
            setSelectedOrderForEdit(null);
          }}
          profitGuardConfig={profitGuardConfig}
        />
      )}
    </div>
  );
};
