export type PortalSection = 'rfq' | 'po' | 'invoice';

export type PortalLineItem = {
  id: string;
  description: string;
  deliveryLocation: string;
  shippingMethod: string;
  requiredBy: string;
  qty: number;
  unitPrice: number;
  partNumber?: string;
  uom?: string;
  tax?: number;
};

export type PortalHistoryEntry = {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
};

export type InvoiceWorkflowStatus = 'extracted' | 'pending_verification' | 'approved';

export type InvoiceExtractedField = {
  id: string;
  label: string;
  value: string;
  required?: boolean;
  confidence: number;
};

export type InvoiceFieldSection = {
  id: string;
  title: string;
  fields: InvoiceExtractedField[];
};

export type InvoiceMeta = {
  aiConfidence: number;
  workflowStatus: InvoiceWorkflowStatus;
  isNonPo: boolean;
  linkedPoNumber?: string;
  verificationLabel: string;
  needsAttention?: boolean;
  vendorEmail?: string;
  amount: number;
  fieldSections: InvoiceFieldSection[];
};

export type PortalDocument = {
  id: string;
  vendorId: string;
  type: PortalSection;
  documentNumber: string;
  organization: string;
  contact: string;
  date: string;
  listTimestamp: string;
  lineItems: PortalLineItem[];
  history: PortalHistoryEntry[];
  invoiceMeta?: InvoiceMeta;
};

const ORG_NAME = "Eric's Tenant-Do Not Change";

function rfqLineItems(): PortalLineItem[] {
  return [
    {
      id: 'li-1',
      description: 'paper',
      deliveryLocation: 'NY Office, Loading Dock',
      shippingMethod: 'Fed Ex',
      requiredBy: 'May-12-2026',
      qty: 11,
      unitPrice: 0,
      partNumber: '',
    },
    {
      id: 'li-2',
      description: 'Pens',
      deliveryLocation: 'NY Office, Loading Dock',
      shippingMethod: 'Fed Ex',
      requiredBy: 'May-12-2026',
      qty: 1,
      unitPrice: 0,
      partNumber: '',
    },
    {
      id: 'li-rfq-3',
      description: 'Sticky notes',
      deliveryLocation: 'NY Office, Loading Dock',
      shippingMethod: 'Fed Ex',
      requiredBy: 'May-12-2026',
      qty: 5,
      unitPrice: 0,
      partNumber: '',
    },
    {
      id: 'li-rfq-4',
      description: 'Printer paper ream',
      deliveryLocation: 'NY Office, Loading Dock',
      shippingMethod: 'Fed Ex',
      requiredBy: 'May-12-2026',
      qty: 3,
      unitPrice: 0,
      partNumber: '',
    },
    {
      id: 'li-rfq-5',
      description: 'File folders',
      deliveryLocation: 'NY Office, Loading Dock',
      shippingMethod: 'Fed Ex',
      requiredBy: 'May-12-2026',
      qty: 8,
      unitPrice: 0,
      partNumber: '',
    },
    {
      id: 'li-rfq-6',
      description: 'Whiteboard markers',
      deliveryLocation: 'NY Office, Loading Dock',
      shippingMethod: 'Fed Ex',
      requiredBy: 'May-12-2026',
      qty: 2,
      unitPrice: 0,
      partNumber: '',
    },
  ];
}

function poLineItems(): PortalLineItem[] {
  return [
    {
      id: 'li-po-1',
      description: 'Laser toner cartridge',
      deliveryLocation: 'Chicago HQ, Receiving',
      shippingMethod: 'UPS Ground',
      requiredBy: 'Jun-01-2026',
      qty: 4,
      unitPrice: 89.5,
    },
    {
      id: 'li-po-2',
      description: 'USB-C docking station',
      deliveryLocation: 'Chicago HQ, Receiving',
      shippingMethod: 'UPS Ground',
      requiredBy: 'Jun-01-2026',
      qty: 2,
      unitPrice: 245,
    },
  ];
}

function invoiceLineItems(): PortalLineItem[] {
  return [
    {
      id: 'li-inv-1',
      description: 'Monthly SaaS subscription',
      deliveryLocation: 'Digital delivery',
      shippingMethod: 'N/A',
      requiredBy: 'May-31-2026',
      qty: 1,
      unitPrice: 1250,
    },
  ];
}

