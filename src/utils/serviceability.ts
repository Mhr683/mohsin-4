import { PakistanCity, ServiceabilityResult } from '../types/location';
import { findCityByName, PAKISTAN_CITIES } from './pakistanLocations';

export interface ServiceabilityQuery {
  cityName: string;
  courierPreference?: string;
  requestedCod?: boolean;
}

export function checkPakistanServiceability(query: ServiceabilityQuery): ServiceabilityResult {
  const city = findCityByName(query.cityName);

  if (!city) {
    return {
      isServiceable: false,
      city: query.cityName,
      province: 'Unknown',
      deliveryDaysEst: 'Uncertain',
      codSupported: false,
      isRemoteArea: true,
      remoteSurchargePKR: 150,
      availableCouriers: [],
      recommendedCourier: 'TCS',
      warnings: ['City not recognized in core courier network. Manual courier verification required.']
    };
  }

  const warnings: string[] = [];
  const isRemote = ['Balochistan', 'Gilgit-Baltistan', 'Azad Jammu & Kashmir'].includes(city.province) && !city.isHub;
  const remoteSurcharge = isRemote ? 150 : 0;

  if (isRemote) {
    warnings.push(`Remote / Tehsil coverage area (${city.province}). Rs. 150 transit surcharge may apply.`);
  }

  if (query.requestedCod && !city.codAvailable) {
    warnings.push(`Cash on Delivery is unavailable in ${city.name}. Advance payment via JazzCash/EasyPaisa is required.`);
  }

  let recommended = 'TRAX';
  if (city.isHub) {
    recommended = 'TRAX'; // Lowest cost for intra/inter hub
  } else if (isRemote) {
    recommended = 'TCS'; // Widest remote network in Pakistan
  } else if (city.supportedCouriers.includes('POSTEX')) {
    recommended = 'POSTEX';
  }

  return {
    isServiceable: true,
    city: city.name,
    province: city.province,
    deliveryDaysEst: city.deliveryEstDays,
    codSupported: city.codAvailable,
    isRemoteArea: isRemote,
    remoteSurchargePKR: remoteSurcharge,
    availableCouriers: city.supportedCouriers,
    recommendedCourier: recommended,
    warnings
  };
}

export function getSuggestedLandmarksForCity(cityName: string): string[] {
  const lower = cityName.toLowerCase();
  if (lower.includes('lahore')) {
    return ['Near Kalma Chowk', 'Near Thokar Niaz Baig', 'Near Liberty Market', 'Main Boulevard DHA', 'Near General Hospital'];
  }
  if (lower.includes('karachi')) {
    return ['Near NIPA Chowrangi', 'Near Do Talwar Clifton', 'Near 2 Minute Chowrangi', 'Near Millennium Mall', 'Near Water Pump'];
  }
  if (lower.includes('islamabad') || lower.includes('rawalpindi')) {
    return ['Near Faizabad Interchange', 'Near Commercial Market', 'Near Centaurus Mall', 'Near Giga Mall', 'Near Committee Chowk'];
  }
  return ['Near Main Jamia Masjid', 'Near Government High School', 'Near Main Bazaar / Chowk', 'Opposite Civil Hospital'];
}
