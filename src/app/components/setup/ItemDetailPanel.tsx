import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { ArrowLeft, ImageIcon, Plus, Trash2 } from 'lucide-react';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  ITEM_GL_ACCOUNT_OPTIONS,
  ITEM_UOM_OPTIONS,
  cloneItemVendor,
  formatCurrency,
  type ItemVendor,
  type SetupItem,
} from '../../data/itemSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type ItemDetailPanelProps = {
  item: SetupItem;
  isNew: boolean;
  isDirty: boolean;
  onChange: (updater: (current: SetupItem) => SetupItem) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function ItemDetailPanel({
  item,
  isNew,
  isDirty,
  onChange,
  onSave,
  onCancel,
}: ItemDetailPanelProps) {
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<ItemVendor | null>(null);

  const set = <K extends keyof SetupItem>(key: K, value: SetupItem[K]) => {
    onChange((current) => ({ ...current, [key]: value }));
  };

  const canSave =
    item.itemId.trim().length > 0 && item.name.trim().length > 0 && item.cost >= 0;

  const openAddVendor = () => {
    setEditingVendor(null);
    setVendorDialogOpen(true);
  };

  const openEditVendor = (vendor: ItemVendor) => {
    setEditingVendor(vendor);
    setVendorDialogOpen(true);
  };

  const handleSaveVendor = (vendor: ItemVendor) => {
    onChange((current) => {
      const exists = current.vendors.some((v) => v.id === vendor.id);
      if (exists) {
        return {
          ...current,
          vendors: current.vendors.map((v) => (v.id === vendor.id ? vendor : v)),
        };
      }
      return { ...current, vendors: [...current.vendors, vendor] };
    });
    setVendorDialogOpen(false);
  };

  const handleDeleteVendor = (vendorId: string) => {
    onChange((current) => ({
      ...current,
      vendors: current.vendors.filter((v) => v.id !== vendorId),
    }));
  };

  return (
    <div style={{ fontFamily: F, display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            border: '1px solid #E4E7EC',
            borderRadius: '8px',
            background: '#FFFFFF',
            color: '#334155',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: F,
          }}
        >
          <ArrowLeft size={16} aria-hidden />
          Back to items
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isDirty && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#B45309',
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '999px',
                padding: '4px 10px',
              }}
            >
              Unsaved changes
            </span>
          )}
          <button type="button" onClick={onCancel} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            style={{
              padding: '9px 18px',
              border: 'none',
              borderRadius: '8px',
              background: canSave ? P2P_BRAND.primary : '#CBD5E1',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: canSave ? 'pointer' : 'not-allowed',
              fontFamily: F,
            }}
          >
            Save
          </button>
        </div>
      </div>

    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
        border: '1px solid #E4E7EC',
        borderRadius: '12px',
        overflow: 'hidden',
        fontFamily: F,
      }}
    >
      <header
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #EEF1F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 600,
            color: '#0F172A',
            letterSpacing: '-0.01em',
          }}
        >
          {item.name || (isNew ? 'New item' : 'Item')}
        </h2>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '10px',
              border: '1px dashed #CBD5E1',
              background: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
              />
            ) : (
              <>
                <ImageIcon size={32} color="#94A3B8" aria-hidden />
                <button
                  type="button"
                  style={{
                    padding: '4px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    background: P2P_BRAND.primary,
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: F,
                  }}
                >
                  Upload
                </button>
              </>
            )}
          </div>

          <div
            style={{
              flex: 1,
              minWidth: '280px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '16px',
            }}
          >
            <Field label="Item Id" required>
              <input
                value={item.itemId}
                onChange={(e) => set('itemId', e.target.value)}
                placeholder="Item Id"
                style={inputStyle}
              />
            </Field>
            <Field label="Item Name" required>
              <input
                value={item.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Item Name"
                style={inputStyle}
              />
            </Field>
            <Field label="Description" fullWidth>
              <textarea
                value={item.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Description"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '72px' }}
              />
            </Field>
            <Field label="Unit of Measure">
              <select
                value={item.unitOfMeasure}
                onChange={(e) => set('unitOfMeasure', e.target.value)}
                style={inputStyle}
              >
                {ITEM_UOM_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="GL Account">
              <select
                value={item.glAccount}
                onChange={(e) => set('glAccount', e.target.value)}
                style={inputStyle}
              >
                {ITEM_GL_ACCOUNT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Cost" required>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '13px',
                    color: '#64748B',
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.cost || ''}
                  onChange={(e) => set('cost', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  style={{ ...inputStyle, paddingLeft: '24px' }}
                />
              </div>
            </Field>
            <Field label="Keywords" fullWidth>
              <input
                value={item.keywords}
                onChange={(e) => set('keywords', e.target.value)}
                placeholder="Keywords"
                style={inputStyle}
              />
            </Field>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '22px' }}>
              <Switch
                id="item-active"
                checked={item.active}
                onCheckedChange={(checked) => set('active', Boolean(checked))}
              />
              <Label htmlFor="item-active" style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                Active
              </Label>
            </div>
          </div>
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `2px solid ${P2P_BRAND.primary}`,
              marginBottom: '16px',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: P2P_BRAND.primaryStrong,
                padding: '8px 0',
              }}
            >
              Vendors
            </span>
            <button
              type="button"
              onClick={openAddVendor}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                marginBottom: '8px',
                border: 'none',
                borderRadius: '6px',
                background: P2P_BRAND.primary,
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: F,
              }}
            >
              <Plus size={14} aria-hidden />
              Add
            </button>
          </div>

          <div style={{ border: '1px solid #E4E7EC', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E4E7EC' }}>
                  {['', 'Vendor Name', 'Part Number', 'Price', 'Action'].map((header) => (
                    <th
                      key={header || 'status'}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#64748B',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {item.vendors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ padding: '24px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}
                    >
                      No vendors linked to this item yet.
                    </td>
                  </tr>
                ) : (
                  item.vendors.map((vendor) => (
                    <tr key={vendor.id} style={{ borderBottom: '1px solid #EEF1F5' }}>
                      <td style={{ padding: '12px 14px', width: '80px' }}>
                        <ActiveBadge active={vendor.active} />
                      </td>
                      <td style={{ padding: '12px 14px', color: P2P_BRAND.primaryStrong, fontWeight: 500 }}>
                        {vendor.vendorName}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#334155' }}>{vendor.partNumber}</td>
                      <td style={{ padding: '12px 14px', color: '#334155' }}>$ {formatCurrency(vendor.price)}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => openEditVendor(vendor)}
                            style={linkButtonStyle}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVendor(vendor.id)}
                            aria-label={`Delete ${vendor.vendorName}`}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#94A3B8',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'inline-flex',
                            }}
                          >
                            <Trash2 size={14} aria-hidden />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ItemVendorFormDialog
        open={vendorDialogOpen}
        initial={editingVendor}
        onOpenChange={setVendorDialogOpen}
        onSave={handleSaveVendor}
      />
    </section>
    </div>
  );
}

type ItemVendorFormDialogProps = {
  open: boolean;
  initial: ItemVendor | null;
  onOpenChange: (open: boolean) => void;
  onSave: (vendor: ItemVendor) => void;
};

function ItemVendorFormDialog({
  open,
  initial,
  onOpenChange,
  onSave,
}: ItemVendorFormDialogProps) {
  const [draft, setDraft] = useState<Omit<ItemVendor, 'id'>>({
    vendorName: '',
    partNumber: '',
    price: 0,
    active: true,
  });

  useEffect(() => {
    if (!open) return;
    if (initial) setDraft(cloneItemVendor(initial));
    else
      setDraft({
        vendorName: '',
        partNumber: '',
        price: 0,
        active: true,
      });
  }, [open, initial]);

  const canSave = draft.vendorName.trim().length > 0 && draft.partNumber.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]" style={{ fontFamily: F }}>
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit vendor' : 'Add vendor'}</DialogTitle>
        </DialogHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '4px 0' }}>
          <Field label="Vendor Name" required>
            <input
              value={draft.vendorName}
              onChange={(e) => setDraft((d) => ({ ...d, vendorName: e.target.value }))}
              style={inputStyle}
            />
          </Field>
          <Field label="Part Number" required>
            <input
              value={draft.partNumber}
              onChange={(e) => setDraft((d) => ({ ...d, partNumber: e.target.value }))}
              style={inputStyle}
            />
          </Field>
          <Field label="Price">
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '13px',
                  color: '#64748B',
                }}
              >
                $
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={draft.price || ''}
                onChange={(e) => setDraft((d) => ({ ...d, price: parseFloat(e.target.value) || 0 }))}
                style={{ ...inputStyle, paddingLeft: '24px' }}
              />
            </div>
          </Field>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Switch
              id="vendor-active"
              checked={draft.active}
              onCheckedChange={(checked) => setDraft((d) => ({ ...d, active: Boolean(checked) }))}
            />
            <Label htmlFor="vendor-active" style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
              Active
            </Label>
          </div>
        </div>
        <DialogFooter>
          <button type="button" onClick={() => onOpenChange(false)} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={() =>
              onSave({
                id: initial?.id ?? `vendor-${crypto.randomUUID()}`,
                vendorName: draft.vendorName.trim(),
                partNumber: draft.partNumber.trim(),
                price: draft.price,
                active: draft.active,
              })
            }
            style={{
              ...secondaryButtonStyle,
              background: canSave ? P2P_BRAND.primary : '#CBD5E1',
              color: '#FFFFFF',
              border: 'none',
              cursor: canSave ? 'pointer' : 'not-allowed',
            }}
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  fullWidth,
  children,
}: {
  label: string;
  required?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        gridColumn: fullWidth ? '1 / -1' : undefined,
      }}
    >
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
        {label}
        {required && (
          <span style={{ color: '#EF4444', marginLeft: '2px' }} aria-hidden>
            *
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      style={{
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        padding: '2px 7px',
        borderRadius: '999px',
        background: active ? '#ECFDF5' : '#F1F5F9',
        color: active ? '#059669' : '#64748B',
        border: `1px solid ${active ? '#A7F3D0' : '#E2E8F0'}`,
      }}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #E4E7EC',
  borderRadius: '8px',
  fontSize: '13px',
  color: '#0F172A',
  background: '#FFFFFF',
  outline: 'none',
  fontFamily: F,
  boxSizing: 'border-box',
};

const linkButtonStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: P2P_BRAND.primaryStrong,
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
  padding: 0,
};

const secondaryButtonStyle: CSSProperties = {
  padding: '8px 16px',
  border: '1px solid #E4E7EC',
  borderRadius: '8px',
  background: '#FFFFFF',
  color: '#334155',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
};
