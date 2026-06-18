export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly';

export type BudgetMonthColumn = {
  key: string;
  label: string;
};

export type BudgetLine = {
  id: string;
  account: string;
  description: string;
  amounts: Record<string, number>;
};

export type BudgetConfiguration = {
  id: string;
  name: string;
  period: BudgetPeriod;
  startDate: string;
  endDate: string;
  glLines: BudgetLine[];
  projectLines: BudgetLine[];
};

export const BUDGET_PERIOD_OPTIONS: { value: BudgetPeriod; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export const GL_ACCOUNT_OPTIONS = [
  'DEP 2:TEST ACC:NEWSEGMENT:Test Sales',
  'DEP 1:HR Account:NEWSEGMENT:Test Sales',
  'DEP 1:Bank:Name:Test Sales',
  'IT:TEST ACC:NEWSEGMENT:Test Sales',
];

export const PROJECT_ACCOUNT_OPTIONS = ['E2M', 'Google', 'iPhone', 'Segment 1'];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function formatBudgetDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const month = MONTH_NAMES[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
}

export function formatBudgetDateRange(startDate: string, endDate: string): string {
  return `${formatBudgetDate(startDate)}${formatBudgetDate(endDate)}`;
}

export function getMonthColumns(startDate: string, endDate: string): BudgetMonthColumn[] {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const columns: BudgetMonthColumn[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const endCursor = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= endCursor) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    columns.push({
      key,
      label: MONTH_NAMES[cursor.getMonth()],
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return columns;
}

export function createEmptyAmounts(columns: BudgetMonthColumn[]): Record<string, number> {
  return Object.fromEntries(columns.map((column) => [column.key, 0]));
}

export function formatBudgetAmount(value: number): string {
  return `Rs. ${value.toLocaleString('en-IN')}`;
}

function createBudgetTestLines(columns: BudgetMonthColumn[]): {
  glLines: BudgetLine[];
  projectLines: BudgetLine[];
} {
  const amounts = createEmptyAmounts(columns);
  const aprilKey = columns[0]?.key;
  const glAmounts = { ...amounts };
  const projectAmounts = { ...amounts };
  if (aprilKey) {
    glAmounts[aprilKey] = 5000;
    projectAmounts[aprilKey] = 4000;
  }

  return {
    glLines: [
      {
        id: 'bgl-1',
        account: 'DEP 2:TEST ACC:NEWSEGMENT:Test Sales',
        description: 'DEP 2:TEST ACC:NEWSEGMENT:Test Sales',
        amounts: { ...glAmounts },
      },
      {
        id: 'bgl-2',
        account: 'DEP 1:HR Account:NEWSEGMENT:Test Sales',
        description: 'DEP 1:HR Account:NEWSEGMENT:Test Sales',
        amounts: { ...amounts, [aprilKey ?? '']: 4000 },
      },
    ],
    projectLines: [
      {
        id: 'bpl-1',
        account: 'E2M',
        description: 'E2M',
        amounts: { ...projectAmounts },
      },
      {
        id: 'bpl-2',
        account: 'Google',
        description: 'Google',
        amounts: { ...amounts },
      },
      {
        id: 'bpl-3',
        account: 'Segment 1',
        description: 'Segment 1',
        amounts: { ...amounts },
      },
    ],
  };
}

export function createEmptyBudget(): BudgetConfiguration {
  const startDate = '2028-04-01';
  const endDate = '2029-03-31';
  const columns = getMonthColumns(startDate, endDate);

  return {
    id: `budget-${crypto.randomUUID()}`,
    name: '',
    period: 'monthly',
    startDate,
    endDate,
    glLines: [],
    projectLines: [],
  };
}

export function createSeedBudgets(): BudgetConfiguration[] {
  const budgetTestStart = '2027-04-01';
  const budgetTestEnd = '2028-03-31';
  const budgetTestColumns = getMonthColumns(budgetTestStart, budgetTestEnd);
  const budgetTestLines = createBudgetTestLines(budgetTestColumns);

  return [
    {
      id: 'budget-1',
      name: '2024-2025',
      period: 'monthly',
      startDate: '2025-04-01',
      endDate: '2026-03-31',
      glLines: [],
      projectLines: [],
    },
    {
      id: 'budget-2',
      name: '2026-2027',
      period: 'monthly',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      glLines: [],
      projectLines: [],
    },
    {
      id: 'budget-3',
      name: 'Budget test',
      period: 'monthly',
      startDate: budgetTestStart,
      endDate: budgetTestEnd,
      glLines: budgetTestLines.glLines,
      projectLines: budgetTestLines.projectLines,
    },
    {
      id: 'budget-4',
      name: 'V-2023-2024',
      period: 'monthly',
      startDate: '2023-04-01',
      endDate: '2024-03-31',
      glLines: [],
      projectLines: [],
    },
  ];
}

export function cloneBudget(budget: BudgetConfiguration): BudgetConfiguration {
  return {
    ...budget,
    glLines: budget.glLines.map((line) => ({
      ...line,
      amounts: { ...line.amounts },
    })),
    projectLines: budget.projectLines.map((line) => ({
      ...line,
      amounts: { ...line.amounts },
    })),
  };
}

export function syncLineAmounts(
  lines: BudgetLine[],
  columns: BudgetMonthColumn[],
): BudgetLine[] {
  const empty = createEmptyAmounts(columns);
  return lines.map((line) => ({
    ...line,
    amounts: columns.reduce<Record<string, number>>((acc, column) => {
      acc[column.key] = line.amounts[column.key] ?? 0;
      return acc;
    }, { ...empty }),
  }));
}
