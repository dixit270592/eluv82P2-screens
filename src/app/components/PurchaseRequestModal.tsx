import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Eye, ChevronDown, Search, Check, Trash2, Edit3, ChevronRight, Plus } from 'lucide-react';
import { UI_FONT_STACK as F } from '../tokens/typography';

export interface LineItemData {
  id: string;
  item: string;
  vendor: string;
  quantity: number;
  cost: number;
  subtotal: number;
  glAccount: string;
}

export interface PRHeaderData {
  description: string;
  type: string;
  vendor: string;
  department: string;
  deliveryLocation: string;
}

interface GLSplit {
  id: string;
  code: string;
  name: string;
  amount: number;
  percentage: number;
}

interface PurchaseRequestModalProps {
  onClose: () => void;
  onComplete: (data: { header: PRHeaderData; lineItem?: LineItemData }) => void;
}

type ModalView = 'header' | 'lineItem' | 'glSplit';

const MODAL_FLOW_STEPS: { id: Exclude<ModalView, 'glSplit'>; label: string; caption: string }[] = [
  { id: 'header', label: 'Header', caption: 'Request details' },
  { id: 'lineItem', label: 'Line item', caption: 'Item & costing' },
];

/* ─── Constants ─── */
const PR_TYPES = [
  'Standard Purchase Request', 'Purchase Order', 'Service Order',
  'Capital Expenditure', 'Professional Services', 'Subscription', 'Maintenance Contract',
];
const VENDORS = [
  '84 Lumber', 'Dell Technologies', 'Microsoft Corporation', 'Amazon Web Services',
  'Adobe Systems', 'Oracle Corporation', 'SAP SE', 'ServiceNow', 'Workday Inc.',
];
const DEPARTMENTS = ['IT', 'Finance', 'Engineering', 'HR', 'Marketing', 'Operations', 'Procurement', 'R&D', 'Sales'];
const DELIVERY_LOCS = [
  'NY Office, Loading Lock 3', 'HQ — Floor 3', 'Chicago Office', 'LA Office', 'Warehouse A', 'Remote',
];
const USER_SECTIONS = ['User Section', 'Finance Team', 'IT Department', 'Operations Team'];
const DEPT_GL_FILTERS = ['All Departments', 'Finance', 'IT', 'Operations', 'HR'];

const GL_ACCOUNTS_LIST = [
  { code: '10:1030', name: 'Finance & Administration-Cash Management', dept: 'Finance' },
  { code: '10:1031', name: 'Finance & Administration Property Ltd', dept: 'Finance' },
  { code: '10:1032', name: 'Finance & Administration Accounts', dept: 'Finance' },
  { code: '10:1000', name: 'Finance & Administration-Accounts Mgmt', dept: 'Finance' },
  { code: '10:1001', name: 'Finance & Administration Employee', dept: 'Finance' },
  { code: '10:1002', name: 'Finance & Administration Payroll', dept: 'Finance' },
  { code: '10:7000', name: 'Finance & Administration Computer', dept: 'IT' },
  { code: '10:7001', name: 'Finance & Administration Software', dept: 'IT' },
  { code: '10:8000', name: 'Operations & Facilities Maintenance', dept: 'Operations' },
];

const PREDEFINED_TEMPLATES: Record<string, Array<{ code: string; name: string; percentage: number }>> = {
  'Finance PR': [
    { code: '10:1030', name: 'Finance & Administration-Cash Mgmt', percentage: 25 },
    { code: '10:1031', name: 'Finance & Administration Prty Ltd', percentage: 25 },
    { code: '10:1000', name: 'Finance & Administration Accounts', percentage: 25 },
    { code: '10:1001', name: 'Finance & Administration Employee', percentage: 25 },
  ],
  'IT Equipment': [
    { code: '10:7000', name: 'Finance & Administration Computer', percentage: 60 },
    { code: '10:7001', name: 'Finance & Administration Software', percentage: 40 },
  ],
  'Operations': [
    { code: '10:8000', name: 'Operations & Facilities Maintenance', percentage: 50 },
    { code: '10:1002', name: 'Finance & Administration Payroll', percentage: 50 },
  ],
};

