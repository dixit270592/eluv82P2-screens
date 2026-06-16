import { useMemo, useState } from 'react';
import { ChevronRight, Plus, Search, ArrowUpDown, Upload, Pencil, Trash2, Minus, SquarePlus } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import { Checkbox } from '../../components/ui/checkbox';
import { Switch } from '../../components/ui/switch';
import { ListPagination } from '../../components/ListPagination';
import { SegmentDataFormDialog } from '../../components/setup/SegmentDataFormDialog';
import { AccountDataFormDialog } from '../../components/setup/AccountDataFormDialog';
import { PredefinedGlSplitFormDialog } from '../../components/setup/PredefinedGlSplitFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { usePagination } from '../../hooks/usePagination';
import {
  ACCOUNT_TYPE_OPTIONS,
  SEGMENT_SYMBOL_OPTIONS,
  createSegmentsForType,
  createSeedSegmentData,
  createSeedAccountData,
  createSeedPredefinedGlSplits,
  getAccountOptions,
  getDepartmentOptions,
  getSegmentTypeOptions,
  type AccountDataRow,
  type AccountSegment,
  type AccountTypeFormat,
  type PredefinedGlSplit,
  type SegmentDataRow,
  type SegmentSymbol,
} from '../../data/accountSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

type TabId = 'segment-config' | 'segment-data' | 'account-data' | 'split-gl';

const TABS: { id: TabId; label: string }[] = [
  { id: 'segment-config', label: 'Account Segment Config' },
  { id: 'segment-data', label: 'Segment Data' },
  { id: 'account-data', label: 'Account Data' },
  { id: 'split-gl', label: 'Predefined Split GL Account setup' },
];

const CHECKBOX_CLASS =
  'size-[18px] shrink-0 rounded-[5px] border-[#D0D5DD] data-[state=checked]:border-[var(--p2p-brand)] data-[state=checked]:bg-[var(--p2p-brand)] data-[state=checked]:text-white';

type SegmentSortKey = 'segmentType' | 'segmentData' | 'description';
type AccountSortKey = 'accountName' | 'accountDetails' | 'active';
type SplitSortKey = 'splitName';
type SortDir = 'asc' | 'desc';

