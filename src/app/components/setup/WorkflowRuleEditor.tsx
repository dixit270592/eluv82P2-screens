import type { CSSProperties, ReactNode } from 'react';
import { ArrowDown, Minus, Plus, Trash2 } from 'lucide-react';
import { PrOptionHelp } from './PrOptionHelp';
import { IconButton, OutlineButton, SelectField, WorkflowUserPicker } from './WorkflowUserPicker';
import {
  WORKFLOW_ACTION_TYPES,
  WORKFLOW_FIELD_TYPES,
  WORKFLOW_FIELD_VALUES,
  WORKFLOW_OPERATORS,
  createEmptyAction,
  createEmptyCondition,
  summarizeTriggerAction,
  summarizeTriggerCondition,
  type WorkflowAction,
  type WorkflowCondition,
  type WorkflowTrigger,
} from '../../data/approvalWorkflowSetup';
import { WORKFLOW_HELP } from '../../data/approvalWorkflowHelp';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type WorkflowRuleEditorProps = {
  rule: WorkflowTrigger;
  index: number;
  canRemove: boolean;
  onChange: (rule: WorkflowTrigger) => void;
  onRemove: () => void;
};

const labelStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginBottom: '6px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#475569',
};

function FieldLabel({ label, helpId, helpText }: { label: string; helpId: string; helpText: string }) {
  return (
    <div style={labelStyle}>
      <span>{label}</span>
      <PrOptionHelp helpId={helpId} text={helpText} optionLabel={label} />
    </div>
  );
}

function SectionShell({
  title,
  helpId,
  helpText,
  tint,
  children,
}: {
  title: string;
  helpId: string;
  helpText: string;
  tint: string;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        background: tint,
        border: '1px solid #E8ECF1',
        borderRadius: '12px',
        padding: '18px 20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: P2P_BRAND.primaryStrong,
          }}
        >
          {title}
        </span>
        <PrOptionHelp helpId={helpId} text={helpText} />
      </div>
      {children}
    </section>
  );
}

