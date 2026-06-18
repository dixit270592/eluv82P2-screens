export type ApprovalUser = {
  id: string;
  name: string;
};

export type ApprovalGroup = {
  id: string;
  name: string;
  userIds: string[];
  active: boolean;
};

export const APPROVAL_USERS: ApprovalUser[] = [
  { id: 'user-prerna', name: 'Prerna Surana' },
  { id: 'user-ellie', name: 'Ellie Sood' },
  { id: 'user-natasha', name: 'Natasha Tuber' },
  { id: 'user-shubham', name: 'Shubham Vyas' },
  { id: 'user-nishtha', name: 'nishtha thakkar' },
  { id: 'user-suraj', name: 'Suraj gandhi' },
  { id: 'user-yogesh', name: 'Yogesh Hadiya' },
  { id: 'user-sg', name: 'SG Oberoi' },
];

export function getUserById(id: string): ApprovalUser | undefined {
  return APPROVAL_USERS.find((u) => u.id === id);
}

export function formatUserNames(userIds: string[]): string {
  return userIds
    .map((id) => getUserById(id)?.name)
    .filter(Boolean)
    .join(', ');
}

export function createSeedApprovalGroups(): ApprovalGroup[] {
  return [
    {
      id: 'ag-prerna',
      name: 'Prerna',
      userIds: ['user-sg'],
      active: true,
    },
    {
      id: 'ag-test-123',
      name: 'test 123',
      userIds: ['user-yogesh'],
      active: true,
    },
    {
      id: 'ag-testt-2',
      name: 'testt 2',
      userIds: ['user-ellie', 'user-natasha', 'user-suraj'],
      active: true,
    },
  ];
}

export function cloneApprovalGroup(group: ApprovalGroup): ApprovalGroup {
  return { ...group, userIds: [...group.userIds] };
}
