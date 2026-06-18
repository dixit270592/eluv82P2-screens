export type ApprovalLevel = {
  id: string;
  label: string;
  lowerLimit: number;
  upperLimit: number;
};

export type GlobalApproval = {
  id: string;
  name: string;
  triggerType: string;
  triggerValue: string;
  limitStepSize: number;
  levels: ApprovalLevel[];
  active: boolean;
};

export const TRIGGER_TYPES = ['Request Type', 'Department', 'Vendor', 'Amount'] as const;

export const TRIGGER_VALUES: Record<string, string[]> = {
  'Request Type': ['Standard Purchase Request', 'Expense', 'Capital Request'],
  Department: ['IT', 'Finance', 'Operations', 'HR'],
  Vendor: ['Preferred Vendor', 'New Vendor'],
  Amount: ['Over $5,000', 'Over $25,000'],
};

const LEVEL_ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'] as const;

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createEmptyLevel(index: number, lowerLimit = 0, upperLimit = 100): ApprovalLevel {
  return {
    id: newId('level'),
    label: index === 0 ? 'Level 1' : (LEVEL_ORDINALS[index - 1] ?? `Level ${index + 1}`),
    lowerLimit,
    upperLimit,
  };
}

export function cloneGlobalApproval(approval: GlobalApproval): GlobalApproval {
  return {
    ...approval,
    levels: approval.levels.map((l) => ({ ...l })),
  };
}

export function createSeedGlobalApprovals(): GlobalApproval[] {
  return [
    {
      id: 'ga-general',
      name: 'General Approval',
      triggerType: 'Request Type',
      triggerValue: 'Standard Purchase Request',
      limitStepSize: 1_000_000,
      levels: [
        { id: 'lv-1', label: 'First', lowerLimit: 0, upperLimit: 200 },
        { id: 'lv-2', label: 'Second', lowerLimit: 200.01, upperLimit: 2500 },
        { id: 'lv-3', label: 'Third', lowerLimit: 2500.01, upperLimit: 5000 },
      ],
      active: true,
    },
    {
      id: 'ga-zap',
      name: 'ZAP',
      triggerType: 'Department',
      triggerValue: 'IT',
      limitStepSize: 100,
      levels: [{ id: 'lv-z1', label: 'Level 1', lowerLimit: 0, upperLimit: 100 }],
      active: true,
    },
  ];
}

export function levelsSummary(levels: ApprovalLevel[]): string {
  if (levels.length === 0) return '—';
  return levels[levels.length - 1]?.label ?? `Level ${levels.length}`;
}

export function addLevelFromStep(levels: ApprovalLevel[], stepSize: number): ApprovalLevel[] {
  const last = levels[levels.length - 1];
  const lower = last ? Number((last.upperLimit + 0.01).toFixed(2)) : 0;
  const upper = Number((lower + stepSize - 0.01).toFixed(2));
  return [...levels, createEmptyLevel(levels.length, lower, Math.max(lower, upper))];
}

export function formatLimit(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
}
