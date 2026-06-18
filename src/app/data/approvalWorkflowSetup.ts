import { APPROVAL_USERS } from './approvalGroupSetup';

export type WorkflowCondition = {
  id: string;
  fieldType: string;
  operator: string;
  value: string;
};

export type WorkflowAction = {
  id: string;
  actionType: string;
  userIds: string[];
};

export type WorkflowTrigger = {
  id: string;
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
};

export const WORKFLOW_FIELD_TYPES = [
  'Request Type',
  'Department',
  'Vendor',
  'Amount',
  'Project',
] as const;

export const WORKFLOW_OPERATORS = ['Equals To', 'Not Equals To', 'Contains', 'Greater Than'] as const;

export const WORKFLOW_ACTION_TYPES = [
  'Route to user',
  'Route to group',
  'Send notification',
  'Require attachment',
] as const;

export const WORKFLOW_FIELD_VALUES: Record<string, string[]> = {
  'Request Type': ['CapEx', 'Blanket Request', 'Blanket Request Release', 'Invoice', 'Standard Purchase Request'],
  Department: ['IT', 'Finance', 'Operations', 'HR'],
  Vendor: ['Preferred Vendor', 'New Vendor'],
  Amount: ['Over $5,000', 'Over $25,000'],
  Project: ['Capital', 'Operating'],
};

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function createEmptyCondition(): WorkflowCondition {
  return {
    id: newId('cond'),
    fieldType: 'Request Type',
    operator: 'Equals To',
    value: '',
  };
}

export function createEmptyAction(): WorkflowAction {
  return {
    id: newId('action'),
    actionType: 'Route to user',
    userIds: ['user-prerna'],
  };
}

export function createEmptyTrigger(): WorkflowTrigger {
  return {
    id: newId('trigger'),
    conditions: [createEmptyCondition()],
    actions: [createEmptyAction()],
  };
}

export function createSeedWorkflowTriggers(): WorkflowTrigger[] {
  const prernaGroup = ['user-prerna', 'user-ellie', 'user-natasha'];
  const prernaPair = ['user-prerna', 'user-ellie'];

  return [
    {
      id: 'wf-1',
      conditions: [{ id: 'c1', fieldType: 'Request Type', operator: 'Equals To', value: 'CapEx' }],
      actions: [{ id: 'a1', actionType: 'Route to user', userIds: prernaGroup }],
    },
    {
      id: 'wf-2',
      conditions: [{ id: 'c2', fieldType: 'Request Type', operator: 'Equals To', value: 'Blanket Request' }],
      actions: [{ id: 'a2', actionType: 'Route to user', userIds: prernaGroup }],
    },
    {
      id: 'wf-3',
      conditions: [
        { id: 'c3', fieldType: 'Request Type', operator: 'Equals To', value: 'Blanket Request Release' },
      ],
      actions: [{ id: 'a3', actionType: 'Route to user', userIds: prernaPair }],
    },
    {
      id: 'wf-4',
      conditions: [{ id: 'c4', fieldType: 'Request Type', operator: 'Equals To', value: 'Invoice' }],
      actions: [{ id: 'a4', actionType: 'Route to user', userIds: prernaGroup }],
    },
  ];
}

export function formatUserSummary(userIds: string[]): string {
  if (userIds.length === 0) return 'Select users';
  const first = APPROVAL_USERS.find((u) => u.id === userIds[0])?.name ?? 'User';
  const short = first.length > 10 ? `${first.slice(0, 9)}…` : first;
  if (userIds.length === 1) return short;
  return `${short} + ${userIds.length - 1} other${userIds.length > 2 ? 's' : ''}`;
}

export function summarizeTriggerCondition(trigger: WorkflowTrigger): string {
  const first = trigger.conditions[0];
  if (!first?.value) return 'New rule — set a condition';
  if (trigger.conditions.length === 1) return first.value;
  return `${first.value} + ${trigger.conditions.length - 1} more`;
}

export function summarizeTriggerAction(trigger: WorkflowTrigger): string {
  const first = trigger.actions[0];
  if (!first) return 'No action';
  if (first.actionType === 'Route to user') return formatUserSummary(first.userIds);
  return first.actionType;
}

export function matchTrigger(trigger: WorkflowTrigger, sample: { requestType?: string }): boolean {
  return trigger.conditions.every((cond) => {
    if (cond.fieldType === 'Request Type' && sample.requestType) {
      if (cond.operator === 'Equals To') return cond.value === sample.requestType;
      if (cond.operator === 'Not Equals To') return cond.value !== sample.requestType;
    }
    return false;
  });
}

export function cloneWorkflow(triggers: WorkflowTrigger[]): WorkflowTrigger[] {
  return triggers.map((t) => ({
    ...t,
    conditions: t.conditions.map((c) => ({ ...c })),
    actions: t.actions.map((a) => ({ ...a, userIds: [...a.userIds] })),
  }));
}