function invoice203LineItems(): PortalLineItem[] {
  return [
    {
      id: 'li-inv3-1',
      description: 'Enterprise workspace license',
      deliveryLocation: 'Digital delivery',
      shippingMethod: 'N/A',
      requiredBy: 'May-28-2026',
      qty: 12,
      unitPrice: 89.99,
      uom: 'Each',
      tax: 0,
    },
    {
      id: 'li-inv3-2',
      description: 'Premium support package',
      deliveryLocation: 'Digital delivery',
      shippingMethod: 'N/A',
      requiredBy: 'May-28-2026',
      qty: 1,
      unitPrice: 450,
      uom: 'Each',
      tax: 0,
    },
    {
      id: 'li-inv3-3',
      description: 'Implementation services',
      deliveryLocation: 'Digital delivery',
      shippingMethod: 'N/A',
      requiredBy: 'May-28-2026',
      qty: 2,
      unitPrice: 200,
      uom: 'Each',
      tax: 0,
    },
    {
      id: 'li-inv3-4',
      description: 'Training session',
      deliveryLocation: 'Digital delivery',
      shippingMethod: 'N/A',
      requiredBy: 'May-28-2026',
      qty: 1,
      unitPrice: 350,
      uom: 'Each',
      tax: 0,
    },
    {
      id: 'li-inv3-5',
      description: 'Hardware security dongle',
      deliveryLocation: 'Digital delivery',
      shippingMethod: 'N/A',
      requiredBy: 'May-28-2026',
      qty: 5,
      unitPrice: 40,
      uom: 'Each',
      tax: 0,
    },
  ];
}

function invoice202LineItems(): PortalLineItem[] {
  return [
    {
      id: 'li-inv202-1',
      description: 'Monthly renewal',
      deliveryLocation: 'Digital delivery',
      shippingMethod: 'N/A',
      requiredBy: 'May-31-2026',
      qty: 10,
      unitPrice: 50,
      uom: 'Each',
      tax: 0,
    },
  ];
}

