export type VendorStatusFilter = 'all' | 'active' | 'archived' | 'approved';

export type VendorContact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone2: string;
  category: string;
};

export type SetupVendor = {
  id: string;
  vendorCode: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  tin: string;
  terms: string;
  currency: string;
  timeZone: string;
  assigned: boolean;
  approved: boolean;
  archived: boolean;
  active: boolean;
  markAsCc: boolean;
  isPunchout: boolean;
  punchoutUrl: string;
  portalUrl: string;
  rating: number;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  contractDocs: boolean;
  w9Docs: boolean;
  miscDocs: boolean;
  contractExpirationWarningDays: number;
  totalAllowedSpendingCap: number;
  poSpendingCapWarningThreshold: number;
  spendingUsedAmount: number;
  contacts: VendorContact[];
};

export const VENDOR_TERMS_OPTIONS = ['Net 30', 'Net 45', 'Net 60', 'Due on receipt', '2/10 Net 30'];
export const CURRENCY_OPTIONS = ['USD', 'CAD', 'EUR', 'GBP', 'INR'];
export const COUNTRY_OPTIONS = ['United States', 'Canada', 'United Kingdom', 'India'];
export const CONTACT_CATEGORY_OPTIONS = ['Sales', 'Support', 'Billing', 'Technical', 'General'];
export const TIME_ZONE_OPTIONS = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Asia/Kolkata',
  'Europe/London',
];

export function createEmptyVendor(vendorCode?: string): Omit<SetupVendor, 'id'> {
  return {
    vendorCode: vendorCode ?? '',
    name: '',
    email: '',
    phone: '',
    website: '',
    tin: '',
    terms: 'Net 30',
    currency: 'USD',
    timeZone: 'America/New_York',
    assigned: false,
    approved: false,
    archived: false,
    active: true,
    markAsCc: false,
    isPunchout: false,
    punchoutUrl: '',
    portalUrl: '',
    rating: 0,
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    contractDocs: false,
    w9Docs: false,
    miscDocs: false,
    contractExpirationWarningDays: 30,
    totalAllowedSpendingCap: 0,
    poSpendingCapWarningThreshold: 80,
    spendingUsedAmount: 0,
    contacts: [],
  };
}

