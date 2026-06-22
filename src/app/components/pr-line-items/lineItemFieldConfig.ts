import {
  createDefaultPurchaseRequestOptions,
  type PurchaseRequestOptionsState,
} from '../../data/purchaseRequestOptions';

export type LineItemFieldKey =
  | 'description'
  | 'type'
  | 'unitOfMeasure'
  | 'quantity'
  | 'cost'
  | 'requiredBy'
  | 'vendorTerms'
  | 'taxGroup'
  | 'vendor'
  | 'projectAccount'
  | 'glAccount';

export type LineItemFieldDefinition = {
  key: LineItemFieldKey;
  label: string;
  section: 'basic' | 'pricing' | 'vendor' | 'accounting';
  required?: boolean;
  visible: boolean;
};

const SECTION_LABELS = {
  basic: 'Item details',
  pricing: 'Pricing & tax',
  vendor: 'Vendor & delivery',
  accounting: 'Accounting',
} as const;

export function getLineItemFieldDefinitions(
  options: PurchaseRequestOptionsState = createDefaultPurchaseRequestOptions(),
): LineItemFieldDefinition[] {
  return [
    { key: 'description', label: 'Description', section: 'basic', required: true, visible: true },
    { key: 'type', label: 'Type', section: 'basic', required: true, visible: true },
    {
      key: 'unitOfMeasure',
      label: 'Unit of measure',
      section: 'basic',
      required: !options.hideUomField,
      visible: !options.hideUomField,
    },
    { key: 'quantity', label: 'Quantity', section: 'pricing', required: true, visible: true },
    { key: 'cost', label: 'Cost', section: 'pricing', required: true, visible: true },
    {
      key: 'taxGroup',
      label: 'Tax group',
      section: 'pricing',
      required: !options.hideTaxField,
      visible: !options.hideTaxField,
    },
    {
      key: 'vendor',
      label: 'Vendor',
      section: 'vendor',
      required: options.lineItemVendorSelection && !options.allowPrSubmissionNoVendor,
      visible: options.lineItemVendorSelection && !options.hideVendorInputField,
    },
    {
      key: 'vendorTerms',
      label: 'Vendor terms',
      section: 'vendor',
      visible: !options.hideVendorTermsField,
    },
    {
      key: 'requiredBy',
      label: 'Required by',
      section: 'vendor',
      visible: !options.hideRequiredByDate,
    },
    {
      key: 'glAccount',
      label: 'GL account',
      section: 'accounting',
      required: options.requireAccountOnItemDetail,
      visible: !options.hideAccountOnItemDetail,
    },
    {
      key: 'projectAccount',
      label: 'Project',
      section: 'accounting',
      required: options.requireProjectOnItemDetail,
      visible: !options.hideProjectOnItemDetail,
    },
  ];
}

export function getVisibleFieldsBySection(
  options?: PurchaseRequestOptionsState,
): Record<keyof typeof SECTION_LABELS, LineItemFieldDefinition[]> {
  const fields = getLineItemFieldDefinitions(options).filter((f) => f.visible);
  return {
    basic: fields.filter((f) => f.section === 'basic'),
    pricing: fields.filter((f) => f.section === 'pricing'),
    vendor: fields.filter((f) => f.section === 'vendor'),
    accounting: fields.filter((f) => f.section === 'accounting'),
  };
}

export { SECTION_LABELS };
