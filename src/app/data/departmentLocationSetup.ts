export type DeptLocType = 'department' | 'location';

export type CompanyAddress = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type DepartmentLocation = {
  id: string;
  name: string;
  type: DeptLocType;
  addressId: string | null;
  active: boolean;
};

export const COMPANY_ADDRESSES: CompanyAddress[] = [
  {
    id: 'addr-sample',
    label: 'Sample Address',
    line1: '1200 Commerce Parkway',
    line2: 'Suite 400',
    city: 'Austin',
    state: 'TX',
    postalCode: '78701',
    country: 'United States',
  },
  {
    id: 'addr-2',
    label: 'Address 2',
    line1: '88 Harbor View Drive',
    city: 'Seattle',
    state: 'WA',
    postalCode: '98101',
    country: 'United States',
  },
  {
    id: 'addr-hq',
    label: 'HQ — Main Campus',
    line1: '500 Innovation Way',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'United States',
  },
];

export function formatAddress(address: CompanyAddress): string {
  const parts = [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
  ].filter(Boolean);
  return parts.join('\n');
}

export function getAddressById(id: string | null): CompanyAddress | undefined {
  if (!id) return undefined;
  return COMPANY_ADDRESSES.find((a) => a.id === id);
}

export function createSeedDepartmentsLocations(): DepartmentLocation[] {
  return [
    { id: 'dl-accounting', name: 'Accounting & Finance', type: 'department', addressId: 'addr-sample', active: true },
    { id: 'dl-hr', name: 'HR', type: 'department', addressId: 'addr-sample', active: true },
    { id: 'dl-it', name: 'IT', type: 'department', addressId: 'addr-2', active: true },
    { id: 'dl-marketing', name: 'Marketing', type: 'department', addressId: 'addr-sample', active: true },
    { id: 'dl-production', name: 'Production', type: 'location', addressId: 'addr-2', active: true },
    { id: 'dl-purchasing', name: 'Purchasing', type: 'department', addressId: 'addr-hq', active: true },
    {
      id: 'dl-rnd',
      name: 'Research & Development (R&D)',
      type: 'department',
      addressId: 'addr-hq',
      active: true,
    },
    { id: 'dl-sales', name: 'Sales', type: 'department', addressId: 'addr-sample', active: true },
    { id: 'dl-asg2', name: 'asg2', type: 'location', addressId: 'addr-2', active: true },
  ];
}

export function cloneDepartmentLocation(item: DepartmentLocation): DepartmentLocation {
  return { ...item };
}