/* ─── Main Modal ─── */
export function PurchaseRequestModal({ onClose, onComplete }: PurchaseRequestModalProps) {
  const [view, setView] = useState<ModalView>('header');
  const [glApplied, setGlApplied] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  /* Header form */
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Standard Purchase Request');
  const [vendor, setVendor] = useState('');
  const [department, setDepartment] = useState('IT');
  const [deliveryLocation, setDeliveryLocation] = useState('NY Office, Loading Lock 3');

  /* Line item form */
  const [itemDesc, setItemDesc] = useState('');
  const [qty, setQty] = useState('');
  const [unitCost, setUnitCost] = useState('0.00');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [appliedGLLabel, setAppliedGLLabel] = useState('6100 - Office Supplies');

  /* GL distribution */
  const [userSection, setUserSection] = useState('User Section');
  const [glSearch, setGlSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [selectedTemplate, setSelectedTemplate] = useState('Finance PR');
  const [glSplits, setGlSplits] = useState<GLSplit[]>([]);

  const subtotal = (parseFloat(qty) || 0) * (parseFloat(unitCost) || 0);
  const totalAllocPct = glSplits.reduce((s, g) => s + g.percentage, 0);
  const totalAllocAmt = glSplits.reduce((s, g) => s + g.amount, 0);
  const remainingPct = Math.max(0, 100 - totalAllocPct);
  const remainingAmt = Math.max(0, subtotal - totalAllocAmt);

  const filteredGL = GL_ACCOUNTS_LIST.filter((acc) => {
    const matchSearch = !glSearch || acc.name.toLowerCase().includes(glSearch.toLowerCase()) || acc.code.includes(glSearch);
    const matchDept = deptFilter === 'All Departments' || acc.dept === deptFilter;
    return matchSearch && matchDept;
  });

  const initTemplate = (name: string) => {
    const tpl = PREDEFINED_TEMPLATES[name];
    if (!tpl) return;
    const totalAmt = subtotal > 0 ? subtotal : 100;
    setGlSplits(
      tpl.map((t, i) => ({
        id: `tpl_${i}_${Date.now()}`,
        code: t.code,
        name: t.name,
        amount: Math.round((t.percentage / 100) * totalAmt * 100) / 100,
        percentage: t.percentage,
      }))
    );
  };

  const handleSelectTemplate = (name: string) => {
    setSelectedTemplate(name);
    initTemplate(name);
  };

  const toggleGLAccount = (acc: (typeof GL_ACCOUNTS_LIST)[0]) => {
    const exists = glSplits.find((s) => s.code === acc.code && s.name.startsWith(acc.name.slice(0, 12)));
    if (exists) {
      setGlSplits((prev) => prev.filter((s) => s.id !== exists.id));
    } else {
      const totalAmt = subtotal > 0 ? subtotal : 100;
      setGlSplits((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          code: acc.code,
          name: acc.name,
          amount: Math.round((totalAmt / (prev.length + 1)) * 100) / 100,
          percentage: Math.round(100 / (prev.length + 1)),
        },
      ]);
    }
  };

  const updateSplit = (id: string, field: 'amount' | 'percentage', value: number) => {
    setGlSplits((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (field === 'amount') {
          return { ...s, amount: value, percentage: subtotal > 0 ? Math.round((value / subtotal) * 1000) / 10 : 0 };
        }
        return { ...s, percentage: value, amount: Math.round((value / 100) * subtotal * 100) / 100 };
      })
    );
  };

  const handleOpenGL = () => {
    if (glSplits.length === 0) initTemplate(selectedTemplate);
    setView('glSplit');
  };

  const handleApplyGL = () => {
    if (glSplits.length > 0) {
      setAppliedGLLabel(glSplits.map((s) => `${s.code} (${s.percentage}%)`).join(', '));
    }
    setGlApplied(true);
    setView('lineItem');
  };

  const handleAddPR = () => {
    const header: PRHeaderData = { description, type, vendor, department, deliveryLocation };
    const hasLine = view === 'lineItem' || (view === 'header' && false);
    let lineItem: LineItemData | undefined;
    if (view === 'lineItem') {
      lineItem = {
        id: Date.now().toString(),
        item: itemDesc || 'New Item',
        vendor: vendor || '84 Lumber',
        quantity: parseFloat(qty) || 1,
        cost: parseFloat(unitCost) || 0,
        subtotal,
        glAccount: glSplits.length > 0 ? `${glSplits[0].code} - ${glSplits[0].name}` : appliedGLLabel,
      };
    }
    onComplete({ header, lineItem });
  };

  /* ── Shared styles ── */
  const inp = (id: string): React.CSSProperties => ({
    width: '100%', height: '36px',
    border: `1px solid ${focused === id ? '#1FA97A' : '#D0D5DD'}`,
    borderRadius: '5px', padding: '0 10px',
    fontSize: '13px', color: '#101828', fontFamily: F,
    outline: 'none', background: '#FFFFFF', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  });

  const sel = (id: string): React.CSSProperties => ({
    ...inp(id), appearance: 'none', paddingRight: '28px', cursor: 'pointer',
  });

  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '11px', fontWeight: 600,
    color: '#344054', fontFamily: F, marginBottom: '5px',
  };

  /** GL distribution is edited from Line item (not a separate step in the strip) */
  const stepIndex = view === 'header' ? 0 : 1;

  /** Single shell width avoids animating `width` (layout thrash) when switching views */
  const MODAL_SHELL_W = '720px';
  /** Horizontal inset inside the card (header, body, footer) */
  const modalPadX = 18;
  const modalPadYHeader = 18;
  const modalPadYFooter = 12;

  /** Align header, step strip, form body, and footer to one full-width track inside horizontal pad */
  const contentColumn: React.CSSProperties = {
    maxWidth: '100%',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(16,24,40,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: '12px', backdropFilter: 'blur(2px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: MODAL_SHELL_W,
          maxWidth: '96vw',
          maxHeight: '90vh',
          background: '#FFFFFF',
          borderRadius: '8px',
          boxShadow: '0 10px 40px rgba(16,24,40,0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── Top bar (same width as form column) ── */}
        <div
          style={{
            padding: `${modalPadYHeader}px ${modalPadX}px 14px`,
            borderBottom: '1px solid #EEF1F5',
            flexShrink: 0,
          }}
        >
          <div style={contentColumn}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#101828', fontFamily: F }}>
                  Add Purchase Request
                </h2>
                {view === 'header' && (
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#667085', fontFamily: F }}>
                    Fill out details to create a new purchase request.
                  </p>
                )}
                {(view === 'lineItem' || view === 'glSplit') && (
                  <div style={{ marginTop: '3px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1FA97A', fontFamily: F }}>
                      Add First Line Item
                    </span>
                    {view === 'glSplit' && (
                      <>
                        <br />
                        <span style={{ fontSize: '12px', color: '#667085', fontFamily: F }}>GL Distribution</span>
                      </>
                    )}
                    {view === 'lineItem' && (
                      <>
                        <br />
                        <span style={{ fontSize: '12px', color: '#667085', fontFamily: F }}>
                          Defaults set here will auto-populate for additional lines.
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                type="button"
                style={{
                  width: '28px', height: '28px', border: '1px solid #E4E7EC', borderRadius: '5px',
                  background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <X size={13} color="#667085" strokeWidth={2.5} />
              </button>
            </div>

          <div
            role="group"
            aria-label="Purchase request steps"
            style={{
              marginTop: 16,
              padding: '14px 16px 16px',
              borderRadius: 10,
              background: 'linear-gradient(180deg, #FCFDFD 0%, #F4F6F9 100%)',
              border: '1px solid #E4E7EC',
              boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 14,
              }}
            >
              {MODAL_FLOW_STEPS.map((s, i) => {
                const active =
                  view === 'glSplit'
                    ? s.id === 'lineItem'
                    : stepIndex === i;
                const complete = stepIndex > i;
                return (
                  <div
                    key={s.id}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                      padding: '2px 0 2px 11px',
                      borderLeft: active ? '3px solid #1FA97A' : '3px solid transparent',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 800,
                        fontFamily: F,
                        background: complete
                          ? 'linear-gradient(145deg, #1FA97A, #16A37A)'
                          : active
                            ? 'linear-gradient(145deg, #0f172a, #1e293b)'
                            : '#E8ECF0',
                        color: complete || active ? '#FFFFFF' : '#64748B',
                        boxShadow:
                          complete || active
                            ? '0 2px 8px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(255,255,255,0.08) inset'
                            : '0 1px 2px rgba(16, 24, 40, 0.06) inset',
                        transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
                        transform: active ? 'scale(1.02)' : 'none',
                      }}
                    >
                      {complete ? <Check size={14} strokeWidth={2.5} /> : i + 1}
                    </span>
                    <div style={{ minWidth: 0, paddingTop: 1 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: active ? 700 : complete ? 600 : 500,
                          color: active || complete ? '#101828' : '#475467',
                          fontFamily: F,
                          letterSpacing: '-0.02em',
                          lineHeight: 1.3,
                        }}
                      >
                        {s.label}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: complete && !active ? '#667085' : active ? '#344054' : '#98A2B3',
                          fontFamily: F,
                          marginTop: 3,
                          lineHeight: 1.35,
                        }}
                      >
                        {s.caption}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Segmented progress: one segment per step */}
            <div
              aria-hidden
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {MODAL_FLOW_STEPS.map((s, i) => {
                const onOrPast = stepIndex > i || stepIndex === i;
                return (
                  <div
                    key={`seg-${s.id}`}
                    style={{
                      flex: 1,
                      height: 5,
                      borderRadius: 999,
                      background: onOrPast
                        ? 'linear-gradient(90deg, #1FA97A 0%, #2DD4A7 100%)'
                        : '#E4E7EC',
                      boxShadow: onOrPast
                        ? '0 1px 2px rgba(31, 169, 122, 0.25), inset 0 1px 0 rgba(255,255,255,0.25)'
                        : 'inset 0 1px 2px rgba(16, 24, 40, 0.06)',
                      transition: 'background 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s',
                    }}
                    title={s.caption}
                  />
                );
              })}
            </div>
          </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: view === 'glSplit' ? 0 : `${modalPadYHeader}px ${modalPadX}px`,
          }}
        >
          <AnimatePresence mode="wait">
            {view === 'header' && (
              <motion.div key="header" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                <div style={contentColumn}>
                  <HeaderForm
                    {...{ description, setDescription, type, setType, vendor, setVendor, department, setDepartment, deliveryLocation, setDeliveryLocation, focused, setFocused, inp, sel, lbl }}
                    onAddLineItem={() => setView('lineItem')}
                  />
                </div>
              </motion.div>
            )}
            {view === 'lineItem' && (
              <motion.div key="lineItem" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                <div style={contentColumn}>
                  <LineItemForm
                    {...{ itemDesc, setItemDesc, qty, setQty, unitCost, setUnitCost, showAdvanced, setShowAdvanced, appliedGLLabel, glApplied, focused, setFocused, inp, lbl }}
                    onEditGL={handleOpenGL}
                  />
                </div>
              </motion.div>
            )}
            {view === 'glSplit' && (
              <motion.div key="glSplit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                <GLDistribution
                  {...{
                    userSection, setUserSection, glSearch, setGlSearch, deptFilter, setDeptFilter,
                    selectedTemplate, filteredGL, glSplits, totalAllocPct, totalAllocAmt,
                    remainingPct, remainingAmt, subtotal, focused, setFocused,
                  }}
                  onSelectTemplate={handleSelectTemplate}
                  onToggleAccount={toggleGLAccount}
                  onUpdateSplit={updateSplit}
                  onRemoveSplit={(id) => setGlSplits((p) => p.filter((s) => s.id !== id))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Footer (actions line up with form column) ── */}
        <div
          style={{
            padding: `${modalPadYFooter}px ${modalPadX}px`,
            borderTop: '1px solid #EEF1F5',
            background: '#FAFAFA',
            flexShrink: 0,
          }}
        >
          <div style={{ ...contentColumn, display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: '10px' }}>
            <SecBtn onClick={onClose}>Cancel</SecBtn>
            {view === 'header' && (
              <PriBtn onClick={handleAddPR}>Add Purchase Request</PriBtn>
            )}
            {view === 'lineItem' && !glApplied && (
              <PriBtn onClick={handleAddPR}>Add Line</PriBtn>
            )}
            {view === 'lineItem' && glApplied && (
              <PriBtn onClick={handleAddPR}>Add Purchase Request</PriBtn>
            )}
            {view === 'glSplit' && (
              <PriBtn onClick={handleApplyGL}>Apply</PriBtn>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── STEP 1: Header Form ─── */
function HeaderForm({
  description, setDescription, type, setType, vendor, setVendor,
  department, setDepartment, deliveryLocation, setDeliveryLocation,
  focused, setFocused, inp, sel, lbl, onAddLineItem,
}: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Description */}
      <div>
        <label style={lbl}>Description <Req /></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description…"
          onFocus={() => setFocused('desc')}
          onBlur={() => setFocused(null)}
          style={{
            ...inp('desc'), height: '72px', padding: '8px 10px',
            resize: 'none', lineHeight: 1.5, width: '100%', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Row: Type + Vendor */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Type */}
        <div>
          <label style={lbl}>Type <Req /></label>
          <div style={{ position: 'relative' }}>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              onFocus={() => setFocused('type')}
              onBlur={() => setFocused(null)}
              style={sel('type')}
            >
              {PR_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={12} color="#98A2B3" style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Vendor */}
        <div>
          <label style={lbl}>Select Vendor <Req /></label>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <select
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                onFocus={() => setFocused('vendor')}
                onBlur={() => setFocused(null)}
                style={sel('vendor')}
              >
                <option value="">Select vendor…</option>
                {VENDORS.map((v) => <option key={v}>{v}</option>)}
              </select>
              <ChevronDown size={12} color="#98A2B3" style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
            <button style={eyeBtnSt}><Eye size={13} color="#98A2B3" strokeWidth={1.8} /></button>
          </div>
        </div>
      </div>

      {/* Row: Department + Delivery Location */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {/* Department */}
        <div>
          <label style={lbl}>Department/Location <Req /></label>
          <div style={{ position: 'relative' }}>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              onFocus={() => setFocused('dept')}
              onBlur={() => setFocused(null)}
              style={sel('dept')}
            >
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown size={12} color="#98A2B3" style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Delivery Location */}
        <div>
          <label style={lbl}>Delivery Location <Req /></label>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <select
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                onFocus={() => setFocused('dloc')}
                onBlur={() => setFocused(null)}
                style={sel('dloc')}
              >
                {DELIVERY_LOCS.map((l) => <option key={l}>{l}</option>)}
              </select>
              <ChevronDown size={12} color="#98A2B3" style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
            <button style={eyeBtnSt}><Eye size={13} color="#98A2B3" strokeWidth={1.8} /></button>
          </div>
        </div>
      </div>

      {/* + Add Line Item Entry */}
      <div>
        <button
          onClick={onAddLineItem}
          style={{
            width: '100%', height: '38px', border: '1.5px dashed #D0D5DD',
            borderRadius: '6px', background: '#FAFAFA', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            fontSize: '13px', color: '#667085', fontFamily: F, fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#1FA97A';
            (e.currentTarget as HTMLElement).style.color = '#1FA97A';
            (e.currentTarget as HTMLElement).style.background = '#F0FDF9';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD';
            (e.currentTarget as HTMLElement).style.color = '#667085';
            (e.currentTarget as HTMLElement).style.background = '#FAFAFA';
          }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Add Line Item Entry
        </button>
      </div>
    </div>
  );
}

/* ─── STEP 2: Line Item Form ─── */
function LineItemForm({
  itemDesc, setItemDesc, qty, setQty, unitCost, setUnitCost,
  showAdvanced, setShowAdvanced, appliedGLLabel, glApplied, focused, setFocused, inp, lbl, onEditGL,
}: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Description */}
      <div>
        <label style={{ ...lbl, color: '#667085', fontSize: '12px' }}>Description</label>
        <input
          value={itemDesc}
          onChange={(e) => setItemDesc(e.target.value)}
          placeholder="Enter item description…"
          onFocus={() => setFocused('idesc')}
          onBlur={() => setFocused(null)}
          style={inp('idesc')}
        />
      </div>

      {/* Qty + Unit Cost */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div>
          <label style={{ ...lbl, color: '#667085', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity</label>
          <input
            type="number" min={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="Enter qty"
            onFocus={() => setFocused('qty')}
            onBlur={() => setFocused(null)}
            style={inp('qty')}
          />
        </div>
        <div>
          <label style={{ ...lbl, color: '#667085', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit Cost</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '10px', fontSize: '13px', color: '#667085', fontFamily: F, zIndex: 1 }}>$</span>
            <input
              type="number" min={0} step={0.01}
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              onFocus={() => setFocused('ucost')}
              onBlur={() => setFocused(null)}
              style={{ ...inp('ucost'), paddingLeft: '20px' }}
            />
          </div>
        </div>
      </div>

      {/* Advanced Details */}
      <div style={{ border: '1px solid #E4E7EC', borderRadius: '6px', overflow: 'hidden' }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            width: '100%', padding: '10px 14px', background: 'transparent',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            fontFamily: F, textAlign: 'left',
          }}
        >
          <ChevronRight
            size={13} color="#667085" strokeWidth={2}
            style={{ transition: 'transform 0.2s', transform: showAdvanced ? 'rotate(90deg)' : 'rotate(0deg)' }}
          />
          <span style={{ fontSize: '12px', color: '#667085', fontFamily: F, fontWeight: 500 }}>
            Advanced Details <span style={{ fontSize: '11px', color: '#98A2B3' }}>(Optional)</span>
          </span>
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}
            >
              <div
                style={{
                  padding: '10px 14px 12px',
                  borderTop: '1px solid #EEF1F5',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <div
                    style={{
                      width: '16px', height: '16px', borderRadius: '3px',
                      border: glApplied ? 'none' : '1.5px solid #D0D5DD',
                      background: glApplied ? '#1FA97A' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                  >
                    {glApplied && <Check size={10} color="#fff" strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: '12px', color: '#344054', fontFamily: F, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {appliedGLLabel}
                  </span>
                </div>
                <button
                  onClick={onEditGL}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '5px 10px', border: '1px solid #D0D5DD', borderRadius: '5px',
                    background: '#FFFFFF', cursor: 'pointer', fontSize: '12px', color: '#667085', fontFamily: F,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#F0FDF9';
                    (e.currentTarget as HTMLElement).style.borderColor = '#1FA97A';
                    (e.currentTarget as HTMLElement).style.color = '#1FA97A';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
                    (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD';
                    (e.currentTarget as HTMLElement).style.color = '#667085';
                  }}
                >
                  <Edit3 size={11} strokeWidth={2} />
                  Edit GL Account(s)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── STEP 3: GL Distribution ─── */
function GLDistribution({
  userSection, setUserSection, glSearch, setGlSearch, deptFilter, setDeptFilter,
  selectedTemplate, filteredGL, glSplits, totalAllocPct, totalAllocAmt,
  remainingPct, remainingAmt, subtotal, focused, setFocused,
  onSelectTemplate, onToggleAccount, onUpdateSplit, onRemoveSplit,
}: any) {
  return (
    <div style={{ display: 'flex', height: '420px' }}>
      {/* Left 40% — GL Selector */}
      <div
        style={{
          width: '40%', flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid #E4E7EC', background: '#F9FAFB',
        }}
      >
        {/* User section dropdown */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #E4E7EC' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={userSection}
              onChange={(e) => setUserSection(e.target.value)}
              style={{
                width: '100%', height: '34px', appearance: 'none', paddingRight: '28px',
                border: 'none', borderRadius: '5px', background: '#1FA97A', color: '#FFFFFF',
                fontSize: '12px', fontWeight: 600, fontFamily: F, cursor: 'pointer', padding: '0 28px 0 10px',
                outline: 'none',
              }}
            >
              {USER_SECTIONS.map((s) => <option key={s} style={{ background: '#FFFFFF', color: '#101828' }}>{s}</option>)}
            </select>
            <ChevronDown size={12} color="#fff" style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '10px 14px 0' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              height: '32px', padding: '0 9px',
              border: `1px solid ${focused === 'glSearch' ? '#1FA97A' : '#D0D5DD'}`,
              borderRadius: '5px', background: '#FFFFFF', transition: 'border-color 0.15s',
              marginBottom: '8px',
            }}
          >
            <Search size={12} color="#98A2B3" strokeWidth={2} />
            <input
              value={glSearch}
              onChange={(e) => setGlSearch(e.target.value)}
              placeholder="Search by name or code…"
              onFocus={() => setFocused('glSearch')}
              onBlur={() => setFocused(null)}
              style={{ border: 'none', outline: 'none', fontSize: '12px', color: '#101828', fontFamily: F, background: 'transparent', flex: 1 }}
            />
          </div>

          {/* Dept filter */}
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{
                width: '100%', height: '32px', appearance: 'none', paddingRight: '24px',
                border: '1px solid #D0D5DD', borderRadius: '5px', background: '#FFFFFF',
                color: '#667085', fontSize: '12px', fontFamily: F, cursor: 'pointer', padding: '0 24px 0 9px', outline: 'none',
              }}
            >
              {DEPT_GL_FILTERS.map((d) => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown size={11} color="#98A2B3" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>

          {/* Template presets */}
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <select
              value={selectedTemplate}
              onChange={(e) => onSelectTemplate(e.target.value)}
              style={{
                width: '100%', height: '32px', appearance: 'none', paddingRight: '24px',
                border: '1px solid #D0D5DD', borderRadius: '5px', background: '#FFFFFF',
                color: '#667085', fontSize: '12px', fontFamily: F, cursor: 'pointer', padding: '0 24px 0 9px', outline: 'none',
              }}
            >
              <option value="">Select Account Template…</option>
              {Object.keys(PREDEFINED_TEMPLATES).map((t) => <option key={t}>{t}</option>)}
            </select>
            <ChevronDown size={11} color="#98A2B3" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* GL list */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '4px' }}>
          {filteredGL.map((acc: any) => {
            const checked = glSplits.some((s: GLSplit) => s.code === acc.code && s.name.startsWith(acc.name.slice(0, 10)));
            return (
              <div
                key={`${acc.code}_${acc.name}`}
                onClick={() => onToggleAccount(acc)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '9px',
                  padding: '9px 14px', cursor: 'pointer',
                  background: checked ? '#E6F7F1' : 'transparent',
                  borderBottom: '1px solid #F2F4F7', transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => { if (!checked) (e.currentTarget as HTMLElement).style.background = '#F0F2F5'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = checked ? '#E6F7F1' : 'transparent'; }}
              >
                <div
                  style={{
                    width: '15px', height: '15px', borderRadius: '3px', flexShrink: 0, marginTop: '1px',
                    border: checked ? 'none' : '1.5px solid #D0D5DD',
                    background: checked ? '#1FA97A' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {checked && <Check size={9} color="#fff" strokeWidth={3} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#344054', fontFamily: F }}>{acc.code}</div>
                  <div style={{ fontSize: '10px', color: '#667085', fontFamily: F, marginTop: '1px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{acc.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right 60% — Splits table */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
        {/* Right header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #EEF1F5' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#344054', fontFamily: F }}>
            Selected Predefined Split ({selectedTemplate || 'None'})
          </span>
        </div>

        {/* Table headers */}
        <div
          style={{
            display: 'grid', gridTemplateColumns: '1fr 90px 80px 28px',
            padding: '8px 14px', background: '#F9FAFB', borderBottom: '1px solid #EEF1F5', gap: '8px',
          }}
        >
          {['GL Account', 'Amount', 'Percentage', ''].map((h) => (
            <span key={h} style={{ fontSize: '10px', fontWeight: 600, color: '#667085', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Split rows */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {glSplits.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: '12px', color: '#98A2B3', fontFamily: F }}>
              Select GL accounts from the left or choose a template
            </div>
          ) : (
            glSplits.map((split: GLSplit) => (
              <div
                key={split.id}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 90px 80px 28px',
                  padding: '9px 14px', borderBottom: '1px solid #F2F4F7', alignItems: 'center', gap: '8px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#344054', fontFamily: F }}>{split.code}</div>
                  <div style={{ fontSize: '10px', color: '#98A2B3', fontFamily: F, marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{split.name}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ fontSize: '11px', color: '#667085', fontFamily: F }}>$</span>
                  <input
                    type="number" step={0.01}
                    value={split.amount}
                    onChange={(e) => onUpdateSplit(split.id, 'amount', parseFloat(e.target.value) || 0)}
                    style={{ width: '70px', height: '28px', border: '1px solid #D0D5DD', borderRadius: '4px', padding: '0 6px', fontSize: '12px', fontFamily: F, color: '#101828', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => (e.target.style.borderColor = '#1FA97A')}
                    onBlur={(e) => (e.target.style.borderColor = '#D0D5DD')}
                  />
                </div>
                <input
                  type="number" min={0} max={100} step={1}
                  value={split.percentage}
                  onChange={(e) => onUpdateSplit(split.id, 'percentage', parseFloat(e.target.value) || 0)}
                  style={{ width: '68px', height: '28px', border: '1px solid #D0D5DD', borderRadius: '4px', padding: '0 6px', fontSize: '12px', fontFamily: F, color: '#101828', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={(e) => (e.target.style.borderColor = '#1FA97A')}
                  onBlur={(e) => (e.target.style.borderColor = '#D0D5DD')}
                />
                <button
                  onClick={() => onRemoveSplit(split.id)}
                  style={{
                    width: '24px', height: '24px', border: 'none', background: 'transparent',
                    cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#98A2B3',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#F04438'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#98A2B3'; }}
                >
                  <X size={11} strokeWidth={2.5} />
                </button>
              </div>
            ))
          )}

          {/* Remaining balance row */}
          {glSplits.length > 0 && (
            <div
              style={{
                display: 'grid', gridTemplateColumns: '1fr 90px 80px 28px',
                padding: '9px 14px', gap: '8px', alignItems: 'center',
                background: remainingPct < 0.01 ? '#F0FDF9' : '#FFFBEB',
                borderTop: '1.5px solid #E4E7EC',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#344054', fontFamily: F }}>Remaining Balance</span>
              <span style={{ fontSize: '11px', color: '#344054', fontFamily: F, paddingLeft: '16px' }}>
                ${remainingAmt.toFixed(2)}
              </span>
              <span style={{ fontSize: '11px', color: remainingPct < 0.01 ? '#1FA97A' : '#D97706', fontFamily: F, fontWeight: 600 }}>
                {remainingPct < 0.01 ? '100.00%' : `${remainingPct.toFixed(1)}%`}
              </span>
              <span />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Button helpers ── */
function PriBtn({ onClick, children, disabled }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        height: '36px', padding: '0 18px',
        background: disabled ? '#D0D5DD' : '#1FA97A',
        color: '#fff', border: 'none', borderRadius: '5px',
        fontSize: '13px', fontWeight: 600, fontFamily: F,
        cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = '#178F67'; }}
      onMouseLeave={(e) => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = '#1FA97A'; }}
    >
      {children}
    </button>
  );
}

function SecBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: '36px', padding: '0 18px',
        background: '#FFFFFF', color: '#344054',
        border: '1.5px solid #D0D5DD', borderRadius: '5px',
        fontSize: '13px', fontWeight: 600, fontFamily: F,
        cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF')}
    >
      {children}
    </button>
  );
}

const eyeBtnSt: React.CSSProperties = {
  width: '36px', height: '36px', flexShrink: 0,
  border: '1px solid #D0D5DD', borderRadius: '5px',
  background: '#FFFFFF', display: 'flex', alignItems: 'center',
  justifyContent: 'center', cursor: 'pointer',
};

function Req() { return <span style={{ color: '#F04438' }}>*</span>; }
