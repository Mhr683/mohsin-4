import { calculateWeightDelivery, WeightDeliveryResult } from './weightDelivery';
import { findCityByName } from './pakistanLocations';
import { checkPakistanServiceability } from './serviceability';
import { CourierProviderCode, CourierRateOption } from '../types/courier';

export interface ShippingRateCalculationInput {
  originCity?: string; // Default 'Lahore' or supplier city
  destinationCity: string;
  weightKg: number;
  quantity?: number;
  codAmountPKR?: number;
  preferredCourier?: CourierProviderCode | 'AUTO';
  isExpress?: boolean;
}

export interface DetailedShippingRateResult {
  weightBreakdown: WeightDeliveryResult;
  isSameCity: boolean;
  baseDeliveryFeePKR: number;
  extraWeightFeePKR: number;
  codFeePKR: number;
  remoteSurchargePKR: number;
  totalDeliveryCostPKR: number;
  estimatedDeliveryTime: string;
  serviceable: boolean;
  recommendedCourier: CourierProviderCode;
  courierOptions: CourierRateOption[];
  warnings: string[];
}

export function calculateComprehensiveShippingRate(
  input: ShippingRateCalculationInput
): DetailedShippingRateResult {
  const origin = input.originCity || 'Lahore';
  const destCity = findCityByName(input.destinationCity);
  const serviceCheck = checkPakistanServiceability({
    cityName: input.destinationCity,
    requestedCod: (input.codAmountPKR || 0) > 0
  });

  const isSameCity = origin.trim().toLowerCase() === input.destinationCity.trim().toLowerCase();
  const baseRate = isSameCity ? 150 : 200;
  const extraPerKg = isSameCity ? 50 : 65;

  const weightResult = calculateWeightDelivery(input.weightKg, baseRate, extraPerKg);
  const codAmount = input.codAmountPKR || 0;
  // Standard Pakistani courier COD collection charge: 1.5% or min Rs. 35
  const codFee = codAmount > 0 ? Math.max(35, Math.round(codAmount * 0.015)) : 0;
  const remoteSurcharge = serviceCheck.remoteSurchargePKR;

  const totalCost = weightResult.totalDeliveryPKR + codFee + remoteSurcharge;

  const courierOptions: CourierRateOption[] = [
    {
      courier: 'TRAX',
      courierDisplayName: 'Trax Sonic COD',
      baseRatePKR: isSameCity ? 150 : 190,
      codFeePKR: codAmount > 0 ? Math.max(35, Math.round(codAmount * 0.015)) : 0,
      fuelSurchargePKR: 10,
      remoteAreaSurchargePKR: remoteSurcharge,
      totalCostPKR: (isSameCity ? 150 : 190) + weightResult.extraDeliveryPKR + codFee + remoteSurcharge,
      estimatedDays: isSameCity ? '24 Hours' : '2-3 Days',
      serviceable: serviceCheck.isServiceable,
      remarks: 'Best value for Karachi, Lahore, Islamabad'
    },
    {
      courier: 'POSTEX',
      courierDisplayName: 'PostEx Rapid COD',
      baseRatePKR: isSameCity ? 140 : 185,
      codFeePKR: codAmount > 0 ? Math.max(30, Math.round(codAmount * 0.012)) : 0,
      fuelSurchargePKR: 0,
      remoteAreaSurchargePKR: remoteSurcharge,
      totalCostPKR: (isSameCity ? 140 : 185) + weightResult.extraDeliveryPKR + Math.round(codFee * 0.9) + remoteSurcharge,
      estimatedDays: isSameCity ? '24 Hours' : '1-2 Days',
      serviceable: serviceCheck.isServiceable,
      remarks: 'Fastest hub-to-hub dispatch with automated SMS'
    },
    {
      courier: 'TCS',
      courierDisplayName: 'TCS Express Pakistan',
      baseRatePKR: isSameCity ? 190 : 250,
      codFeePKR: codAmount > 0 ? Math.max(50, Math.round(codAmount * 0.02)) : 0,
      fuelSurchargePKR: 20,
      remoteAreaSurchargePKR: remoteSurcharge,
      totalCostPKR: (isSameCity ? 190 : 250) + weightResult.extraDeliveryPKR + Math.round(codFee * 1.3) + remoteSurcharge + 20,
      estimatedDays: isSameCity ? '24 Hours' : '1-2 Days',
      serviceable: true,
      remarks: 'Deepest rural and tehsil delivery reach'
    },
    {
      courier: 'LEOPARDS',
      courierDisplayName: 'Leopards COD Prime',
      baseRatePKR: isSameCity ? 160 : 210,
      codFeePKR: codAmount > 0 ? Math.max(45, Math.round(codAmount * 0.018)) : 0,
      fuelSurchargePKR: 15,
      remoteAreaSurchargePKR: remoteSurcharge,
      totalCostPKR: (isSameCity ? 160 : 210) + weightResult.extraDeliveryPKR + codFee + remoteSurcharge + 15,
      estimatedDays: isSameCity ? '24 Hours' : '2-3 Days',
      serviceable: serviceCheck.isServiceable,
      remarks: 'Reliable cash management across Punjab & Sindh'
    }
  ];

  let recommended: CourierProviderCode = 'TRAX';
  if (serviceCheck.isRemoteArea) {
    recommended = 'TCS';
  } else if (input.isExpress) {
    recommended = 'POSTEX';
  }

  return {
    weightBreakdown: weightResult,
    isSameCity,
    baseDeliveryFeePKR: baseRate,
    extraWeightFeePKR: weightResult.extraDeliveryPKR,
    codFeePKR: codFee,
    remoteSurchargePKR: remoteSurcharge,
    totalDeliveryCostPKR: totalCost,
    estimatedDeliveryTime: isSameCity ? '1-2 Days' : destCity?.deliveryEstDays || '2-4 Days',
    serviceable: serviceCheck.isServiceable,
    recommendedCourier: recommended,
    courierOptions,
    warnings: serviceCheck.warnings
  };
}
