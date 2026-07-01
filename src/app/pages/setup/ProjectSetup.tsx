import { useMemo, useState } from 'react';
import { ChevronRight, Plus, Search, ArrowUpDown, Upload } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import { Checkbox } from '../../components/ui/checkbox';
import { Switch } from '../../components/ui/switch';
import { ListPagination } from '../../components/ListPagination';
import { ProjectSegmentDataFormDialog } from '../../components/setup/ProjectSegmentDataFormDialog';
import { ProjectDataFormDialog } from '../../components/setup/ProjectDataFormDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { usePagination } from '../../hooks/usePagination';
import {
  PROJECT_TYPE_OPTIONS,
  SEGMENT_SYMBOL_OPTIONS,
  createProjectSegmentsForType,
  createSeedProjectData,
  createSeedProjectSegmentData,
  getProjectOptions,
  getProjectSegmentTypeOptions,
  type ProjectDataRow,
  type ProjectSegment,
  type ProjectSegmentDataRow,
  type ProjectTypeFormat,
  type SegmentSymbol,
} from '../../data/projectSetup';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';
import { ImportWizard } from '../../components/setup/import';
import {
  PROJECT_DATA_IMPORT_CONFIG,
  PROJECT_SEGMENT_IMPORT_CONFIG,
} from '../../data/importWizardConfig';

type TabId = 'segment-config' | 'segment-data' | 'project-data';

const TABS: { id: TabId; label: string }[] = [
  { id: 'segment-config', label: 'Project Segment Config' },
  { id: 'segment-data', label: 'Segment Data' },
  { id: 'project-data', label: 'Project Data' },
];

const CHECKBOX_CLASS =
  'size-[18px] shrink-0 rounded-[5px] border-[#D0D5DD] data-[state=checked]:border-[var(--p2p-brand)] data-[state=checked]:bg-[var(--p2p-brand)] data-[state=checked]:text-white';

type SegmentSortKey = 'segmentType' | 'segmentData' | 'description';
type ProjectSortKey = 'fullAccountName' | 'accountDescription' | 'active';
type SortDir = 'asc' | 'desc';

