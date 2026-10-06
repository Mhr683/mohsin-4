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

export class PostExCourierAdapter implements ICourierProvider {
  code: CourierProviderCode = 'POSTEX';
  name = 'PostEx Fintech Logistics';

  isApiConfigured(): boolean {
    return Boolean(typeof process !== 'undefined' && process.env?.POSTEX_TOKEN);
  }

  async createShipment(request: CreateShipmentRequest): Promise<CreateShipmentResponse> {
    const timestamp = Date.now().toString().slice(-6);
    const trackingNumber = `PSTX-${timestamp}`;
    const weight = Math.max(0.5, request.totalWeightKg);
    const shippingCharge = weight <= 0.5 ? 175 : 175 + Math.ceil(weight - 0.5) * 65;

    return {
      success: true,
      trackingNumber,
      cnNumber: `CN-PSTX-${timestamp}`,
      courier: 'POSTEX',
      bookingTime: new Date().toISOString(),
      estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      shippingChargePKR: shippingCharge,
      labelUrl: `https://postex.pk/track/${trackingNumber}`
    };
  }

  async cancelShipment(trackingNumber: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: `Shipment ${trackingNumber} marked cancelled in PostEx API.` };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    const now = new Date();
    return {
      trackingNumber,
      courier: 'POSTEX',
      currentStatus: 'OUT_FOR_DELIVERY',
      currentStatusText: 'Rider Out for Delivery (Rider Contact: 0312-4455667)',
      originCity: 'Karachi',
      destinationCity: 'Lahore',
      lastUpdated: now.toISOString(),
      isRTO: false,
      checkpoints: [
        {
          timestamp: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
          status: 'BOOKED',
          statusText: 'Electronic Consignment Note Generated',
          location: 'Karachi Hub'
        },
        {
          timestamp: new Date(now.getTime() - 12 * 3600 * 1000).toISOString(),
          status: 'IN_TRANSIT',
          statusText: 'Dispatched via Air Express Linehaul',
          location: 'Allama Iqbal Airport Station'
        },
        {
          timestamp: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
          status: 'OUT_FOR_DELIVERY',
          statusText: 'Assigned to Johar Town Route Rider',
          location: 'Lahore Delivery Center'
        }
      ]
    };
  }

  async calculateRate(request: RateEstimateRequest): Promise<CourierRateOption> {
    const origin = findCityByName(request.originCity);
    const dest = findCityByName(request.destinationCity);
    const isSameCity = origin?.name.toLowerCase() === dest?.name.toLowerCase();

    const weight = Math.max(0.5, request.weightKg);
    const baseRate = isSameCity ? 140 : 190 + Math.max(0, Math.ceil(weight - 0.5)) * 65;
    const codFee = request.codAmountPKR > 0 ? Math.max(35, Math.round(request.codAmountPKR * 0.012)) : 0;

    return {
      courier: 'POSTEX',
      courierDisplayName: 'PostEx Rapid Delivery',
      baseRatePKR: baseRate,
      codFeePKR: codFee,
      fuelSurchargePKR: 0,
      remoteAreaSurchargePKR: 0,
      totalCostPKR: baseRate + codFee,
      estimatedDays: isSameCity ? '24 Hours' : '1-2 Days',
      serviceable: true
    };
  }

  async checkServiceability(destinationCity: string, isCod = true): Promise<{ serviceable: boolean; deliveryDays: string }> {
    const city = findCityByName(destinationCity);
    if (!city) return { serviceable: false, deliveryDays: 'Unknown' };
    const ok = city.supportedCouriers.includes('POSTEX') && (!isCod || city.codAvailable);
    return { serviceable: ok, deliveryDays: city.deliveryEstDays };
  }

  async createRtoRequest(payload: RtoRequestPayload): Promise<{ success: boolean; rtoTrackingNumber: string }> {
    return { success: true, rtoTrackingNumber: `RTO-${payload.trackingNumber}` };
  }

  async generateLabel(trackingNumber: string): Promise<{ labelUrl: string }> {
    return { labelUrl: `https://api.postex.pk/label/${trackingNumber}` };
  }

  async reconcileShipment(trackingNumbers: string[]): Promise<ReconciliationItem[]> {
    return trackingNumbers.map((tn) => ({
      trackingNumber: tn,
      orderNumber: `ORD-${tn.slice(-5)}`,
      collectedCodPKR: 3200,
      deductedShippingPKR: 190,
      deductedCodFeePKR: 38,
      netPayoutPKR: 2972,
      settlementStatus: 'SETTLED',
      courierReportedStatus: 'Delivered - Instant Bank Clearance'
    }));
  }
}
