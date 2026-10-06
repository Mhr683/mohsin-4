export type CourierProviderCode = 'TRAX' | 'POSTEX' | 'TCS' | 'LEOPARDS' | 'CALL_COURIER';

export type CourierDeliveryType = 'STANDARD' | 'OVERNIGHT' | 'SAME_DAY' | 'CARGO_BILTY';

export type ShipmentStatus = 
  | 'PENDING'
  | 'BOOKED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED_ATTEMPT'
  | 'RTO_INITIATED'
  | 'RTO_IN_TRANSIT'
  | 'RTO_DELIVERED'
  | 'CANCELLED';

export interface ConsigneeInfo {
  name: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address: string;
  city: string;
  province?: string;
  nearestLandmark?: string;
  postalCode?: string;
}

export interface ShipperInfo {
  businessName: string;
  contactPerson: string;
  phone: string;
  address: string;
  city: string;
  originHub?: string;
}

export interface ShipmentItem {
  sku?: string;
  productTitle: string;
  quantity: number;
  weightKg: number;
  pricePKR: number;
}

export interface CreateShipmentRequest {
  orderId: string;
  orderNumber?: string;
  consignee: ConsigneeInfo;
  shipper?: ShipperInfo;
  items: ShipmentItem[];
  codAmountPKR: number; // 0 for prepaid orders
  totalWeightKg: number;
  pieces: number;
  deliveryType?: CourierDeliveryType;
  specialInstructions?: string; // e.g., 'Do not open flyer before cash collection'
  productDescription?: string;
}

export interface CreateShipmentResponse {
  success: boolean;
  trackingNumber: string;
  cnNumber: string; // Consignment note number
  courier: CourierProviderCode;
  bookingTime: string;
  estimatedDeliveryDate?: string;
  shippingChargePKR: number;
  labelUrl?: string;
  rawResponse?: any;
  error?: string;
}

export interface TrackingCheckpoint {
  timestamp: string;
  status: ShipmentStatus;
  statusText: string;
  location: string;
  remarks?: string;
}

export interface TrackingResult {
  trackingNumber: string;
  courier: CourierProviderCode;
  currentStatus: ShipmentStatus;
  currentStatusText: string;
  originCity: string;
  destinationCity: string;
  receiverName?: string;
  checkpoints: TrackingCheckpoint[];
  lastUpdated: string;
  isRTO: boolean;
  deliveryDate?: string;
}

export interface RateEstimateRequest {
  originCity: string;
  destinationCity: string;
  weightKg: number;
  codAmountPKR: number;
  deliveryType?: CourierDeliveryType;
  itemCount?: number;
}

export interface CourierRateOption {
  courier: CourierProviderCode;
  courierDisplayName: string;
  baseRatePKR: number;
  codFeePKR: number;
  fuelSurchargePKR: number;
  remoteAreaSurchargePKR: number;
  totalCostPKR: number;
  estimatedDays: string;
  serviceable: boolean;
  remarks?: string;
}

export interface RtoRequestPayload {
  trackingNumber: string;
  reason: string;
  notes?: string;
}

export interface ReconciliationItem {
  trackingNumber: string;
  orderNumber: string;
  collectedCodPKR: number;
  deductedShippingPKR: number;
  deductedCodFeePKR: number;
  netPayoutPKR: number;
  settlementStatus: 'SETTLED' | 'DISCREPANCY' | 'PENDING';
  courierReportedStatus: string;
}
