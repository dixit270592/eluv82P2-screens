export type PRStatus =
  | 'unsubmitted'
  | 'recalled'
  | 'submitted'
  | 'awaiting_approval'
  | 'in_approval'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export type ViewRole = 'requester' | 'approver' | 'po_creator';

export type NextActionInfo =
  | {
      type: 'single';
      name: string;
      initials: string;
      avatarBg?: string;
    }
  | {
      type: 'group';
      roleName: string;
      approverCount: number;
    };

export const DEFAULT_NEXT_ACTION: NextActionInfo = {
  type: 'single',
  name: 'Joe Smith',
  initials: 'JS',
  avatarBg: '#1A7A6E',
};

export const isInApprovalStatus = (status: PRStatus) =>
  status === 'submitted' || status === 'awaiting_approval' || status === 'in_approval';

export const isEditableStatus = (status: PRStatus) =>
  status === 'unsubmitted' || status === 'recalled';

/** Secondary status badge shown beside "Request: Saved" */
export const getSecondaryBadgeStatus = (
  status: PRStatus,
  viewRole: ViewRole,
): PRStatus | null => {
  if (viewRole === 'approver' && isInApprovalStatus(status)) return null;
  if (status === 'recalled') return 'unsubmitted';
  if (status === 'unsubmitted') return 'unsubmitted';
  if (isInApprovalStatus(status)) return 'submitted';
  if (status === 'approved' || status === 'rejected' || status === 'cancelled') return status;
  return null;
};

/** Muted inline label between back link and title (requester view only) */
export const getInlineStatusLabel = (
  status: PRStatus,
  viewRole: ViewRole,
): string | null => {
  if (viewRole === 'approver') return null;
  if (isInApprovalStatus(status)) return 'Submitted';
  if (status === 'recalled') return 'Recalled';
  return null;
};

export const getRequestLabel = (status: PRStatus): string => {
  switch (status) {
    case 'unsubmitted':
      return 'Saved';
    case 'recalled':
      return 'Recalled';
    case 'submitted':
      return 'Submitted';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'cancelled':
      return 'Cancelled';
  }
};

export const getCancelledPRIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem('pr-cancelled-ids') || '[]');
  } catch {
    return [];
  }
};

export const markPRCancelled = (id: string) => {
  const ids = getCancelledPRIds();
  if (!ids.includes(id)) {
    localStorage.setItem('pr-cancelled-ids', JSON.stringify([...ids, id]));
  }
};

export const buildNextActionFromApprovers = (approvers: string[]): NextActionInfo => {
  if (approvers.length > 1) {
    return {
      type: 'group',
      roleName: 'Finance Approval Group',
      approverCount: approvers.length,
    };
  }
  const name = approvers[0] || 'Joe Smith';
  return {
    type: 'single',
    name,
    initials: name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    avatarBg: '#1A7A6E',
  };
};
