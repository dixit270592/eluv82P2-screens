export type PrOptionSectionId =
  | 'vendor'
  | 'dates'
  | 'visibility'
  | 'lineFields'
  | 'approvals'
  | 'shipping';

export type PrOptionSection = {
  id: PrOptionSectionId;
  title: string;
  description: string;
};

export const PR_OPTION_SECTIONS: PrOptionSection[] = [
  {
    id: 'vendor',
    title: 'Vendor & quoting',
    description: 'Control whether vendors are picked on the header, per line, or sourced through quoting.',
  },
  {
    id: 'dates',
    title: 'Dates & deadlines',
    description: 'Manage required-by dates on line items.',
  },
  {
    id: 'visibility',
    title: 'Visibility & templates',
    description: 'Who can see requests and how copied templates behave.',
  },
  {
    id: 'lineFields',
    title: 'Line item fields',
    description: 'Show, hide, or require accounting fields on each line.',
  },
  {
    id: 'approvals',
    title: 'Approvals & notifications',
    description: 'Email and reminder behavior for approvers.',
  },
  {
    id: 'shipping',
    title: 'Shipping',
    description: 'Default carrier or method on new requests.',
  },
];

export const PR_OPTION_HELP: Record<string, string> = {
  'allow-freeform-vendor':
    'Lets requesters type a vendor name that is not on the approved list. New vendors typically go through an approval workflow before they can be used on purchase orders.',
  'hide-vendor-input':
    'Removes the vendor field from the request. Users cannot select a vendor up front—the request is routed to quoting instead. Not available when line-item vendor selection is enabled.',
  'line-item-vendor':
    'Assigns a vendor to each line item instead of one vendor on the request header. Use this when a single request can include items from multiple suppliers.',
  'hide-vendor-terms':
    'Hides payment terms (for example Net 30) on the purchase request so users cannot change them during entry.',
  'default-vendor-terms':
    'When a vendor is selected, payment terms auto-fill from that vendor’s record in vendor setup.',
  'allow-no-vendor':
    'Allows submission without a vendor. The request is sent to quoting so procurement can source a supplier later.',
  'require-vendor-header':
    'Requires a vendor on the request header before submit. Use when every request must be tied to a vendor upfront (header-level vendor model).',
  'hide-required-by-date':
    'Removes the required-by date field from the line item detail screen.',
  'set-require-by-offset':
    'Automatically sets each line’s required-by date to a fixed number of days after the line is created, so users do not pick a date manually.',
  'view-other-dept-requests':
    'Lets users view purchase requests created by colleagues in their own department(s), not only requests they created.',
  'update-dept-loc-templates':
    'When copying a template or past request, department and location are replaced with the copier’s profile values instead of keeping the original.',
  'require-account':
    'Makes the GL account (cost center) mandatory on every line item.',
  'hide-account':
    'Hides the account field on line items. Do not enable together with required account on the same field.',
  'require-project':
    'Makes the project code mandatory on every line item.',
  'hide-project':
    'Hides the project field on line items. Do not enable together with required project on the same field.',
  'hide-tax':
    'Hides the tax field on line items. Tax may be calculated or applied later in the process. Use the dropdown to choose how tax differences are handled.',
  'hide-uom':
    'Hides the unit-of-measure field and applies the selected default unit to new lines.',
  'alert-delayed-approvals':
    'Sends reminders to approvers when approval tasks remain open longer than expected.',
  'include-attachments':
    'Includes purchase request attachments in approval notification emails so approvers can review files without signing in.',
  'default-shipping':
    'Pre-fills the shipping method on new requests with the carrier or method you select.',
};
