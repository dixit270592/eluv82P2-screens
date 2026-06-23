import { forwardRef } from 'react';
import { createDefaultPurchaseRequestOptions, type PurchaseRequestOptionsState } from '../../data/purchaseRequestOptions';
import type { PRLineItemsSectionHandle } from './PRLineItemsSection';
import { PRLineItemsSectionV3 } from './PRLineItemsSectionV3';
import type { PRLineItem } from './types';

type PRLineItemsWithLayoutPickerProps = {
  items: PRLineItem[];
  onChange: (items: PRLineItem[]) => void;
  options?: PurchaseRequestOptionsState;
  disabled?: boolean;
  defaultVendor?: string;
  onOpenGL?: (itemId: string) => void;
  onOpenBudget?: (itemId: string) => void;
  onOpenBudgetReport?: (itemId: string) => void;
  onItemAdded?: (description: string) => void;
  onItemRemoved?: (count?: number) => void;
  onRequestQuote?: (selectedItemIds: string[]) => void;
};

/** Line items section — V3 experience (expandable rows + auto-populate blank row). */
export const PRLineItemsWithLayoutPicker = forwardRef<
  PRLineItemsSectionHandle,
  PRLineItemsWithLayoutPickerProps
>(function PRLineItemsWithLayoutPicker(props, ref) {
  return <PRLineItemsSectionV3 ref={ref} {...props} />;
});
