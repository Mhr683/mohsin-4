import React from 'react';
import {
  CheckCircle2,
  Clock,
  Truck,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Banknote,
  Box,
  FileText
} from 'lucide-react';
import { OrderAuditEntry, orderAuditService, OrderEventType } from '../services/orderAuditService';

interface OrderTimelineProps {
  orderId: string;
  customEntries?: OrderAuditEntry[];
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ orderId, customEntries }) => {
  const events = customEntries || orderAuditService.getOrderTimeline(orderId);

  const getEventIcon = (type: OrderEventType) => {
    switch (type) {
      case 'ORDER_CREATED':
        return <Box className="w-4 h-4 text-blue-400" />;
      case 'CUSTOMER_VERIFIED':
      case 'COD_CONFIRMATION':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'SUPPLIER_ASSIGNED':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'SHIPMENT_BOOKED':
      case 'TRACKING_GENERATED':
      case 'COURIER_STATUS_CHANGED':
        return <Truck className="w-4 h-4 text-indigo-400" />;
      case 'DELIVERED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'RTO_INITIATED':
      case 'RTO_RECEIVED':
      case 'CANCELLED':
        return <RotateCcw className="w-4 h-4 text-rose-400" />;
      case 'PAYOUT_DISBURSED':
      case 'REFUND_PROCESSED':
        return <Banknote className="w-4 h-4 text-amber-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Full Order Lifecycle & Courier Audit Trail</span>
        </h4>
        <span className="text-[11px] text-slate-400 font-mono">
          {events.length} Recorded Events
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {events.map((event, idx) => (
          <div key={event.id || idx} className="relative group">
            {/* Timeline dot */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
              {getEventIcon(event.eventType)}
            </div>

            {/* Event Content Box */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1 hover:border-slate-700 transition">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white text-[13px]">{event.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(event.timestamp).toLocaleString('en-PK', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">{event.description}</p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-300">
                  By: {event.actor}
                </span>

                {event.courierName && (
                  <span className="bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded text-[10px] font-mono">
                    {event.courierName}
                  </span>
                )}

                {event.trackingNumber && (
                  <span className="bg-slate-800 text-emerald-400 font-mono px-2 py-0.5 rounded text-[10px]">
                    Track: {event.trackingNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
