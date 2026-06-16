export const PO_OPTION_SECTIONS = [
  {
    id: 'workflow',
    title: 'Creation & workflow',
    description: 'How purchase orders are created, consolidated, and assigned.',
  },
  {
    id: 'notifications',
    title: 'Notifications & email',
    description: 'Who receives PO links and how email notifications behave.',
  },
  {
    id: 'documents',
    title: 'Documents & branding',
    description: 'Logo, terms, and files attached to emailed POs. Document layout is managed via the PO template.',
  },
  {
    id: 'formDisplay',
    title: 'PO form display',
    description: 'Columns and fields shown on the purchase order form.',
  },
] as const;

export const PO_OPTION_HELP: Record<string, string> = {
  'auto-create-po':
    'Automatically generates a purchase order when the related request receives final approval, without manual PO creation.',
  'allow-consolidation':
    'Allows multiple approved requests or lines to be combined into a single purchase order for the same vendor.',
  'allow-users-create-pos':
    'Lets requesters or buyers create their own purchase orders instead of routing all PO creation to coordinators.',
  'send-link-coordinators':
    'Emails PO coordinators a link to view or process the purchase order when it is created or updated.',
  'send-link-requester':
    'Emails the original requester a link to the purchase order so they can track status.',
  'cc-on-email':
    'Sends a CC notification to configured recipients whenever a purchase order is emailed to a vendor.',
  'logo-on-po':
    'Displays your company logo on the printed and PDF purchase order. Upload a 150 × 150 pixel JPG or PNG.',
  'terms-and-conditions':
    'Includes terms and conditions text on the purchase order document and in the PO record.',
  'terms-as-attachment':
    'Attaches a separate terms-and-conditions file when emailing purchase orders to vendors.',
  'include-attachments-email':
    'Includes PR and PO file attachments in the email body sent to vendors (when supported by your mail setup).',
  'select-all-attachments':
    'Pre-selects all available attachments in the send-PO email dialog so users do not have to check each file.',
  'show-ship-method':
    'Shows the shipping method field on the purchase order form.',
  'show-account':
    "Shows the account column on the purchase order form and line items.",
  'show-project-name':
    "Shows the project name column on the purchase order form and line items.",
  'show-required-by':
    'Shows the required-by date column on the purchase order form.',
  'show-po-coordinator':
    'Displays the assigned PO coordinator on the purchase order form.',
  'show-revision-number':
    'Shows the revision number on purchase orders that are change orders or revisions.',
};
