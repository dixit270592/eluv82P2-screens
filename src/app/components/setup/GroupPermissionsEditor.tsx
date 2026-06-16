import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import {
  PERMISSION_CATEGORIES,
  countCategoryPermissions,
  type PermissionId,
  type UserGroup,
} from '../../data/groupSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type GroupPermissionsEditorProps = {
  group: UserGroup | null;
  isNew: boolean;
  isDirty: boolean;
  onNameChange: (name: string) => void;
  onTogglePermission: (id: PermissionId, checked: boolean) => void;
  onToggleCategory: (categoryId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onReset: () => void;
  onSave: () => void;
};

export function GroupPermissionsEditor({
  group,
  isNew,
  isDirty,
  onNameChange,
  onTogglePermission,
  onToggleCategory,
  onSelectAll,
  onExpandAll,
  onCollapseAll,
  onReset,
  onSave,
}: GroupPermissionsEditorProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (!group) {
    return (
      <section
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
          border: '1px solid #E4E7EC',
          borderRadius: '12px',
          fontFamily: F,
          padding: '48px',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '360px' }}>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>
            Select a group to edit
          </p>
          <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
            Choose a group from the list or create a new one to configure module permissions.
          </p>
        </div>
      </section>
    );
  }

  const allSelected = group.permissions.size === PERMISSION_CATEGORIES.flatMap((c) => c.permissions).length;
  const someSelected = group.permissions.size > 0 && !allSelected;

  const toggleExpanded = (categoryId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpanded(new Set(PERMISSION_CATEGORIES.map((c) => c.id)));
    onExpandAll();
  };

  const handleCollapseAll = () => {
    setExpanded(new Set());
    onCollapseAll();
  };

  return (
    <section
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
        border: '1px solid #E4E7EC',
        borderRadius: '12px',
        overflow: 'hidden',
        fontFamily: F,
        minWidth: 0,
      }}
    >
      <header
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E4E7EC',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em' }}>
              {isNew ? 'Create group' : 'Edit group'}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
              Define what users in this group can access across modules.
            </p>
          </div>
          {isDirty && (
            <span
              style={{
                flexShrink: 0,
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
        </div>

        <div>
          <Label
            htmlFor="group-name"
            style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}
          >
            Group name <span style={{ color: '#DC2626' }} aria-hidden>*</span>
          </Label>
          <input
            id="group-name"
            type="text"
            value={group.name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Finance Approvers"
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #E4E7EC',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#0F172A',
              background: '#FFFFFF',
              outline: 'none',
              fontFamily: F,
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              color: '#334155',
            }}
          >
            <Checkbox
              checked={allSelected ? true : someSelected ? 'indeterminate' : false}
              onCheckedChange={(checked) => onSelectAll(checked === true)}
              aria-label="Select all permissions"
            />
            Select all
          </label>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <ToolbarButton onClick={handleExpandAll}>Expand all</ToolbarButton>
            <ToolbarButton onClick={handleCollapseAll}>Collapse all</ToolbarButton>
            <ToolbarButton onClick={onReset}>Reset</ToolbarButton>
          </div>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {PERMISSION_CATEGORIES.map((category) => {
            const isOpen = expanded.has(category.id);
            const counts = countCategoryPermissions(category, group.permissions);
            const categoryAll = counts.selected === counts.total;
            const categorySome = counts.selected > 0 && !categoryAll;

            return (
              <div
                key={category.id}
                style={{
                  border: '1px solid #E4E7EC',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: '#FFFFFF',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0 4px 0 12px',
                    background: isOpen ? P2P_BRAND.surface : '#F8FAFC',
                    borderBottom: isOpen ? `1px solid ${P2P_BRAND.surfaceBorder}` : 'none',
                  }}
                >
                  <Checkbox
                    checked={categoryAll ? true : categorySome ? 'indeterminate' : false}
                    onCheckedChange={(checked) => onToggleCategory(category.id, checked === true)}
                    aria-label={`Select all in ${category.title}`}
                  />
                  <button
                    type="button"
                    onClick={() => toggleExpanded(category.id)}
                    aria-expanded={isOpen}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '12px 8px 12px 0',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: F,
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{category.title}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: counts.selected > 0 ? P2P_BRAND.primaryStrong : '#94A3B8',
                          background: counts.selected > 0 ? '#FFFFFF' : 'transparent',
                          border: counts.selected > 0 ? `1px solid ${P2P_BRAND.surfaceBorder}` : 'none',
                          borderRadius: '999px',
                          padding: '2px 8px',
                        }}
                      >
                        {counts.selected}/{counts.total}
                      </span>
                      {isOpen ? (
                        <Minus size={16} color="#64748B" aria-hidden />
                      ) : (
                        <Plus size={16} color="#64748B" aria-hidden />
                      )}
                    </span>
                  </button>
                </div>

                {isOpen && (
                  <ul
                    style={{
                      margin: 0,
                      padding: '12px 16px 16px 40px',
                      listStyle: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {category.permissions.map((permission) => (
                      <li key={permission.id}>
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: '#334155',
                            lineHeight: 1.45,
                          }}
                        >
                          <Checkbox
                            checked={group.permissions.has(permission.id)}
                            onCheckedChange={(checked) => onTogglePermission(permission.id, checked === true)}
                            className="mt-0.5"
                          />
                          {permission.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <footer
        style={{
          padding: '16px 24px',
          borderTop: '1px solid #E4E7EC',
          display: 'flex',
          justifyContent: 'flex-end',
          background: '#FAFBFC',
        }}
      >
        <button
          type="button"
          onClick={onSave}
          disabled={!group.name.trim()}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            background: !group.name.trim() ? '#94A3B8' : P2P_BRAND.primary,
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
            cursor: !group.name.trim() ? 'not-allowed' : 'pointer',
            fontFamily: F,
          }}
        >
          Save group
        </button>
      </footer>
    </section>
  );
}

function ToolbarButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 12px',
        border: `1px solid ${P2P_BRAND.surfaceBorder}`,
        borderRadius: '8px',
        background: '#FFFFFF',
        color: P2P_BRAND.primaryStrong,
        fontSize: '12px',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: F,
      }}
    >
      {children}
    </button>
  );
}
