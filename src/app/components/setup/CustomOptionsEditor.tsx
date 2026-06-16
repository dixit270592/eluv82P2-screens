import type { CSSProperties } from 'react';
import { ChevronDown, ChevronRight, Layers, Plus, Trash2 } from 'lucide-react';
import { PrOptionHelp } from './PrOptionHelp';
import {
  TRANSACTION_KINDS,
  createEmptySubType,
  createEmptyType,
  formatCost,
  type CustomSubType,
  type CustomTransaction,
  type CustomType,
} from '../../data/customOptions';
import { CUSTOM_OPTIONS_HELP } from '../../data/customOptionsHelp';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #E4E7EC',
  borderRadius: '8px',
  fontSize: '13px',
  fontFamily: F,
  color: '#0F172A',
  background: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
};

type CustomOptionsEditorProps = {
  transactions: CustomTransaction[];
  onChange: (transactions: CustomTransaction[]) => void;
  expandedTxnIds: Set<string>;
  onToggleTxn: (id: string) => void;
};

export function CustomOptionsStructureGuide() {
  const steps = [
    { label: 'Transaction', desc: 'Expense, PR, PO…' },
    { label: 'Type', desc: 'Category' },
    { label: 'Sub-type', desc: 'Choice + cost' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        padding: '12px 16px',
        background: P2P_BRAND.surface,
        border: `1px solid ${P2P_BRAND.surfaceBorder}`,
        borderRadius: '10px',
        marginBottom: '20px',
      }}
    >
      <Layers size={16} color={P2P_BRAND.primary} aria-hidden />
      <span style={{ fontSize: '12px', fontWeight: 600, color: P2P_BRAND.primaryStrong }}>How it works</span>
      {steps.map((step, i) => (
        <span key={step.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {i > 0 ? <ChevronRight size={14} color="#94A3B8" aria-hidden /> : null}
          <span
            style={{
              fontSize: '12px',
              color: '#334155',
              background: '#FFFFFF',
              border: '1px solid #E4E7EC',
              borderRadius: '6px',
              padding: '4px 10px',
            }}
          >
            <strong>{step.label}</strong>
            <span style={{ color: '#94A3B8' }}> · {step.desc}</span>
          </span>
        </span>
      ))}
      <PrOptionHelp helpId="structure" text={CUSTOM_OPTIONS_HELP.structure} />
    </div>
  );
}

