import { UI_FONT_STACK as F } from '../../tokens/typography';
import type { PRStatus } from '../../types/prWorkflow';
import { WF } from './workflowTokens';

const PILL_LABELS: Partial<Record<PRStatus, { label: string; color: string }>> = {
  unsubmitted: { label: 'Unsubmitted', color: '#667085' },
  submitted: { label: 'In Approval', color: '#D97706' },
  awaiting_approval: { label: 'In Approval', color: '#D97706' },
  in_approval: { label: 'In Approval', color: '#D97706' },
  approved: { label: 'Approved', color: '#1FA97A' },
  rejected: { label: 'Rejected', color: '#F04438' },
  cancelled: { label: 'Cancelled', color: '#667085' },
};

interface StatusBadgeProps {
  status: PRStatus;
  /** Render as a different status (e.g. recalled → unsubmitted pill) */
  displayAs?: PRStatus;
  /** Legacy inline pill style from MainPurchaseRequestV2 header */
  pill?: boolean;
}

export function StatusBadge({ status, displayAs, pill = true }: StatusBadgeProps) {
  const resolved = displayAs ?? status;
  const meta = PILL_LABELS[resolved];

  if (!meta) return null;

  if (pill) {
    return (
      <span
        role="status"
        aria-label={`Status: ${meta.label}`}
        style={{
          padding: '4px 10px',
          border: '1px solid #E4E7EC',
          borderRadius: '100px',
          background: '#FFFFFF',
          fontSize: '11px',
          fontWeight: 600,
          color: meta.color,
          fontFamily: F,
          whiteSpace: 'nowrap',
          lineHeight: 1,
        }}
      >
        {meta.label}
      </span>
    );
  }

  const dotColor =
    resolved === 'submitted' || resolved === 'awaiting_approval' || resolved === 'in_approval'
      ? '#F59E0B'
      : resolved === 'approved'
        ? '#10B981'
        : resolved === 'rejected'
          ? '#EF4444'
          : '#98A2B3';

  return (
    <span
      role="status"
      aria-label={`Status: ${meta.label}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height: WF.badgeHeight,
        padding: '0 8px 0 6px',
        borderRadius: 100,
        background: '#FFFFFF',
        border: '1px solid #E4E7EC',
        fontSize: '10.5px',
        fontWeight: 600,
        color: meta.color,
        fontFamily: F,
        whiteSpace: 'nowrap',
        lineHeight: 1,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: dotColor,
          flexShrink: 0,
        }}
      />
      {meta.label}
    </span>
  );
}
