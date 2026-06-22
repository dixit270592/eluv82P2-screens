import type { LineItemData } from '../PurchaseRequestModal';

export type PRLineItem = LineItemData & {
  type?: string;
  unitOfMeasure?: string;
  taxGroup?: string;
  glAccountsCount?: number;
  requiredBy?: string;
  vendorTerms?: string;
  projectAccount?: string;
};

export type { LineItemFormValues, LineItemValidationErrors } from './lineItemValidation';
