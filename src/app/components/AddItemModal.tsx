/**
 * Backward-compatible wrapper. Prefer `LineItemFormModal` from `./pr-line-items`.
 */
import { LineItemFormModal, type LineItemFormValues } from './pr-line-items';

export type AddItemData = LineItemFormValues & {
  glAccounts: Array<{ account: string; name: string; amount: number; percentage: number }>;
};

interface AddItemModalProps {
  onClose: () => void;
  onSave: (data: AddItemData) => void;
}

export function AddItemModal({ onClose, onSave }: AddItemModalProps) {
  return (
    <LineItemFormModal
      mode="add"
      onClose={onClose}
      onSave={onSave}
    />
  );
}
