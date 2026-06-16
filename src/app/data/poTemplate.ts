export type PoTemplateMapping = {
  id: string;
  label: string;
  description: string;
  mapped: boolean;
};

export type PoTemplateDraft = {
  fileName: string | null;
  templateName: string;
  isDefault: boolean;
  uploadedAt: string | null;
};

export type GeneratePoDetails = {
  poNumber: string;
  vendorName: string;
  vendorAddress: string;
  orderDate: string;
  requestedBy: string;
  shipTo: string;
  lineItems: { description: string; qty: number; unitPrice: number }[];
};

const STORAGE_KEY = 'eluv8-po-template-draft';

export const PO_TEMPLATE_MAPPINGS: PoTemplateMapping[] = [
  { id: 'po-number', label: 'PO Number', description: 'Header — top right of your document', mapped: true },
  { id: 'vendor', label: 'Vendor Details', description: 'Bill-to / vendor block', mapped: true },
  { id: 'line-items', label: 'Line Items', description: 'Item table rows and columns', mapped: true },
  { id: 'totals', label: 'Totals', description: 'Subtotal, tax, and grand total', mapped: true },
  { id: 'approval', label: 'Approval Section', description: 'Signature and approval lines', mapped: true },
];

export function createDefaultPoTemplateDraft(): PoTemplateDraft {
  return {
    fileName: null,
    templateName: '',
    isDefault: true,
    uploadedAt: null,
  };
}

export function createSampleGeneratePoDetails(): GeneratePoDetails {
  return {
    poNumber: 'PO-2026-0142',
    vendorName: 'Acme Industrial Supply',
    vendorAddress: '4200 Commerce Drive, Austin, TX 78701',
    orderDate: 'Jun 15, 2026',
    requestedBy: 'Natasha Tuber',
    shipTo: 'HQ — Building A, 1200 Main Street, Dallas, TX 75201',
    lineItems: [
      { description: 'Ergonomic office chair — mesh back', qty: 12, unitPrice: 189.0 },
      { description: 'Adjustable monitor arm — dual', qty: 12, unitPrice: 74.5 },
      { description: 'Cable management tray — under desk', qty: 12, unitPrice: 32.0 },
    ],
  };
}

export function loadPoTemplateDraft(): PoTemplateDraft {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultPoTemplateDraft();
    return { ...createDefaultPoTemplateDraft(), ...JSON.parse(raw) };
  } catch {
    return createDefaultPoTemplateDraft();
  }
}

export function savePoTemplateDraft(draft: PoTemplateDraft): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearPoTemplateDraft(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export function lineItemsTotal(items: GeneratePoDetails['lineItems']): number {
  return items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
}
