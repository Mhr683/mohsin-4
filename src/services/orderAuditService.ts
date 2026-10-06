export type OrderEventType =
  | 'ORDER_CREATED'
  | 'CUSTOMER_VERIFIED'
  | 'COD_CONFIRMATION'
  | 'SUPPLIER_ASSIGNED'
  | 'SHIPMENT_BOOKED'
  | 'TRACKING_GENERATED'
  | 'COURIER_STATUS_CHANGED'
  | 'DELIVERY_ATTEMPT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RTO_INITIATED'
  | 'RTO_RECEIVED'
  | 'PAYOUT_DISBURSED'
  | 'REFUND_PROCESSED';

export interface OrderAuditEntry {
  id: string;
  orderId: string;
  eventType: OrderEventType;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  badge?: string;
  courierName?: string;
  trackingNumber?: string;
}

class OrderAuditService {
  private entries: OrderAuditEntry[] = [];

  logEvent(
    orderId: string,
    eventType: OrderEventType,
    title: string,
    description: string,
    actor = 'SYSTEM',
    extras?: { badge?: string; courierName?: string; trackingNumber?: string }
  ): OrderAuditEntry {
    const entry: OrderAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      orderId,
      eventType,
      title,
      description,
      timestamp: new Date().toISOString(),
      actor,
      ...extras
    };
    this.entries.unshift(entry);
    return entry;
  }

  getOrderTimeline(orderId: string): OrderAuditEntry[] {
    const matched = this.entries.filter((e) => e.orderId === orderId);
    if (matched.length === 0) {
      // Seed default baseline timeline for initial orders
      return [
        {
          id: `seed-1-${orderId}`,
          orderId,
          eventType: 'ORDER_CREATED',
          title: 'Order Placed by Customer',
          description: 'Single parcel order initiated with Cash on Delivery (COD).',
          timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
          actor: 'BUYER'
        },
        {
          id: `seed-2-${orderId}`,
          orderId,
          eventType: 'CUSTOMER_VERIFIED',
          title: 'WhatsApp COD Verified',
          description: 'Customer responded "CONFIRM 1" to WhatsApp automated verification bot.',
          timestamp: new Date(Date.now() - 47 * 3600 * 1000).toISOString(),
          actor: 'AI_WHATSAPP_BOT'
        },
        {
          id: `seed-3-${orderId}`,
          orderId,
          eventType: 'SHIPMENT_BOOKED',
          title: 'Consignment Booked with Courier',
          description: 'Electronic Consignment Note generated. 4x6 thermal dispatch slip printed.',
          timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          actor: 'SUPPLIER_HUB',
          courierName: 'Trax Logistics',
          trackingNumber: `TRX-${orderId.slice(-5)}`
        }
      ];
    }
    return matched;
  }
}

export const orderAuditService = new OrderAuditService();
