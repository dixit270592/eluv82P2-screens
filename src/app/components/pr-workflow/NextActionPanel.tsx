import { Users } from 'lucide-react';
import { UI_FONT_STACK as F } from '../../tokens/typography';
import { P2P_BRAND } from '../../tokens/brand';
import type { NextActionInfo, PRStatus, ViewRole } from '../../types/prWorkflow';

interface NextActionPanelProps {
  nextAction: NextActionInfo;
  status: PRStatus;
  viewRole: ViewRole;
  layout?: 'inline' | 'stacked';
}

function getHeadline(
  status: PRStatus,
  viewRole: ViewRole,
  nextAction: NextActionInfo,
): string {
  if (status === 'approved') return 'Ready for PO';
  if (viewRole === 'approver') return 'Next Approver';
  if (nextAction.type === 'group') return nextAction.roleName;
  return 'Awaiting Approval';
}

function getAssigneeLabel(nextAction: NextActionInfo, status: PRStatus, viewRole: ViewRole): string {
  if (status === 'approved') return 'All approvals complete';
  if (nextAction.type === 'group') return 'Multiple Approvers';
  if (viewRole === 'approver') return nextAction.name;
  return `By ${nextAction.name}`;
}

export function NextActionPanel({
  nextAction,
  status,
  viewRole,
  layout = 'inline',
}: NextActionPanelProps) {
  const headline = getHeadline(status, viewRole, nextAction);
  const assignee = getAssigneeLabel(nextAction, status, viewRole);
  const isGroup = nextAction.type === 'group';
  const tooltip = isGroup
    ? `${nextAction.approverCount} approvers in ${nextAction.roleName}`
    : nextAction.type === 'single'
      ? nextAction.name
      : undefined;

  const avatarSize = layout === 'inline' ? 26 : 28;

  const avatar = status !== 'approved' && (
    isGroup ? (
      <div
        title={tooltip}
        aria-label={tooltip}
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: 6,
          background: 'linear-gradient(145deg, #F2F4F7 0%, #E4E7EC 100%)',
          border: '1px solid #E4E7EC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Users size={13} color="#667085" strokeWidth={2} />
      </div>
    ) : (
      <div
        title={tooltip}
        aria-label={tooltip}
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: 6,
          background:
            nextAction.type === 'single'
              ? nextAction.avatarBg ||
                `linear-gradient(135deg, ${P2P_BRAND.primary} 0%, ${P2P_BRAND.primaryStrong} 100%)`
              : '#F2F4F7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 700,
          color: '#FFFFFF',
          fontFamily: F,
          flexShrink: 0,
          boxShadow: '0 1px 2px rgba(16, 24, 40, 0.08)',
        }}
      >
        {nextAction.type === 'single' ? nextAction.initials : null}
      </div>
    )
  );

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: layout === 'inline' ? '5px 10px 5px 6px' : '8px 10px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #E4E7EC',
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(16, 24, 40, 0.05)',
        flexShrink: 0,
        maxWidth: layout === 'inline' ? 280 : '100%',
        minWidth: layout === 'inline' ? 0 : undefined,
      }}
    >
      {avatar}
      <div style={{ minWidth: 0, lineHeight: 1.25 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#344054',
              fontFamily: F,
            }}
          >
            Next Action:
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#101828',
              fontFamily: F,
            }}
          >
            {headline}
          </span>
        </div>
        <div
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: '#667085',
            fontFamily: F,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginTop: 1,
          }}
        >
          {assignee}
        </div>
      </div>
    </div>
  );
}
