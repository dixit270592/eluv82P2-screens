import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { WorkflowActionButton } from './WorkflowActionButton';

interface ApprovalActionsProps {
  onApprove: () => void;
  onReject: () => void;
  onRequireChange: () => void;
  disabled?: boolean;
}

export function ApprovalActions({
  onApprove,
  onReject,
  onRequireChange,
  disabled = false,
}: ApprovalActionsProps) {
  return (
    <>
      <WorkflowActionButton
        onClick={onApprove}
        icon={<CheckCircle2 size={11} strokeWidth={2} />}
        variant="green"
        disabled={disabled}
      >
        Approve
      </WorkflowActionButton>
      <WorkflowActionButton
        onClick={onReject}
        icon={<X size={11} strokeWidth={2.5} />}
        variant="red"
        disabled={disabled}
      >
        Reject
      </WorkflowActionButton>
      <WorkflowActionButton
        onClick={onRequireChange}
        icon={<AlertCircle size={11} strokeWidth={2} />}
        variant="outline-amber"
        disabled={disabled}
      >
        Require Change
      </WorkflowActionButton>
    </>
  );
}
