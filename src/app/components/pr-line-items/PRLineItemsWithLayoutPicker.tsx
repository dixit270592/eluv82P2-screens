import { forwardRef, useState } from 'react';
import { createDefaultPurchaseRequestOptions, type PurchaseRequestOptionsState } from '../../data/purchaseRequestOptions';
import { UI_FONT_STACK as F } from '../../tokens/typography';
import { LineItemsLayoutToggle, type LineItemsLayoutVersion } from './LineItemsLayoutToggle';
import { PRLineItemsSection, type PRLineItemsSectionHandle } from './PRLineItemsSection';
import { PRLineItemsSectionV2 } from './PRLineItemsSectionV2';
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
  onItemRemoved?: () => void;
  onRequestQuote?: (selectedItemIds: string[]) => void;
  defaultLayout?: LineItemsLayoutVersion;
};

export const PRLineItemsWithLayoutPicker = forwardRef<
  PRLineItemsSectionHandle,
  PRLineItemsWithLayoutPickerProps
>(function PRLineItemsWithLayoutPicker(
  {
    items,
    onChange,
    options = createDefaultPurchaseRequestOptions(),
    disabled = false,
    defaultVendor,
    onOpenGL,
    onOpenBudget,
    onOpenBudgetReport,
    onItemAdded,
    onItemRemoved,
    onRequestQuote,
    defaultLayout = 'v1',
  },
  ref,
) {
  const [layout, setLayout] = useState<LineItemsLayoutVersion>(defaultLayout);

  const sharedProps = {
    items,
    onChange,
    options,
    disabled,
    defaultVendor,
    onOpenGL,
    onOpenBudget,
    onOpenBudgetReport,
    onItemAdded,
    onItemRemoved,
    onRequestQuote,
  };

  return (
    <div>
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid #F0F1F3',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          background: '#FAFBFC',
        }}
      >
        <LineItemsLayoutToggle value={layout} onChange={setLayout} />
        <span style={{ fontSize: '12px', color: '#98A2B3', fontFamily: F }}>
          {layout === 'v1'
            ? 'Expand rows inline for full field visibility'
            : 'Scan compact rows · open a drawer for details'}
        </span>
      </div>

      {layout === 'v1' ? (
        <PRLineItemsSection ref={ref} {...sharedProps} />
      ) : (
        <PRLineItemsSectionV2 ref={ref} {...sharedProps} />
      )}
    </div>
  );
});
