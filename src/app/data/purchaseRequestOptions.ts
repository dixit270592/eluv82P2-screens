export type PurchaseRequestOptionsState = {
  allowFreeformVendorEntry: boolean;
  hideVendorInputField: boolean;
  lineItemVendorSelection: boolean;
  hideVendorTermsField: boolean;
  defaultVendorTermsFromSetup: boolean;
  allowPrSubmissionNoVendor: boolean;
  requireVendorOnHeader: boolean;
  hideRequiredByDate: boolean;
  setRequireByDateOffset: boolean;
  requireByDays: number;
  allowViewOtherDeptRequests: boolean;
  updateDeptLocOnCopiedTemplates: boolean;
  requireAccountOnItemDetail: boolean;
  hideAccountOnItemDetail: boolean;
  requireProjectOnItemDetail: boolean;
  hideProjectOnItemDetail: boolean;
  hideTaxField: boolean;
  taxDiffMode: string;
  hideUomField: boolean;
  uomDefault: string;
  alertDelayedApprovals: boolean;
  includeAttachmentsWithApprovalEmails: boolean;
  defaultShippingMethod: boolean;
  shippingMethod: string;
};

export const TAX_DIFF_OPTIONS = [
  'Tax diff percentage',
  'Tax diff amount',
  'No tax diff',
] as const;

export const UOM_DEFAULT_OPTIONS = [
  'Celsius (°C)',
  'Fahrenheit (°F)',
  'Each (EA)',
  'Case (CS)',
] as const;

export const SHIPPING_METHOD_OPTIONS = [
  'UPS',
  'FedEx',
  'USPS',
  'Freight',
  'Will call',
] as const;

export function createDefaultPurchaseRequestOptions(): PurchaseRequestOptionsState {
  return {
    allowFreeformVendorEntry: false,
    hideVendorInputField: false,
    lineItemVendorSelection: true,
    hideVendorTermsField: false,
    defaultVendorTermsFromSetup: false,
    allowPrSubmissionNoVendor: false,
    requireVendorOnHeader: false,
    hideRequiredByDate: false,
    setRequireByDateOffset: false,
    requireByDays: 20,
    allowViewOtherDeptRequests: true,
    updateDeptLocOnCopiedTemplates: false,
    requireAccountOnItemDetail: false,
    hideAccountOnItemDetail: false,
    requireProjectOnItemDetail: false,
    hideProjectOnItemDetail: false,
    hideTaxField: true,
    taxDiffMode: TAX_DIFF_OPTIONS[0],
    hideUomField: true,
    uomDefault: UOM_DEFAULT_OPTIONS[0],
    alertDelayedApprovals: false,
    includeAttachmentsWithApprovalEmails: true,
    defaultShippingMethod: true,
    shippingMethod: SHIPPING_METHOD_OPTIONS[0],
  };
}
