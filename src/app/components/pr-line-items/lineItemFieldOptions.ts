import {
  createDefaultPurchaseRequestOptions,
  type PurchaseRequestOptionsState,
} from '../../data/purchaseRequestOptions';
import type { LineItemFormValues } from './lineItemValidation';

export const LINE_ITEM_TYPES = ['Goods', 'Services', 'Fixed Assets', 'Inventory Item'];
export const LINE_ITEM_UNITS = [
  'Each',
  'Box',
  'Dozen',
  'Kilogram',
  'Meter',
  'Liter',
  'Piece',
  'Kilo Gram (Kg)',
];
export const LINE_ITEM_VENDOR_TERMS = [
  'Net 15',
  'Net 30',
  'Net 60',
  'Net 90',
  'Due on Receipt',
  'COD',
];
export const LINE_ITEM_TAX_GROUPS = [
  'Standard Tax',
  'Tax diff percentage',
  'Zero Rated',
  'Exempt',
  'Out of Scope',
];
export const LINE_ITEM_VENDORS = [
  '84 Lumber',
  'Vendor 1',
  'Dell Technologies',
  'Microsoft Corporation',
  'Amazon Web Services',
];
export const LINE_ITEM_PROJECT_ACCOUNTS = [
  'Project A - Operations',
  'Project B - Marketing',
  'Project C - Development',
  'General - Admin',
];
export const LINE_ITEM_GL_ACCOUNTS = [
  '6100 - Office Supplies',
  '6200 - Software & Licenses',
  'DEP 2:Bank:NEWSEGMENT:Test Sales',
];

export function emptyLineItemForm(
  options: PurchaseRequestOptionsState = createDefaultPurchaseRequestOptions(),
): LineItemFormValues {
  return {
    description: '',
    type: 'Goods',
    unitOfMeasure: options.uomDefault || 'Each',
    quantity: 1,
    cost: 0,
    requiredBy: '',
    vendorTerms: 'Net 15',
    taxGroup: '',
    vendor: '',
    projectAccount: '',
    glAccount: LINE_ITEM_GL_ACCOUNTS[0],
    glAccountsCount: 1,
  };
}
