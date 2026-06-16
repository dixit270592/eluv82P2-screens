export const RECEIVING_OPTION_SECTIONS = [
  {
    id: 'overReceiving',
    title: 'Over-receiving & change orders',
    description: 'When receiving more than ordered triggers a change order or spending review.',
  },
  {
    id: 'editing',
    title: 'Receipt editing',
    description: 'What receivers can change while recording a receipt.',
  },
  {
    id: 'alerts',
    title: 'Alerts & follow-up',
    description: 'Reminders when goods have not been received on schedule.',
  },
  {
    id: 'notifications',
    title: 'Email notifications',
    description: 'Who is notified when receipts are created or receiving is complete.',
  },
  {
    id: 'requirements',
    title: 'Requirements',
    description: 'Mandatory steps before a receipt can be saved.',
  },
] as const;

export const RECEIVING_OPTION_HELP: Record<string, string> = {
  'force-change-percent':
    'Creates a change order when the quantity received exceeds the ordered amount by more than the percentage you set. Helps control over-receiving against the original PO.',
  'force-change-amount':
    'Creates a change order when the dollar value received exceeds the allowed spending amount. Use this for strict budget control on receipts.',
  'allow-price-changes':
    'Lets receivers adjust unit price on a line during receiving when the vendor invoice differs from the purchase order.',
  'allow-edit-accounts':
    'Allows receivers to change the GL account on receipt lines — useful when the coding was wrong on the original order.',
  'allow-edit-projects':
    'Allows receivers to change the project assignment on receipt lines before posting.',
  'allow-payment-terms':
    'Lets receivers update payment terms on the receipt when they differ from the purchase order or vendor invoice.',
  'alert-non-receipt':
    'Sends a reminder to receivers when items on an open order have not been received within the number of days you specify.',
  'email-invoicing-full':
    'Notifies users with invoicing rights when every line on a request has been fully received and is ready for invoice matching.',
  'email-invoicing-partial':
    'Notifies users with invoicing rights when a request is only partially received but has been closed for further receiving.',
  'email-requester-any':
    'Sends the original requester an email each time any receipt is recorded against their request.',
  'email-requester-full':
    'Sends the original requester an email when all items on their requisition have been fully received.',
  'require-attachments':
    'Requires at least one file attachment (packing slip, delivery note, photo, etc.) before a receipt can be saved.',
};
