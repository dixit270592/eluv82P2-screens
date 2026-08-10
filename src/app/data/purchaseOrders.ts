export type PoStatus =
  | 'pending_approval'
  | 'approved'
  | 'sent'
  | 'partially_received'
  | 'closed'
  | 'cancelled';

export type PoLineItem = {
  id: string;
  name: string;
  description: string;
  vendor: string;
  vendorTerms: string;
  type: string;
  subType: string;
  quantity: number;
  cost: number;
  taxGroup: string;
  taxAmount: number;
  uom: string;
  requiredBy: string;
  glAccount?: string;
  project?: string;
};

export type PoHistoryEntry = {
  id: string;
  actor: string;
  action: string;
  detail?: string;
  timestamp: string;
  kind: 'note' | 'system';
};

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  description: string;
  vendor: string;
  department: string;
  deliveryLocation: string;
  shippingMethod: string;
  requiredBy: string;
  status: PoStatus;
  subTotal: number;
  tax: number;
  total: number;
  currencyPrefix: string;
  items: PoLineItem[];
  history: PoHistoryEntry[];
};

export const PO_STATUS_META: Record<
  PoStatus,
  { label: string; bg: string; text: string; border: string; cta: string }
> = {
  pending_approval: {
    label: 'Pending Approval',
    bg: '#FFFBEB',
    text: '#B45309',
    border: '#FDE68A',
    cta: 'Approve',
  },
  approved: {
    label: 'Approved',
    bg: '#ECFAF5',
    text: '#0E7A54',
    border: '#B8E8D9',
    cta: 'Send to Vendor',
  },
  sent: {
    label: 'Sent to Vendor',
    bg: '#EFF6FF',
    text: '#1D4ED8',
    border: '#BFDBFE',
    cta: 'Mark Received',
  },
  partially_received: {
    label: 'Partially Received',
    bg: '#F5F3FF',
    text: '#6D28D9',
    border: '#DDD6FE',
    cta: 'Receive Remaining',
  },
  closed: {
    label: 'Closed',
    bg: '#F4F4F5',
    text: '#57534E',
    border: '#E4E4E7',
    cta: 'Reopen',
  },
  cancelled: {
    label: 'Cancelled',
    bg: '#FEF2F2',
    text: '#B91C1C',
    border: '#FECACA',
    cta: 'View Details',
  },
};

