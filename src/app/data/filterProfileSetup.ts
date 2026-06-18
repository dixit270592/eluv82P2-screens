import { createSeedDepartmentsLocations } from './departmentLocationSetup';

export type FilterOption = {
  id: string;
  label: string;
};

export type FilterProfile = {
  id: string;
  name: string;
  projectEnabled: boolean;
  departmentLocationId: string | null;
  departmentId: string | null;
  accountId: string | null;
  active: boolean;
};

const seedDepartments = createSeedDepartmentsLocations();

export const FILTER_DEPARTMENT_LOCATION_OPTIONS: FilterOption[] = seedDepartments.map((d) => ({
  id: d.id,
  label: d.name,
}));

export const FILTER_DEPARTMENT_OPTIONS: FilterOption[] = seedDepartments
  .filter((d) => d.type === 'department')
  .map((d) => ({
    id: d.id,
    label: d.name,
  }));

export const FILTER_ACCOUNT_OPTIONS: FilterOption[] = [
  { id: 'acct-1000', label: '1000 — Cash & Equivalents' },
  { id: 'acct-2000', label: '2000 — Accounts Payable' },
  { id: 'acct-4100', label: '4100 — Office Supplies' },
  { id: 'acct-5100', label: '5100 — IT Equipment' },
  { id: 'acct-6200', label: '6200 — Professional Services' },
];

export function getFilterOptionLabel(
  options: FilterOption[],
  id: string | null,
): string | undefined {
  if (!id) return undefined;
  return options.find((o) => o.id === id)?.label;
}

export function createSeedFilterProfiles(): FilterProfile[] {
  return [
    {
      id: 'fp-test-ai',
      name: 'test AI',
      projectEnabled: false,
      departmentLocationId: 'dl-it',
      departmentId: null,
      accountId: null,
      active: true,
    },
    {
      id: 'fp-test-filter',
      name: 'test filter',
      projectEnabled: true,
      departmentLocationId: null,
      departmentId: 'dl-purchasing',
      accountId: 'acct-4100',
      active: true,
    },
  ];
}

export function cloneFilterProfile(profile: FilterProfile): FilterProfile {
  return { ...profile };
}

export function hasAtLeastOneFilter(profile: Pick<
  FilterProfile,
  'departmentLocationId' | 'departmentId' | 'accountId'
>): boolean {
  return Boolean(profile.departmentLocationId || profile.departmentId || profile.accountId);
}
