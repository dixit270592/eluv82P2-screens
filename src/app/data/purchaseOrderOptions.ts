export type PurchaseOrderOptionsState = {
  autoCreatePoOnFinalApproval: boolean;
  allowPoConsolidation: boolean;
  allowUsersCreateOwnPos: boolean;
  sendPoLinkToCoordinators: boolean;
  sendPoLinkToRequester: boolean;
  ccNotificationWhenEmailingPos: boolean;
  logoOnPo: boolean;
  logoFileName: string | null;
  termsAndConditions: boolean;
  termsText: string;
  termsAsAttachment: boolean;
  termsAttachmentFileName: string | null;
  includeAttachmentsWithPoEmail: boolean;
  selectAllAttachmentsByDefault: boolean;
  showShipMethodOnForm: boolean;
  showAccountColumn: boolean;
  showProjectNameColumn: boolean;
  showRequiredByColumn: boolean;
  showPoCoordinatorOnForm: boolean;
  showRevisionNumberOnForm: boolean;
};

export function createDefaultPurchaseOrderOptions(): PurchaseOrderOptionsState {
  return {
    autoCreatePoOnFinalApproval: false,
    allowPoConsolidation: true,
    allowUsersCreateOwnPos: true,
    sendPoLinkToCoordinators: true,
    sendPoLinkToRequester: true,
    ccNotificationWhenEmailingPos: false,
    logoOnPo: false,
    logoFileName: null,
    termsAndConditions: true,
    termsText: 'My applications rules and regulations.',
    termsAsAttachment: true,
    termsAttachmentFileName: 'POSITIVE_INV_3 (1).pdf',
    includeAttachmentsWithPoEmail: false,
    selectAllAttachmentsByDefault: true,
    showShipMethodOnForm: true,
    showAccountColumn: true,
    showProjectNameColumn: true,
    showRequiredByColumn: true,
    showPoCoordinatorOnForm: true,
    showRevisionNumberOnForm: true,
  };
}
