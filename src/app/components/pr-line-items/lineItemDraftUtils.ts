import type { LineItemFormValues } from './lineItemValidation';
import type { PRLineItem } from './types';
import { toLineItemFormValues } from './lineItemBlank';

export function isDraftDirty(
  draft: LineItemFormValues,
  item: PRLineItem,
  isNew: boolean,
): boolean {
  if (isNew) {
    return (
      draft.description.trim() !== '' ||
      draft.vendor.trim() !== '' ||
      draft.cost > 0 ||
      draft.taxGroup.trim() !== '' ||
      draft.projectAccount.trim() !== '' ||
      draft.requiredBy.trim() !== '' ||
      draft.type !== 'Goods' ||
      draft.unitOfMeasure !== (item.unitOfMeasure || 'Each') ||
      draft.vendorTerms !== (item.vendorTerms || 'Net 15') ||
      draft.glAccount !== (item.glAccount || '')
    );
  }

  const saved = toLineItemFormValues(item);
  return (
    draft.description !== saved.description ||
    draft.type !== saved.type ||
    draft.unitOfMeasure !== saved.unitOfMeasure ||
    draft.quantity !== saved.quantity ||
    draft.cost !== saved.cost ||
    draft.requiredBy !== saved.requiredBy ||
    draft.vendorTerms !== saved.vendorTerms ||
    draft.taxGroup !== saved.taxGroup ||
    draft.vendor !== saved.vendor ||
    draft.projectAccount !== saved.projectAccount ||
    draft.glAccount !== saved.glAccount
  );
}

export function hasAnyUnsavedDrafts(
  editingIds: Set<string>,
  draftValues: Record<string, LineItemFormValues>,
  items: PRLineItem[],
  unsavedNewIds: Set<string>,
): boolean {
  for (const id of editingIds) {
    const draft = draftValues[id];
    const item = items.find((i) => i.id === id);
    if (!draft || !item) continue;
    if (isDraftDirty(draft, item, unsavedNewIds.has(id))) return true;
  }
  return false;
}
