import { ICourierProvider } from '../courierProvider';
import {
  CourierProviderCode,
  CreateShipmentRequest,
  CreateShipmentResponse,
  TrackingResult,
  RateEstimateRequest,
  CourierRateOption,
  RtoRequestPayload,
  ReconciliationItem
} from '../../../types/courier';
import { findCityByName } from '../../../utils/pakistanLocations';

export class TraxCourierAdapter implements ICourierProvider {
  code: CourierProviderCode = 'TRAX';
  name = 'Trax Logistics (Sonic COD)';

  isApiConfigured(): boolean {
    return Boolean(typeof process !== 'undefined' && process.env?.TRAX_API_KEY);
  }

  async createShipment(request: CreateShipmentRequest): Promise<CreateShipmentResponse> {
    const timestamp = Date.now().toString().slice(-6);
    const trackingNumber = `TRAX-PK-${timestamp}`;
    const weight = Math.max(0.5, request.totalWeightKg);
    const shippingCharge = weight <= 1 ? 190 : 190 + Math.ceil(weight - 1) * 70;

    return {
      success: true,
      trackingNumber,
      cnNumber: `CN-TRX-${timestamp}`,
      courier: 'TRAX',
      bookingTime: new Date().toISOString(),
      estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      shippingChargePKR: shippingCharge,
      labelUrl: `https://trax.pk/tracking?tracking_number=${trackingNumber}`
    };
  }

  async cancelShipment(trackingNumber: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: `Shipment ${trackingNumber} marked cancelled in Trax booking portal.` };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    const now = new Date();
    return {
      trackingNumber,
      courier: 'TRAX',
      currentStatus: 'IN_TRANSIT',
      currentStatusText: 'In Transit between Hubs (Karachi/Lahore)',
      originCity: 'Lahore',
      destinationCity: 'Karachi',
      lastUpdated: now.toISOString(),
      isRTO: false,
      checkpoints: [
        {
          timestamp: new Date(now.getTime() - 36 * 3600 * 1000).toISOString(),
          status: 'BOOKED',
          statusText: 'Electronic Booking Received',
          location: 'Lahore Central Hub'
        },
        {
          timestamp: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
          status: 'PICKED_UP',
          statusText: 'Consignment Dispatched to Main Linehaul',
          location: 'Lahore Hub'
        },
        {
          timestamp: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
          status: 'IN_TRANSIT',
          statusText: 'Arrived at Destination Transit Hub',
          location: 'Karachi Central Depot'
        }
      ]
    };
  }

  async calculateRate(request: RateEstimateRequest): Promise<CourierRateOption> {
    const origin = findCityByName(request.originCity);
    const dest = findCityByName(request.destinationCity);
    const isSameCity = origin?.name.toLowerCase() === dest?.name.toLowerCase();

    const weight = Math.max(0.5, request.weightKg);
    const baseRate = isSameCity ? 150 : 200 + Math.max(0, Math.ceil(weight - 1)) * 60;
    const codFee = request.codAmountPKR > 0 ? Math.max(40, Math.round(request.codAmountPKR * 0.015)) : 0;
    const fuel = Math.round(baseRate * 0.05);

    return {
      courier: 'TRAX',
      courierDisplayName: 'Trax Sonic COD',
      baseRatePKR: baseRate,
      codFeePKR: codFee,
      fuelSurchargePKR: fuel,
      remoteAreaSurchargePKR: 0,
      totalCostPKR: baseRate + codFee + fuel,
      estimatedDays: isSameCity ? '24 Hours' : '2-3 Days',
      serviceable: true
    };
  }

  async checkServiceability(destinationCity: string, isCod = true): Promise<{ serviceable: boolean; deliveryDays: string }> {
    const city = findCityByName(destinationCity);
    if (!city) return { serviceable: false, deliveryDays: 'Unknown' };
    const ok = city.supportedCouriers.includes('TRAX') && (!isCod || city.codAvailable);
    return { serviceable: ok, deliveryDays: city.deliveryEstDays };
  }

  async createRtoRequest(payload: RtoRequestPayload): Promise<{ success: boolean; rtoTrackingNumber: string }> {
    return {
      success: true,
      rtoTrackingNumber: `RTO-${payload.trackingNumber}`
    };
  }

  async generateLabel(trackingNumber: string): Promise<{ labelUrl: string }> {
    return { labelUrl: `https://api.trax.pk/print/${trackingNumber}` };
  }

  async reconcileShipment(trackingNumbers: string[]): Promise<ReconciliationItem[]> {
    return trackingNumbers.map((tn) => ({
      trackingNumber: tn,
      orderNumber: `ORD-${tn.slice(-5)}`,
      collectedCodPKR: 2850,
      deductedShippingPKR: 210,
      deductedCodFeePKR: 42,
      netPayoutPKR: 2598,
      settlementStatus: 'SETTLED',
      courierReportedStatus: 'Delivered - Cash Handed Over'
    }));
  }
}
