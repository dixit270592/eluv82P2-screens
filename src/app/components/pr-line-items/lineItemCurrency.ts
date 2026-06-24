/** Shared currency formatting for PR line items (matches app-wide USD display). */
export function formatLineItemCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

/** Prefix shown inside currency input fields (without trailing space). */
export const LINE_ITEM_CURRENCY_PREFIX = '$';
