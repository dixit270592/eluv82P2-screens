import {
  createDefaultPurchaseRequestOptions,
  type PurchaseRequestOptionsState,
} from '../../data/purchaseRequestOptions';
import { getLineItemFieldDefinitions, type LineItemFieldKey } from './lineItemFieldConfig';

export type LineItemFormValues = {
  description: string;
  type: string;
  unitOfMeasure: string;
  quantity: number;
  cost: number;
  requiredBy: string;
  vendorTerms: string;
  taxGroup: string;
  vendor: string;
  projectAccount: string;
  glAccount: string;
  glAccountsCount: number;
};

export type LineItemValidationErrors = Partial<Record<LineItemFieldKey, string>>;

export function validateLineItemForm(
  values: LineItemFormValues,
  options: PurchaseRequestOptionsState = createDefaultPurchaseRequestOptions(),
): LineItemValidationErrors {
  const errors: LineItemValidationErrors = {};
  const fields = getLineItemFieldDefinitions(options).filter((f) => f.visible);

  for (const field of fields) {
    const value = values[field.key];

    if (field.required) {
      if (typeof value === 'string' && !value.trim()) {
        errors[field.key] = `${field.label} is required`;
      } else if (field.key === 'glAccount' && values.glAccountsCount < 1 && !value.trim()) {
        errors[field.key] = `${field.label} is required`;
      }
    }

    if (field.key === 'quantity' && (Number.isNaN(values.quantity) || values.quantity <= 0)) {
      errors.quantity = 'Quantity must be greater than zero';
    }

    if (field.key === 'cost' && values.cost < 0) {
      errors.cost = 'Cost cannot be negative';
    }
  }

  return errors;
}

export function hasLineItemErrors(errors: LineItemValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}
