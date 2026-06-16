export type PermissionId = string;

export type PermissionCategory = {
  id: string;
  title: string;
  permissions: { id: PermissionId; label: string }[];
};

export type UserGroup = {
  id: string;
  name: string;
  permissions: Set<PermissionId>;
  isSystem?: boolean;
};

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  {
    id: 'general',
    title: 'General Module Access',
    permissions: [
      { id: 'general.expense-request', label: 'User can create Expense Request' },
      { id: 'general.capex-request', label: 'User can create CapEx Request' },
      { id: 'general.blanket-request', label: 'User can create Blanket Request' },
      { id: 'general.invoice-request', label: 'User can create Invoice Request' },
      { id: 'general.standard-pr', label: 'User can create Standard Purchase Requests' },
    ],
  },
  {
    id: 'vendor',
    title: 'Vendor Management Editing Options',
    permissions: [
      { id: 'vendor.dispute-invoices', label: 'User can contact Vendor to dispute invoices' },
      { id: 'vendor.send-invitations', label: 'User can send invitations to vendors' },
      { id: 'vendor.edit-details', label: 'User can edit Vendor details' },
      { id: 'vendor.delete-documents', label: 'User can delete Vendor Documents' },
      { id: 'vendor.assign-data-entry', label: 'User can assign Vendor to another user for data entry' },
      { id: 'vendor.audit-portal', label: 'User can audit Vendor portal data' },
      { id: 'vendor.approve', label: 'User can approve vendors' },
    ],
  },
  {
    id: 'receiving',
    title: 'Receiving Options',
    permissions: [
      { id: 'receiving.create-receipts', label: 'User can create Receipts' },
      { id: 'receiving.modify-delete', label: 'User can modify and delete receipts' },
      { id: 'receiving.change-costs', label: 'User can change Costs on receipts' },
      { id: 'receiving.delete-attachments', label: 'User can delete attachment associated with Receipts' },
      { id: 'receiving.invoice-matching', label: 'User can create invoice matching transaction from the receiving screen' },
    ],
  },
  {
    id: 'invoice',
    title: 'Invoice Editing Options',
    permissions: [
      { id: 'invoice.edit-all-fields', label: 'User can edit all fields on Item Detail Screen' },
      { id: 'invoice.edit-account', label: 'User can edit Account Field on Item Detail Screen' },
      { id: 'invoice.edit-project', label: 'User can edit Project Field on Item Detail Screen' },
      { id: 'invoice.edit-price-qty', label: 'User can edit Price and Quantity on Item Detail Screen' },
      { id: 'invoice.assign-data-entry', label: 'User can assign Invoice to another User for data entry' },
      { id: 'invoice.add-lines', label: 'User can add lines to Invoice' },
      { id: 'invoice.add-shipping', label: 'User can add Shipping cost to invoice' },
      { id: 'invoice.export', label: 'User can Export Data' },
      { id: 'invoice.edit-portal-data', label: 'User can edit Vendor Portal invoice data' },
    ],
  },
  {
    id: 'expense',
    title: 'Expense Options',
    permissions: [{ id: 'expense.export', label: 'User can Export Data' }],
  },
  {
    id: 'po',
    title: 'Purchase Order Options',
    permissions: [
      { id: 'po.create', label: 'User can create Purchase Order' },
      { id: 'po.change-order', label: 'User can create Change Order' },
      { id: 'po.change-terms', label: 'User can change Terms and Conditions on Purchase Order' },
      { id: 'po.cancel', label: 'User can cancel the Purchase Order' },
      { id: 'po.hold', label: 'User can place Purchase Order on hold / remove hold' },
      { id: 'po.export', label: 'User can Export Data' },
      { id: 'po.reopen', label: 'User can reopen closed PO' },
    ],
  },
  {
    id: 'pr',
    title: 'Purchase Request Editing Options',
    permissions: [
      { id: 'pr.edit-all-fields', label: 'User can edit all fields on Item Detail Screen' },
      { id: 'pr.edit-account', label: 'User can edit Account Fields on Item Detail Screen' },
      { id: 'pr.edit-project', label: 'User can edit Project Fields on Item Detail Screen' },
      { id: 'pr.edit-vendor', label: 'User can edit Vendor Fields on Item Detail Screen' },
      { id: 'pr.edit-price-qty', label: 'User can edit Price and Quantity on Item Detail Screen' },
      { id: 'pr.edit-terms', label: 'User can edit Terms Fields on Item Detail Screen' },
      { id: 'pr.assign-data-entry', label: 'User can assign PR to another user for data entry' },
      { id: 'pr.request-quotes', label: 'User can create request for Quotes' },
      { id: 'pr.export', label: 'User can Export Data' },
      { id: 'pr.reopen', label: 'User can reopen closed PR' },
    ],
  },
];

export const ALL_PERMISSION_IDS = PERMISSION_CATEGORIES.flatMap((c) =>
  c.permissions.map((p) => p.id),
);

function permissionSet(ids: PermissionId[]): Set<PermissionId> {
  return new Set(ids);
}

export function createSeedGroups(): UserGroup[] {
  return [
    {
      id: 'group-general',
      name: 'General',
      isSystem: true,
      permissions: permissionSet(ALL_PERMISSION_IDS),
    },
    {
      id: 'group-request-creator',
      name: 'Request Creator',
      permissions: permissionSet([
        'general.standard-pr',
        'general.expense-request',
        'pr.edit-all-fields',
        'pr.edit-price-qty',
      ]),
    },
    {
      id: 'group-new',
      name: 'New group',
      permissions: permissionSet([]),
    },
    {
      id: 'group-new-test',
      name: 'New test',
      permissions: permissionSet(['general.standard-pr']),
    },
    {
      id: 'group-test',
      name: 'test',
      permissions: permissionSet(['receiving.create-receipts', 'po.create']),
    },
  ];
}

export function cloneGroup(group: UserGroup): UserGroup {
  return {
    ...group,
    permissions: new Set(group.permissions),
  };
}

export function countCategoryPermissions(
  category: PermissionCategory,
  permissions: Set<PermissionId>,
): { selected: number; total: number } {
  const total = category.permissions.length;
  const selected = category.permissions.filter((p) => permissions.has(p.id)).length;
  return { selected, total };
}
