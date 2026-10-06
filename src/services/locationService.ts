import { CustomerAddress, PakistanCity, PakistanProvince, ServiceabilityResult } from '../types/location';
import { PAKISTAN_CITIES, PAKISTAN_PROVINCES, findCityByName, getCitiesByProvince } from '../utils/pakistanLocations';
import { checkPakistanServiceability } from '../utils/serviceability';

class LocationService {
  private savedAddresses: CustomerAddress[] = [
    {
      id: 'addr-sample-1',
      fullName: 'Muhammad Usman',
      phone: '03001234567',
      secondaryPhone: '03217654321',
      province: 'Punjab',
      city: 'Lahore',
      area: 'Johar Town',
      streetAddress: 'House 42, Block G3, Phase 2',
      nearestLandmark: 'Near Expo Center Main Gate',
      postalCode: '54000',
      isDefault: true,
      addressType: 'HOME',
      verifiedServiceable: true
    },
    {
      id: 'addr-sample-2',
      fullName: 'Ayesha Siddiqui',
      phone: '03339876543',
      province: 'Sindh',
      city: 'Karachi',
      area: 'Gulshan-e-Iqbal',
      streetAddress: 'Flat 4B, Al-Madina Heights, Block 13-D',
      nearestLandmark: 'Opposite Bait-ul-Mukarram Masjid',
      postalCode: '75300',
      isDefault: false,
      addressType: 'HOME',
      verifiedServiceable: true
    }
  ];

  getProvinces(): PakistanProvince[] {
    return PAKISTAN_PROVINCES;
  }

  getAllCities(): PakistanCity[] {
    return PAKISTAN_CITIES;
  }

  getCitiesForProvince(province: PakistanProvince): PakistanCity[] {
    return getCitiesByProvince(province);
  }

  getCityDetails(cityName: string): PakistanCity | undefined {
    return findCityByName(cityName);
  }

  checkServiceability(cityName: string, isCod = true): ServiceabilityResult {
    return checkPakistanServiceability({ cityName, requestedCod: isCod });
  }

  getSavedAddresses(): CustomerAddress[] {
    return this.savedAddresses;
  }

  saveAddress(address: Omit<CustomerAddress, 'id'> & { id?: string }): CustomerAddress {
    const isServiceable = this.checkServiceability(address.city).isServiceable;
    const newAddress: CustomerAddress = {
      ...address,
      id: address.id || `addr-${Date.now()}`,
      verifiedServiceable: isServiceable,
      isDefault: address.isDefault || this.savedAddresses.length === 0
    };

    if (newAddress.isDefault) {
      this.savedAddresses = this.savedAddresses.map((a) => ({ ...a, isDefault: false }));
    }

    const existingIndex = this.savedAddresses.findIndex((a) => a.id === newAddress.id);
    if (existingIndex >= 0) {
      this.savedAddresses[existingIndex] = newAddress;
    } else {
      this.savedAddresses.push(newAddress);
    }

    return newAddress;
  }

  deleteAddress(id: string): void {
    this.savedAddresses = this.savedAddresses.filter((a) => a.id !== id);
    if (this.savedAddresses.length > 0 && !this.savedAddresses.some((a) => a.isDefault)) {
      this.savedAddresses[0].isDefault = true;
    }
  }

  getDefaultAddress(): CustomerAddress | undefined {
    return this.savedAddresses.find((a) => a.isDefault) || this.savedAddresses[0];
  }
}

export const locationService = new LocationService();
