import { useMemo, useState } from 'react';
import { DollarSign, Filter, Pencil, Upload, Inbox, ArrowLeft } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  BUDGET_PERIOD_OPTIONS,
  GL_ACCOUNT_OPTIONS,
  PROJECT_ACCOUNT_OPTIONS,
  formatBudgetAmount,
  getMonthColumns,
  syncLineAmounts,
  type BudgetConfiguration,
  type BudgetLine,
  type BudgetPeriod,
} from '../../data/budgetSetup';
import { FieldLabelWithHelp, SetupHelpIcon } from './SetupHelpIcon';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type BudgetTab = 'gl' | 'project';

type BudgetConfigPanelProps = {
  budget: BudgetConfiguration;
  isNew: boolean;
  onChange: (budget: BudgetConfiguration) => void;
  onSave: () => void;
  onBack: () => void;
  savedMessage?: boolean;
};

export function BudgetConfigPanel({
  budget,
  isNew,
  onChange,
  onSave,
  onBack,
  savedMessage,
}: BudgetConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<BudgetTab>('gl');
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  const monthColumns = useMemo(
    () => getMonthColumns(budget.startDate, budget.endDate),
    [budget.startDate, budget.endDate],
  );

  const lines = activeTab === 'gl' ? budget.glLines : budget.projectLines;
  const accountOptions = activeTab === 'gl' ? GL_ACCOUNT_OPTIONS : PROJECT_ACCOUNT_OPTIONS;
  const accountLabel = activeTab === 'gl' ? 'Select GL Account' : 'Select Project Account';
  const accountColumnLabel = activeTab === 'gl' ? 'Gl Accounts' : 'Project Accounts';

  const updateBudget = (patch: Partial<BudgetConfiguration>) => {
    onChange({ ...budget, ...patch });
  };

  const updateDateRange = (startDate?: string, endDate?: string) => {
    const nextStart = startDate ?? budget.startDate;
    const nextEnd = endDate ?? budget.endDate;
    const columns = getMonthColumns(nextStart, nextEnd);
    onChange({
      ...budget,
      startDate: nextStart,
      endDate: nextEnd,
      glLines: syncLineAmounts(budget.glLines, columns),
      projectLines: syncLineAmounts(budget.projectLines, columns),
    });
  };

  const addLine = () => {
    if (!selectedAccount) return;
    const targetKey = activeTab === 'gl' ? 'glLines' : 'projectLines';
    const existing = budget[targetKey];
    if (existing.some((line) => line.account === selectedAccount)) {
      setSelectedAccount('');
      return;
    }
    const newLine: BudgetLine = {
      id: `line-${crypto.randomUUID()}`,
      account: selectedAccount,
      description: selectedAccount,
      amounts: Object.fromEntries(monthColumns.map((column) => [column.key, 0])),
    };
    onChange({
      ...budget,
      [targetKey]: [...existing, newLine],
    });
    setSelectedAccount('');
  };

  const updateLineAmount = (lineId: string, monthKey: string, value: number) => {
    const targetKey = activeTab === 'gl' ? 'glLines' : 'projectLines';
    onChange({
      ...budget,
      [targetKey]: budget[targetKey].map((line) =>
        line.id === lineId
          ? {
              ...line,
              amounts: { ...line.amounts, [monthKey]: Math.max(0, value) },
            }
          : line,
      ),
    });
  };

  return (
    <section
      aria-label="Budget configuration"
      style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
        border: '1px solid #E4E7EC',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
        fontFamily: F,
      }}
    >
      <div style={{ padding: '20px 24px 0', borderBottom: '1px solid #EEF1F5' }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '14px',
            padding: 0,
            border: 'none',
            background: 'transparent',
            fontSize: '13px',
            fontWeight: 600,
            color: P2P_BRAND.primaryStrong,
            cursor: 'pointer',
            fontFamily: F,
          }}
        >
          <ArrowLeft size={16} aria-hidden />
          Back to budgets
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 600,
              color: '#0F172A',
              letterSpacing: '-0.02em',
            }}
          >
            {isNew ? 'Add Budget Configuration' : 'Modify Budget Configuration'}
          </h2>
          <SetupHelpIcon label="Configure the fiscal period, then allocate monthly amounts on the GL Account or Project Account tab." />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px 16px',
            paddingBottom: '18px',
          }}
        >
          <Field
            label="Budget Name"
            help="A descriptive label shown in the budget list and financial reports."
          >
            <div style={{ position: 'relative' }}>
              <DollarSign
                size={15}
                color="#94A3B8"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                aria-hidden
              />
              <input
                type="text"
                value={budget.name}
                onChange={(e) => updateBudget({ name: e.target.value })}
                placeholder="Budget name"
                style={{ ...inputStyle, paddingLeft: '32px' }}
              />
            </div>
          </Field>

          <Field
            label="Define Period"
            help="How amounts are grouped in the grid. Monthly creates one column per month in the date range."
          >
            <Select
              value={budget.period}
              onValueChange={(value) => updateBudget({ period: value as BudgetPeriod })}
            >
              <SelectTrigger
                className="h-10 w-full border-[#E4E7EC] bg-white text-[13px] shadow-none focus-visible:border-[var(--p2p-brand)]"
                style={{ fontFamily: F }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-[13px]">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Select Start Date" help="First day of the budget period. Month columns begin from this date.">
            <input
              type="date"
              value={budget.startDate}
              onChange={(e) => updateDateRange(e.target.value, undefined)}
              style={inputStyle}
            />
          </Field>

          <Field label="Select End Date" help="Last day of the budget period. The grid includes all months through this date.">
            <input
              type="date"
              value={budget.endDate}
              onChange={(e) => updateDateRange(undefined, e.target.value)}
              style={inputStyle}
            />
          </Field>
        </div>

        <div
          role="tablist"
          aria-label="Budget account type"
          style={{ display: 'flex', gap: '4px', borderBottom: '1px solid #E4E7EC' }}
        >
          {(
            [
              { id: 'gl' as const, label: 'Gl Account' },
              { id: 'project' as const, label: 'Project Account' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            const tabHelp =
              tab.id === 'gl'
                ? 'Allocate budget amounts to general ledger account segments.'
                : 'Allocate budget amounts to project-based accounts.';
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedAccount('');
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${P2P_BRAND.primary}` : '2px solid transparent',
                  marginBottom: '-1px',
                  background: 'transparent',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? P2P_BRAND.primaryStrong : '#64748B',
                  cursor: 'pointer',
                  fontFamily: F,
                }}
              >
                {tab.label}
                <SetupHelpIcon label={tabHelp} />
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid #EEF1F5',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            aria-label="Filter"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              border: '1px solid #E4E7EC',
              borderRadius: '8px',
              background: '#FFFFFF',
              color: '#64748B',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Filter size={15} aria-hidden />
          </button>
          <SetupHelpIcon label="Filter rows by account name or amount threshold." />
        </div>

        <div style={{ flex: '1 1 220px', minWidth: '200px', maxWidth: '420px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>{accountLabel}</span>
            <SetupHelpIcon label="Choose an account, then click Add account to include it in the budget grid below." />
          </div>
          <Select
            value={selectedAccount || undefined}
            onValueChange={setSelectedAccount}
          >
            <SelectTrigger
              className="h-9 w-full border-[#E4E7EC] bg-white text-[13px] shadow-none focus-visible:border-[var(--p2p-brand)]"
              style={{ fontFamily: F }}
            >
              <SelectValue placeholder={accountLabel} />
            </SelectTrigger>
            <SelectContent>
              {accountOptions.map((account) => (
                <SelectItem key={account} value={account} className="text-[13px]">
                  {account}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button
          type="button"
          onClick={addLine}
          disabled={!selectedAccount}
          style={{
            ...outlineButtonStyle,
            opacity: selectedAccount ? 1 : 0.55,
            cursor: selectedAccount ? 'pointer' : 'not-allowed',
          }}
        >
          Add account
        </button>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <button type="button" style={outlineButtonStyle}>
            <Pencil size={14} aria-hidden />
            Auto Fill
          </button>
          <SetupHelpIcon label="Copy a value or pattern across selected months and accounts." />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <button type="button" style={outlineButtonStyle}>
            <Upload size={14} aria-hidden />
            Import Budgets
          </button>
          <SetupHelpIcon label="Upload a CSV file to populate account rows and monthly amounts." />
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <table
          aria-label={`${accountColumnLabel} budget amounts`}
          style={{ width: '100%', borderCollapse: 'collapse', minWidth: `${520 + monthColumns.length * 110}px` }}
        >
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
              <th style={{ ...thStyle, minWidth: '200px', position: 'sticky', left: 0, background: '#F9FAFB', zIndex: 2 }}>
                {accountColumnLabel}
              </th>
              <th style={{ ...thStyle, minWidth: '200px', position: 'sticky', left: '200px', background: '#F9FAFB', zIndex: 2 }}>
                Description
              </th>
              {monthColumns.map((column) => (
                <th key={column.key} style={{ ...thStyle, minWidth: '110px', textAlign: 'right' }}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={2 + monthColumns.length} style={{ padding: '64px 20px', textAlign: 'center' }}>
                  <Inbox size={36} color="#CBD5E1" strokeWidth={1.5} aria-hidden />
                  <p style={{ margin: '10px 0 0', fontSize: '13px', color: '#64748B' }}>No Data</p>
                </td>
              </tr>
            ) : (
              lines.map((line) => (
                <tr key={line.id} style={{ borderBottom: '1px solid #EEF1F5' }}>
                  <td
                    style={{
                      ...tdStyle,
                      position: 'sticky',
                      left: 0,
                      background: '#FFFFFF',
                      zIndex: 1,
                      fontSize: '13px',
                      color: '#334155',
                      maxWidth: '220px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={line.account}
                  >
                    {line.account}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      position: 'sticky',
                      left: '200px',
                      background: '#FFFFFF',
                      zIndex: 1,
                      fontSize: '13px',
                      color: '#64748B',
                      maxWidth: '220px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={line.description}
                  >
                    {line.description}
                  </td>
                  {monthColumns.map((column) => (
                    <td key={column.key} style={{ ...tdStyle, textAlign: 'right' }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={formatBudgetAmount(line.amounts[column.key] ?? 0)}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d]/g, '');
                          updateLineAmount(line.id, column.key, raw ? Number.parseInt(raw, 10) : 0);
                        }}
                        aria-label={`${line.account} ${column.label} amount`}
                        style={amountInputStyle}
                      />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '16px 24px',
          borderTop: '1px solid #EEF1F5',
          background: '#FAFBFC',
          flexShrink: 0,
        }}
      >
        {savedMessage && (
          <span style={{ fontSize: '12px', color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>
            Budget saved
          </span>
        )}
        <button type="button" onClick={onSave} style={primaryButtonStyle}>
          Save
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {help ? (
        <FieldLabelWithHelp label={label} help={help} />
      ) : (
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#334155',
            marginBottom: '6px',
          }}
        >
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '40px',
  padding: '0 12px',
  border: '1px solid #E4E7EC',
  borderRadius: '8px',
  fontSize: '13px',
  color: '#0F172A',
  background: '#FFFFFF',
  outline: 'none',
  fontFamily: F,
  boxSizing: 'border-box',
};

const amountInputStyle: React.CSSProperties = {
  width: '100%',
  minWidth: '88px',
  padding: '6px 8px',
  border: '1px solid #E4E7EC',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#334155',
  background: '#F8FAFC',
  outline: 'none',
  fontFamily: F,
  textAlign: 'right',
  boxSizing: 'border-box',
};

const thStyle: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 600,
  color: '#667085',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 14px',
  verticalAlign: 'middle',
};

const primaryButtonStyle: React.CSSProperties = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '8px',
  background: P2P_BRAND.primary,
  color: '#FFFFFF',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
};

const outlineButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 12px',
  border: `1px solid ${P2P_BRAND.surfaceBorder}`,
  borderRadius: '8px',
  background: '#FFFFFF',
  color: P2P_BRAND.primaryStrong,
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
  flexShrink: 0,
};
