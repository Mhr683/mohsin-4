import { CustomerAddress, PakistanProvince } from '../types/location';
import { checkPakistanServiceability } from '../utils/serviceability';
import { locationService } from './locationService';

export interface AddressValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  serviceabilityWarnings: string[];
}

export function validatePakistanPhone(phone: string): { isValid: boolean; normalized: string; error?: string } {
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length === 11 && clean.startsWith('03')) {
    return { isValid: true, normalized: clean };
  }
  if (clean.length === 12 && clean.startsWith('923')) {
    return { isValid: true, normalized: `0${clean.slice(2)}` };
  }
  return {
    isValid: false,
    normalized: clean,
    error: 'Please enter a valid 11-digit Pakistani mobile number (e.g., 03001234567).'
  };
}

export function validateCustomerAddress(address: Partial<CustomerAddress>): AddressValidationResult {
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (!address.fullName?.trim() || address.fullName.trim().length < 3) {
    errors.fullName = 'Full name must be at least 3 characters.';
  }

  const phoneRes = validatePakistanPhone(address.phone || '');
  if (!phoneRes.isValid) {
    errors.phone = phoneRes.error || 'Invalid phone number.';
  }

  if (!address.province) {
    errors.province = 'Please select a province.';
  }

  if (!address.city?.trim()) {
    errors.city = 'Please select or enter a city.';
  } else {
    const sCheck = checkPakistanServiceability({ cityName: address.city });
    if (!sCheck.isServiceable) {
      warnings.push(`City "${address.city}" has limited courier coverage. Manual dispatch confirmation may be required.`);
    }
  }

  if (!address.streetAddress?.trim() || address.streetAddress.trim().length < 5) {
    errors.streetAddress = 'Please enter detailed street address, house/shop number, or mohallah.';
  }

  if (!address.nearestLandmark?.trim()) {
    warnings.push('Adding a famous landmark (Masjid, Chowk, School) improves courier delivery rate by 34%.');
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    serviceabilityWarnings: warnings
  };
}

class CustomerAddressService {
  getAddresses(customerId?: string): CustomerAddress[] {
    return locationService.getSavedAddresses();
  }

  saveAddress(address: Omit<CustomerAddress, 'id'> & { id?: string }): { success: boolean; address?: CustomerAddress; validation?: AddressValidationResult } {
    const val = validateCustomerAddress(address);
    if (!val.isValid) {
      return { success: false, validation: val };
    }

    const saved = locationService.saveAddress(address);
    return { success: true, address: saved, validation: val };
  }

  deleteAddress(id: string): void {
    locationService.deleteAddress(id);
  }

  setDefaultAddress(id: string): void {
    const list = locationService.getSavedAddresses();
    list.forEach((a) => {
      a.isDefault = a.id === id;
    });
  }
}

export const customerAddressService = new CustomerAddressService();
