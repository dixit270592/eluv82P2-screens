export type PortalSection = 'rfq' | 'po' | 'invoice';

export type PortalLineItem = {
  id: string;
  description: string;
  deliveryLocation: string;
  shippingMethod: string;
  requiredBy: string;
  qty: number;
  unitPrice: number;
};

export type PortalHistoryEntry = {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
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
    },
    {
      id: 'li-2',
      description: 'Pens',
      deliveryLocation: 'NY Office, Loading Dock',
      shippingMethod: 'Fed Ex',
      requiredBy: 'May-12-2026',
      qty: 1,
      unitPrice: 0,
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
      documentNumber: 'INV-0008871',
      organization: ORG_NAME,
      contact,
      date: '05/15/2026',
      listTimestamp: '05/15/2026 at 4:45 PM',
      lineItems: invoiceLineItems(),
      history: [
        {
          id: 'h-inv-1',
          actor: 'Accounts Payable',
          action: 'Invoice INV-0008871 submitted for payment',
          timestamp: '05/15/2026 at 4:45 PM',
        },
      ],
    },
    {
      id: `${vendorId}-inv-2`,
      vendorId,
      type: 'invoice',
      documentNumber: 'INV-0008850',
      organization: ORG_NAME,
      contact,
      date: '05/01/2026',
      listTimestamp: '05/01/2026 at 8:20 AM',
      lineItems: [
        {
          id: 'li-inv-2',
          description: 'Hardware maintenance',
          deliveryLocation: 'On-site',
          shippingMethod: 'N/A',
          requiredBy: 'Apr-30-2026',
          qty: 1,
          unitPrice: 3200,
        },
      ],
      history: [
        {
          id: 'h-inv-2',
          actor: 'Accounts Payable',
          action: 'Invoice INV-0008850 approved',
          timestamp: '05/01/2026 at 8:20 AM',
        },
      ],
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

export function clonePortalDocument(doc: PortalDocument): PortalDocument {
  return {
    ...doc,
    lineItems: doc.lineItems.map((item) => ({ ...item })),
    history: doc.history.map((entry) => ({ ...entry })),
  };
}
