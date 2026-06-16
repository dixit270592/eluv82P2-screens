import { ArrowRight, Plus } from 'lucide-react';
import {
  summarizeTriggerAction,
  summarizeTriggerCondition,
  type WorkflowTrigger,
} from '../../data/approvalWorkflowSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type WorkflowRuleNavigatorProps = {
  rules: WorkflowTrigger[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
};

export function WorkflowRuleNavigator({ rules, selectedId, onSelect, onAdd }: WorkflowRuleNavigatorProps) {
  return (
    <div
      style={{
        width: '280px',
        flexShrink: 0,
        borderRight: '1px solid #EEF1F5',
        display: 'flex',
        flexDirection: 'column',
        background: '#FAFBFC',
      }}
    >
      <div
        style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid #EEF1F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>Rules</p>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94A3B8' }}>Evaluated top to bottom</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          aria-label="Add rule"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: `1px solid ${P2P_BRAND.surfaceBorder}`,
            borderRadius: '8px',
            background: P2P_BRAND.surface,
            color: P2P_BRAND.primaryStrong,
            cursor: 'pointer',
          }}
        >
          <Plus size={16} aria-hidden />
        </button>
      </div>

      <div
        role="listbox"
        aria-label="Workflow rules"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {rules.map((rule, index) => {
          const selected = rule.id === selectedId;
          return (
            <button
              key={rule.id}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onSelect(rule.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '12px 14px',
                border: selected ? `1px solid ${P2P_BRAND.primary}` : '1px solid #E4E7EC',
                borderRadius: '10px',
                background: selected ? '#FFFFFF' : '#FFFFFF',
                boxShadow: selected ? `0 0 0 3px ${P2P_BRAND.surface}` : 'none',
                cursor: 'pointer',
                fontFamily: F,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '6px',
                    background: selected ? P2P_BRAND.primary : '#E2E8F0',
                    color: selected ? '#FFFFFF' : '#64748B',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>
                  {summarizeTriggerCondition(rule)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: '#64748B',
                  paddingLeft: '30px',
                }}
              >
                <ArrowRight size={12} color={P2P_BRAND.primary} aria-hidden />
                <span>{summarizeTriggerAction(rule)}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
