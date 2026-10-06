import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShoppingBag,
  Truck,
  Wallet,
  Clock,
  Boxes,
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppNotificationType } from '../types/notification';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearAllNotifications } = useApp();
  const [filter, setFilter] = useState<'ALL' | 'ORDERS' | 'LOGISTICS' | 'FINANCE'>('ALL');

  if (!isOpen) return null;

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'NEW_ORDER':
      case 'ORDER_CONFIRMATION':
        return <ShoppingBag className="w-4 h-4 text-emerald-400" />;
      case 'SHIPMENT_BOOKED':
      case 'SHIPMENT_UPDATE':
      case 'DELIVERY_ATTEMPT':
      case 'DELIVERED':
        return <Truck className="w-4 h-4 text-indigo-400" />;
      case 'PAYOUT':
      case 'WALLET':
        return <Wallet className="w-4 h-4 text-amber-400" />;
      case 'SUPPLIER_STOCK_ALERT':
        return <Boxes className="w-4 h-4 text-purple-400" />;
      case 'FRAUD_RISK_ALERT':
      case 'RTO':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    const typeStr = (n as any).type || '';
    if (filter === 'ORDERS') return typeStr.includes('ORDER');
    if (filter === 'LOGISTICS') return typeStr.includes('SHIPMENT') || typeStr.includes('DELIVER') || typeStr.includes('RTO');
    if (filter === 'FINANCE') return typeStr.includes('PAYOUT') || typeStr.includes('WALLET');
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-slate-900 border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between space-y-4">
        {/* Header */}
        <div className="space-y-3 border-b border-slate-800 pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base">Activity Notifications</h3>
                <p className="text-[11px] text-slate-400">Order, courier dispatch, RTO & payout alerts</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex gap-1 bg-slate-950 p-1 rounded-xl text-[11px]">
            {(['ALL', 'ORDERS', 'LOGISTICS', 'FINANCE'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 py-1 rounded-lg font-semibold transition ${
                  filter === tab
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3.5 rounded-2xl border transition cursor-pointer text-xs ${
                  n.isRead
                    ? 'bg-slate-950/50 border-slate-800/80 opacity-75'
                    : 'bg-slate-800/80 border-emerald-500/30 shadow-md'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {getNotificationIcon((n as any).type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="font-bold text-white text-xs truncate">{n.title}</span>
                      <span className="text-[10px] text-slate-500 shrink-0 ml-2">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">{n.message}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              No notifications matching this filter.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={clearAllNotifications}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 rounded-xl transition"
          >
            Clear All Notifications
          </button>
        </div>
      </div>
    </div>
  );
};