function invoiceExtractedSections(
  docNumber: string,
  vendorName: string,
  lineItems: PortalLineItem[],
  poNumber?: string,
  vendorEmail = 'ap@asana.com',
  totalAmount?: number,
): InvoiceFieldSection[] {
  const amount =
    totalAmount ?? lineItems.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
  const amountStr = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const poDisplay = poNumber?.trim() ? poNumber : '—';

  const header: InvoiceFieldSection = {
    id: 'header',
    title: 'Invoice details',
    fields: [
      { id: 'f-inv', label: 'Invoice number', value: docNumber, required: true, confidence: 98.6 },
      {
        id: 'f-po',
        label: 'PO number',
        value: poDisplay,
        required: true,
        confidence: poNumber?.trim() ? 94.2 : 98.5,
      },
      { id: 'f-vendor', label: 'Vendor name', value: vendorName, confidence: 90 },
      { id: 'f-email', label: 'Vendor email', value: vendorEmail, confidence: 95 },
      {
        id: 'f-amt',
        label: 'Amount',
        value: amountStr,
        required: true,
        confidence: 98.7,
      },
    ],
  };

  const lineSections = lineItems.map((line, index) => {
    const itemNum = index + 1;
    const lineAmount = line.qty * line.unitPrice;
    const lineAmountStr = lineAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const taxStr = (line.tax ?? 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return {
      id: `line-${line.id}`,
      title: `Line item ${itemNum}`,
      fields: [
        {
          id: `${line.id}-desc`,
          label: 'Description',
          value: line.description,
          required: true,
          confidence: 93.7,
        },
        {
          id: `${line.id}-qty`,
          label: 'Quantity',
          value: String(line.qty),
          required: true,
          confidence: 95.6,
        },
        {
          id: `${line.id}-amt`,
          label: 'Line amount',
          value: lineAmountStr,
          required: true,
          confidence: 95.6,
        },
        {
          id: `${line.id}-uom`,
          label: 'Unit of measure',
          value: line.uom ?? 'Each',
          confidence: 95.5,
        },
        {
          id: `${line.id}-tax`,
          label: 'Tax',
          value: taxStr,
          confidence: 95.5,
        },
      ],
    };
  });

  return [header, ...lineSections];
}

export function invoiceHasLowConfidenceFields(meta: InvoiceMeta): boolean {
  return meta.fieldSections.some((section) =>
    section.fields.some((field) => getConfidenceTone(field.confidence) === 'low'),
  );
}

const EMPTY_FIELD_PLACEHOLDERS = new Set(['—', '-', '–']);

export function isInvoiceFieldValueValid(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && !EMPTY_FIELD_PLACEHOLDERS.has(trimmed);
}

export function areInvoiceRequiredFieldsComplete(meta: InvoiceMeta): boolean {
  return meta.fieldSections.every((section) =>
    section.fields.every(
      (field) => !field.required || isInvoiceFieldValueValid(field.value),
    ),
  );
}

function invoiceHistory(docNumber: string, confidence: number): PortalHistoryEntry[] {
  return [
    {
      id: 'h-ai-1',
      actor: 'AI',
      action: `Invoice Created — automatically extracted from AP inbox with ${confidence.toFixed(2)}% confidence`,
      timestamp: '05/26/2026 at 10:52 AM',
    },
    {
      id: 'h-ai-2',
      actor: 'Elements Admin',
      action: `added a verification note for ${docNumber}`,
      timestamp: '05/26/2026 at 11:04 AM',
    },
  ];
}

function baseHistory(docLabel: string, docNumber: string): PortalHistoryEntry[] {
  return [
    {
      id: 'h-1',
      actor: 'Elements Admin',
      action: `added a additional note test`,
      timestamp: '05/26/2026 at 10:52 AM',
    },
    {
      id: 'h-2',
      actor: 'Elements Admin',
      action: `${docLabel} ${docNumber} request a quote for paper, Pens`,
      timestamp: '05/26/2026 at 10:52 AM',
    },
  ];
}

export function createVendorPortalDocuments(vendorId: string, vendorName: string): PortalDocument[] {
  const contact = `${vendorName} vendor admin`;

  return [
    {
      id: `${vendorId}-rfq-1`,
      vendorId,
      type: 'rfq',
      documentNumber: 'RFQ-0000001',
      organization: ORG_NAME,
      contact,
      date: '05/26/2026',
      listTimestamp: '05/26/2026 at 10:52 AM',
      lineItems: rfqLineItems(),
      history: baseHistory('RFQ', 'RFQ-0000001'),
    },
    {
      id: `${vendorId}-rfq-2`,
      vendorId,
      type: 'rfq',
      documentNumber: 'RFQ-0000002',
      organization: ORG_NAME,
      contact,
      date: '05/20/2026',
      listTimestamp: '05/20/2026 at 2:15 PM',
      lineItems: [
        {
          id: 'li-3',
          description: 'Office chairs',
          deliveryLocation: 'Boston Office',
          shippingMethod: 'Fed Ex',
          requiredBy: 'Jun-15-2026',
          qty: 6,
          unitPrice: 0,
        },
      ],
      history: [
        {
          id: 'h-3',
          actor: 'Procurement Team',
          action: 'RFQ RFQ-0000002 sent for vendor quote',
          timestamp: '05/20/2026 at 2:15 PM',
        },
      ],
    },
    {
      id: `${vendorId}-po-1`,
      vendorId,
      type: 'po',
      documentNumber: 'PO-0001042',
      organization: ORG_NAME,
      contact,
      date: '05/18/2026',
      listTimestamp: '05/18/2026 at 9:30 AM',
      lineItems: poLineItems(),
      history: [
        {
          id: 'h-po-1',
          actor: 'Buyer',
          action: 'PO PO-0001042 issued to vendor',
          timestamp: '05/18/2026 at 9:30 AM',
        },
      ],
    },
    {
      id: `${vendorId}-po-2`,
      vendorId,
      type: 'po',
      documentNumber: 'PO-0001038',
      organization: ORG_NAME,
      contact,
      date: '05/10/2026',
      listTimestamp: '05/10/2026 at 11:00 AM',
      lineItems: [
        {
          id: 'li-po-3',
          description: 'Network switch 48-port',
          deliveryLocation: 'Dallas DC',
          shippingMethod: 'Fed Ex',
          requiredBy: 'May-25-2026',
          qty: 1,
          unitPrice: 1899,
        },
      ],
      history: [
        {
          id: 'h-po-2',
          actor: 'Buyer',
          action: 'PO PO-0001038 acknowledged by vendor',
          timestamp: '05/10/2026 at 11:00 AM',
        },
      ],
    },
    {
      id: `${vendorId}-inv-1`,
      vendorId,
      type: 'invoice',
      documentNumber: 'INV202',
      organization: ORG_NAME,
      contact,
      date: '05/28/2026',
      listTimestamp: '05/28/2026',
      lineItems: invoice202LineItems(),
      invoiceMeta: {
        aiConfidence: 95.66,
        workflowStatus: 'extracted',
        isNonPo: true,
        verificationLabel: 'Pending Verification',
        amount: 500,
        vendorEmail: 'aasana@satvasolutions.com',
        fieldSections: invoiceExtractedSections(
          'INV202',
          'Aasana Lalani',
          invoice202LineItems(),
          undefined,
          'aasana@satvasolutions.com',
          500,
        ),
      },
      history: invoiceHistory('INV202', 95.66),
    },
    {
      id: `${vendorId}-inv-2`,
      vendorId,
      type: 'invoice',
      documentNumber: 'INV203',
      organization: ORG_NAME,
      contact,
      date: '05/28/2026',
      listTimestamp: '05/28/2026',
      lineItems: invoice203LineItems(),
      invoiceMeta: {
        aiConfidence: 95.59,
        workflowStatus: 'pending_verification',
        isNonPo: true,
        verificationLabel: 'Pending Verification',
        amount: 2479.88,
        vendorEmail: 'ap@asana.com',
        fieldSections: (() => {
          const sections = invoiceExtractedSections(
            'INV203',
            'Asana',
            invoice203LineItems(),
            undefined,
            'ap@asana.com',
            2479.88,
          );
          sections[0].fields = sections[0].fields.map((field) =>
            field.id === 'f-po' ? { ...field, confidence: 42.1 } : field,
          );
          return sections;
        })(),
      },
      history: invoiceHistory('INV203', 95.59),
    },
    {
      id: `${vendorId}-inv-3`,
      vendorId,
      type: 'invoice',
      documentNumber: 'INV201',
      organization: ORG_NAME,
      contact,
      date: '05/27/2026',
      listTimestamp: '05/27/2026',
      lineItems: [
        {
          id: 'li-inv2-1',
          description: 'Hardware maintenance',
          deliveryLocation: 'On-site',
          shippingMethod: 'N/A',
          requiredBy: 'Apr-30-2026',
          qty: 1,
          unitPrice: 3200,
          uom: 'Each',
          tax: 0,
        },
      ],
      invoiceMeta: {
        aiConfidence: 88.14,
        workflowStatus: 'pending_verification',
        isNonPo: false,
        linkedPoNumber: 'PO-0000103',
        verificationLabel: 'Pending Verification',
        needsAttention: true,
        amount: 3200,
        vendorEmail: 'support@vendor.com',
        fieldSections: invoiceExtractedSections(
          'INV201',
          vendorName,
          [
            {
              id: 'li-inv2-1',
              description: 'Hardware maintenance',
              deliveryLocation: 'On-site',
              shippingMethod: 'N/A',
              requiredBy: 'Apr-30-2026',
              qty: 1,
              unitPrice: 3200,
            },
          ],
          'PO-0000103',
          'support@vendor.com',
          3200,
        ),
      },
      history: invoiceHistory('INV201', 88.14),
    },
  ];
}

export function getPortalSectionLabel(section: PortalSection): string {
  if (section === 'rfq') return 'RFQ';
  if (section === 'po') return 'PO';
  return 'Invoice';
}

export function getPortalDocumentsForSection(
  documents: PortalDocument[],
  section: PortalSection,
): PortalDocument[] {
  return documents.filter((doc) => doc.type === section);
}

export function sumLineQty(items: PortalLineItem[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export function sumLineTotal(items: PortalLineItem[]): number {
  return items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
}

export function formatPortalCurrency(amount: number): string {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function getConfidenceTone(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 75) return 'high';
  if (confidence >= 50) return 'medium';
  return 'low';
}

export function formatConfidence(confidence: number): string {
  return `${confidence.toFixed(confidence % 1 === 0 ? 0 : 2)}%`;
}

export function clonePortalDocument(doc: PortalDocument): PortalDocument {
  return {
    ...doc,
    lineItems: doc.lineItems.map((item) => ({ ...item })),
    history: doc.history.map((entry) => ({ ...entry })),
    invoiceMeta: doc.invoiceMeta
      ? {
          ...doc.invoiceMeta,
          fieldSections: doc.invoiceMeta.fieldSections.map((section) => ({
            ...section,
            fields: section.fields.map((field) => ({ ...field })),
          })),
        }
      : undefined,
  };
}
