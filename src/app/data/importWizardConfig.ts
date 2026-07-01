import { getMonthColumns, type BudgetConfiguration, type BudgetPeriod } from './budgetSetup';
import type { ImportType } from '../types/globalImport';

export type ImportWizardConfig = {
  type: ImportType;
  title: string;
  sampleFileName: string;
  acceptedFileTypes: string;
  sampleColumns: string[];
  sampleRows: string[][];
  contextPayloadKey: string;
  buildContextPayload: (context?: Record<string, unknown>) => unknown;
  getMappingParams: (context?: Record<string, unknown>) => Record<string, string | number>;
};

function capitalizePeriod(period: BudgetPeriod): string {
  return period.charAt(0).toUpperCase() + period.slice(1);
}

function buildBudgetContext(budget: BudgetConfiguration, importBudgetType = 0) {
  const monthColumns = getMonthColumns(budget.startDate, budget.endDate);
  return {
    id: budget.id,
    budgetName: budget.name.trim() || 'Untitled budget',
    definePeriod: capitalizePeriod(budget.period),
    startDate: new Date(`${budget.startDate}T00:00:00`).toISOString(),
    endDate: new Date(`${budget.endDate}T00:00:00`).toISOString(),
    totalPeriod: monthColumns.length,
    importBudgetType,
  };
}

export const BUDGET_IMPORT_CONFIG: ImportWizardConfig = {
  type: 'BUDGET',
  title: 'Import Budget Data',
  sampleFileName: 'elements_budget_data_sample.csv',
  acceptedFileTypes: '.csv,.xlsx,.xls',
  sampleColumns: ['GLAccount', 'Description', 'Period1'],
  sampleRows: [
    ['DEP 2:TEST ACC:Name:Test Sales', 'Test Sales budget line', '5000'],
    ['DEP 1:HR Account:Name:Test Sales', 'HR allocation', '4000'],
  ],
  contextPayloadKey: 'budgetData',
  buildContextPayload: (context) => {
    const budget = context?.budget as BudgetConfiguration;
    const importBudgetType = (context?.importBudgetType as number) ?? 0;
    return buildBudgetContext(budget, importBudgetType);
  },
  getMappingParams: (context) => {
    const budget = context?.budget as BudgetConfiguration;
    const monthColumns = getMonthColumns(budget.startDate, budget.endDate);
    const importBudgetType = (context?.importBudgetType as number) ?? 0;
    return {
      Type: 'BUDGET',
      budgetPeriod: capitalizePeriod(budget.period),
      totalPeriod: monthColumns.length,
      importBudgetType,
      periodLabels: monthColumns.map((column) => column.label).join('|'),
    };
  },
};

export const ACCOUNT_SEGMENT_IMPORT_CONFIG: ImportWizardConfig = {
  type: 'ACCOUNT',
  title: 'Import Segment Data',
  sampleFileName: 'elements_account_segment_sample.csv',
  acceptedFileTypes: '.csv,.xlsx,.xls',
  sampleColumns: ['SegmentType', 'SegmentData', 'Description'],
  sampleRows: [
    ['Department', 'DEP 1', 'Primary department segment'],
    ['Account', 'TEST ACC', 'Test account segment'],
  ],
  contextPayloadKey: 'accountData',
  buildContextPayload: () => ({ importScope: 'segment' }),
  getMappingParams: () => ({ Type: 'ACCOUNT', importScope: 'segment' }),
};

export const ACCOUNT_DATA_IMPORT_CONFIG: ImportWizardConfig = {
  type: 'ACCOUNT',
  title: 'Import Account Data',
  sampleFileName: 'elements_account_data_sample.csv',
  acceptedFileTypes: '.csv,.xlsx,.xls',
  sampleColumns: ['AccountName', 'AccountDetails', 'Active'],
  sampleRows: [
    ['DEP 1:TEST ACC:Name:Test Sales', 'Sales department account', 'Yes'],
    ['DEP 2:HR Account:Name:Test Sales', 'HR department account', 'Yes'],
  ],
  contextPayloadKey: 'accountData',
  buildContextPayload: () => ({ importScope: 'account' }),
  getMappingParams: () => ({ Type: 'ACCOUNT', importScope: 'account' }),
};

export const VENDOR_IMPORT_CONFIG: ImportWizardConfig = {
  type: 'VENDOR',
  title: 'Import Vendor Data',
  sampleFileName: 'elements_vendor_data_sample.csv',
  acceptedFileTypes: '.csv,.xlsx,.xls',
  sampleColumns: ['VendorCode', 'VendorName', 'Email'],
  sampleRows: [
    ['VND-001', 'Acme Supplies Ltd.', 'orders@acme.example'],
    ['VND-002', 'Global Office Co.', 'sales@global.example'],
  ],
  contextPayloadKey: 'vendorData',
  buildContextPayload: () => ({}),
  getMappingParams: () => ({ Type: 'VENDOR' }),
};

export const PROJECT_SEGMENT_IMPORT_CONFIG: ImportWizardConfig = {
  type: 'PROJECT',
  title: 'Import Project Segment Data',
  sampleFileName: 'elements_project_segment_sample.csv',
  acceptedFileTypes: '.csv,.xlsx,.xls',
  sampleColumns: ['SegmentType', 'SegmentData', 'Description'],
  sampleRows: [
    ['Project', 'E2M', 'Enterprise project segment'],
    ['Project', 'Google', 'Google initiative'],
  ],
  contextPayloadKey: 'projectData',
  buildContextPayload: () => ({ importScope: 'segment' }),
  getMappingParams: () => ({ Type: 'PROJECT', importScope: 'segment' }),
};

export const PROJECT_DATA_IMPORT_CONFIG: ImportWizardConfig = {
  type: 'PROJECT',
  title: 'Import Project Data',
  sampleFileName: 'elements_project_data_sample.csv',
  acceptedFileTypes: '.csv,.xlsx,.xls',
  sampleColumns: ['FullAccountName', 'AccountDescription', 'Active'],
  sampleRows: [
    ['E2M:Phase1:Build', 'Enterprise build phase', 'Yes'],
    ['Google:Ads:Q1', 'Google ads project', 'Yes'],
  ],
  contextPayloadKey: 'projectData',
  buildContextPayload: () => ({ importScope: 'project' }),
  getMappingParams: () => ({ Type: 'PROJECT', importScope: 'project' }),
};