export function createSeedVendors(): SetupVendor[] {
  return [
    {
      id: 'vendor-dell',
      vendorCode: 'V-1001',
      name: 'Dell Technologies',
      email: 'procurement@dell.com',
      phone: '800-999-3355',
      website: 'https://www.dell.com',
      tin: '74-2487834',
      terms: 'Net 30',
      currency: 'USD',
      timeZone: 'America/Chicago',
      assigned: true,
      approved: true,
      archived: false,
      active: true,
      markAsCc: false,
      isPunchout: false,
      punchoutUrl: '',
      portalUrl: 'https://www.dell.com',
      rating: 4,
      addressLine1: 'One Dell Way',
      addressLine2: '',
      addressLine3: '',
      city: 'Round Rock',
      state: 'TX',
      zip: '78682',
      country: 'United States',
      contractDocs: true,
      w9Docs: true,
      miscDocs: false,
      contractExpirationWarningDays: 30,
      totalAllowedSpendingCap: 1_000_000,
      poSpendingCapWarningThreshold: 80,
      spendingUsedAmount: 413_502.95,
      contacts: [
        {
          id: 'vc-1',
          name: 'Sarah Mitchell',
          email: 'sarah.mitchell@dell.com',
          phone: '512-555-0101',
          phone2: '',
          category: 'Sales',
        },
      ],
    },
    {
      id: 'vendor-cdw',
      vendorCode: 'V-1002',
      name: 'CDW',
      email: 'orders@cdw.com',
      phone: '800-800-4239',
      website: 'https://www.cdw.com',
      tin: '36-4530079',
      terms: 'Net 45',
      currency: 'USD',
      timeZone: 'America/Chicago',
      assigned: true,
      approved: true,
      archived: false,
      active: true,
      markAsCc: false,
      isPunchout: true,
      punchoutUrl: '#punchout-cdw',
      portalUrl: 'https://www.cdw.com',
      rating: 5,
      addressLine1: '200 N Milwaukee Ave',
      addressLine2: '',
      addressLine3: '',
      city: 'Vernon Hills',
      state: 'IL',
      zip: '60061',
      country: 'United States',
      contractDocs: true,
      w9Docs: true,
      miscDocs: true,
      contractExpirationWarningDays: 45,
      totalAllowedSpendingCap: 2_500_000,
      poSpendingCapWarningThreshold: 75,
      spendingUsedAmount: 1_875_000,
      contacts: [
        {
          id: 'vc-2',
          name: 'James Cooper',
          email: 'j.cooper@cdw.com',
          phone: '847-555-0192',
          phone2: '847-555-0193',
          category: 'Support',
        },
      ],
    },
    {
      id: 'vendor-amazon',
      vendorCode: 'V-1003',
      name: 'Amazon Business',
      email: 'business@amazon.com',
      phone: '866-216-1072',
      website: 'https://business.amazon.com',
      tin: '91-1646860',
      terms: 'Due on receipt',
      currency: 'USD',
      timeZone: 'America/Los_Angeles',
      assigned: true,
      approved: false,
      archived: false,
      active: true,
      markAsCc: true,
      isPunchout: true,
      punchoutUrl: '#punchout-amazon',
      portalUrl: 'https://business.amazon.com',
      rating: 3,
      addressLine1: '410 Terry Ave N',
      addressLine2: '',
      addressLine3: '',
      city: 'Seattle',
      state: 'WA',
      zip: '98109',
      country: 'United States',
      contractDocs: false,
      w9Docs: true,
      miscDocs: false,
      contractExpirationWarningDays: 30,
      totalAllowedSpendingCap: 0,
      poSpendingCapWarningThreshold: 80,
      spendingUsedAmount: 0,
      contacts: [],
    },
    {
      id: 'vendor-staples',
      vendorCode: 'V-1004',
      name: 'Staples',
      email: 'business@staples.com',
      phone: '800-333-3330',
      website: 'https://www.staples.com',
      tin: '04-2896127',
      terms: 'Net 30',
      currency: 'USD',
      timeZone: 'America/New_York',
      assigned: false,
      approved: true,
      archived: false,
      active: true,
      markAsCc: false,
      isPunchout: true,
      punchoutUrl: '#punchout-staples',
      portalUrl: 'https://www.staples.com',
      rating: 4,
      addressLine1: '500 Staples Dr',
      addressLine2: '',
      addressLine3: '',
      city: 'Framingham',
      state: 'MA',
      zip: '01702',
      country: 'United States',
      contractDocs: true,
      w9Docs: false,
      miscDocs: false,
      contractExpirationWarningDays: 30,
      totalAllowedSpendingCap: 500_000,
      poSpendingCapWarningThreshold: 85,
      spendingUsedAmount: 128_400,
      contacts: [
        {
          id: 'vc-3',
          name: 'Lisa Park',
          email: 'lisa.park@staples.com',
          phone: '508-555-0144',
          phone2: '',
          category: 'Billing',
        },
      ],
    },
    {
      id: 'vendor-grainger',
      vendorCode: 'V-1005',
      name: 'Grainger',
      email: 'customerservice@grainger.com',
      phone: '800-472-4643',
      website: 'https://www.grainger.com',
      tin: '36-1150280',
      terms: 'Net 30',
      currency: 'USD',
      timeZone: 'America/Chicago',
      assigned: true,
      approved: true,
      archived: false,
      active: true,
      markAsCc: false,
      isPunchout: true,
      punchoutUrl: '#punchout-grainger',
      portalUrl: 'https://www.grainger.com',
      rating: 4,
      addressLine1: '100 Grainger Pkwy',
      addressLine2: '',
      addressLine3: '',
      city: 'Lake Forest',
      state: 'IL',
      zip: '60045',
      country: 'United States',
      contractDocs: true,
      w9Docs: true,
      miscDocs: false,
      contractExpirationWarningDays: 60,
      totalAllowedSpendingCap: 750_000,
      poSpendingCapWarningThreshold: 80,
      spendingUsedAmount: 312_750,
      contacts: [],
    },
    {
      id: 'vendor-legacy',
      vendorCode: 'V-0998',
      name: 'Legacy Office Supply',
      email: 'archive@legacy.com',
      phone: '555-0100',
      website: '',
      tin: '',
      terms: 'Net 30',
      currency: 'USD',
      timeZone: 'America/New_York',
      assigned: false,
      approved: false,
      archived: true,
      active: false,
      markAsCc: false,
      isPunchout: false,
      punchoutUrl: '',
      portalUrl: '',
      rating: 2,
      addressLine1: '100 Old Mill Rd',
      addressLine2: '',
      addressLine3: '',
      city: 'Boston',
      state: 'MA',
      zip: '02108',
      country: 'United States',
      contractDocs: false,
      w9Docs: false,
      miscDocs: false,
      contractExpirationWarningDays: 30,
      totalAllowedSpendingCap: 0,
      poSpendingCapWarningThreshold: 80,
      spendingUsedAmount: 0,
      contacts: [],
    },
  ];
}