export function AccountSetup() {
  const [activeTab, setActiveTab] = useState<TabId>('segment-config');
  const [accountType, setAccountType] = useState<AccountTypeFormat>('department-account');
  const [symbol, setSymbol] = useState<SegmentSymbol>(':');
  const [segments, setSegments] = useState<AccountSegment[]>(() =>
    createSegmentsForType('department-account'),
  );
  const [segmentData, setSegmentData] = useState<SegmentDataRow[]>(() => createSeedSegmentData());
  const [accountData, setAccountData] = useState<AccountDataRow[]>(() => createSeedAccountData());
  const [glSplits, setGlSplits] = useState<PredefinedGlSplit[]>(() => createSeedPredefinedGlSplits());
  const [segmentSearch, setSegmentSearch] = useState('');
  const [accountSearch, setAccountSearch] = useState('');
  const [splitSearch, setSplitSearch] = useState('');
  const [segmentSortKey, setSegmentSortKey] = useState<SegmentSortKey>('segmentType');
  const [accountSortKey, setAccountSortKey] = useState<AccountSortKey>('accountName');
  const [splitSortKey, setSplitSortKey] = useState<SplitSortKey>('splitName');
  const [segmentSortDir, setSegmentSortDir] = useState<SortDir>('asc');
  const [accountSortDir, setAccountSortDir] = useState<SortDir>('asc');
  const [splitSortDir, setSplitSortDir] = useState<SortDir>('asc');
  const [segmentSelectedIds, setSegmentSelectedIds] = useState<Set<string>>(new Set());
  const [accountSelectedIds, setAccountSelectedIds] = useState<Set<string>>(new Set());
  const [segmentDialogOpen, setSegmentDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [editingSegmentRow, setEditingSegmentRow] = useState<SegmentDataRow | null>(null);
  const [editingAccountRow, setEditingAccountRow] = useState<AccountDataRow | null>(null);
  const [editingSplit, setEditingSplit] = useState<PredefinedGlSplit | null>(null);
  const [deleteSplitId, setDeleteSplitId] = useState<string | null>(null);
  const [expandedSplitIds, setExpandedSplitIds] = useState<Set<string>>(() => new Set(['pgs-1']));
  const [configSaved, setConfigSaved] = useState(false);

  const segmentTypes = useMemo(() => getSegmentTypeOptions(segments), [segments]);
  const departments = useMemo(() => getDepartmentOptions(segmentData), [segmentData]);
  const accounts = useMemo(() => getAccountOptions(segmentData), [segmentData]);

  const filteredSegmentData = useMemo(() => {
    const query = segmentSearch.trim().toLowerCase();
    return segmentData
      .filter((row) => {
        if (!query) return true;
        return (
          row.segmentType.toLowerCase().includes(query) ||
          row.segmentData.toLowerCase().includes(query) ||
          row.description.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const dir = segmentSortDir === 'asc' ? 1 : -1;
        if (segmentSortKey === 'segmentType') return a.segmentType.localeCompare(b.segmentType) * dir;
        if (segmentSortKey === 'segmentData') return a.segmentData.localeCompare(b.segmentData) * dir;
        return a.description.localeCompare(b.description) * dir;
      });
  }, [segmentData, segmentSearch, segmentSortKey, segmentSortDir]);

  const filteredAccountData = useMemo(() => {
    const query = accountSearch.trim().toLowerCase();
    return accountData
      .filter((row) => {
        if (!query) return true;
        return (
          row.accountName.toLowerCase().includes(query) ||
          row.accountDetails.toLowerCase().includes(query) ||
          row.department.toLowerCase().includes(query) ||
          row.account.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const dir = accountSortDir === 'asc' ? 1 : -1;
        if (accountSortKey === 'accountName') return a.accountName.localeCompare(b.accountName) * dir;
        if (accountSortKey === 'accountDetails') return a.accountDetails.localeCompare(b.accountDetails) * dir;
        return (Number(a.active) - Number(b.active)) * dir;
      });
  }, [accountData, accountSearch, accountSortKey, accountSortDir]);

  const filteredGlSplits = useMemo(() => {
    const query = splitSearch.trim().toLowerCase();
    return glSplits
      .filter((split) => !query || split.splitName.toLowerCase().includes(query))
      .sort((a, b) => {
        const dir = splitSortDir === 'asc' ? 1 : -1;
        return a.splitName.localeCompare(b.splitName) * dir;
      });
  }, [glSplits, splitSearch, splitSortKey, splitSortDir]);

  const segmentPagination = usePagination(filteredSegmentData, {
    resetKey: `${segmentSearch}-${segmentSortKey}-${segmentSortDir}`,
    pageSize: 10,
  });
  const accountPagination = usePagination(filteredAccountData, {
    resetKey: `${accountSearch}-${accountSortKey}-${accountSortDir}`,
    pageSize: 10,
  });
  const splitPagination = usePagination(filteredGlSplits, {
    resetKey: `${splitSearch}-${splitSortKey}-${splitSortDir}`,
    pageSize: 10,
  });

  const allSegmentVisibleSelected =
    segmentPagination.paginatedItems.length > 0 &&
    segmentPagination.paginatedItems.every((row) => segmentSelectedIds.has(row.id));
  const someSegmentVisibleSelected =
    segmentPagination.paginatedItems.some((row) => segmentSelectedIds.has(row.id)) &&
    !allSegmentVisibleSelected;

  const allAccountVisibleSelected =
    accountPagination.paginatedItems.length > 0 &&
    accountPagination.paginatedItems.every((row) => accountSelectedIds.has(row.id));
  const someAccountVisibleSelected =
    accountPagination.paginatedItems.some((row) => accountSelectedIds.has(row.id)) &&
    !allAccountVisibleSelected;

  const handleAccountTypeChange = (value: AccountTypeFormat) => {
    setAccountType(value);
    setSegments(createSegmentsForType(value));
    setConfigSaved(false);
  };

  const updateSegment = (id: string, patch: Partial<AccountSegment>) => {
    setSegments((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    setConfigSaved(false);
  };

  const handleSaveConfig = () => {
    setConfigSaved(true);
    window.setTimeout(() => setConfigSaved(false), 2400);
  };

  const toggleSegmentSort = (key: SegmentSortKey) => {
    if (segmentSortKey === key) setSegmentSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSegmentSortKey(key);
      setSegmentSortDir('asc');
    }
  };

  const toggleAccountSort = (key: AccountSortKey) => {
    if (accountSortKey === key) setAccountSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setAccountSortKey(key);
      setAccountSortDir('asc');
    }
  };

  const toggleSplitSort = (key: SplitSortKey) => {
    if (splitSortKey === key) setSplitSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSplitSortKey(key);
      setSplitSortDir('asc');
    }
  };

  const toggleSegmentSelectAll = (checked: boolean) => {
    setSegmentSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        for (const row of segmentPagination.paginatedItems) next.add(row.id);
      } else {
        for (const row of segmentPagination.paginatedItems) next.delete(row.id);
      }
      return next;
    });
  };

  const toggleAccountSelectAll = (checked: boolean) => {
    setAccountSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        for (const row of accountPagination.paginatedItems) next.add(row.id);
      } else {
        for (const row of accountPagination.paginatedItems) next.delete(row.id);
      }
      return next;
    });
  };

  const toggleSegmentSelectRow = (id: string, checked: boolean) => {
    setSegmentSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleAccountSelectRow = (id: string, checked: boolean) => {
    setAccountSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const openCreateSegment = () => {
    setEditingSegmentRow(null);
    setSegmentDialogOpen(true);
  };

  const openEditSegment = (row: SegmentDataRow) => {
    setEditingSegmentRow(row);
    setSegmentDialogOpen(true);
  };

  const openCreateAccount = () => {
    setEditingAccountRow(null);
    setAccountDialogOpen(true);
  };

  const openEditAccount = (row: AccountDataRow) => {
    setEditingAccountRow(row);
    setAccountDialogOpen(true);
  };

  const openCreateSplit = () => {
    setEditingSplit(null);
    setSplitDialogOpen(true);
  };

  const openEditSplit = (split: PredefinedGlSplit) => {
    setEditingSplit(split);
    setSplitDialogOpen(true);
  };

  const toggleSplitExpanded = (id: string) => {
    setExpandedSplitIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSaveSegmentData = (saved: SegmentDataRow) => {
    setSegmentData((prev) => {
      const exists = prev.some((r) => r.id === saved.id);
      if (exists) return prev.map((r) => (r.id === saved.id ? saved : r));
      return [...prev, saved];
    });
  };

  const handleSaveAccountData = (saved: AccountDataRow) => {
    setAccountData((prev) => {
      const exists = prev.some((r) => r.id === saved.id);
      if (exists) return prev.map((r) => (r.id === saved.id ? saved : r));
      return [...prev, saved];
    });
  };

  const handleSaveGlSplit = (saved: PredefinedGlSplit) => {
    setGlSplits((prev) => {
      const exists = prev.some((s) => s.id === saved.id);
      if (exists) return prev.map((s) => (s.id === saved.id ? saved : s));
      return [...prev, saved];
    });
  };

  const confirmDeleteSplit = () => {
    if (!deleteSplitId) return;
    setGlSplits((prev) => prev.filter((s) => s.id !== deleteSplitId));
    setExpandedSplitIds((prev) => {
      const next = new Set(prev);
      next.delete(deleteSplitId);
      return next;
    });
    setDeleteSplitId(null);
  };

  const toggleAccountActive = (id: string, active: boolean) => {
    setAccountData((prev) => prev.map((row) => (row.id === id ? { ...row, active } : row)));
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: '#F5F7FA',
        fontFamily: F,
        overflow: 'hidden',
      }}
    >
      <SkipToMainContent />
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <TopHeader />

        <main
          id="main-content"
          tabIndex={-1}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px 28px 32px',
            minWidth: 0,
          }}
        >
          <nav aria-label="Breadcrumb" style={{ marginBottom: '20px' }}>
            <ol
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0,
                padding: 0,
                listStyle: 'none',
                fontSize: '12px',
                color: '#64748B',
              }}
            >
              <li>Setup &amp; configuration</li>
              <li aria-hidden>
                <ChevronRight size={14} color="#CBD5E1" />
              </li>
              <li>Accounting Setup</li>
              <li aria-hidden>
                <ChevronRight size={14} color="#CBD5E1" />
              </li>
              <li style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>Account Setup</li>
            </ol>
          </nav>

          <header style={{ marginBottom: '20px' }}>
            <h1
              style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: 600,
                color: '#0F172A',
                letterSpacing: '-0.02em',
              }}
            >
              Account Setup
            </h1>
            <p
              style={{
                margin: '6px 0 0',
                fontSize: '14px',
                color: '#64748B',
                maxWidth: '62ch',
                lineHeight: 1.5,
              }}
            >
              Configure account segment structure, segment values, and GL account formats for your
              organization.
            </p>
          </header>

          <div
            role="tablist"
            aria-label="Account setup sections"
            style={{
              display: 'flex',
              gap: '4px',
              borderBottom: '1px solid #E4E7EC',
              marginBottom: '20px',
              overflowX: 'auto',
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flexShrink: 0,
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
                    transition: 'color 0.15s, border-color 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'segment-config' && (
            <section
              role="tabpanel"
              aria-label="Account Segment Config"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E4E7EC',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px 24px',
                  borderBottom: '1px solid #EEF1F5',
                }}
              >
                <div style={{ flex: '1 1 280px', minWidth: 0, maxWidth: '420px' }}>
                  <FieldLabel required>Account Type</FieldLabel>
                  <Select value={accountType} onValueChange={(v) => handleAccountTypeChange(v as AccountTypeFormat)}>
                    <SelectTrigger
                      className="h-10 w-full border-[#E4E7EC] bg-white text-[13px] shadow-none focus-visible:border-[var(--p2p-brand)] focus-visible:ring-[color-mix(in_srgb,var(--p2p-brand)_18%,transparent)]"
                      style={{ fontFamily: F }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-[13px]">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div style={{ flex: '0 0 160px', minWidth: '140px' }}>
                  <FieldLabel required>Select Symbol</FieldLabel>
                  <Select value={symbol} onValueChange={(v) => setSymbol(v as SegmentSymbol)}>
                    <SelectTrigger
                      className="h-10 w-full border-[#E4E7EC] bg-white text-[13px] shadow-none focus-visible:border-[var(--p2p-brand)] focus-visible:ring-[color-mix(in_srgb,var(--p2p-brand)_18%,transparent)]"
                      style={{ fontFamily: F }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEGMENT_SYMBOL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-[13px]">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table
                  aria-label="Account segments"
                  style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}
                >
                  <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
                      <th style={{ ...thStyle, width: '72px' }}>Segment</th>
                      <th style={thStyle}>Name</th>
                      <th style={{ ...thStyle, width: '120px' }}>Length</th>
                      <th style={{ ...thStyle, width: '100px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {segments.map((segment) => (
                      <tr key={segment.id} style={{ borderBottom: '1px solid #EEF1F5' }}>
                        <td style={{ ...tdStyle, color: '#64748B', fontSize: '13px', fontWeight: 500 }}>
                          {segment.order}
                        </td>
                        <td style={tdStyle}>
                          <input
                            type="text"
                            value={segment.name}
                            onChange={(e) => updateSegment(segment.id, { name: e.target.value })}
                            aria-label={`Segment ${segment.order} name`}
                            style={cellInputStyle}
                          />
                        </td>
                        <td style={tdStyle}>
                          <input
                            type="number"
                            min={1}
                            max={32}
                            value={segment.length}
                            onChange={(e) => {
                              const next = Number.parseInt(e.target.value, 10);
                              if (!Number.isNaN(next)) {
                                updateSegment(segment.id, { length: Math.min(32, Math.max(1, next)) });
                              }
                            }}
                            aria-label={`Segment ${segment.order} length`}
                            style={{ ...cellInputStyle, width: '72px', textAlign: 'center' }}
                          />
                        </td>
                        <td style={tdStyle}>
                          <Checkbox
                            checked={segment.active}
                            onCheckedChange={(checked) =>
                              updateSegment(segment.id, { active: checked === true })
                            }
                            aria-label={`${segment.active ? 'Deactivate' : 'Activate'} ${segment.name}`}
                            className={CHECKBOX_CLASS}
                          />
                        </td>
                      </tr>
                    ))}
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
                }}
              >
                {configSaved && (
                  <span style={{ fontSize: '12px', color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>
                    Configuration saved
                  </span>
                )}
                <button type="button" onClick={handleSaveConfig} style={primaryButtonStyle}>
                  Save
                </button>
              </div>
            </section>
          )}

          {activeTab === 'segment-data' && (
            <section
              role="tabpanel"
              aria-label="Segment Data"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E4E7EC',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
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
                <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '360px' }}>
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
                    value={segmentSearch}
                    onChange={(e) => setSegmentSearch(e.target.value)}
                    placeholder="Search here…"
                    aria-label="Search segment data"
                    style={{
                      height: '36px',
                      width: '100%',
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <button type="button" style={outlineButtonStyle}>
                    <Upload size={15} strokeWidth={2} aria-hidden />
                    Import
                  </button>
                  <button type="button" onClick={openCreateSegment} style={primaryButtonStyle}>
                    <Plus size={16} strokeWidth={2.25} aria-hidden />
                    Segment Data
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table
                  aria-label="Segment data"
                  style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}
                >
                  <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
                      <th style={{ ...thStyle, width: '44px' }}>
                        <Checkbox
                          checked={allSegmentVisibleSelected ? true : someSegmentVisibleSelected ? 'indeterminate' : false}
                          onCheckedChange={(checked) => toggleSegmentSelectAll(checked === true)}
                          aria-label="Select all rows"
                          className={CHECKBOX_CLASS}
                        />
                      </th>
                      <SortableHeader
                        label="Segment type"
                        active={segmentSortKey === 'segmentType'}
                        onClick={() => toggleSegmentSort('segmentType')}
                      />
                      <SortableHeader
                        label="Segment data"
                        active={segmentSortKey === 'segmentData'}
                        onClick={() => toggleSegmentSort('segmentData')}
                      />
                      <SortableHeader
                        label="Segment description"
                        active={segmentSortKey === 'description'}
                        onClick={() => toggleSegmentSort('description')}
                      />
                      <th style={{ ...thStyle, width: '80px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSegmentData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: '48px 20px',
                            textAlign: 'center',
                            fontSize: '13px',
                            color: '#64748B',
                          }}
                        >
                          {segmentData.length === 0
                            ? 'No segment data yet. Add your first entry to get started.'
                            : 'No entries match your search.'}
                        </td>
                      </tr>
                    ) : (
                      segmentPagination.paginatedItems.map((row) => (
                        <tr
                          key={row.id}
                          style={{ borderBottom: '1px solid #EEF1F5' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#FAFBFC';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <td style={tdStyle}>
                            <Checkbox
                              checked={segmentSelectedIds.has(row.id)}
                              onCheckedChange={(checked) => toggleSegmentSelectRow(row.id, checked === true)}
                              aria-label={`Select ${row.segmentData}`}
                              className={CHECKBOX_CLASS}
                            />
                          </td>
                          <td style={tdStyle}>
                            <button
                              type="button"
                              onClick={() => openEditSegment(row)}
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
                              {row.segmentType}
                            </button>
                          </td>
                          <td style={{ ...tdStyle, fontSize: '13px', color: '#334155' }}>
                            {row.segmentData}
                          </td>
                          <td style={{ ...tdStyle, fontSize: '13px', color: '#64748B' }}>
                            {row.description || '—'}
                          </td>
                          <td style={tdStyle} />
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <ListPagination
                page={segmentPagination.page}
                totalPages={segmentPagination.totalPages}
                rangeStart={segmentPagination.rangeStart}
                rangeEnd={segmentPagination.rangeEnd}
                totalItems={segmentPagination.totalItems}
                onPageChange={segmentPagination.setPage}
              />
            </section>
          )}

          {activeTab === 'account-data' && (
            <section
              role="tabpanel"
              aria-label="Account Data"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E4E7EC',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
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
                <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: '360px' }}>
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
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    placeholder="Search here…"
                    aria-label="Search account data"
                    style={{
                      height: '36px',
                      width: '100%',
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <button type="button" style={outlineButtonStyle}>
                    <Upload size={15} strokeWidth={2} aria-hidden />
                    Import
                  </button>
                  <button type="button" onClick={openCreateAccount} style={primaryButtonStyle}>
                    <Plus size={16} strokeWidth={2.25} aria-hidden />
                    Account Data
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table
                  aria-label="Account data"
                  style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}
                >
                  <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
                      <th style={{ ...thStyle, width: '44px' }}>
                        <Checkbox
                          checked={allAccountVisibleSelected ? true : someAccountVisibleSelected ? 'indeterminate' : false}
                          onCheckedChange={(checked) => toggleAccountSelectAll(checked === true)}
                          aria-label="Select all rows"
                          className={CHECKBOX_CLASS}
                        />
                      </th>
                      <SortableHeader
                        label="Account name"
                        active={accountSortKey === 'accountName'}
                        onClick={() => toggleAccountSort('accountName')}
                      />
                      <SortableHeader
                        label="Account details"
                        active={accountSortKey === 'accountDetails'}
                        onClick={() => toggleAccountSort('accountDetails')}
                      />
                      <SortableHeader
                        label="Active"
                        active={accountSortKey === 'active'}
                        onClick={() => toggleAccountSort('active')}
                      />
                      <th style={{ ...thStyle, width: '80px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccountData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: '48px 20px',
                            textAlign: 'center',
                            fontSize: '13px',
                            color: '#64748B',
                          }}
                        >
                          {accountData.length === 0
                            ? 'No account data yet. Add your first entry to get started.'
                            : 'No entries match your search.'}
                        </td>
                      </tr>
                    ) : (
                      accountPagination.paginatedItems.map((row) => (
                        <tr
                          key={row.id}
                          style={{ borderBottom: '1px solid #EEF1F5' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#FAFBFC';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <td style={tdStyle}>
                            <Checkbox
                              checked={accountSelectedIds.has(row.id)}
                              onCheckedChange={(checked) => toggleAccountSelectRow(row.id, checked === true)}
                              aria-label={`Select ${row.accountName}`}
                              className={CHECKBOX_CLASS}
                            />
                          </td>
                          <td style={tdStyle}>
                            <button
                              type="button"
                              onClick={() => openEditAccount(row)}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                padding: 0,
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 500,
                                color: '#334155',
                                fontFamily: F,
                                textAlign: 'left',
                                lineHeight: 1.45,
                              }}
                            >
                              {row.accountName}
                            </button>
                          </td>
                          <td style={{ ...tdStyle, fontSize: '13px', color: '#64748B', lineHeight: 1.45 }}>
                            {row.accountDetails}
                          </td>
                          <td style={{ ...tdStyle, width: '100px' }}>
                            <Switch
                              checked={row.active}
                              onCheckedChange={(checked) => toggleAccountActive(row.id, checked)}
                              aria-label={`${row.active ? 'Deactivate' : 'Activate'} ${row.accountName}`}
                            />
                          </td>
                          <td style={tdStyle} />
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <ListPagination
                page={accountPagination.page}
                totalPages={accountPagination.totalPages}
                rangeStart={accountPagination.rangeStart}
                rangeEnd={accountPagination.rangeEnd}
                totalItems={accountPagination.totalItems}
                onPageChange={accountPagination.setPage}
              />
            </section>
          )}

          {activeTab === 'split-gl' && (
            <section
              role="tabpanel"
              aria-label="Predefined Split GL Account setup"
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: '16px',
                }}
              >
                <button type="button" onClick={openCreateSplit} style={primaryButtonStyle}>
                  <Plus size={16} strokeWidth={2.25} aria-hidden />
                  Add Predefined GL Split
                </button>
              </div>

              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E4E7EC',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
                }}
              >
                <div
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #EEF1F5',
                  }}
                >
                  <div style={{ position: 'relative', maxWidth: '360px' }}>
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
                      value={splitSearch}
                      onChange={(e) => setSplitSearch(e.target.value)}
                      placeholder="Search here…"
                      aria-label="Search predefined GL splits"
                      style={{
                        height: '36px',
                        width: '100%',
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
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table
                    aria-label="Predefined GL splits"
                    style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}
                  >
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
                        <th style={{ ...thStyle, width: '44px' }} aria-label="Expand" />
                        <SortableHeader
                          label="Split name"
                          active={splitSortKey === 'splitName'}
                          onClick={() => toggleSplitSort('splitName')}
                        />
                        <th style={{ ...thStyle, width: '120px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGlSplits.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            style={{
                              padding: '48px 20px',
                              textAlign: 'center',
                              fontSize: '13px',
                              color: '#64748B',
                            }}
                          >
                            {glSplits.length === 0
                              ? 'No predefined GL splits yet. Add your first split to get started.'
                              : 'No splits match your search.'}
                          </td>
                        </tr>
                      ) : (
                        splitPagination.paginatedItems.flatMap((split) => {
                          const expanded = expandedSplitIds.has(split.id);
                          const rows = [
                            <tr
                              key={split.id}
                              style={{ borderBottom: '1px solid #EEF1F5' }}
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
                                  onClick={() => toggleSplitExpanded(split.id)}
                                  aria-expanded={expanded}
                                  aria-label={`${expanded ? 'Collapse' : 'Expand'} ${split.splitName}`}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '28px',
                                    height: '28px',
                                    border: '1px solid #E4E7EC',
                                    borderRadius: '6px',
                                    background: '#FFFFFF',
                                    cursor: 'pointer',
                                    color: P2P_BRAND.primaryStrong,
                                  }}
                                >
                                  {expanded ? <Minus size={14} /> : <SquarePlus size={14} />}
                                </button>
                              </td>
                              <td style={{ ...tdStyle, fontSize: '13px', fontWeight: 500, color: '#334155' }}>
                                {split.splitName}
                              </td>
                              <td style={{ ...tdStyle, textAlign: 'right' }}>
                                <div
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    justifyContent: 'flex-end',
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => openEditSplit(split)}
                                    aria-label={`Edit ${split.splitName}`}
                                    style={iconActionStyle(P2P_BRAND.primary)}
                                  >
                                    <Pencil size={14} aria-hidden />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteSplitId(split.id)}
                                    aria-label={`Delete ${split.splitName}`}
                                    style={iconActionStyle('#94A3B8')}
                                  >
                                    <Trash2 size={14} aria-hidden />
                                  </button>
                                </div>
                              </td>
                            </tr>,
                          ];

                          if (expanded && split.lines.length > 0) {
                            rows.push(
                              <tr key={`${split.id}-detail`}>
                                <td colSpan={3} style={{ padding: 0, background: '#FAFBFC' }}>
                                  <table
                                    aria-label={`${split.splitName} GL allocation`}
                                    style={{
                                      width: '100%',
                                      borderCollapse: 'collapse',
                                      borderTop: '1px solid #EEF1F5',
                                    }}
                                  >
                                    <thead>
                                      <tr style={{ borderBottom: '1px solid #E4E7EC' }}>
                                        <th style={{ ...nestedThStyle, paddingLeft: '68px' }}>GL account</th>
                                        <th style={nestedThStyle}>Account name</th>
                                        <th style={{ ...nestedThStyle, width: '140px', textAlign: 'right' }}>
                                          Percentage %
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {split.lines.map((line) => (
                                        <tr key={line.id} style={{ borderBottom: '1px solid #EEF1F5' }}>
                                          <td
                                            style={{
                                              ...nestedTdStyle,
                                              paddingLeft: '68px',
                                              color: '#334155',
                                            }}
                                          >
                                            {line.glAccount}
                                          </td>
                                          <td style={{ ...nestedTdStyle, color: '#64748B' }}>
                                            {line.accountName}
                                          </td>
                                          <td
                                            style={{
                                              ...nestedTdStyle,
                                              textAlign: 'right',
                                              color: '#334155',
                                              fontWeight: 500,
                                            }}
                                          >
                                            {line.percentage.toFixed(2)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </td>
                              </tr>,
                            );
                          }

                          return rows;
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <ListPagination
                  page={splitPagination.page}
                  totalPages={splitPagination.totalPages}
                  rangeStart={splitPagination.rangeStart}
                  rangeEnd={splitPagination.rangeEnd}
                  totalItems={splitPagination.totalItems}
                  onPageChange={splitPagination.setPage}
                />
              </div>
            </section>
          )}
        </main>
      </div>

      <SegmentDataFormDialog
        open={segmentDialogOpen}
        mode={editingSegmentRow ? 'edit' : 'create'}
        initial={editingSegmentRow}
        segmentTypes={segmentTypes}
        onOpenChange={setSegmentDialogOpen}
        onSave={handleSaveSegmentData}
      />

      <AccountDataFormDialog
        open={accountDialogOpen}
        mode={editingAccountRow ? 'edit' : 'create'}
        initial={editingAccountRow}
        departments={departments}
        accounts={accounts}
        onOpenChange={setAccountDialogOpen}
        onSave={handleSaveAccountData}
      />

      <PredefinedGlSplitFormDialog
        open={splitDialogOpen}
        mode={editingSplit ? 'edit' : 'create'}
        initial={editingSplit}
        onOpenChange={setSplitDialogOpen}
        onSave={handleSaveGlSplit}
      />

      <AlertDialog open={Boolean(deleteSplitId)} onOpenChange={(open) => !open && setDeleteSplitId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete predefined GL split?</AlertDialogTitle>
            <AlertDialogDescription>
              This split and its allocation lines will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSplit}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label
      style={{
        display: 'block',
        fontSize: '12px',
        fontWeight: 600,
        color: '#334155',
        marginBottom: '6px',
      }}
    >
      {children}
      {required && (
        <span style={{ color: '#DC2626', marginLeft: '2px' }} aria-hidden>
          *
        </span>
      )}
    </label>
  );
}