export function CustomOptionsSummary({ transactions }: { transactions: CustomTransaction[] }) {
  return (
    <aside
      aria-label="Options structure summary"
      style={{
        position: 'sticky',
        top: '12px',
        background: '#FFFFFF',
        border: '1px solid #E4E7EC',
        borderRadius: '12px',
        padding: '18px',
        boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
      }}
    >
      <h2 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Structure summary</h2>
      <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748B', lineHeight: 1.45 }}>
        Live preview of your custom option hierarchy.
      </p>

      {transactions.length === 0 ? (
        <p style={{ margin: 0, fontSize: '13px', color: '#CBD5E1' }}>No transactions configured yet.</p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {transactions.map((txn) => (
            <li key={txn.id}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>{txn.transactionKind}</p>
              {txn.types.length === 0 ? (
                <p style={{ margin: '4px 0 0 12px', fontSize: '12px', color: '#CBD5E1' }}>No types added</p>
              ) : (
                <ul style={{ margin: '6px 0 0', padding: '0 0 0 12px', listStyle: 'none', borderLeft: '2px solid #E2E8F0' }}>
                  {txn.types.map((type) => (
                    <li key={type.id} style={{ marginBottom: '8px', paddingLeft: '10px' }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        {type.name || 'Untitled type'}
                      </p>
                      {type.subTypes.length > 0 ? (
                        <ul style={{ margin: '4px 0 0', padding: 0, listStyle: 'none' }}>
                          {type.subTypes.map((st) => (
                            <li
                              key={st.id}
                              style={{
                                fontSize: '11px',
                                color: '#64748B',
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '8px',
                                padding: '2px 0',
                              }}
                            >
                              <span>{st.name || 'Untitled'}</span>
                              <span style={{ color: '#94A3B8', flexShrink: 0 }}>{formatCost(st.associatedCost)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

function SubTypeTable({
  subTypes,
  onChange,
}: {
  subTypes: CustomSubType[];
  onChange: (subTypes: CustomSubType[]) => void;
}) {
  const update = (id: string, patch: Partial<CustomSubType>) => {
    onChange(subTypes.map((st) => (st.id === id ? { ...st, ...patch } : st)));
  };

  const remove = (id: string) => {
    if (subTypes.length <= 1) return;
    onChange(subTypes.filter((st) => st.id !== id));
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: F }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #E4E7EC', color: '#64748B', textAlign: 'left' }}>
            <th style={{ padding: '8px 10px', fontWeight: 600, width: '55%' }}>Sub-type</th>
            <th style={{ padding: '8px 10px', fontWeight: 600, width: '35%' }}>Associated cost</th>
            <th style={{ padding: '8px 4px', width: '40px' }} aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {subTypes.map((st) => (
            <tr key={st.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
              <td style={{ padding: '6px 10px 6px 0' }}>
                <input
                  type="text"
                  value={st.name}
                  placeholder="e.g. Car - Honda"
                  aria-label="Sub-type name"
                  onChange={(e) => update(st.id, { name: e.target.value })}
                  style={inputStyle}
                />
              </td>
              <td style={{ padding: '6px 10px 6px 0' }}>
                <input
                  type="number"
                  min={0}
                  value={st.associatedCost}
                  aria-label="Associated cost"
                  onChange={(e) => update(st.id, { associatedCost: Number(e.target.value) || 0 })}
                  style={{ ...inputStyle, textAlign: 'right' }}
                />
              </td>
              <td style={{ padding: '6px 0', verticalAlign: 'middle' }}>
                <button
                  type="button"
                  disabled={subTypes.length <= 1}
                  onClick={() => remove(st.id)}
                  aria-label="Remove sub-type"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    border: 'none',
                    borderRadius: '6px',
                    background: 'transparent',
                    color: subTypes.length <= 1 ? '#E2E8F0' : '#94A3B8',
                    cursor: subTypes.length <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Trash2 size={15} aria-hidden />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={() => onChange([...subTypes, createEmptySubType()])}
        style={{
          marginTop: '8px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          border: `1px dashed ${P2P_BRAND.surfaceBorder}`,
          borderRadius: '8px',
          background: '#FFFFFF',
          color: P2P_BRAND.primaryStrong,
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: F,
        }}
      >
        <Plus size={14} aria-hidden />
        Add sub-type
      </button>
    </div>
  );
}

function TypeCard({
  type,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  type: CustomType;
  index: number;
  onChange: (type: CustomType) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div
      style={{
        background: '#FAFBFC',
        border: '1px solid #E4E7EC',
        borderRadius: '10px',
        padding: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#94A3B8',
            background: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: '6px',
            padding: '2px 8px',
          }}
        >
          Type {index + 1}
        </span>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <input
            type="text"
            value={type.name}
            placeholder="Category name, e.g. Automobile"
            aria-label={`Type ${index + 1} name`}
            onChange={(e) => onChange({ ...type, name: e.target.value })}
            style={inputStyle}
          />
        </div>
        <PrOptionHelp helpId="type" text={CUSTOM_OPTIONS_HELP.type} />
        <button
          type="button"
          disabled={!canRemove}
          onClick={onRemove}
          aria-label="Remove type"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: '1px solid #FECDCA',
            borderRadius: '8px',
            background: '#FFFFFF',
            color: canRemove ? '#B42318' : '#FECDCA',
            cursor: canRemove ? 'pointer' : 'not-allowed',
          }}
        >
          <Trash2 size={15} aria-hidden />
        </button>
      </div>

      <SubTypeTable subTypes={type.subTypes} onChange={(subTypes) => onChange({ ...type, subTypes })} />
    </div>
  );
}

function TransactionCard({
  transaction,
  index,
  expanded,
  onToggle,
  onChange,
  onRemove,
  canRemove,
}: {
  transaction: CustomTransaction;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (txn: CustomTransaction) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const typeCount = transaction.types.length;
  const subCount = transaction.types.reduce((s, t) => s + t.subTypes.length, 0);

  const updateType = (typeId: string, next: CustomType) => {
    onChange({
      ...transaction,
      types: transaction.types.map((t) => (t.id === typeId ? next : t)),
    });
  };

  return (
    <article
      style={{
        background: '#FFFFFF',
        border: `1px solid ${expanded ? P2P_BRAND.surfaceBorder : '#E4E7EC'}`,
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: expanded ? '0 2px 8px rgba(31,169,122,0.08)' : '0 1px 3px rgba(16,24,40,0.04)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 18px',
          background: expanded ? P2P_BRAND.surface : '#FAFBFC',
          borderBottom: expanded ? `1px solid ${P2P_BRAND.surfaceBorder}` : 'none',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            border: 'none',
            borderRadius: '6px',
            background: '#FFFFFF',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {expanded ? (
            <ChevronDown size={16} color="#64748B" aria-hidden />
          ) : (
            <ChevronRight size={16} color="#64748B" aria-hidden />
          )}
        </button>

        <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8' }}>#{index + 1}</span>

        <label style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', flexShrink: 0 }}>Transaction</label>
        <select
          value={transaction.transactionKind}
          onChange={(e) => onChange({ ...transaction, transactionKind: e.target.value })}
          aria-label="Transaction type"
          style={{
            flex: '1 1 180px',
            minWidth: '160px',
            height: '36px',
            padding: '0 12px',
            border: '1px solid #E4E7EC',
            borderRadius: '8px',
            fontSize: '13px',
            fontFamily: F,
            color: '#0F172A',
            background: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          {TRANSACTION_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {kind}
            </option>
          ))}
        </select>

        <PrOptionHelp helpId="transaction" text={CUSTOM_OPTIONS_HELP.transaction} />

        <span
          style={{
            fontSize: '11px',
            color: '#64748B',
            background: '#FFFFFF',
            border: '1px solid #E4E7EC',
            borderRadius: '999px',
            padding: '3px 10px',
          }}
        >
          {typeCount} {typeCount === 1 ? 'type' : 'types'} · {subCount} sub-types
        </span>

        <button
          type="button"
          disabled={!canRemove}
          onClick={onRemove}
          aria-label="Remove transaction"
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            border: '1px solid #FECDCA',
            borderRadius: '8px',
            background: '#FFFFFF',
            color: canRemove ? '#B42318' : '#FECDCA',
            cursor: canRemove ? 'pointer' : 'not-allowed',
          }}
        >
          <Trash2 size={15} aria-hidden />
        </button>
      </header>

      {expanded ? (
        <div style={{ padding: '18px' }}>
          {transaction.types.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '28px 16px',
                border: `1.5px dashed ${P2P_BRAND.surfaceBorder}`,
                borderRadius: '10px',
                background: '#FAFBFC',
                marginBottom: '12px',
              }}
            >
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748B' }}>
                Add a type to start building options for {transaction.transactionKind}.
              </p>
              <button
                type="button"
                onClick={() => onChange({ ...transaction, types: [createEmptyType()] })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  border: 'none',
                  borderRadius: '8px',
                  background: P2P_BRAND.primary,
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: F,
                }}
              >
                <Plus size={14} aria-hidden />
                Add first type
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
              {transaction.types.map((type, typeIndex) => (
                <TypeCard
                  key={type.id}
                  type={type}
                  index={typeIndex}
                  canRemove={transaction.types.length > 1}
                  onChange={(next) => updateType(type.id, next)}
                  onRemove={() =>
                    onChange({
                      ...transaction,
                      types: transaction.types.filter((t) => t.id !== type.id),
                    })
                  }
                />
              ))}
            </div>
          )}

          {transaction.types.length > 0 ? (
            <button
              type="button"
              onClick={() => onChange({ ...transaction, types: [...transaction.types, createEmptyType()] })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
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
              <Plus size={14} aria-hidden />
              Add type
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function CustomOptionsEditor({
  transactions,
  onChange,
  expandedTxnIds,
  onToggleTxn,
}: CustomOptionsEditorProps) {
  const updateTxn = (id: string, next: CustomTransaction) => {
    onChange(transactions.map((t) => (t.id === id ? next : t)));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {transactions.map((txn, index) => (
        <TransactionCard
          key={txn.id}
          transaction={txn}
          index={index}
          expanded={expandedTxnIds.has(txn.id)}
          onToggle={() => onToggleTxn(txn.id)}
          canRemove={transactions.length > 1}
          onChange={(next) => updateTxn(txn.id, next)}
          onRemove={() => onChange(transactions.filter((t) => t.id !== txn.id))}
        />
      ))}
    </div>
  );
}
