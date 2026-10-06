import { UnifiedOrderStatus, StatusTransitionRecord, TransitionValidationResult } from '../types/orderStatus';
import { ShipmentStatus } from '../types/courier';

class OrderStatusService {
  // Allowed transition graph
  private allowedTransitions: Record<UnifiedOrderStatus, UnifiedOrderStatus[]> = {
    NEW: ['CONFIRMED', 'CANCELLED', 'FAILED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['READY_TO_SHIP', 'CANCELLED'],
    READY_TO_SHIP: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['IN_TRANSIT', 'CANCELLED', 'RTO'],
    IN_TRANSIT: ['OUT_FOR_DELIVERY', 'RTO', 'FAILED'],
    OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED', 'RTO'],
    DELIVERED: ['RETURN_REQUESTED'],
    CANCELLED: [], // Terminal
    FAILED: ['OUT_FOR_DELIVERY', 'RTO', 'CANCELLED'],
    RETURN_REQUESTED: ['RTO', 'DELIVERED'],
    RTO: ['RTO_RECEIVED'],
    RTO_RECEIVED: [] // Terminal
  };

  private transitionHistory: StatusTransitionRecord[] = [];

  validateTransition(from: UnifiedOrderStatus, to: UnifiedOrderStatus): TransitionValidationResult {
    if (from === to) {
      return { allowed: true };
    }

    const targets = this.allowedTransitions[from] || [];
    if (targets.includes(to)) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: `Cannot transition order directly from "${from}" to "${to}". Permitted next states: [${targets.join(', ')}]`
    };
  }

  recordTransition(
    orderId: string,
    from: UnifiedOrderStatus | 'INIT',
    to: UnifiedOrderStatus,
    actor = 'SYSTEM',
    reason?: string,
    metadata?: Record<string, any>
  ): StatusTransitionRecord {
    const record: StatusTransitionRecord = {
      id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      orderId,
      fromStatus: from,
      toStatus: to,
      timestamp: new Date().toISOString(),
      actor,
      reason,
      metadata
    };

    this.transitionHistory.push(record);
    return record;
  }

  getOrderHistory(orderId: string): StatusTransitionRecord[] {
    return this.transitionHistory.filter((t) => t.orderId === orderId);
  }

  mapCourierStatusToOrderStatus(courierStatus: ShipmentStatus): UnifiedOrderStatus | null {
    switch (courierStatus) {
      case 'PENDING':
        return 'PROCESSING';
      case 'BOOKED':
        return 'READY_TO_SHIP';
      case 'PICKED_UP':
        return 'SHIPPED';
      case 'IN_TRANSIT':
        return 'IN_TRANSIT';
      case 'OUT_FOR_DELIVERY':
        return 'OUT_FOR_DELIVERY';
      case 'DELIVERED':
        return 'DELIVERED';
      case 'FAILED_ATTEMPT':
        return 'FAILED';
      case 'RTO_INITIATED':
      case 'RTO_IN_TRANSIT':
        return 'RTO';
      case 'RTO_DELIVERED':
        return 'RTO_RECEIVED';
      case 'CANCELLED':
        return 'CANCELLED';
      default:
        return null;
    }
  }
}

export const orderStatusService = new OrderStatusService();