export function formatPoMoney(amount: number, prefix = 'Rs.') {
  return `${prefix} ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function createSeedPurchaseOrders(): PurchaseOrder[] {
  return [
    {
      id: 'po-288',
      poNumber: 'PO - 0000288',
      description: 'approval Required testing',
      vendor: 'Suraj',
      department: 'Marketing',
      deliveryLocation: 'Address 1',
      shippingMethod: 'UPS',
      requiredBy: 'July-30-2026',
      status: 'pending_approval',
      subTotal: 10,
      tax: 6,
      total: 16,
      currencyPrefix: 'Rs.',
      items: [
        {
          id: 'item-1',
          name: 'ITEM 1',
          description: 'approval Required testing',
          vendor: 'Suraj',
          vendorTerms: 'Net 15',
          type: 'Test',
          subType: '—',
          quantity: 1,
          cost: 10,
          taxGroup: 'Standard',
          taxAmount: 6,
          uom: 'Celcius (°C)',
          requiredBy: 'July-30-2026',
          glAccount: '6100 - Computer Equipment',
          project: 'Project A - Operations',
        },
      ],
      history: [
        {
          id: 'h1',
          actor: 'Suraj Gandhi',
          action: 'Updated a note',
          detail: 'Please review approval path before send.',
          timestamp: 'Jul 28, 2026 · 2:14 PM',
          kind: 'note',
        },
        {
          id: 'h2',
          actor: 'Suraj Gandhi',
          action: 'Created a note',
          detail: 'Initial PO created from PR workflow.',
          timestamp: 'Jul 28, 2026 · 1:52 PM',
          kind: 'note',
        },
        {
          id: 'h3',
          actor: 'Natasha Tuber',
          action: 'PO prepared for vendor send',
          detail: 'Waiting on final approval.',
          timestamp: 'Jul 27, 2026 · 4:05 PM',
          kind: 'system',
        },
      ],
    },
    {
      id: 'po-287',
      poNumber: 'PO - 0000287',
      description: 'Q3 office supplies restock',
      vendor: 'Office Depot',
      department: 'Operations',
      deliveryLocation: 'HQ Receiving Dock',
      shippingMethod: 'Ground',
      requiredBy: 'Aug-15-2026',
      status: 'approved',
      subTotal: 420,
      tax: 33.6,
      total: 453.6,
      currencyPrefix: 'Rs.',
      items: [
        {
          id: 'item-a',
          name: 'Copy paper case',
          description: 'A4 multipurpose paper — 10 ream case',
          vendor: 'Office Depot',
          vendorTerms: 'Net 30',
          type: 'Supplies',
          subType: 'Paper',
          quantity: 12,
          cost: 28,
          taxGroup: 'Standard',
          taxAmount: 26.88,
          uom: 'Case',
          requiredBy: 'Aug-15-2026',
          glAccount: '6200 - Office Supplies',
          project: 'Project A - Operations',
        },
        {
          id: 'item-b',
          name: 'Toner cartridge',
          description: 'HP 26A black toner',
          vendor: 'Office Depot',
          vendorTerms: 'Net 30',
          type: 'Supplies',
          subType: 'Toner',
          quantity: 4,
          cost: 21,
          taxGroup: 'Standard',
          taxAmount: 6.72,
          uom: 'Each',
          requiredBy: 'Aug-15-2026',
          glAccount: '6200 - Office Supplies',
          project: 'Project A - Operations',
        },
      ],
      history: [
        {
          id: 'h1',
          actor: 'Amy Richardson',
          action: 'Approved purchase order',
          timestamp: 'Aug 02, 2026 · 11:20 AM',
          kind: 'system',
        },
        {
          id: 'h2',
          actor: 'Daniel Park',
          action: 'Submitted for approval',
          timestamp: 'Aug 01, 2026 · 3:40 PM',
          kind: 'system',
        },
      ],
    },
    {
      id: 'po-286',
      poNumber: 'PO - 0000286',
      description: 'Engineering lab sensors',
      vendor: 'Fisher Scientific',
      department: 'Engineering',
      deliveryLocation: 'Lab Building B',
      shippingMethod: 'Express',
      requiredBy: 'Sep-01-2026',
      status: 'sent',
      subTotal: 1840,
      tax: 147.2,
      total: 1987.2,
      currencyPrefix: 'Rs.',
      items: [
        {
          id: 'item-s1',
          name: 'Temp sensor kit',
          description: 'High-precision thermocouple set',
          vendor: 'Fisher Scientific',
          vendorTerms: 'Net 45',
          type: 'Equipment',
          subType: 'Sensors',
          quantity: 8,
          cost: 180,
          taxGroup: 'Standard',
          taxAmount: 115.2,
          uom: 'Kit',
          requiredBy: 'Sep-01-2026',
        },
        {
          id: 'item-s2',
          name: 'Calibration cable',
          description: 'Shielded calibration lead',
          vendor: 'Fisher Scientific',
          vendorTerms: 'Net 45',
          type: 'Equipment',
          subType: 'Accessories',
          quantity: 8,
          cost: 50,
          taxGroup: 'Standard',
          taxAmount: 32,
          uom: 'Each',
          requiredBy: 'Sep-01-2026',
        },
      ],
      history: [
        {
          id: 'h1',
          actor: 'Natasha Tuber',
          action: 'PO Sent to Vendor',
          detail: 'Email confirmation queued to vendor portal.',
          timestamp: 'Aug 05, 2026 · 9:12 AM',
          kind: 'system',
        },
        {
          id: 'h2',
          actor: 'John Davidson',
          action: 'Approved purchase order',
          timestamp: 'Aug 04, 2026 · 4:48 PM',
          kind: 'system',
        },
      ],
    },
    {
      id: 'po-285',
      poNumber: 'PO - 0000285',
      description: 'Marketing campaign print run',
      vendor: 'Creative Print Co.',
      department: 'Marketing',
      deliveryLocation: 'Marketing Closet',
      shippingMethod: 'Courier',
      requiredBy: 'Aug-20-2026',
      status: 'partially_received',
      subTotal: 960,
      tax: 76.8,
      total: 1036.8,
      currencyPrefix: 'Rs.',
      items: [
        {
          id: 'item-p1',
          name: 'Brochure set',
          description: 'Tri-fold brochure — 2,000 pcs',
          vendor: 'Creative Print Co.',
          vendorTerms: 'Net 15',
          type: 'Print',
          subType: 'Collateral',
          quantity: 1,
          cost: 720,
          taxGroup: 'Standard',
          taxAmount: 57.6,
          uom: 'Lot',
          requiredBy: 'Aug-20-2026',
        },
        {
          id: 'item-p2',
          name: 'Poster pack',
          description: 'A2 event posters — 50 pcs',
          vendor: 'Creative Print Co.',
          vendorTerms: 'Net 15',
          type: 'Print',
          subType: 'Signage',
          quantity: 1,
          cost: 240,
          taxGroup: 'Standard',
          taxAmount: 19.2,
          uom: 'Pack',
          requiredBy: 'Aug-20-2026',
        },
      ],
      history: [
        {
          id: 'h1',
          actor: 'Marcus Webb',
          action: 'Partial receipt recorded',
          detail: 'Brochure set received; posters pending.',
          timestamp: 'Aug 08, 2026 · 1:05 PM',
          kind: 'system',
        },
      ],
    },
    {
      id: 'po-284',
      poNumber: 'PO - 0000284',
      description: 'Annual software renewals',
      vendor: 'Microsoft Corporation',
      department: 'IT',
      deliveryLocation: 'Digital delivery',
      shippingMethod: 'N/A',
      requiredBy: 'Jul-01-2026',
      status: 'closed',
      subTotal: 24500,
      tax: 1960,
      total: 26460,
      currencyPrefix: 'Rs.',
      items: [
        {
          id: 'item-m1',
          name: 'M365 E3 licenses',
          description: 'Enterprise license renewal — 50 seats',
          vendor: 'Microsoft Corporation',
          vendorTerms: 'Net 30',
          type: 'Software',
          subType: 'Subscription',
          quantity: 50,
          cost: 490,
          taxGroup: 'Standard',
          taxAmount: 1960,
          uom: 'Seat',
          requiredBy: 'Jul-01-2026',
        },
      ],
      history: [
        {
          id: 'h1',
          actor: 'Sarah Chen',
          action: 'Closed purchase order',
          timestamp: 'Jul 10, 2026 · 10:00 AM',
          kind: 'system',
        },
      ],
    },
  ];
}