function SortableHeader({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <th style={thStyle}>
      <button
        type="button"
        onClick={onClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          border: 'none',
          background: 'transparent',
          padding: 0,
          cursor: 'pointer',
          fontSize: '11px',
          fontWeight: 600,
          color: active ? P2P_BRAND.primaryStrong : '#667085',
          fontFamily: F,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
        <ArrowUpDown size={12} aria-hidden />
      </button>
    </th>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 600,
  color: '#667085',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  verticalAlign: 'middle',
};

const cellInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #E4E7EC',
  borderRadius: '6px',
  fontSize: '13px',
  color: '#0F172A',
  background: '#F8FAFC',
  outline: 'none',
  fontFamily: F,
  boxSizing: 'border-box',
};

const primaryButtonStyle: React.CSSProperties = {
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

const outlineButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '9px 14px',
  border: `1px solid ${P2P_BRAND.surfaceBorder}`,
  borderRadius: '8px',
  background: '#FFFFFF',
  color: P2P_BRAND.primaryStrong,
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: F,
};

const nestedThStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: '11px',
  fontWeight: 600,
  color: '#667085',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
};

const nestedTdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '13px',
  verticalAlign: 'middle',
  lineHeight: 1.45,
};

function iconActionStyle(color: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '6px',
    background: 'transparent',
    cursor: 'pointer',
    color,
  };
}
