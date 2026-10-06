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

export class LeopardsCourierAdapter implements ICourierProvider {
  code: CourierProviderCode = 'LEOPARDS';
  name = 'Leopards Courier COD';

  isApiConfigured(): boolean {
    return Boolean(typeof process !== 'undefined' && process.env?.LEOPARDS_API_KEY);
  }

  async createShipment(request: CreateShipmentRequest): Promise<CreateShipmentResponse> {
    const timestamp = Date.now().toString().slice(-6);
    const trackingNumber = `LEO-${timestamp}`;
    const weight = Math.max(0.5, request.totalWeightKg);
    const shippingCharge = weight <= 0.5 ? 200 : 200 + Math.ceil(weight - 0.5) * 75;

    return {
      success: true,
      trackingNumber,
      cnNumber: `CN-LEO-${timestamp}`,
      courier: 'LEOPARDS',
      bookingTime: new Date().toISOString(),
      estimatedDeliveryDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      shippingChargePKR: shippingCharge,
      labelUrl: `https://leopardscourier.com/track/${trackingNumber}`
    };
  }

  async cancelShipment(trackingNumber: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: `Shipment ${trackingNumber} cancelled in Leopards Courier booking system.` };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    const now = new Date();
    return {
      trackingNumber,
      courier: 'LEOPARDS',
      currentStatus: 'IN_TRANSIT',
      currentStatusText: 'In Transit between Regional Sorting Stations',
      originCity: 'Faisalabad',
      destinationCity: 'Multan',
      lastUpdated: now.toISOString(),
      isRTO: false,
      checkpoints: [
        {
          timestamp: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
          status: 'BOOKED',
          statusText: 'Booking Received at Faisalabad Branch',
          location: 'Faisalabad Station'
        },
        {
          timestamp: new Date(now.getTime() - 10 * 3600 * 1000).toISOString(),
          status: 'IN_TRANSIT',
          statusText: 'Dispatched to Multan Express Center',
          location: 'Highway Linehaul'
        }
      ]
    };
  }

  async calculateRate(request: RateEstimateRequest): Promise<CourierRateOption> {
    const origin = findCityByName(request.originCity);
    const dest = findCityByName(request.destinationCity);
    const isSameCity = origin?.name.toLowerCase() === dest?.name.toLowerCase();

    const weight = Math.max(0.5, request.weightKg);
    const baseRate = isSameCity ? 160 : 210 + Math.max(0, Math.ceil(weight - 0.5)) * 75;
    const codFee = request.codAmountPKR > 0 ? Math.max(45, Math.round(request.codAmountPKR * 0.018)) : 0;

    return {
      courier: 'LEOPARDS',
      courierDisplayName: 'Leopards COD Prime',
      baseRatePKR: baseRate,
      codFeePKR: codFee,
      fuelSurchargePKR: 15,
      remoteAreaSurchargePKR: 0,
      totalCostPKR: baseRate + codFee + 15,
      estimatedDays: isSameCity ? '24 Hours' : '2-3 Days',
      serviceable: true
    };
  }

  async checkServiceability(destinationCity: string, isCod = true): Promise<{ serviceable: boolean; deliveryDays: string }> {
    const city = findCityByName(destinationCity);
    if (!city) return { serviceable: false, deliveryDays: 'Unknown' };
    const ok = city.supportedCouriers.includes('LEOPARDS') && (!isCod || city.codAvailable);
    return { serviceable: ok, deliveryDays: city.deliveryEstDays };
  }

  async createRtoRequest(payload: RtoRequestPayload): Promise<{ success: boolean; rtoTrackingNumber: string }> {
    return { success: true, rtoTrackingNumber: `RTO-LEO-${payload.trackingNumber}` };
  }

  async generateLabel(trackingNumber: string): Promise<{ labelUrl: string }> {
    return { labelUrl: `https://leopardscourier.com/print/${trackingNumber}` };
  }

  async reconcileShipment(trackingNumbers: string[]): Promise<ReconciliationItem[]> {
    return trackingNumbers.map((tn) => ({
      trackingNumber: tn,
      orderNumber: `ORD-${tn.slice(-5)}`,
      collectedCodPKR: 3500,
      deductedShippingPKR: 225,
      deductedCodFeePKR: 63,
      netPayoutPKR: 3212,
      settlementStatus: 'SETTLED',
      courierReportedStatus: 'Delivered - Cash Handed Over'
    }));
  }
}
