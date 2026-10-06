export type AppNotificationType =
  | 'NEW_ORDER'
  | 'ORDER_CONFIRMATION'
  | 'SHIPMENT_BOOKED'
  | 'SHIPMENT_UPDATE'
  | 'DELIVERY_ATTEMPT'
  | 'DELIVERED'
  | 'RTO'
  | 'PAYOUT'
  | 'WALLET'
  | 'SUPPLIER_STOCK_ALERT'
  | 'FRAUD_RISK_ALERT'
  | 'SYSTEM_MESSAGE';

export interface AppNotification {
  id: string;
  type: AppNotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}
