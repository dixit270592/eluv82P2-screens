import { createSeedApprovalGroups } from './approvalGroupSetup';
import { createSeedFilterProfiles } from './filterProfileSetup';
import { createSeedDepartmentsLocations } from './departmentLocationSetup';

export type UserStatusFilter = 'all' | 'active' | 'inactive';

export type SetupUser = {
  id: string;
  userName: string;
  email: string;
  title: string;
  firstName: string;
  lastName: string;
  physicalPhone: string;
  cellPhone: string;
  active: boolean;
  showBudgetInfo: boolean;
  defaultDepartmentId: string | null;
  defaultType: string;
  defaultView: string;
  defaultDeliveryLocationId: string | null;
  rightGroupId: string | null;
  filterProfileId: string | null;
  last4Cc: string;
  expenseVendor: string;
  approvalGroupId: string | null;
  timeZone: string;
  managerId: string | null;
  proxyApproverId: string | null;
  createExpenseForUsers: string;
  createReports: boolean;
  outOfOffice: boolean;
};

export const DEFAULT_TYPE_OPTIONS = ['Standard', 'Admin', 'Requester', 'Approver'];
export const DEFAULT_VIEW_OPTIONS = ['Dashboard', 'Purchase Requests', 'Invoices'];
export const TIME_ZONE_OPTIONS = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Asia/Kolkata',
  'Europe/London',
];
export const EXPENSE_VENDOR_OPTIONS = ['None', 'Concur', 'Expensify', 'Internal'];

const departments = createSeedDepartmentsLocations();
const filterProfiles = createSeedFilterProfiles();
const approvalGroups = createSeedApprovalGroups();

export const USER_DEPARTMENT_OPTIONS = departments.map((d) => ({ id: d.id, label: d.name }));
export const USER_DELIVERY_LOCATION_OPTIONS = departments
  .filter((d) => d.type === 'location')
  .map((d) => ({ id: d.id, label: d.name }));
export const USER_FILTER_PROFILE_OPTIONS = filterProfiles.map((f) => ({ id: f.id, label: f.name }));
export const USER_APPROVAL_GROUP_OPTIONS = approvalGroups.map((g) => ({ id: g.id, label: g.name }));
export const USER_RIGHT_GROUP_OPTIONS = [
  { id: 'group-general', label: 'General' },
  { id: 'group-request-creator', label: 'Request Creator' },
];

export const MANAGER_OPTIONS = [
  { id: 'user-natasha', label: 'Natasha Tuber' },
  { id: 'user-yogesh', label: 'Yogesh Hadiya' },
  { id: 'user-sg', label: 'SG Oberoi' },
];

export function createEmptyUser(): Omit<SetupUser, 'id'> {
  return {
    userName: '',
    email: '',
    title: '',
    firstName: '',
    lastName: '',
    physicalPhone: '',
    cellPhone: '',
    active: true,
    showBudgetInfo: false,
    defaultDepartmentId: null,
    defaultType: 'Standard',
    defaultView: 'Dashboard',
    defaultDeliveryLocationId: null,
    rightGroupId: null,
    filterProfileId: null,
    last4Cc: '',
    expenseVendor: 'None',
    approvalGroupId: null,
    timeZone: 'America/New_York',
    managerId: null,
    proxyApproverId: null,
    createExpenseForUsers: '',
    createReports: false,
    outOfOffice: false,
  };
}