export function WorkflowRuleEditor({ rule, index, canRemove, onChange, onRemove }: WorkflowRuleEditorProps) {
  const updateCondition = (id: string, patch: Partial<WorkflowCondition>) => {
    onChange({
      ...rule,
      conditions: rule.conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  };

  const updateAction = (id: string, patch: Partial<WorkflowAction>) => {
    onChange({
      ...rule,
      actions: rule.actions.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });
  };

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid #EEF1F5',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.04em' }}>
            RULE {index + 1}
          </p>
          <h2 style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em' }}>
            {summarizeTriggerCondition(rule)}
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748B' }}>
            Routes to <span style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>{summarizeTriggerAction(rule)}</span>
          </p>
        </div>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              border: '1px solid #FECDCA',
              borderRadius: '8px',
              background: '#FFFFFF',
              color: '#B42318',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: F,
              flexShrink: 0,
            }}
          >
            <Trash2 size={14} aria-hidden />
            Delete rule
          </button>
        ) : null}
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <SectionShell title="When" helpId="when" helpText={WORKFLOW_HELP.when} tint="#F8FBFA">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {rule.conditions.map((cond, condIndex) => (
              <div key={cond.id}>
                {condIndex > 0 ? (
                  <p
                    style={{
                      margin: '0 0 10px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#94A3B8',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    And
                  </p>
                ) : null}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr)) auto',
                    gap: '14px',
                    alignItems: 'end',
                  }}
                >
                  <div>
                    <FieldLabel label="Field type" helpId="fieldType" helpText={WORKFLOW_HELP.fieldType} />
                    <SelectField
                      ariaLabel="Field type"
                      value={cond.fieldType}
                      options={WORKFLOW_FIELD_TYPES}
                      fullWidth
                      onChange={(fieldType) => updateCondition(cond.id, { fieldType, value: '' })}
                    />
                  </div>
                  <div>
                    <FieldLabel label="Operator" helpId="operator" helpText={WORKFLOW_HELP.operator} />
                    <SelectField
                      ariaLabel="Operator"
                      value={cond.operator}
                      options={WORKFLOW_OPERATORS}
                      fullWidth
                      onChange={(operator) => updateCondition(cond.id, { operator })}
                    />
                  </div>
                  <div>
                    <FieldLabel label="Value" helpId="value" helpText={WORKFLOW_HELP.value} />
                    <SelectField
                      ariaLabel="Value"
                      value={cond.value}
                      placeholder="Select value"
                      options={WORKFLOW_FIELD_VALUES[cond.fieldType] ?? []}
                      fullWidth
                      onChange={(value) => updateCondition(cond.id, { value })}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '6px', paddingBottom: '1px' }}>
                    <IconButton
                      variant="add"
                      ariaLabel="Add condition"
                      onClick={() =>
                        onChange({ ...rule, conditions: [...rule.conditions, createEmptyCondition()] })
                      }
                    >
                      <Plus size={14} />
                    </IconButton>
                    <IconButton
                      variant="remove"
                      ariaLabel="Remove condition"
                      disabled={rule.conditions.length <= 1}
                      onClick={() =>
                        onChange({
                          ...rule,
                          conditions: rule.conditions.filter((c) => c.id !== cond.id),
                        })
                      }
                    >
                      <Minus size={14} />
                    </IconButton>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '14px' }}>
            <OutlineButton
              variant="primary"
              onClick={() => onChange({ ...rule, conditions: [...rule.conditions, createEmptyCondition()] })}
            >
              Add condition
            </OutlineButton>
          </div>
        </SectionShell>

        <div style={{ display: 'flex', justifyContent: 'center', color: '#CBD5E1' }} aria-hidden>
          <ArrowDown size={20} />
        </div>

        <SectionShell title="Then" helpId="action" helpText={WORKFLOW_HELP.action} tint="#F8FAFC">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {rule.actions.map((action, actionIndex) => (
              <div key={action.id}>
                {actionIndex > 0 ? (
                  <p
                    style={{
                      margin: '0 0 10px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#94A3B8',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Also
                  </p>
                ) : null}

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      action.actionType === 'Route to user'
                        ? 'minmax(0, 1fr) minmax(0, 1.2fr) auto'
                        : 'minmax(0, 1fr) auto',
                    gap: '14px',
                    alignItems: 'end',
                  }}
                >
                  <div>
                    <FieldLabel label="Action" helpId="actionType" helpText={WORKFLOW_HELP.actionType} />
                    <SelectField
                      ariaLabel="Action type"
                      value={action.actionType}
                      options={WORKFLOW_ACTION_TYPES}
                      fullWidth
                      onChange={(actionType) => updateAction(action.id, { actionType })}
                    />
                  </div>

                  {action.actionType === 'Route to user' ? (
                    <div>
                      <FieldLabel label="Approvers" helpId="users" helpText={WORKFLOW_HELP.users} />
                      <WorkflowUserPicker
                        userIds={action.userIds}
                        onChange={(userIds) => updateAction(action.id, { userIds })}
                      />
                    </div>
                  ) : null}

                  <div style={{ display: 'flex', gap: '6px', paddingBottom: '1px' }}>
                    <IconButton
                      variant="remove"
                      ariaLabel="Remove action"
                      disabled={rule.actions.length <= 1}
                      onClick={() =>
                        onChange({
                          ...rule,
                          actions: rule.actions.filter((a) => a.id !== action.id),
                        })
                      }
                    >
                      <Minus size={14} />
                    </IconButton>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '14px' }}>
            <OutlineButton onClick={() => onChange({ ...rule, actions: [...rule.actions, createEmptyAction()] })}>
              Add action
            </OutlineButton>
          </div>
        </SectionShell>
      </div>
    </div>
  );
}