export function ProjectSetup() {
  const [activeTab, setActiveTab] = useState<TabId>('segment-config');
  const [projectType, setProjectType] = useState<ProjectTypeFormat>('project');
  const [symbol, setSymbol] = useState<SegmentSymbol>(':');
  const [segments, setSegments] = useState<ProjectSegment[]>(() => createProjectSegmentsForType('project'));
  const [segmentData, setSegmentData] = useState<ProjectSegmentDataRow[]>(() => createSeedProjectSegmentData());
  const [projectData, setProjectData] = useState<ProjectDataRow[]>(() => createSeedProjectData());
  const [segmentSearch, setSegmentSearch] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [segmentSortKey, setSegmentSortKey] = useState<SegmentSortKey>('segmentType');
  const [projectSortKey, setProjectSortKey] = useState<ProjectSortKey>('fullAccountName');
  const [segmentSortDir, setSegmentSortDir] = useState<SortDir>('asc');
  const [projectSortDir, setProjectSortDir] = useState<SortDir>('asc');
  const [segmentSelectedIds, setSegmentSelectedIds] = useState<Set<string>>(new Set());
  const [projectSelectedIds, setProjectSelectedIds] = useState<Set<string>>(new Set());
  const [segmentDialogOpen, setSegmentDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingSegmentRow, setEditingSegmentRow] = useState<ProjectSegmentDataRow | null>(null);
  const [editingProjectRow, setEditingProjectRow] = useState<ProjectDataRow | null>(null);
  const [configSaved, setConfigSaved] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importScope, setImportScope] = useState<'segment' | 'project'>('segment');

  const segmentTypes = useMemo(() => getProjectSegmentTypeOptions(segments), [segments]);
  const projects = useMemo(() => getProjectOptions(segmentData), [segmentData]);

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

  const filteredProjectData = useMemo(() => {
    const query = projectSearch.trim().toLowerCase();
    return projectData
      .filter((row) => {
        if (!query) return true;
        return (
          row.fullAccountName.toLowerCase().includes(query) ||
          row.accountDescription.toLowerCase().includes(query) ||
          row.project.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const dir = projectSortDir === 'asc' ? 1 : -1;
        if (projectSortKey === 'fullAccountName') return a.fullAccountName.localeCompare(b.fullAccountName) * dir;
        if (projectSortKey === 'accountDescription') {
          return a.accountDescription.localeCompare(b.accountDescription) * dir;
        }
        return (Number(a.active) - Number(b.active)) * dir;
      });
  }, [projectData, projectSearch, projectSortKey, projectSortDir]);

  const segmentPagination = usePagination(filteredSegmentData, {
    resetKey: `${segmentSearch}-${segmentSortKey}-${segmentSortDir}`,
    pageSize: 10,
  });
  const projectPagination = usePagination(filteredProjectData, {
    resetKey: `${projectSearch}-${projectSortKey}-${projectSortDir}`,
    pageSize: 10,
  });

  const allSegmentVisibleSelected =
    segmentPagination.paginatedItems.length > 0 &&
    segmentPagination.paginatedItems.every((row) => segmentSelectedIds.has(row.id));
  const someSegmentVisibleSelected =
    segmentPagination.paginatedItems.some((row) => segmentSelectedIds.has(row.id)) &&
    !allSegmentVisibleSelected;

  const allProjectVisibleSelected =
    projectPagination.paginatedItems.length > 0 &&
    projectPagination.paginatedItems.every((row) => projectSelectedIds.has(row.id));
  const someProjectVisibleSelected =
    projectPagination.paginatedItems.some((row) => projectSelectedIds.has(row.id)) &&
    !allProjectVisibleSelected;

  const handleProjectTypeChange = (value: ProjectTypeFormat) => {
    setProjectType(value);
    setSegments(createProjectSegmentsForType(value));
    setConfigSaved(false);
  };

  const updateSegment = (id: string, patch: Partial<ProjectSegment>) => {
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

  const toggleProjectSort = (key: ProjectSortKey) => {
    if (projectSortKey === key) setProjectSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setProjectSortKey(key);
      setProjectSortDir('asc');
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

  const toggleProjectSelectAll = (checked: boolean) => {
    setProjectSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        for (const row of projectPagination.paginatedItems) next.add(row.id);
      } else {
        for (const row of projectPagination.paginatedItems) next.delete(row.id);
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

  const toggleProjectSelectRow = (id: string, checked: boolean) => {
    setProjectSelectedIds((prev) => {
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

  const openEditSegment = (row: ProjectSegmentDataRow) => {
    setEditingSegmentRow(row);
    setSegmentDialogOpen(true);
  };

  const openCreateProject = () => {
    setEditingProjectRow(null);
    setProjectDialogOpen(true);
  };

  const openEditProject = (row: ProjectDataRow) => {
    setEditingProjectRow(row);
    setProjectDialogOpen(true);
  };

  const handleSaveSegmentData = (saved: ProjectSegmentDataRow) => {
    setSegmentData((prev) => {
      const exists = prev.some((r) => r.id === saved.id);
      if (exists) return prev.map((r) => (r.id === saved.id ? saved : r));
      return [...prev, saved];
    });
  };

  const handleSaveProjectData = (saved: ProjectDataRow) => {
    setProjectData((prev) => {
      const exists = prev.some((r) => r.id === saved.id);
      if (exists) return prev.map((r) => (r.id === saved.id ? saved : r));
      return [...prev, saved];
    });
  };

  const toggleProjectActive = (id: string, active: boolean) => {
    setProjectData((prev) => prev.map((row) => (row.id === id ? { ...row, active } : row)));
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
              <li style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>Project Setup</li>
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
              Project Setup
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
              Configure project segment structure, segment values, and project account data for your
              organization.
            </p>
          </header>

          <div
            role="tablist"
            aria-label="Project setup sections"
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
              aria-label="Project Segment Config"
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
                  <FieldLabel required>Select</FieldLabel>
                  <Select value={projectType} onValueChange={(v) => handleProjectTypeChange(v as ProjectTypeFormat)}>
                    <SelectTrigger
                      className="h-10 w-full border-[#E4E7EC] bg-white text-[13px] shadow-none focus-visible:border-[var(--p2p-brand)] focus-visible:ring-[color-mix(in_srgb,var(--p2p-brand)_18%,transparent)]"
                      style={{ fontFamily: F }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROJECT_TYPE_OPTIONS.map((opt) => (
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
                  aria-label="Project segments"
                  style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}
                >
                  <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
                      <th style={{ ...thStyle, width: '48px' }}>S</th>
                      <th style={thStyle}>Segment name</th>
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
                  <button
                    type="button"
                    onClick={() => {
                      setImportScope('segment');
                      setImportOpen(true);
                    }}
                    style={outlineButtonStyle}
                  >
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
                  aria-label="Project segment data"
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
                              }}
                            >
                              Edit
                            </button>
                          </td>
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

          {activeTab === 'project-data' && (
            <section
              role="tabpanel"
              aria-label="Project Data"
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
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search here…"
                    aria-label="Search project data"
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
                  <button
                    type="button"
                    onClick={() => {
                      setImportScope('project');
                      setImportOpen(true);
                    }}
                    style={outlineButtonStyle}
                  >
                    <Upload size={15} strokeWidth={2} aria-hidden />
                    Import
                  </button>
                  <button type="button" onClick={openCreateProject} style={primaryButtonStyle}>
                    <Plus size={16} strokeWidth={2.25} aria-hidden />
                    Project Data
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table
                  aria-label="Project data"
                  style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}
                >
                  <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
                      <th style={{ ...thStyle, width: '44px' }}>
                        <Checkbox
                          checked={allProjectVisibleSelected ? true : someProjectVisibleSelected ? 'indeterminate' : false}
                          onCheckedChange={(checked) => toggleProjectSelectAll(checked === true)}
                          aria-label="Select all rows"
                          className={CHECKBOX_CLASS}
                        />
                      </th>
                      <SortableHeader
                        label="Full account name"
                        active={projectSortKey === 'fullAccountName'}
                        onClick={() => toggleProjectSort('fullAccountName')}
                      />
                      <SortableHeader
                        label="Account description"
                        active={projectSortKey === 'accountDescription'}
                        onClick={() => toggleProjectSort('accountDescription')}
                      />
                      <SortableHeader
                        label="Active"
                        active={projectSortKey === 'active'}
                        onClick={() => toggleProjectSort('active')}
                      />
                      <th style={{ ...thStyle, width: '80px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjectData.length === 0 ? (
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
                          {projectData.length === 0
                            ? 'No project data yet. Add your first entry to get started.'
                            : 'No entries match your search.'}
                        </td>
                      </tr>
                    ) : (
                      projectPagination.paginatedItems.map((row) => (
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
                              checked={projectSelectedIds.has(row.id)}
                              onCheckedChange={(checked) => toggleProjectSelectRow(row.id, checked === true)}
                              aria-label={`Select ${row.fullAccountName}`}
                              className={CHECKBOX_CLASS}
                            />
                          </td>
                          <td style={tdStyle}>
                            <button
                              type="button"
                              onClick={() => openEditProject(row)}
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
                              {row.fullAccountName}
                            </button>
                          </td>
                          <td style={{ ...tdStyle, fontSize: '13px', color: '#64748B' }}>
                            {row.accountDescription}
                          </td>
                          <td style={{ ...tdStyle, width: '100px' }}>
                            <Switch
                              checked={row.active}
                              onCheckedChange={(checked) => toggleProjectActive(row.id, checked)}
                              aria-label={`${row.active ? 'Deactivate' : 'Activate'} ${row.fullAccountName}`}
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
                page={projectPagination.page}
                totalPages={projectPagination.totalPages}
                rangeStart={projectPagination.rangeStart}
                rangeEnd={projectPagination.rangeEnd}
                totalItems={projectPagination.totalItems}
                onPageChange={projectPagination.setPage}
              />
            </section>
          )}
        </main>
      </div>

      <ProjectSegmentDataFormDialog
        open={segmentDialogOpen}
        mode={editingSegmentRow ? 'edit' : 'create'}
        initial={editingSegmentRow}
        segmentTypes={segmentTypes}
        onOpenChange={setSegmentDialogOpen}
        onSave={handleSaveSegmentData}
      />

      <ProjectDataFormDialog
        open={projectDialogOpen}
        mode={editingProjectRow ? 'edit' : 'create'}
        initial={editingProjectRow}
        projects={projects}
        onOpenChange={setProjectDialogOpen}
        onSave={handleSaveProjectData}
      />

      <ImportWizard
        open={importOpen}
        onOpenChange={setImportOpen}
        config={importScope === 'segment' ? PROJECT_SEGMENT_IMPORT_CONFIG : PROJECT_DATA_IMPORT_CONFIG}
      />
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