export function cloneSetupVendor(vendor: SetupVendor): SetupVendor {
  return {
    ...vendor,
    contacts: vendor.contacts.map((c) => ({ ...c })),
  };
}

export function cloneVendorContact(contact: VendorContact): VendorContact {
  return { ...contact };
}

export function vendorsEqual(a: SetupVendor, b: SetupVendor): boolean {
  if (
    a.vendorCode !== b.vendorCode ||
    a.name !== b.name ||
    a.email !== b.email ||
    a.phone !== b.phone ||
    a.website !== b.website ||
    a.tin !== b.tin ||
    a.terms !== b.terms ||
    a.currency !== b.currency ||
    a.timeZone !== b.timeZone ||
    a.assigned !== b.assigned ||
    a.approved !== b.approved ||
    a.archived !== b.archived ||
    a.active !== b.active ||
    a.markAsCc !== b.markAsCc ||
    a.isPunchout !== b.isPunchout ||
    a.punchoutUrl !== b.punchoutUrl ||
    a.portalUrl !== b.portalUrl ||
    a.rating !== b.rating ||
    a.addressLine1 !== b.addressLine1 ||
    a.addressLine2 !== b.addressLine2 ||
    a.addressLine3 !== b.addressLine3 ||
    a.city !== b.city ||
    a.state !== b.state ||
    a.zip !== b.zip ||
    a.country !== b.country ||
    a.contractDocs !== b.contractDocs ||
    a.w9Docs !== b.w9Docs ||
    a.miscDocs !== b.miscDocs ||
    a.contractExpirationWarningDays !== b.contractExpirationWarningDays ||
    a.totalAllowedSpendingCap !== b.totalAllowedSpendingCap ||
    a.poSpendingCapWarningThreshold !== b.poSpendingCapWarningThreshold ||
    a.spendingUsedAmount !== b.spendingUsedAmount ||
    a.contacts.length !== b.contacts.length
  ) {
    return false;
  }

  return a.contacts.every((contact, index) => {
    const other = b.contacts[index];
    return (
      contact.name === other.name &&
      contact.email === other.email &&
      contact.phone === other.phone &&
      contact.phone2 === other.phone2 &&
      contact.category === other.category
    );
  });
}

export function getVendorInitials(vendor: SetupVendor): string {
  const parts = vendor.name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'VN';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function nextVendorCode(vendors: SetupVendor[]): string {
  const numbers = vendors
    .map((v) => {
      const match = v.vendorCode.match(/V-(\d+)/);
      return match ? Number.parseInt(match[1], 10) : 0;
    })
    .filter((n) => !Number.isNaN(n));
  const next = numbers.length > 0 ? Math.max(...numbers) + 1 : 1001;
  return `V-${next}`;
}

export function formatVendorCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getSpendingUtilization(used: number, cap: number): number {
  if (cap <= 0) return 0;
  return Math.min(100, Math.round((used / cap) * 100));
}

export function getSpendingAvailable(cap: number, used: number): number {
  return Math.max(0, cap - used);
}

export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrencyInputValue(amount: number): string {
  if (amount <= 0) return '';
  return amount.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function getVendorPortalUrl(vendor: SetupVendor): string | null {
  const portal = vendor.portalUrl.trim();
  if (portal) return portal;
  const website = vendor.website.trim();
  return website || null;
}
