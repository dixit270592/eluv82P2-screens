export interface WorkflowActionHandlers {
  onSave: () => void;
  onSubmit: () => void;
  onCancel: () => void;
  onRecall: () => void;
  onCopy: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequireChange: () => void;
  onCreatePO: () => void;
  onEmailPO: () => void;
  onCreateChangeOrder: () => void;
  onPrint: () => void;
  onToggleStar: () => void;
}
