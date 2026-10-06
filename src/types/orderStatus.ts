export type UnifiedOrderStatus =
  | 'NEW'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_TO_SHIP'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED'
  | 'RETURN_REQUESTED'
  | 'RTO'
  | 'RTO_RECEIVED';

export interface StatusTransitionRecord {
  id: string;
  orderId: string;
  fromStatus: UnifiedOrderStatus | 'INIT';
  toStatus: UnifiedOrderStatus;
  timestamp: string;
  actor: string; // 'SYSTEM' | 'RESELLER' | 'SUPPLIER' | 'ADMIN' | 'COURIER_WEBHOOK'
  reason?: string;
  metadata?: Record<string, any>;
}

export interface TransitionValidationResult {
  allowed: boolean;
  reason?: string;
}
