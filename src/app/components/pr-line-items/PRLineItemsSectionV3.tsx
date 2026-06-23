import { forwardRef } from 'react';
import { PRLineItemsSection, type PRLineItemsSectionHandle } from './PRLineItemsSection';
import type { PRLineItem } from './types';
import type { PurchaseRequestOptionsState } from '../../data/purchaseRequestOptions';

type PRLineItemsSectionV3Props = {
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

export const PRLineItemsSectionV3 = forwardRef<PRLineItemsSectionHandle, PRLineItemsSectionV3Props>(
  function PRLineItemsSectionV3(props, ref) {
    return <PRLineItemsSection ref={ref} {...props} autoPopulateBlankRow />;
  },
);
