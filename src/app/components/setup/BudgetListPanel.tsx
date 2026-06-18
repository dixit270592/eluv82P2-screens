import { Plus, Search, Trash2 } from 'lucide-react';
import {
  BUDGET_PERIOD_OPTIONS,
  formatBudgetDateRange,
  type BudgetConfiguration,
} from '../../data/budgetSetup';
import { SetupHelpIcon } from './SetupHelpIcon';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type BudgetListPanelProps = {
  budgets: BudgetConfiguration[];
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
};

export function BudgetListPanel({
  budgets,
  search,
  onSearchChange,
  onSelect,
  onCreate,
  onDelete,
}: BudgetListPanelProps) {
  const query = search.trim().toLowerCase();
  const filtered = budgets.filter((budget) => {
    if (!query) return true;
    const range = formatBudgetDateRange(budget.startDate, budget.endDate).toLowerCase();
    return budget.name.toLowerCase().includes(query) || range.includes(query);
  });

  const periodLabel = (value: BudgetConfiguration['period']) =>
    BUDGET_PERIOD_OPTIONS.find((option) => option.value === value)?.label ?? value;

  return (
    <section
      aria-label="Budget list"
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
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #EEF1F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#101828' }}>All budgets</span>
          <span
            style={{
              padding: '2px 9px',
              background: '#F2F4F7',
              borderRadius: '100px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#667085',
            }}
          >
            {filtered.length}
          </span>
          <SetupHelpIcon label="Select a budget to open its configuration, or create a new fiscal period." />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              color="#94A3B8"
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search here…"
              aria-label="Search budgets"
              style={{
                height: '36px',
                width: '240px',
                padding: '0 10px 0 32px',
                border: '1px solid #E4E7EC',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#0F172A',
                background: '#F8FAFC',
                outline: 'none',
                fontFamily: F,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button type="button" onClick={onCreate} style={newButtonStyle}>
            <Plus size={15} strokeWidth={2.25} aria-hidden />
            New
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <table
          aria-label="Budgets"
          style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}
        >
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
              <th style={thStyle}>Budget name</th>
              <th style={thStyle}>Period</th>
              <th style={thStyle}>Date range</th>
              <th style={{ ...thStyle, width: '80px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: '48px 20px',
                    textAlign: 'center',
                    fontSize: '13px',
                    color: '#64748B',
                  }}
                >
                  {budgets.length === 0
                    ? 'No budgets yet. Create your first budget to get started.'
                    : 'No budgets match your search.'}
                </td>
              </tr>
            ) : (
              filtered.map((budget) => (
                <tr
                  key={budget.id}
                  style={{ borderBottom: '1px solid #EEF1F5', cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FAFBFC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={tdStyle}>
                    <button
                      type="button"
                      onClick={() => onSelect(budget.id)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: 0,
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: P2P_BRAND.primaryStrong,
                        fontFamily: F,
                        textAlign: 'left',
                      }}
                    >
                      {budget.name || 'Untitled budget'}
                    </button>
                  </td>
                  <td style={{ ...tdStyle, fontSize: '13px', color: '#64748B' }}>
                    {periodLabel(budget.period)}
                  </td>
                  <td style={{ ...tdStyle, fontSize: '13px', color: '#64748B' }}>
                    {formatBudgetDateRange(budget.startDate, budget.endDate)}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(budget.id);
                      }}
                      aria-label={`Delete ${budget.name || 'budget'}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        border: '1px solid #FECACA',
                        borderRadius: '8px',
                        background: '#FFFFFF',
                        color: '#DC2626',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 600,
  color: '#667085',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  verticalAlign: 'middle',
};

const newButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '10px 16px',
  border: 'none',
  borderRadius: '8px',
  background: P2P_BRAND.primary,
  color: '#FFFFFF',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
};
