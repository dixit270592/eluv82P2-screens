export type AccountTypeFormat =
  | 'department-account'
  | 'location-department-account'
  | 'custom';

export type SegmentSymbol = ':' | '-' | '.' | '/';

export type AccountSegment = {
  id: string;
  order: number;
  name: string;
  length: number;
  active: boolean;
};

export type SegmentDataRow = {
  id: string;
  segmentType: string;
  segmentData: string;
  description: string;
};

export const ACCOUNT_TYPE_OPTIONS: { value: AccountTypeFormat; label: string }[] = [
  { value: 'department-account', label: 'Department-Account' },
  { value: 'location-department-account', label: 'Location-Department-Account' },
  { value: 'custom', label: 'Make your own format' },
];

export const SEGMENT_SYMBOL_OPTIONS: { value: SegmentSymbol; label: string }[] = [
  { value: ':', label: ':' },
  { value: '-', label: '-' },
  { value: '.', label: '.' },
  { value: '/', label: '/' },
];

const defaultSegmentsByType: Record<AccountTypeFormat, Omit<AccountSegment, 'id'>[]> = {
  'department-account': [
    { order: 1, name: 'Department', length: 10, active: true },
    { order: 2, name: 'Account', length: 10, active: true },
  ],
  'location-department-account': [
    { order: 1, name: 'Location', length: 10, active: true },
    { order: 2, name: 'Department', length: 10, active: true },
    { order: 3, name: 'Account', length: 10, active: true },
  ],
  custom: [
    { order: 1, name: 'Segment 1', length: 10, active: true },
    { order: 2, name: 'Segment 2', length: 10, active: true },
  ],
};

export function createSegmentsForType(type: AccountTypeFormat): AccountSegment[] {
  return defaultSegmentsByType[type].map((segment, index) => ({
    ...segment,
    id: `seg-${type}-${index + 1}`,
  }));
}

export function createSeedSegmentData(): SegmentDataRow[] {
  return [
    {
      id: 'sd-1',
      segmentType: 'Account',
      segmentData: 'TEST ACC',
      description: 'dep',
    },
    {
      id: 'sd-2',
      segmentType: 'Account',
      segmentData: 'HR Account',
      description: 'BankAccount',
    },
    {
      id: 'sd-3',
      segmentType: 'Account',
      segmentData: 'Bank',
      description: 'test segment',
    },
    {
      id: 'sd-4',
      segmentType: 'Account',
      segmentData: 'IT',
      description: 'IT-Dept',
    },
    {
      id: 'sd-5',
      segmentType: 'Department',
      segmentData: 'Finance',
      description: 'Finance department',
    },
    {
      id: 'sd-6',
      segmentType: 'Department',
      segmentData: 'Operations',
      description: 'Operations department',
    },
    {
      id: 'sd-7',
      segmentType: 'Account',
      segmentData: 'Marketing',
      description: 'Marketing spend',
    },
    {
      id: 'sd-8',
      segmentType: 'Account',
      segmentData: 'Travel',
      description: 'Travel expenses',
    },
    {
      id: 'sd-9',
      segmentType: 'Department',
      segmentData: 'HR',
      description: 'Human resources',
    },
    {
      id: 'sd-10',
      segmentType: 'Account',
      segmentData: 'Supplies',
      description: 'Office supplies',
    },
    {
      id: 'sd-11',
      segmentType: 'Account',
      segmentData: 'Software',
      description: 'Software licenses',
    },
    {
      id: 'sd-12',
      segmentType: 'Department',
      segmentData: 'Legal',
      description: 'Legal department',
    },
  ];
}

export function getSegmentTypeOptions(segments: AccountSegment[]): string[] {
  return [...new Set(segments.filter((s) => s.active).map((s) => s.name))];
}

export function cloneSegmentData(row: SegmentDataRow): SegmentDataRow {
  return { ...row };
}

export type AccountDataRow = {
  id: string;
  department: string;
  account: string;
  description: string;
  active: boolean;
  accountName: string;
  accountDetails: string;
};

export type GlSplitLine = {
  id: string;
  glAccount: string;
  accountName: string;
  percentage: number;
};

export type PredefinedGlSplit = {
  id: string;
  splitName: string;
  lines: GlSplitLine[];
};

export function getDepartmentOptions(segmentData: SegmentDataRow[]): string[] {
  return [
    ...new Set(
      segmentData.filter((row) => row.segmentType === 'Department').map((row) => row.segmentData),
    ),
  ];
}

