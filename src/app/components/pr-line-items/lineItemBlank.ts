import {
  createDefaultPurchaseRequestOptions,
  type PurchaseRequestOptionsState,
} from '../../data/purchaseRequestOptions';
import { validateLineItemForm, type LineItemFormValues } from './lineItemValidation';
import type { PRLineItem } from './types';

export function toLineItemFormValues(item: PRLineItem): LineItemFormValues {
  return {
    description: item.item,
    type: item.type || 'Goods',
    unitOfMeasure: item.unitOfMeasure || 'Each',
    quantity: item.quantity,
    cost: item.cost,
    requiredBy: item.requiredBy || '',
    vendorTerms: item.vendorTerms || 'Net 15',
    taxGroup: item.taxGroup || '',
    vendor: item.vendor,
    projectAccount: item.projectAccount || '',
    glAccount: item.glAccount,
    glAccountsCount: item.glAccountsCount || 1,
  };
}

export function isBlankLineItem(item: PRLineItem): boolean {
  return !item.item?.trim();
}

export function isTrailingBlankItem(
  items: PRLineItem[],
  item: PRLineItem,
  index: number,
): boolean {
  return index === items.length - 1 && isBlankLineItem(item);
}

export function isLineItemComplete(
  item: PRLineItem,
  options: PurchaseRequestOptionsState = createDefaultPurchaseRequestOptions(),
): boolean {
  return Object.keys(validateLineItemForm(toLineItemFormValues(item), options)).length === 0;
}

export function createBlankLineItem(
  id: string,
  defaultVendor?: string,
  options: PurchaseRequestOptionsState = createDefaultPurchaseRequestOptions(),
): PRLineItem {
  return {
    id,
    item: '',
    vendor: defaultVendor || '',
    quantity: 1,
    cost: 0,
    subtotal: 0,
    glAccount: '6100 - Computer Equipment',
    type: 'Goods',
    unitOfMeasure: options.uomDefault || 'Each',
    taxGroup: '',
    glAccountsCount: 1,
    requiredBy: '',
    vendorTerms: 'Net 15',
    projectAccount: '',
  };
}

/** Filled rows only — excludes a trailing draft row used for auto-populate. */
export function filledLineItems(items: PRLineItem[]): PRLineItem[] {
  if (items.length === 0) return items;
  const last = items[items.length - 1];
  if (isBlankLineItem(last)) return items.slice(0, -1);
  return items;
}
