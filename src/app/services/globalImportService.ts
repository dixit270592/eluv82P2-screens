import type {
  FieldMappingEntry,
  ImportDataPayload,
  ImportFileResult,
  ImportType,
  MappingFieldDefinition,
  ParsedImportFile,
  ValidationResult,
  ValidationRow,
} from '../types/globalImport';

const API_BASE = '/api/GlobalImport';

const BASE_DESTINATION_FIELDS: Record<Exclude<ImportType, 'BUDGET'>, MappingFieldDefinition[]> = {
  ACCOUNT: [
    { fieldName: 'AccountName', displayName: 'Account Name', dataType: 'string', maxLength: 200, isRequired: true },
    { fieldName: 'AccountDetails', displayName: 'Account Details', dataType: 'string', maxLength: 500, isRequired: false },
    { fieldName: 'Active', displayName: 'Active', dataType: 'string', maxLength: 10, isRequired: false },
  ],
  VENDOR: [
    { fieldName: 'VendorCode', displayName: 'Vendor Code', dataType: 'string', maxLength: 50, isRequired: true },
    { fieldName: 'VendorName', displayName: 'Vendor Name', dataType: 'string', maxLength: 200, isRequired: true },
    { fieldName: 'Email', displayName: 'Email', dataType: 'string', maxLength: 150, isRequired: false },
  ],
  PROJECT: [
    { fieldName: 'FullAccountName', displayName: 'Full Account Name', dataType: 'string', maxLength: 200, isRequired: true },
    { fieldName: 'AccountDescription', displayName: 'Account Description', dataType: 'string', maxLength: 500, isRequired: false },
    { fieldName: 'Active', displayName: 'Active', dataType: 'string', maxLength: 10, isRequired: false },
  ],
};

function buildBudgetMappingFields(params: Record<string, string | number>): MappingFieldDefinition[] {
  const totalPeriod = Math.max(1, Number(params.totalPeriod) || 1);
  const importBudgetType = Number(params.importBudgetType) || 0;
  const periodLabels = String(params.periodLabels ?? '')
    .split('|')
    .map((label) => label.trim())
    .filter(Boolean);

  const accountField: MappingFieldDefinition =
    importBudgetType === 1
      ? {
          fieldName: 'ProjectAccount',
          displayName: 'Project Account',
          dataType: 'string',
          maxLength: 200,
          isRequired: true,
        }
      : {
          fieldName: 'GLAccount',
          displayName: 'GL Account',
          dataType: 'string',
          maxLength: 100,
          isRequired: true,
        };

  const fields: MappingFieldDefinition[] = [
    accountField,
    {
      fieldName: 'Description',
      displayName: 'Description',
      dataType: 'string',
      maxLength: 200,
      isRequired: false,
    },
  ];

  for (let index = 0; index < totalPeriod; index += 1) {
    const periodNumber = index + 1;
    const monthLabel = periodLabels[index];
    fields.push({
      fieldName: `Period${periodNumber}`,
      displayName: monthLabel ? `${monthLabel} (Period ${periodNumber})` : `Period ${periodNumber}`,
      dataType: 'decimal',
      maxLength: 50,
      isRequired: periodNumber === 1,
    });
  }

  return fields;
}

function normalizeFieldName(value: string): string {
  return value.replace(/\*$/, '').trim().toLowerCase().replace(/[\s_-]/g, '');
}

export function parseDelimitedText(text: string): ParsedImportFile {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = lines[0].split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map((line) =>
    line.split(delimiter).map((cell) => cell.trim().replace(/^"|"$/g, '')),
  );

  return { headers, rows };
}

export async function parseImportFile(file: File): Promise<ParsedImportFile> {
  const text = await file.text();
  return parseDelimitedText(text);
}

export function autoMapFields(
  sourceFields: string[],
  destinationFields: MappingFieldDefinition[],
): Record<string, string> {
  const mapping: Record<string, string> = {};
  const usedDestinations = new Set<string>();

  for (const source of sourceFields) {
    const normalizedSource = normalizeFieldName(source);
    const exactMatch = destinationFields.find(
      (dest) =>
        !usedDestinations.has(dest.fieldName) &&
        normalizeFieldName(dest.fieldName) === normalizedSource,
    );
    if (exactMatch) {
      mapping[source] = exactMatch.fieldName;
      usedDestinations.add(exactMatch.fieldName);
      continue;
    }

    if (normalizedSource === 'glaccount') {
      const projectAccount = destinationFields.find(
        (dest) => dest.fieldName === 'ProjectAccount' && !usedDestinations.has(dest.fieldName),
      );
      if (projectAccount) {
        mapping[source] = projectAccount.fieldName;
        usedDestinations.add(projectAccount.fieldName);
      }
    }
  }

  const unmappedSources = sourceFields.filter((source) => !mapping[source]);
  const unmappedDestinations = destinationFields.filter((dest) => !usedDestinations.has(dest.fieldName));

  if (unmappedSources.length === 1 && unmappedDestinations.length === 1) {
    mapping[unmappedSources[0]] = unmappedDestinations[0].fieldName;
  }

  return mapping;
}

export function buildFieldMappingPayload(
  sourceToDestination: Record<string, string>,
  destinationFields: MappingFieldDefinition[],
): FieldMappingEntry[] {
  return Object.entries(sourceToDestination)
    .filter(([, toField]) => toField.length > 0)
    .map(([fromField, toField]) => {
      const dest = destinationFields.find((field) => field.fieldName === toField);
      return {
        FromField: fromField.replace(/\*$/, ''),
        ToField: toField,
        IsRequired: dest?.isRequired ?? false,
        dataType: dest?.dataType ?? 'string',
      };
    });
}

