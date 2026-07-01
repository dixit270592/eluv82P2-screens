export type ImportType = 'BUDGET' | 'ACCOUNT' | 'VENDOR' | 'PROJECT';

export type FieldMappingEntry = {
  FromField: string;
  ToField: string;
  IsRequired: boolean;
  dataType: string;
};

export type ImportDataPayload = {
  Type: ImportType;
  FieldMapping: FieldMappingEntry[];
};

export type MappingFieldDefinition = {
  fieldName: string;
  displayName: string;
  dataType: string;
  maxLength: number;
  isRequired: boolean;
};

export type ParsedImportFile = {
  headers: string[];
  rows: string[][];
};

export type ValidationRowStatus = 'valid' | 'invalid' | 'warning';

export type ValidationRow = {
  rowIndex: number;
  status: ValidationRowStatus;
  errors: string[];
  warnings: string[];
  data: Record<string, string | number>;
};

export type ValidationResult = {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  warningCount: number;
  rows: ValidationRow[];
  columns: string[];
};

export type ImportFileResult = {
  success: boolean;
  importedCount: number;
  message?: string;
};

export type BudgetImportContext = {
  id: string;
  budgetName: string;
  definePeriod: string;
  startDate: string;
  endDate: string;
  totalPeriod: number;
  importBudgetType: number;
};
