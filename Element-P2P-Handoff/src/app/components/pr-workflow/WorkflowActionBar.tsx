import { Save, Send, X, Mail, FilePlus, RefreshCw } from 'lucide-react';
import { UI_FONT_STACK as F } from '../../tokens/typography';
import type { PRStatus, ViewRole } from '../../types/prWorkflow';
import { isEditableStatus, isInApprovalStatus } from '../../types/prWorkflow';
import { CopyButton } from './CopyButton';
import { PrintButton } from './PrintButton';
import { StarButton } from './StarButton';
import { WorkflowActionButton } from './WorkflowActionButton';
import { ApprovalActions } from './ApprovalActions';
import type { WorkflowActionHandlers } from './WorkflowActionBar.types';
import { WF } from './workflowTokens';

export type { WorkflowActionHandlers } from './WorkflowActionBar.types';

interface WorkflowActionBarProps {
  status: PRStatus;
  viewRole: ViewRole;
  onViewRoleChange: (role: ViewRole) => void;
  poCreated: boolean;
  handlers: WorkflowActionHandlers;
  isStarred?: boolean;
  /** When true, only renders action buttons (no role switcher chrome) */
  actionsOnly?: boolean;
}

const ROLE_LABELS: Record<ViewRole, string> = {
  requester: 'Requester',
  approver: 'Approver',
  po_creator: 'PO',
};

export function RolePreviewSwitcher({
  viewRole,
  onViewRoleChange,
}: {
  viewRole: ViewRole;
  onViewRoleChange: (role: ViewRole) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Preview role"
      style={{
        display: 'inline-flex',
        padding: 2,
        background: '#F2F4F7',
        borderRadius: 6,
        border: '1px solid #E4E7EC',
        gap: 1,
      }}
    >
      {(['requester', 'approver', 'po_creator'] as ViewRole[]).map((role) => {
        const active = viewRole === role;
        return (
          <button
            key={role}
            type="button"
            onClick={() => onViewRoleChange(role)}
            style={{
              height: 22,
              padding: '0 8px',
              border: 'none',
              borderRadius: 4,
              background: active ? '#FFFFFF' : 'transparent',
              boxShadow: active ? '0 1px 2px rgba(16, 24, 40, 0.08)' : 'none',
              fontSize: '10px',
              fontWeight: 600,
              color: active ? '#1FA97A' : '#667085',
              fontFamily: F,
              cursor: 'pointer',
              transition: 'all 0.12s',
              whiteSpace: 'nowrap',
            }}
          >
            {ROLE_LABELS[role]}
          </button>
        );
      })}
    </div>
  );
}

function renderDraftActions(handlers: WorkflowActionHandlers, showCopy: boolean) {
  return (
    <>
      <WorkflowActionButton onClick={handlers.onSave} icon={<Save size={12} strokeWidth={2} />} variant="blue">
        Save
      </WorkflowActionButton>
      <WorkflowActionButton onClick={handlers.onSubmit} icon={<Send size={12} strokeWidth={2} />} variant="green">
        Submit for Approval
      </WorkflowActionButton>
      <WorkflowActionButton onClick={handlers.onCancel} icon={<X size={12} strokeWidth={2.5} />} variant="gray">
        Cancel
      </WorkflowActionButton>
      {showCopy && <CopyButton onClick={handlers.onCopy} />}
    </>
  );
}

function renderInApprovalRequesterActions(handlers: WorkflowActionHandlers) {
  return (
    <>
      <WorkflowActionButton onClick={handlers.onRecall} variant="green">
        Recall
      </WorkflowActionButton>
      <WorkflowActionButton onClick={handlers.onCancel} icon={<X size={12} strokeWidth={2.5} />} variant="gray">
        Cancel
      </WorkflowActionButton>
      <CopyButton onClick={handlers.onCopy} />
    </>
  );
}