export function getAccountOptions(segmentData: SegmentDataRow[]): string[] {
  return [
    ...new Set(
      segmentData.filter((row) => row.segmentType === 'Account').map((row) => row.segmentData),
    ),
  ];
}

export function buildAccountDisplay(
  department: string,
  account: string,
  description: string,
): Pick<AccountDataRow, 'accountName' | 'accountDetails'> {
  const detailSegment = description.trim() || 'Description';
  return {
    accountName: `${department}:${account}:Name:Test Sales`,
    accountDetails: `${account}::${detailSegment}:Sales Department`,
  };
}

export function createSeedAccountData(): AccountDataRow[] {
  const rows = [
    { department: 'ABC', account: 'HR Account', description: 'test' },
    { department: 'DEP 1', account: 'Bank', description: 'Description' },
    { department: 'DEP 1', account: 'Bank', description: 'test' },
    { department: 'DEP 1', account: 'HR Account', description: 'Description' },
    { department: 'DEP 1', account: 'HR Account', description: 'test' },
    { department: 'DEP 2', account: 'HR Account', description: 'test' },
    { department: 'IT', account: 'TEST ACC', description: 'test' },
    { department: 'IT', account: 'Bank', description: 'Description' },
    { department: 'IT', account: 'HR Account', description: 'test' },
    { department: 'Finance', account: 'Supplies', description: 'Office supplies' },
    { department: 'Operations', account: 'Travel', description: 'Travel expenses' },
    { department: 'HR', account: 'Software', description: 'Software licenses' },
  ];

  return rows.map((row, index) => {
    const display = buildAccountDisplay(row.department, row.account, row.description);
    return {
      id: `ad-${index + 1}`,
      ...row,
      active: true,
      ...display,
      accountName:
        index === 0
          ? 'ABC:HR Account:NEWSEGMENT:Test Sales'
          : index === 2
            ? 'DEP 1:Bank:NEWSEGMENT:Test Sales'
            : index === 4
              ? 'DEP 1:HR Account:NEWSEGMENT:Test Sales'
              : display.accountName,
      accountDetails:
        index === 0
          ? 'account segment::test:Sales Department'
          : index === 2
            ? 'BankAccount::test:Sales Department'
            : index === 4
              ? '::test:Sales Department'
              : display.accountDetails,
    };
  });
}

const egerSplitLines: GlSplitLine[] = [
  {
    id: 'gsl-1',
    glAccount: 'IT:TEST ACC:NEWSEGMENT:Test Sales',
    accountName: ':IT-Dept:test:Sales Department',
    percentage: 11.11,
  },
  {
    id: 'gsl-2',
    glAccount: 'DEP 2:HR Account:NEWSEGMENT:Test Sales',
    accountName: '::test:Sales Department',
    percentage: 11.11,
  },
  {
    id: 'gsl-3',
    glAccount: 'DEP 2:HR Account:Name:Test Sales',
    accountName: '::Description:Sales Department',
    percentage: 11.11,
  },
  {
    id: 'gsl-4',
    glAccount: 'IT:HR Account:NEWSEGMENT:Test Sales',
    accountName: ':IT-Dept:test:Sales Department',
    percentage: 11.11,
  },
  {
    id: 'gsl-5',
    glAccount: 'DEP 1:Bank:NEWSEGMENT:Test Sales',
    accountName: 'BankAccount::test:Sales Department',
    percentage: 11.11,
  },
  {
    id: 'gsl-6',
    glAccount: 'DEP 1:Bank:Name:Test Sales',
    accountName: 'BankAccount::Description:Sales Department',
    percentage: 11.11,
  },
  {
    id: 'gsl-7',
    glAccount: 'IT:Bank:Name:Test Sales',
    accountName: 'BankAccount:IT-Dept:Description:Sales Department',
    percentage: 11.11,
  },
];

export function createSeedPredefinedGlSplits(): PredefinedGlSplit[] {
  return [
    { id: 'pgs-1', splitName: 'eger', lines: egerSplitLines },
    { id: 'pgs-2', splitName: 'esnf', lines: [] },
    { id: 'pgs-3', splitName: 'fg', lines: [] },
    { id: 'pgs-4', splitName: 'New GL 1 Test', lines: [] },
    { id: 'pgs-5', splitName: 'nfkinf', lines: [] },
    { id: 'pgs-6', splitName: 'Split 1', lines: [] },
    { id: 'pgs-7', splitName: 'Tery', lines: [] },
    { id: 'pgs-8', splitName: 'Test Predefined GL 1', lines: [] },
    { id: 'pgs-9', splitName: 'Tetstgs', lines: [] },
  ];
}
