export type CustomSubType = {
  id: string;
  name: string;
  associatedCost: number;
};

export type CustomType = {
  id: string;
  name: string;
  subTypes: CustomSubType[];
};

export type CustomTransaction = {
  id: string;
  transactionKind: string;
  types: CustomType[];
};

export const TRANSACTION_KINDS = [
  'Expense',
  'Standard Purchase Request',
  'Purchase Order',
  'Invoice',
  'Receiving',
] as const;

export type TransactionKind = (typeof TRANSACTION_KINDS)[number];

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createEmptySubType(): CustomSubType {
  return { id: newId('subtype'), name: '', associatedCost: 0 };
}

export function createEmptyType(): CustomType {
  return { id: newId('type'), name: '', subTypes: [createEmptySubType()] };
}

export function createEmptyTransaction(kind: TransactionKind = 'Expense'): CustomTransaction {
  return { id: newId('txn'), transactionKind: kind, types: [] };
}

export function createSeedCustomOptions(): CustomTransaction[] {
  return [
    {
      id: 'txn-expense',
      transactionKind: 'Expense',
      types: [
        {
          id: 'type-auto',
          name: 'Automobile',
          subTypes: [
            { id: 'st-honda', name: 'Car - Honda', associatedCost: 2000 },
            { id: 'st-toyota', name: 'Car - Toyota', associatedCost: 1850 },
          ],
        },
        {
          id: 'type-bike',
          name: 'Bike',
          subTypes: [
            { id: 'st-pulsar', name: 'Pulsar', associatedCost: 1200 },
            { id: 'st-re', name: 'Royal Enfield', associatedCost: 1600 },
            { id: 'st-hero', name: 'Hero Honda', associatedCost: 950 },
          ],
        },
      ],
    },
    {
      id: 'txn-spr',
      transactionKind: 'Standard Purchase Request',
      types: [],
    },
  ];
}

export function countSubTypes(transactions: CustomTransaction[]): number {
  return transactions.reduce(
    (sum, txn) => sum + txn.types.reduce((tSum, type) => tSum + type.subTypes.length, 0),
    0,
  );
}

export function formatCost(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    value,
  );
}
