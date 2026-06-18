export type ReceivingOptionsState = {
  forceChangeOrderOverReceivePercent: boolean;
  overReceivePercent: number;
  forceChangeOrderOverSpendAmount: boolean;
  overSpendAmount: number;
  allowLineItemPriceChanges: boolean;
  allowEditingAccountsOnReceipts: boolean;
  allowEditingProjectsOnReceipts: boolean;
  allowChangePaymentTermsOnReceipts: boolean;
  alertNonReceiptAfterDays: boolean;
  nonReceiptAlertDays: number;
  emailInvoicingFullyReceived: boolean;
  emailInvoicingPartiallyClosed: boolean;
  emailRequesterAnyReceipt: boolean;
  emailRequesterFullyReceived: boolean;
  requireAttachmentsForReceipts: boolean;
};

export function createDefaultReceivingOptions(): ReceivingOptionsState {
  return {
    forceChangeOrderOverReceivePercent: false,
    overReceivePercent: 10,
    forceChangeOrderOverSpendAmount: false,
    overSpendAmount: 500,
    allowLineItemPriceChanges: false,
    allowEditingAccountsOnReceipts: false,
    allowEditingProjectsOnReceipts: false,
    allowChangePaymentTermsOnReceipts: false,
    alertNonReceiptAfterDays: false,
    nonReceiptAlertDays: 14,
    emailInvoicingFullyReceived: false,
    emailInvoicingPartiallyClosed: false,
    emailRequesterAnyReceipt: false,
    emailRequesterFullyReceived: false,
    requireAttachmentsForReceipts: false,
  };
}