export function createSeedUsers(): SetupUser[] {
  return [
    {
      id: 'user-natasha',
      userName: 'natasha.tuber',
      email: 'natasha.tuber@company.com',
      title: 'Procurement Manager',
      firstName: 'Natasha',
      lastName: 'Tuber',
      physicalPhone: '2125550100',
      cellPhone: '2125550101',
      active: true,
      showBudgetInfo: true,
      defaultDepartmentId: 'dl-purchasing',
      defaultType: 'Admin',
      defaultView: 'Dashboard',
      defaultDeliveryLocationId: 'dl-production',
      rightGroupId: 'group-general',
      filterProfileId: 'fp-test-filter',
      last4Cc: '4242',
      expenseVendor: 'Concur',
      approvalGroupId: 'ag-testt-2',
      timeZone: 'America/New_York',
      managerId: 'user-sg',
      proxyApproverId: null,
      createExpenseForUsers: '',
      createReports: true,
      outOfOffice: false,
    },
    {
      id: 'user-yogesh',
      userName: 'yogesh.hadiya',
      email: 'yogesh.hadiya@company.com',
      title: 'Buyer',
      firstName: 'Yogesh',
      lastName: 'Hadiya',
      physicalPhone: '4155550180',
      cellPhone: '4155550181',
      active: true,
      showBudgetInfo: false,
      defaultDepartmentId: 'dl-purchasing',
      defaultType: 'Requester',
      defaultView: 'Purchase Requests',
      defaultDeliveryLocationId: null,
      rightGroupId: 'group-request-creator',
      filterProfileId: 'fp-test-ai',
      last4Cc: '',
      expenseVendor: 'None',
      approvalGroupId: 'ag-test-123',
      timeZone: 'America/Los_Angeles',
      managerId: 'user-natasha',
      proxyApproverId: null,
      createExpenseForUsers: '',
      createReports: false,
      outOfOffice: false,
    },
    {
      id: 'user-ellie',
      userName: 'ellie.sood',
      email: 'ellie.sood@company.com',
      title: 'Finance Analyst',
      firstName: 'Ellie',
      lastName: 'Sood',
      physicalPhone: '3125550170',
      cellPhone: '3125550171',
      active: false,
      showBudgetInfo: true,
      defaultDepartmentId: 'dl-accounting',
      defaultType: 'Approver',
      defaultView: 'Invoices',
      defaultDeliveryLocationId: null,
      rightGroupId: 'group-general',
      filterProfileId: null,
      last4Cc: '1234',
      expenseVendor: 'Expensify',
      approvalGroupId: 'ag-testt-2',
      timeZone: 'America/Chicago',
      managerId: 'user-sg',
      proxyApproverId: 'user-natasha',
      createExpenseForUsers: '',
      createReports: true,
      outOfOffice: true,
    },
    {
      id: 'user-shubham',
      userName: 'shubham.vyas',
      email: 'shubham.vyas@company.com',
      title: 'IT Specialist',
      firstName: 'Shubham',
      lastName: 'Vyas',
      physicalPhone: '2065550190',
      cellPhone: '2065550191',
      active: true,
      showBudgetInfo: false,
      defaultDepartmentId: 'dl-it',
      defaultType: 'Standard',
      defaultView: 'Dashboard',
      defaultDeliveryLocationId: 'dl-asg2',
      rightGroupId: 'group-general',
      filterProfileId: 'fp-test-ai',
      last4Cc: '',
      expenseVendor: 'Internal',
      approvalGroupId: null,
      timeZone: 'America/Denver',
      managerId: 'user-natasha',
      proxyApproverId: null,
      createExpenseForUsers: '',
      createReports: false,
      outOfOffice: false,
    },
    {
      id: 'user-prerna',
      userName: 'prerna.surana',
      email: 'prerna.surana@company.com',
      title: 'Operations Lead',
      firstName: 'Prerna',
      lastName: 'Surana',
      physicalPhone: '9876543210',
      cellPhone: '9876543211',
      active: true,
      showBudgetInfo: false,
      defaultDepartmentId: 'dl-marketing',
      defaultType: 'Standard',
      defaultView: 'Purchase Requests',
      defaultDeliveryLocationId: null,
      rightGroupId: 'group-request-creator',
      filterProfileId: null,
      last4Cc: '',
      expenseVendor: 'None',
      approvalGroupId: 'ag-prerna',
      timeZone: 'Asia/Kolkata',
      managerId: null,
      proxyApproverId: null,
      createExpenseForUsers: '',
      createReports: false,
      outOfOffice: false,
    },
  ];
}

export function cloneSetupUser(user: SetupUser): SetupUser {
  return { ...user };
}

export function usersEqual(a: SetupUser, b: SetupUser): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function getUserDisplayName(user: SetupUser): string {
  const full = `${user.firstName} ${user.lastName}`.trim();
  return full || user.userName;
}

export function getUserInitials(user: SetupUser): string {
  const first = user.firstName?.[0] ?? '';
  const last = user.lastName?.[0] ?? '';
  if (first || last) return `${first}${last}`.toUpperCase();
  return (user.userName[0] ?? 'U').toUpperCase();
}

const AVATAR_COLORS = [
  { bg: '#ECFDF5', color: '#0E7A54', border: '#B8E8D9' },
  { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' },
  { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  { bg: '#FDF2F8', color: '#BE185D', border: '#FBCFE8' },
];

export function getUserAvatarStyle(user: SetupUser) {
  const index =
    Math.abs(user.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
