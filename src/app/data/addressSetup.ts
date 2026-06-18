export type AddressType = 'physical' | 'delivery' | 'billing';

export type AddressRecord = {
  id: string;
  name: string;
  addressType: AddressType | null;
  line1: string;
  line2?: string;
  line3?: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  email: string;
  phone: string;
  active: boolean;
};

export const ADDRESS_TYPE_OPTIONS: { value: AddressType; label: string }[] = [
  { value: 'physical', label: 'Physical' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'billing', label: 'Billing' },
];

export const COUNTRY_OPTIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'India',
  'Australia',
];

export function formatAddressType(type: AddressType | null): string {
  if (!type) return '—';
  return ADDRESS_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}

export function createSeedAddresses(): AddressRecord[] {
  return [
    {
      id: 'addr-1',
      name: 'Address 1',
      addressType: 'delivery',
      line1: '350 Fifth Avenue',
      line2: 'Suite 1200',
      city: 'New York city',
      state: 'NY',
      country: 'United States',
      zipCode: '10118',
      email: 'ny.delivery@company.com',
      phone: '2125550101',
      active: true,
    },
    {
      id: 'addr-2',
      name: 'Address 2',
      addressType: 'physical',
      line1: '88 Harbor View Drive',
      city: 'Seattle',
      state: 'WA',
      country: 'United States',
      zipCode: '98101',
      email: 'seattle@company.com',
      phone: '2065550199',
      active: true,
    },
    {
      id: 'addr-ahmedabad',
      name: 'Ahmedabad',
      addressType: 'physical',
      line1: 'SG Highway',
      line2: 'Block B',
      city: 'Ahmedabad',
      state: 'GJ',
      country: 'India',
      zipCode: '380015',
      email: 'ahmedabad@company.com',
      phone: '9876543210',
      active: false,
    },
    {
      id: 'addr-nishtat',
      name: 'nishtat',
      addressType: 'billing',
      line1: '12 Market Street',
      city: 'Anytown',
      state: 'CA',
      country: 'United States',
      zipCode: '90210',
      email: 'billing@company.com',
      phone: '3105550142',
      active: true,
    },
    {
      id: 'addr-hq',
      name: 'HQ Campus',
      addressType: 'physical',
      line1: '500 Innovation Way',
      city: 'San Francisco',
      state: 'CA',
      country: 'United States',
      zipCode: '94105',
      email: 'hq@company.com',
      phone: '4155550188',
      active: true,
    },
    {
      id: 'addr-warehouse',
      name: 'Central Warehouse',
      addressType: 'delivery',
      line1: '2200 Logistics Parkway',
      city: 'Dallas',
      state: 'TX',
      country: 'United States',
      zipCode: '75201',
      email: 'warehouse@company.com',
      phone: '2145550166',
      active: true,
    },
    {
      id: 'addr-london',
      name: 'London Office',
      addressType: 'billing',
      line1: '10 Downing Street Annex',
      city: 'London',
      state: 'England',
      country: 'United Kingdom',
      zipCode: 'SW1A 2AA',
      email: 'london@company.com',
      phone: '442071234567',
      active: true,
    },
    {
      id: 'addr-toronto',
      name: 'Toronto Branch',
      addressType: null,
      line1: '100 King Street West',
      city: 'Toronto',
      state: 'ON',
      country: 'Canada',
      zipCode: 'M5X 1A9',
      email: 'toronto@company.com',
      phone: '4165550133',
      active: true,
    },
  ];
}

export function cloneAddressRecord(record: AddressRecord): AddressRecord {
  return { ...record };
}

export function formatFullAddress(record: AddressRecord): string {
  return [
    record.line1,
    record.line2,
    record.line3,
    `${record.city}, ${record.state} ${record.zipCode}`,
    record.country,
  ]
    .filter(Boolean)
    .join('\n');
}
