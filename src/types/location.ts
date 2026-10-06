export type PakistanProvince = 
  | 'Punjab'
  | 'Sindh'
  | 'Khyber Pakhtunkhwa'
  | 'Balochistan'
  | 'Islamabad Capital Territory'
  | 'Azad Jammu & Kashmir'
  | 'Gilgit-Baltistan';

export interface PakistanCity {
  id: string;
  name: string;
  urduName: string;
  province: PakistanProvince;
  division?: string;
  postalCode: string;
  isHub: boolean; // Karachi, Lahore, Rawalpindi/Islamabad
  supportedCouriers: ('TRAX' | 'POSTEX' | 'TCS' | 'LEOPARDS' | 'CALL_COURIER')[];
  deliveryEstDays: string; // e.g., '1-2 Days', '2-3 Days'
  codAvailable: boolean;
  areas: string[];
}

export interface CustomerAddress {
  id: string;
  customerId?: string;
  fullName: string;
  phone: string; // e.g. '03001234567'
  secondaryPhone?: string;
  province: PakistanProvince;
  city: string;
  area: string;
  streetAddress: string;
  nearestLandmark?: string; // Essential in Pakistan (Masjid, Chowk, Market)
  postalCode?: string;
  isDefault?: boolean;
  addressType: 'HOME' | 'OFFICE' | 'SHOP';
  verifiedServiceable?: boolean;
}

export interface ServiceabilityResult {
  isServiceable: boolean;
  city: string;
  province: string;
  deliveryDaysEst: string;
  codSupported: boolean;
  isRemoteArea: boolean;
  remoteSurchargePKR: number;
  availableCouriers: string[];
  recommendedCourier: string;
  warnings: string[];
}
