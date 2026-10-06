import React, { useState } from 'react';
import {
  Search,
  X,
  Package,
  ShoppingBag,
  Users,
  Building,
  ArrowRight,
  Filter,
  Truck,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    products,
    orders,
    customers,
    suppliers,
    setSelectedProductForModal,
    setIsProductDetailModalOpen,
    setSelectedOrderForModal,
    setActiveTab
  } = useApp();

  const [query, setQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'ORDERS' | 'PRODUCTS' | 'CUSTOMERS' | 'TRACKING'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCourier, setSelectedCourier] = useState<string>('ALL');

  if (!isGlobalSearchOpen) return null;

  const q = query.toLowerCase().trim();

  // Search logic
  const matchedProducts = (filterCategory === 'ALL' || filterCategory === 'PRODUCTS') && q
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            (p.category && p.category.toLowerCase().includes(q))
        )
        .slice(0, 4)
    : [];

  const matchedOrders = (filterCategory === 'ALL' || filterCategory === 'ORDERS' || filterCategory === 'TRACKING') && q
    ? orders
        .filter((o) => {
          const matchText =
            (o.orderId && o.orderId.toLowerCase().includes(q)) ||
            (o.customerName && o.customerName.toLowerCase().includes(q)) ||
            (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q)) ||
            (o.city && o.city.toLowerCase().includes(q)) ||
            (o.customerPhone && o.customerPhone.includes(q));

          const matchStatus = selectedStatus === 'ALL' || o.status === selectedStatus;
          const matchCourier = selectedCourier === 'ALL' || o.courierName?.toUpperCase().includes(selectedCourier);

          return matchText && matchStatus && matchCourier;
        })
        .slice(0, 5)
    : [];

  const matchedCustomers = (filterCategory === 'ALL' || filterCategory === 'CUSTOMERS') && q
    ? customers
        .filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.phone.toLowerCase().includes(q) ||
            (c.city && c.city.toLowerCase().includes(q))
        )
        .slice(0, 4)
    : [];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-start justify-center p-4 pt-16 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-emerald-400 absolute left-4 top-3.5" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across products, orders, tracking #, customers, city (e.g. Lahore, TRX-1234)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 text-xs">
          <div className="flex flex-wrap gap-1">
            {(['ALL', 'ORDERS', 'PRODUCTS', 'CUSTOMERS', 'TRACKING'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  filterCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat === 'ALL' ? 'All Entities' : cat.charAt(0) + cat.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="DELIVERED">Delivered</option>
              <option value="RTO">RTO / Returned</option>
            </select>

            <select
              value={selectedCourier}
              onChange={(e) => setSelectedCourier(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Couriers</option>
              <option value="TRAX">Trax</option>
              <option value="POSTEX">PostEx</option>
              <option value="TCS">TCS</option>
              <option value="LEOPARD">Leopards</option>
            </select>
          </div>
        </div>

        {/* Results Stream */}
        {q ? (
          <div className="space-y-4 text-xs pt-1">
            {/* Orders */}
            {matchedOrders.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
                  <span>Orders, Parcels & Tracking Results ({matchedOrders.length})</span>
                </p>
                <div className="space-y-1.5">
                  {matchedOrders.map((o) => (
                    <div
                      key={o.orderId}
                      onClick={() => {
                        setSelectedOrderForModal(o);
                        setActiveTab('orders');
                        setIsGlobalSearchOpen(false);
                      }}
                      className="p-3 bg-slate-950/80 hover:bg-slate-800 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingBag className="w-4 h-4 text-sky-400 shrink-0" />
                        <div>
                          <p className="font-bold text-white text-xs">
                            Order #{o.orderId} • {o.customerName} ({o.city || 'Pakistan'})
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {o.productName} • Courier: {o.courierName || 'Unassigned'} • Tracking:{' '}
                            <strong className="text-emerald-400 font-mono">{o.trackingNumber || 'Pending'}</strong> • Status: {o.status}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {matchedProducts.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Wholesale Products ({matchedProducts.length})</span>
                </p>
                <div className="space-y-1.5">
                  {matchedProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedProductForModal(p);
                        setIsProductDetailModalOpen(true);
                        setIsGlobalSearchOpen(false);
                      }}
                      className="p-3 bg-slate-950/80 hover:bg-slate-800 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-bold text-white">{p.name}</p>
                          <span className="text-[10px] text-slate-400">
                            SKU: {p.sku} • Wholesale: PKR {p.supplierCostPKR?.toLocaleString()} • Rec: PKR {p.recSellingPricePKR?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customers */}
            {matchedCustomers.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Customer Directory ({matchedCustomers.length})</span>
                </p>
                <div className="space-y-1.5">
                  {matchedCustomers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setActiveTab('customers');
                        setIsGlobalSearchOpen(false);
                      }}
                      className="p-3 bg-slate-950/80 hover:bg-slate-800 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-purple-400 shrink-0" />
                        <div>
                          <p className="font-bold text-white">{c.name} ({c.city})</p>
                          <span className="text-[10px] text-slate-400">Phone: {c.phone} • Trust: {c.trustScore}/100</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {matchedProducts.length === 0 && matchedOrders.length === 0 && matchedCustomers.length === 0 && (
              <p className="text-center py-6 text-slate-500">No matching items found for "{query}".</p>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            Start typing to filter across all Pakistani wholesale orders, live tracking numbers, catalog items, and customers...
          </div>
        )}
      </div>
    </div>
  );
};
