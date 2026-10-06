import { ICourierProvider } from './courierProvider';
import { TraxCourierAdapter } from './adapters/traxAdapter';
import { PostExCourierAdapter } from './adapters/postexAdapter';
import { TcsCourierAdapter } from './adapters/tcsAdapter';
import { LeopardsCourierAdapter } from './adapters/leopardsAdapter';
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

class CourierManager {
  private providers: Map<CourierProviderCode, ICourierProvider> = new Map();

  constructor() {
    this.registerProvider(new TraxCourierAdapter());
    this.registerProvider(new PostExCourierAdapter());
    this.registerProvider(new TcsCourierAdapter());
    this.registerProvider(new LeopardsCourierAdapter());
  }

  registerProvider(provider: ICourierProvider): void {
    this.providers.set(provider.code, provider);
  }

  getProvider(code: CourierProviderCode): ICourierProvider {
    const provider = this.providers.get(code);
    if (!provider) {
      // Fallback to Trax if requested courier is not registered
      return this.providers.get('TRAX')!;
    }
    return provider;
  }

  listProviders(): { code: CourierProviderCode; name: string; isConfigured: boolean }[] {
    return Array.from(this.providers.values()).map((p) => ({
      code: p.code,
      name: p.name,
      isConfigured: p.isApiConfigured()
    }));
  }

  async compareRates(request: RateEstimateRequest): Promise<CourierRateOption[]> {
    const promises = Array.from(this.providers.values()).map(async (provider) => {
      try {
        const option = await provider.calculateRate(request);
        const serviceCheck = await provider.checkServiceability(request.destinationCity, request.codAmountPKR > 0);
        return {
          ...option,
          serviceable: serviceCheck.serviceable,
          estimatedDays: serviceCheck.deliveryDays || option.estimatedDays
        };
      } catch (err) {
        return null;
      }
    });

    const results = await Promise.all(promises);
    return results.filter((r): r is CourierRateOption => r !== null).sort((a, b) => a.totalCostPKR - b.totalCostPKR);
  }

  async createShipment(
    preferredCourier: CourierProviderCode | 'AUTO',
    request: CreateShipmentRequest
  ): Promise<CreateShipmentResponse> {
    let courierCode: CourierProviderCode;

    if (preferredCourier === 'AUTO') {
      const rates = await this.compareRates({
        originCity: request.shipper?.city || 'Lahore',
        destinationCity: request.consignee.city,
        weightKg: request.totalWeightKg,
        codAmountPKR: request.codAmountPKR,
        deliveryType: request.deliveryType
      });
      courierCode = rates.find((r) => r.serviceable)?.courier || 'TRAX';
    } else {
      courierCode = preferredCourier;
    }

    const provider = this.getProvider(courierCode);
    return provider.createShipment(request);
  }

  async trackShipment(trackingNumber: string, courierHint?: CourierProviderCode): Promise<TrackingResult> {
    const code = courierHint || this.detectCourier(trackingNumber);
    const provider = this.getProvider(code);
    return provider.trackShipment(trackingNumber);
  }

  detectCourier(trackingNumber: string): CourierProviderCode {
    const tn = trackingNumber.trim().toUpperCase();
    if (tn.startsWith('PSTX') || tn.includes('POSTEX')) return 'POSTEX';
    if (tn.startsWith('TRAX') || tn.startsWith('TRX')) return 'TRAX';
    if (tn.startsWith('LEO') || tn.includes('LEOPARD')) return 'LEOPARDS';
    if (tn.startsWith('77') || tn.includes('TCS')) return 'TCS';
    return 'TRAX';
  }

  async createRtoRequest(courier: CourierProviderCode, payload: RtoRequestPayload) {
    const provider = this.getProvider(courier);
    return provider.createRtoRequest(payload);
  }

  async reconcileShipments(courier: CourierProviderCode, trackingNumbers: string[]): Promise<ReconciliationItem[]> {
    const provider = this.getProvider(courier);
    return provider.reconcileShipment(trackingNumbers);
  }
}

export const courierManager = new CourierManager();