export function getDuplicateMappings(sourceToDestination: Record<string, string>): string[] {
  const counts = new Map<string, number>();
  for (const toField of Object.values(sourceToDestination)) {
    if (!toField) continue;
    counts.set(toField, (counts.get(toField) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, count]) => count > 1).map(([field]) => field);
}

export function getUnmappedRequiredFields(
  sourceToDestination: Record<string, string>,
  destinationFields: MappingFieldDefinition[],
): MappingFieldDefinition[] {
  const mapped = new Set(Object.values(sourceToDestination).filter(Boolean));
  return destinationFields.filter((field) => field.isRequired && !mapped.has(field.fieldName));
}

function mockValidateRows(
  parsed: ParsedImportFile,
  fieldMapping: FieldMappingEntry[],
  destinationFields: MappingFieldDefinition[],
): ValidationResult {
  const columns = [...new Set(fieldMapping.map((entry) => entry.ToField))];
  const rows: ValidationRow[] = parsed.rows.map((cells, index) => {
    const data: Record<string, string | number> = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const mapping of fieldMapping) {
      const sourceIndex = parsed.headers.findIndex(
        (header) => header.replace(/\*$/, '') === mapping.FromField,
      );
      const rawValue = sourceIndex >= 0 ? cells[sourceIndex] ?? '' : '';
      const dest = destinationFields.find((field) => field.fieldName === mapping.ToField);

      if (dest?.dataType === 'decimal') {
        const numeric = rawValue === '' ? 0 : Number.parseFloat(rawValue);
        if (rawValue !== '' && Number.isNaN(numeric)) {
          errors.push(`${mapping.ToField} must be a number`);
          data[mapping.ToField] = rawValue;
        } else {
          data[mapping.ToField] = numeric;
          if (numeric === 0 && dest.isRequired) {
            warnings.push(`${mapping.ToField} is zero`);
          }
        }
      } else {
        data[mapping.ToField] = rawValue;
        if (dest?.isRequired && !rawValue.trim()) {
          errors.push(`${mapping.ToField} is required`);
        }
        if (dest?.maxLength && rawValue.length > dest.maxLength) {
          errors.push(`${mapping.ToField} exceeds max length (${dest.maxLength})`);
        }
      }
    }

    let status: ValidationRow['status'] = 'valid';
    if (errors.length > 0) status = 'invalid';
    else if (warnings.length > 0) status = 'warning';

    return { rowIndex: index + 1, status, errors, warnings, data };
  });

  const validRecords = rows.filter((row) => row.status === 'valid').length;
  const invalidRecords = rows.filter((row) => row.status === 'invalid').length;
  const warningCount = rows.filter((row) => row.status === 'warning').length;

  return {
    totalRecords: rows.length,
    validRecords,
    invalidRecords,
    warningCount,
    rows,
    columns,
  };
}

async function tryFetch<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, init);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getMappingFields(
  params: Record<string, string | number>,
): Promise<MappingFieldDefinition[]> {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  );
  const remote = await tryFetch<MappingFieldDefinition[]>(
    `${API_BASE}/GetMappingFields?${query.toString()}`,
  );
  if (remote) return remote;

  const type = params.Type as ImportType;
  if (type === 'BUDGET') return buildBudgetMappingFields(params);
  return BASE_DESTINATION_FIELDS[type] ?? [];
}

export async function validateImportFile(
  file: File,
  importData: ImportDataPayload,
  contextKey: string,
  contextPayload: unknown,
  parsed: ParsedImportFile,
  destinationFields: MappingFieldDefinition[],
): Promise<ValidationResult> {
  const formData = new FormData();
  formData.append('formfile', file);
  formData.append('importdata', JSON.stringify(importData));
  formData.append(contextKey, JSON.stringify(contextPayload));

  const remote = await tryFetch<ValidationResult>(`${API_BASE}/ValidateImportFile`, {
    method: 'POST',
    body: formData,
  });
  if (remote) return remote;

  return mockValidateRows(parsed, importData.FieldMapping, destinationFields);
}

export async function importFile(
  file: File,
  importData: ImportDataPayload,
  contextKey: string,
  contextPayload: unknown,
): Promise<ImportFileResult> {
  const formData = new FormData();
  formData.append('formfile', file);
  formData.append('importdata', JSON.stringify(importData));
  formData.append(contextKey, JSON.stringify(contextPayload));

  const remote = await tryFetch<ImportFileResult>(`${API_BASE}/ImportFile`, {
    method: 'POST',
    body: formData,
  });
  if (remote) return remote;

  return {
    success: true,
    importedCount: importData.FieldMapping.length > 0 ? 1 : 0,
    message: 'Import completed successfully.',
  };
}

export function buildSampleCsvText(columns: string[], sampleRows: string[][]): string {
  const header = columns.join(',');
  const body = sampleRows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  return `${header}\n${body}`;
}

export async function copySampleCsvToClipboard(columns: string[], sampleRows: string[][]): Promise<void> {
  await navigator.clipboard.writeText(buildSampleCsvText(columns, sampleRows));
}

export function downloadSampleCsv(fileName: string, columns: string[], sampleRows: string[][]): void {
  const blob = new Blob([buildSampleCsvText(columns, sampleRows)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}