function renderApproverInApprovalActions(handlers: WorkflowActionHandlers) {
  return (
    <>
      <ApprovalActions
        onApprove={handlers.onApprove}
        onReject={handlers.onReject}
        onRequireChange={handlers.onRequireChange}
      />
      <WorkflowActionButton onClick={handlers.onSave} icon={<Save size={12} strokeWidth={2} />} variant="blue">
        Save
      </WorkflowActionButton>
      <WorkflowActionButton onClick={handlers.onSubmit} icon={<Send size={12} strokeWidth={2} />} variant="green">
        Submit for Approval
      </WorkflowActionButton>
      <WorkflowActionButton onClick={handlers.onCancel} icon={<X size={12} strokeWidth={2.5} />} variant="gray">
        Cancel
      </WorkflowActionButton>
    </>
  );
}

function renderUtilityActions(handlers: WorkflowActionHandlers, isStarred: boolean) {
  return (
    <>
      <PrintButton onClick={handlers.onPrint} />
      <StarButton onClick={handlers.onToggleStar} active={isStarred} />
    </>
  );
}

export function WorkflowActionBar({
  status,
  viewRole,
  onViewRoleChange,
  poCreated,
  handlers,
  isStarred = false,
  actionsOnly = false,
}: WorkflowActionBarProps) {
  const isCancelled = status === 'cancelled';

  const renderRequesterActions = () => {
    if (isCancelled) {
      return <CopyButton onClick={handlers.onCopy} title="Copy cancelled request" />;
    }

    if (isEditableStatus(status)) {
      return renderDraftActions(handlers, status === 'recalled');
    }

    if (isInApprovalStatus(status)) {
      return renderInApprovalRequesterActions(handlers);
    }

    if (status === 'approved' || status === 'rejected') {
      return <CopyButton onClick={handlers.onCopy} />;
    }

    return null;
  };

  const renderApproverActions = () => {
    if (!isInApprovalStatus(status)) return null;
    return renderApproverInApprovalActions(handlers);
  };

  const renderPOCreatorActions = () => {
    if (status !== 'approved') return null;

    if (!poCreated) {
      return (
        <WorkflowActionButton onClick={handlers.onCreatePO} icon={<FilePlus size={12} strokeWidth={2} />} variant="green">
          Create PO
        </WorkflowActionButton>
      );
    }

    return (
      <>
        <WorkflowActionButton onClick={handlers.onEmailPO} icon={<Mail size={12} strokeWidth={2} />} variant="blue">
          Email PO
        </WorkflowActionButton>
        <WorkflowActionButton
          onClick={handlers.onCreateChangeOrder}
          icon={<RefreshCw size={12} strokeWidth={2} />}
          variant="amber"
        >
          Change Order
        </WorkflowActionButton>
      </>
    );
  };

  const actions =
    viewRole === 'approver'
      ? renderApproverActions()
      : viewRole === 'po_creator'
        ? renderPOCreatorActions()
        : renderRequesterActions();

  const utilityActions = renderUtilityActions(handlers, isStarred);

  const actionButtons = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        flexShrink: 0,
      }}
    >
      {actions}
      {utilityActions}
    </div>
  );

  if (actionsOnly) {
    return actionButtons;
  }

  const hasWorkflowActions = Boolean(actions);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        padding: '8px 10px',
        background: '#FFFFFF',
        border: `1px solid ${WF.toolbarBorder}`,
        borderRadius: WF.toolbarRadius,
        opacity: isCancelled ? 0.85 : 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: WF.actionGap,
          flexWrap: 'wrap',
          flex: '1 1 auto',
          minWidth: 0,
        }}
      >
        {actions}
        {utilityActions}
      </div>

      {!hasWorkflowActions && isCancelled && (
        <span style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F, flex: 1 }}>
          No workflow actions available
        </span>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginLeft: 'auto',
          flexShrink: 0,
        }}
      >
        <RolePreviewSwitcher viewRole={viewRole} onViewRoleChange={onViewRoleChange} />
      </div>
    </div>
  );
}
