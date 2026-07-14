export const EXPORT_DATASETS = [
  { id: 'purchase-request', label: 'Purchase Request' },
  { id: 'purchase-order', label: 'Purchase Order' },
  { id: 'invoice', label: 'Invoice' },
  { id: 'expense', label: 'Expense' },
] as const;

export type ExportDatasetId = (typeof EXPORT_DATASETS)[number]['id'];

export const PURCHASE_REQUEST_TYPES = [
  'Standard Purchase Request',
  'CAPEX',
  'Blanket Request',
] as const;

export const EXPORT_FORMATS = [
  { id: 'xlsx', label: 'Excel (.xlsx)' },
  { id: 'csv', label: 'CSV (.csv)' },
  { id: 'pdf', label: 'PDF (.pdf)' },
] as const;

export type ExportFormatId = (typeof EXPORT_FORMATS)[number]['id'];

/** Purchase Request export columns — matches legacy export field set (26 fields). */
export const PURCHASE_REQUEST_COLUMNS = [
  'Purchase Requisition Type',
  'PR Number',
  'Request Header Description',
  'Request Status',
  'Requester',
  'Request Owner',
  'Req Approval Date',
  'VendorId',
  'Vendor Name',
  'Item ID',
  'Line Number',
  'Item Description',
  'Unit of Measure',
  'Unit Cost',
  'Order Qty',
  'GL Account',
  'Department',
  'Project',
  'Ship To Address',
  'Need By Date',
  'Created Date',
  'Currency',
  'Line Total',
  'Total Amount',
  'PO Number',
  'Notes',
] as const;

export type PurchaseRequestColumn = (typeof PURCHASE_REQUEST_COLUMNS)[number];

export function getColumnsForDataset(datasetId: ExportDatasetId): readonly string[] {
  switch (datasetId) {
    case 'purchase-request':
      return PURCHASE_REQUEST_COLUMNS;
    default:
      return ['ID', 'Name', 'Status', 'Created Date', 'Owner', 'Amount'];
  }
}

export function getRequestTypesForDataset(datasetId: ExportDatasetId): readonly string[] | null {
  if (datasetId === 'purchase-request') return PURCHASE_REQUEST_TYPES;
  return null;
}
