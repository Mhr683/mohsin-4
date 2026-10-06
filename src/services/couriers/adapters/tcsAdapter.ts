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

export class TcsCourierAdapter implements ICourierProvider {
  code: CourierProviderCode = 'TCS';
  name = 'TCS Express Pakistan';

  isApiConfigured(): boolean {
    return Boolean(typeof process !== 'undefined' && process.env?.TCS_API_KEY);
  }

  async createShipment(request: CreateShipmentRequest): Promise<CreateShipmentResponse> {
    const timestamp = Date.now().toString().slice(-6);
    const trackingNumber = `7788${timestamp}`;
    const weight = Math.max(0.5, request.totalWeightKg);
    const shippingCharge = weight <= 0.5 ? 240 : 240 + Math.ceil(weight - 0.5) * 90;

    return {
      success: true,
      trackingNumber,
      cnNumber: `TCS-CN-${timestamp}`,
      courier: 'TCS',
      bookingTime: new Date().toISOString(),
      estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      shippingChargePKR: shippingCharge,
      labelUrl: `https://tcsexpress.com/track/${trackingNumber}`
    };
  }

  async cancelShipment(trackingNumber: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: `Consignment ${trackingNumber} cancelled in TCS system.` };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    const now = new Date();
    return {
      trackingNumber,
      courier: 'TCS',
      currentStatus: 'IN_TRANSIT',
      currentStatusText: 'Consignment In Transit via Express Overland',
      originCity: 'Lahore',
      destinationCity: 'Peshawar',
      lastUpdated: now.toISOString(),
      isRTO: false,
      checkpoints: [
        {
          timestamp: new Date(now.getTime() - 20 * 3600 * 1000).toISOString(),
          status: 'BOOKED',
          statusText: 'Shipment Created',
          location: 'Lahore Area Office'
        },
        {
          timestamp: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(),
          status: 'IN_TRANSIT',
          statusText: 'Forwarded to Peshawar Hub',
          location: 'Rawalpindi Gateway Hub'
        }
      ]
    };
  }

  async calculateRate(request: RateEstimateRequest): Promise<CourierRateOption> {
    const origin = findCityByName(request.originCity);
    const dest = findCityByName(request.destinationCity);
    const isSameCity = origin?.name.toLowerCase() === dest?.name.toLowerCase();

    const weight = Math.max(0.5, request.weightKg);
    const baseRate = isSameCity ? 180 : 250 + Math.max(0, Math.ceil(weight - 0.5)) * 90;
    const codFee = request.codAmountPKR > 0 ? Math.max(50, Math.round(request.codAmountPKR * 0.02)) : 0;

    return {
      courier: 'TCS',
      courierDisplayName: 'TCS Yayvo / Express',
      baseRatePKR: baseRate,
      codFeePKR: codFee,
      fuelSurchargePKR: 20,
      remoteAreaSurchargePKR: 0,
      totalCostPKR: baseRate + codFee + 20,
      estimatedDays: isSameCity ? '24 Hours' : '1-2 Days',
      serviceable: true,
      remarks: 'Highest remote reliability & reach across all tehsils in Pakistan'
    };
  }

  async checkServiceability(destinationCity: string, isCod = true): Promise<{ serviceable: boolean; deliveryDays: string }> {
    const city = findCityByName(destinationCity);
    if (!city) return { serviceable: false, deliveryDays: 'Unknown' };
    return { serviceable: true, deliveryDays: city.deliveryEstDays };
  }

  async createRtoRequest(payload: RtoRequestPayload): Promise<{ success: boolean; rtoTrackingNumber: string }> {
    return { success: true, rtoTrackingNumber: `RTO-TCS-${payload.trackingNumber}` };
  }

  async generateLabel(trackingNumber: string): Promise<{ labelUrl: string }> {
    return { labelUrl: `https://www.tcsexpress.com/shipping-label/${trackingNumber}` };
  }

  async reconcileShipment(trackingNumbers: string[]): Promise<ReconciliationItem[]> {
    return trackingNumbers.map((tn) => ({
      trackingNumber: tn,
      orderNumber: `ORD-${tn.slice(-5)}`,
      collectedCodPKR: 4500,
      deductedShippingPKR: 270,
      deductedCodFeePKR: 90,
      netPayoutPKR: 4140,
      settlementStatus: 'SETTLED',
      courierReportedStatus: 'Delivered'
    }));
  }
}
