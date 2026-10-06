import {
  CourierProviderCode,
  CreateShipmentRequest,
  CreateShipmentResponse,
  TrackingResult,
  RateEstimateRequest,
  CourierRateOption,
  RtoRequestPayload,
  ReconciliationItem
} from '../../types/courier';

export interface ICourierProvider {
  code: CourierProviderCode;
  name: string;
  isApiConfigured(): boolean;
  createShipment(request: CreateShipmentRequest): Promise<CreateShipmentResponse>;
  cancelShipment(trackingNumber: string, reason?: string): Promise<{ success: boolean; message: string }>;
  trackShipment(trackingNumber: string): Promise<TrackingResult>;
  calculateRate(request: RateEstimateRequest): Promise<CourierRateOption>;
  checkServiceability(destinationCity: string, isCod?: boolean): Promise<{ serviceable: boolean; deliveryDays: string; reason?: string }>;
  createRtoRequest(payload: RtoRequestPayload): Promise<{ success: boolean; rtoTrackingNumber?: string }>;
  generateLabel(trackingNumber: string): Promise<{ labelUrl?: string; rawHtml?: string }>;
  reconcileShipment(trackingNumbers: string[]): Promise<ReconciliationItem[]>;
}
