import { PakistanCity, PakistanProvince } from '../types/location';

export const PAKISTAN_PROVINCES: PakistanProvince[] = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan'
];

export const PAKISTAN_CITIES: PakistanCity[] = [
  // --- Hub Cities ---
  {
    id: 'lhr',
    name: 'Lahore',
    urduName: 'لاہور',
    province: 'Punjab',
    division: 'Lahore',
    postalCode: '54000',
    isHub: true,
    supportedCouriers: ['TRAX', 'POSTEX', 'TCS', 'LEOPARDS', 'CALL_COURIER'],
    deliveryEstDays: '1-2 Days',
    codAvailable: true,
    areas: [
      'Gulberg (I, II, III)', 'DHA Phase 1-9', 'Model Town', 'Johar Town', 'Wapda Town',
      'Bahria Town', 'Shadman', 'Faisal Town', 'Iqbal Town', 'Cantt', 'Samanabad',
      'Anarkali', 'Shahdara', 'Township', 'Valencia', 'Askari (1-11)', 'Mughalpura'
    ]
  },
  {
    id: 'khi',
    name: 'Karachi',
    urduName: 'کراچی',
    province: 'Sindh',
    division: 'Karachi',
    postalCode: '74000',
    isHub: true,
    supportedCouriers: ['TRAX', 'POSTEX', 'TCS', 'LEOPARDS', 'CALL_COURIER'],
    deliveryEstDays: '1-2 Days',
    codAvailable: true,
    areas: [
      'Clifton (Blocks 1-9)', 'DHA (Phase 1-8)', 'Gulshan-e-Iqbal', 'Gulistan-e-Johar',
      'North Nazimabad', 'PECHS', 'Federal B Area', 'Bahria Town Karachi', 'Malir Cantt',
      'Korangi', 'Saddar', 'Nazimabad', 'Tariq Road', 'Scheme 33', 'Buffer Zone'
    ]
  },
  {
    id: 'isb',
    name: 'Islamabad',
    urduName: 'اسلام آباد',
    province: 'Islamabad Capital Territory',
    division: 'Islamabad',
    postalCode: '44000',
    isHub: true,
    supportedCouriers: ['TRAX', 'POSTEX', 'TCS', 'LEOPARDS', 'CALL_COURIER'],
    deliveryEstDays: '1-2 Days',
    codAvailable: true,
    areas: [
      'Sector F-6 to F-11', 'Sector G-6 to G-15', 'Sector I-8 to I-10', 'DHA Phase 1-5',
      'Bahria Town Phase 1-8', 'Blue Area', 'PWD Housing Society', 'Bani Gala', 'E-11 MPCHS'
    ]
  },
  {
    id: 'rwp',
    name: 'Rawalpindi',
    urduName: 'راولپنڈی',
    province: 'Punjab',
    division: 'Rawalpindi',
    postalCode: '46000',
    isHub: true,
    supportedCouriers: ['TRAX', 'POSTEX', 'TCS', 'LEOPARDS', 'CALL_COURIER'],
    deliveryEstDays: '1-2 Days',
    codAvailable: true,
    areas: [
      'Saddar', 'Cantt', 'Satellite Town', 'Bahria Town (1-8)', 'Chaklala Scheme 3',
      'Westridge', 'Gulraiz Housing', 'Adyala Road', 'Pesharwar Road', 'Shamsabad'
    ]
  },
  {
    id: 'fsd',
    name: 'Faisalabad',
    urduName: 'فیصل آباد',
    province: 'Punjab',
    division: 'Faisalabad',
    postalCode: '38000',
    isHub: true,
    supportedCouriers: ['TRAX', 'POSTEX', 'TCS', 'LEOPARDS', 'CALL_COURIER'],
    deliveryEstDays: '2-3 Days',
    codAvailable: true,
    areas: [
      'Madina Town', 'Peoples Colony', 'Kohinoor City', 'D Ground', 'Civil Lines',
      'Gulberg', 'Samanabad', 'Millat Town', 'Canal Road', 'Ghulam Muhammad Abad'
    ]
  },
  {
    id: 'mux',
    name: 'Multan',
    urduName: 'ملتان',
    province: 'Punjab',
    division: 'Multan',
    postalCode: '60000',
    isHub: false,
    supportedCouriers: ['TRAX', 'POSTEX', 'TCS', 'LEOPARDS'],
    deliveryEstDays: '2-3 Days',
    codAvailable: true,
    areas: ['Bosan Road', 'Cantt', 'Gulgasht Colony', 'Shah Rukn-e-Alam', 'Wapda Town', 'Model Town']
  },
  {
    id: 'pew',
    name: 'Peshawar',
    urduName: 'پشاور',
    province: 'Khyber Pakhtunkhwa',
    division: 'Peshawar',
    postalCode: '25000',
    isHub: true,
    supportedCouriers: ['TRAX', 'POSTEX', 'TCS', 'LEOPARDS'],
    deliveryEstDays: '2-3 Days',
    codAvailable: true,
    areas: ['Hayatabad (Phases 1-7)', 'University Town', 'Peshawar Cantt', 'Warsak Road', 'Ring Road']
  },
  {
    id: 'uet',
    name: 'Quetta',
    urduName: 'کوئٹہ',
    province: 'Balochistan',
    division: 'Quetta',
    postalCode: '87300',
    isHub: false,
    supportedCouriers: ['TCS', 'LEOPARDS', 'TRAX'],
    deliveryEstDays: '3-4 Days',
    codAvailable: true,
    areas: ['Cantt', 'Jinnah Road', 'Zarghoon Road', 'Samungli Road', 'Shahbaz Town']
  },
  {
    id: 'skt',
    name: 'Sialkot',
    urduName: 'سیالکوٹ',
    province: 'Punjab',
    division: 'Gujranwala',
    postalCode: '51310',
    isHub: false,
    supportedCouriers: ['TRAX', 'POSTEX', 'TCS', 'LEOPARDS', 'CALL_COURIER'],
    deliveryEstDays: '2-3 Days',
    codAvailable: true,
    areas: ['Cantt', 'Model Town', 'Kashmir Road', 'Daska Road', 'Shahabpura']
  },
  {
    id: 'gwd',
    name: 'Gwadar',
    urduName: 'گوادر',
    province: 'Balochistan',
    division: 'Makran',
    postalCode: '91200',
    isHub: false,
    supportedCouriers: ['TCS', 'LEOPARDS'],
    deliveryEstDays: '4-5 Days',
    codAvailable: false, // Advance payment recommended
    areas: ['Port City', 'Airport Road', 'Jinnah Avenue', 'Marine Drive']
  },
  {
    id: 'gil',
    name: 'Gilgit',
    urduName: 'گلگت',
    province: 'Gilgit-Baltistan',
    division: 'Gilgit',
    postalCode: '15100',
    isHub: false,
    supportedCouriers: ['TCS', 'LEOPARDS'],
    deliveryEstDays: '4-6 Days',
    codAvailable: true,
    areas: ['Jutial', 'City Center', 'Airport Area', 'Konodas']
  },
  {
    id: 'mzd',
    name: 'Muzaffarabad',
    urduName: 'مظفرآباد',
    province: 'Azad Jammu & Kashmir',
    division: 'Muzaffarabad',
    postalCode: '13100',
    isHub: false,
    supportedCouriers: ['TCS', 'LEOPARDS', 'TRAX'],
    deliveryEstDays: '3-4 Days',
    codAvailable: true,
    areas: ['Plate', 'Lower Chattar', 'Upper Chattar', 'Ambore', 'Neelum Road']
  },
  {
    id: 'hyd',
    name: 'Hyderabad',
    urduName: 'حیدرآباد',
    province: 'Sindh',
    division: 'Hyderabad',
    postalCode: '71000',
    isHub: false,
    supportedCouriers: ['TRAX', 'POSTEX', 'TCS', 'LEOPARDS'],
    deliveryEstDays: '2-3 Days',
    codAvailable: true,
    areas: ['Latifabad (Units 1-12)', 'Qasimabad', 'Cantt', 'Saddar', 'Auto Bhan Road']
  },
  {
    id: 'grw',
    name: 'Gujranwala',
    urduName: 'گوجرانوالہ',
    province: 'Punjab',
    division: 'Gujranwala',
    postalCode: '52250',
    isHub: false,
    supportedCouriers: ['TRAX', 'POSTEX', 'TCS', 'LEOPARDS', 'CALL_COURIER'],
    deliveryEstDays: '2-3 Days',
    codAvailable: true,
    areas: ['DC Colony', 'Wapda Town', 'Model Town', 'Peoples Colony', 'Satellite Town', 'G.T. Road']
  },
  {
    id: 'bwp',
    name: 'Bahawalpur',
    urduName: 'بہاولپور',
    province: 'Punjab',
    division: 'Bahawalpur',
    postalCode: '63100',
    isHub: false,
    supportedCouriers: ['TRAX', 'POSTEX', 'TCS', 'LEOPARDS'],
    deliveryEstDays: '2-3 Days',
    codAvailable: true,
    areas: ['Model Town A & B', 'Cantt', 'Satellite Town', 'University Campus', 'Cheema Town']
  },
  {
    id: 'swat',
    name: 'Swat / Mingora',
    urduName: 'سوات / مینگورہ',
    province: 'Khyber Pakhtunkhwa',
    division: 'Malakand',
    postalCode: '19130',
    isHub: false,
    supportedCouriers: ['TCS', 'LEOPARDS', 'TRAX'],
    deliveryEstDays: '3-4 Days',
    codAvailable: true,
    areas: ['Mingora City', 'Saidu Sharif', 'Fizagat', 'Kanju Township']
  }
];

export const findCityByName = (name: string): PakistanCity | undefined => {
  if (!name) return undefined;
  const clean = name.trim().toLowerCase();
  return PAKISTAN_CITIES.find(
    (c) => c.name.toLowerCase() === clean || c.urduName.includes(name) || clean.includes(c.name.toLowerCase())
  );
};

export const getCitiesByProvince = (province: PakistanProvince): PakistanCity[] => {
  return PAKISTAN_CITIES.filter((c) => c.province === province);
};
