import { ArrowLeft } from 'lucide-react';
import { UI_FONT_STACK as F } from '../../tokens/typography';
import { P2P_BRAND } from '../../tokens/brand';
import type { NextActionInfo, PRStatus, ViewRole } from '../../types/prWorkflow';
import {
  getInlineStatusLabel,
  getSecondaryBadgeStatus,
  isInApprovalStatus,
} from '../../types/prWorkflow';
import { StatusBadge } from './StatusBadge';
import { NextActionPanel } from './NextActionPanel';
import { WorkflowActionBar, RolePreviewSwitcher, type WorkflowActionHandlers } from './WorkflowActionBar';
import { WF } from './workflowTokens';

export type { WorkflowActionHandlers };

interface PRWorkflowHeaderProps {
  prId: string;
  department: string;
  requiredBy: string;
  status: PRStatus;
  viewRole: ViewRole;
  onViewRoleChange: (role: ViewRole) => void;
  poCreated: boolean;
  nextAction: NextActionInfo;
  onBack: () => void;
  handlers: WorkflowActionHandlers;
}

export function PRWorkflowHeader({
  prId,
  department,
  requiredBy,
  status,
  viewRole,
  onViewRoleChange,
  poCreated,
  nextAction,
  onBack,
  handlers,
}: PRWorkflowHeaderProps) {
  const isCancelled = status === 'cancelled';
  const inlineLabel = getInlineStatusLabel(status, viewRole);
  const secondaryBadge = getSecondaryBadgeStatus(status, viewRole);
  const showNextAction =
    isInApprovalStatus(status) && (viewRole === 'requester' || viewRole === 'approver');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: WF.cardGap,
        padding: WF.cardPad,
        marginBottom: 16,
        background: P2P_BRAND.surface,
        border: '1px solid #E4E7EC',
        borderRadius: WF.cardRadius,
        boxShadow: '0 1px 4px rgba(16, 24, 40, 0.04)',
        opacity: isCancelled ? 0.92 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '13px',
            color: '#667085',
            fontFamily: F,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: 0,
            padding: 0,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#1FA97A';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#667085';
          }}
        >
          <ArrowLeft size={14} strokeWidth={2} />
          Back to Purchase Requests
        </button>
        {inlineLabel && (
          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#98A2B3',
              fontFamily: F,
            }}
          >
            {inlineLabel}
          </span>
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <h1
          style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: 700,
            color: '#101828',
            fontFamily: F,
          }}
        >
          Purchase Request
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: '13px',
            color: '#667085',
            fontFamily: F,
            lineHeight: 1.4,
          }}
        >
          {prId}
          <span style={{ color: '#D0D5DD' }} aria-hidden>
            {' '}
            ·{' '}
          </span>
          {department}
          <span style={{ color: '#D0D5DD' }} aria-hidden>
            {' '}
            ·{' '}
          </span>
          Needed by {requiredBy}
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            minWidth: 0,
            flex: '1 1 auto',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              color: isCancelled ? '#98A2B3' : '#667085',
              fontFamily: F,
              fontWeight: 500,
            }}
          >
            Request: Saved
          </span>
          {secondaryBadge && <StatusBadge status={secondaryBadge} pill />}
          <WorkflowActionBar
            status={status}
            viewRole={viewRole}
            onViewRoleChange={onViewRoleChange}
            poCreated={poCreated}
            handlers={handlers}
            actionsOnly
          />
        </div>

        {showNextAction && (
          <NextActionPanel
            nextAction={nextAction}
            status={status}
            viewRole={viewRole}
            layout="inline"
          />
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
        <RolePreviewSwitcher viewRole={viewRole} onViewRoleChange={onViewRoleChange} />
      </div>
    </div>
  );
}
