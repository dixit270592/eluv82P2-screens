import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, ChevronDown, Search, Trash2, Plus } from 'lucide-react';
import { LineItemData, PRHeaderData } from './PurchaseRequestModal';
import { UI_FONT_STACK as F } from '../tokens/typography';

type ModalStep = 'header' | 'lineItem' | 'glSplit';
const STEP_IDX: Record<ModalStep, number> = { header: 0, lineItem: 1, glSplit: 2 };

const steps = [
  { id: 'header', label: 'Header', hint: 'Requester, vendor, ship-to' },
  { id: 'lineItem', label: 'Line item', hint: 'Qty, cost, category' },
  { id: 'glSplit', label: 'GL split', hint: 'Accounts & allocation' },
] as const;

interface HeaderFormData {
  type: string;
  vendor: string;
  department: string;
  deliveryLocation: string;
  shippingMethod: string;
  neededBy: string;
  requestedBy: string;
  priority: string;
}

interface LineItemFormData {
  itemDescription: string;
  category: string;
  quantity: number;
  unitCost: number;
}

interface GLSplit {
  id: string;
  code: string;
  name: string;
  amount: number;
  percentage: number;
}

const defaultHeader: HeaderFormData = {
  type: 'Standard Purchase Request',
  vendor: 'Dell Technologies',
  department: 'Engineering',
  deliveryLocation: 'HQ — Engineering Floor 3',
  shippingMethod: 'Ground',
  neededBy: '2026-03-15',
  requestedBy: 'John Davidson',
  priority: 'Normal',
};

const PR_TYPES = ['Standard Purchase Request', 'Purchase Order', 'Service Order', 'Capital Expenditure', 'Professional Services'];
const VENDORS = ['Dell Technologies', 'Microsoft Corporation', '84 Lumber', 'Amazon Web Services', 'Adobe Systems', 'Oracle Corporation'];
const DEPARTMENTS = ['Engineering', 'IT', 'Finance', 'HR', 'Marketing', 'Operations', 'R&D'];
const DELIVERY_LOCS = ['HQ — Engineering Floor 3', 'NY Office, Loading Lock 3', 'Chicago Office', 'Warehouse A'];
const SHIPPING = ['Ground', 'Express', 'Overnight', 'Freight', 'Will Call'];
const CATEGORIES = ['Hardware', 'Software', 'Services', 'Office Supplies', 'Travel', 'Maintenance'];
const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'];

const GL_ACCOUNTS = [
  { code: '6100', name: 'Computer Equipment', dept: 'IT' },
  { code: '6110', name: 'Software & Licenses', dept: 'IT' },
  { code: '6200', name: 'Office Supplies', dept: 'Ops' },
  { code: '6210', name: 'Furniture & Fixtures', dept: 'Ops' },
  { code: '6300', name: 'Travel & Entertainment', dept: 'HR' },
  { code: '6400', name: 'Professional Services', dept: 'Finance' },
  { code: '6500', name: 'Marketing & Advertising', dept: 'Mktg' },
  { code: '6600', name: 'Maintenance & Repairs', dept: 'Ops' },
  { code: '6700', name: 'Training & Development', dept: 'HR' },
  { code: '6800', name: 'Utilities', dept: 'Ops' },
];

interface Props {
  initialStep?: ModalStep;
  onClose: () => void;
  onComplete: (data: { header: PRHeaderData; lineItem?: LineItemData }) => void;
}

export function PurchaseRequestModalV1({ initialStep = 'header', onClose, onComplete }: Props) {
  const [step, setStep] = useState<ModalStep>(initialStep);
  const [dir, setDir] = useState(1);
  const [maxReached, setMaxReached] = useState<number>(STEP_IDX[initialStep]);
  const [focused, setFocused] = useState<string | null>(null);

  const [headerForm, setHeaderForm] = useState<HeaderFormData>(defaultHeader);
  const [lineItemForm, setLineItemForm] = useState<LineItemFormData>({ itemDescription: '', category: 'Hardware', quantity: 1, unitCost: 0 });
  const [glSplits, setGlSplits] = useState<GLSplit[]>([]);
  const [glSearch, setGlSearch] = useState('');
  const [glFilter, setGlFilter] = useState('All');
  const [vendorSearch, setVendorSearch] = useState(defaultHeader.vendor);
  const [vendorOpen, setVendorOpen] = useState(false);

  const subtotal = lineItemForm.quantity * lineItemForm.unitCost;
  const totalAllocPct = glSplits.reduce((s, g) => s + g.percentage, 0);
  const isBalanced = Math.abs(totalAllocPct - 100) < 0.01;
  const totalAllocAmt = glSplits.reduce((s, g) => s + g.amount, 0);

  const filteredGL = GL_ACCOUNTS.filter(
    (acc) =>
      (acc.name.toLowerCase().includes(glSearch.toLowerCase()) || acc.code.includes(glSearch)) &&
      (glFilter === 'All' || acc.dept === glFilter)
  );
  const depts = ['All', ...Array.from(new Set(GL_ACCOUNTS.map((a) => a.dept)))];

  const goTo = (next: ModalStep) => {
    setDir(STEP_IDX[next] > STEP_IDX[step] ? 1 : -1);
    setStep(next);
    setMaxReached((prev) => Math.max(prev, STEP_IDX[next]));
  };

  const initGL = () => {
    if (glSplits.length === 0) {
      setGlSplits([{ id: '1', code: '6100', name: 'Computer Equipment', amount: subtotal, percentage: 100 }]);
    }
  };

  const addGL = (acc: (typeof GL_ACCOUNTS)[0]) => {
    if (glSplits.find((s) => s.code === acc.code)) return;
    setGlSplits((prev) => {
      const newPct = Math.floor(100 / (prev.length + 1));
      const updated = prev.map((s) => ({ ...s, percentage: newPct, amount: (newPct / 100) * subtotal }));
      const remainder = 100 - newPct * prev.length;
      return [...updated, { id: Date.now().toString(), code: acc.code, name: acc.name, amount: (remainder / 100) * subtotal, percentage: remainder }];
    });
  };

  const updateSplitPct = (id: string, pct: number) => {
    setGlSplits((prev) => prev.map((s) => s.id === id ? { ...s, percentage: pct, amount: (pct / 100) * subtotal } : s));
  };

  const updateSplitAmt = (id: string, amt: number) => {
    setGlSplits((prev) => prev.map((s) => s.id === id ? { ...s, amount: amt, percentage: subtotal > 0 ? Math.round((amt / subtotal) * 1000) / 10 : 0 } : s));
  };

  const removeGL = (id: string) => setGlSplits((prev) => prev.filter((s) => s.id !== id));

  const handleComplete = () => {
    const header: PRHeaderData = {
      description: headerForm.type,
      type: headerForm.type,
      vendor: headerForm.vendor,
      department: headerForm.department,
      deliveryLocation: headerForm.deliveryLocation,
    };
    const lineItem: LineItemData = {
      id: Date.now().toString(),
      item: lineItemForm.itemDescription || 'New Item',
      vendor: headerForm.vendor,
      quantity: lineItemForm.quantity,
      cost: lineItemForm.unitCost,
      subtotal,
      glAccount: glSplits.length > 0 ? `${glSplits[0].code} - ${glSplits[0].name}` : '6100 - Computer Equipment',
    };
    onComplete({ header, lineItem });
  };

  const inp = (id: string): React.CSSProperties => ({
    width: '100%', height: '38px',
    border: `1.5px solid ${focused === id ? '#1FA97A' : '#D0D5DD'}`,
    borderRadius: '6px', padding: '0 11px',
    fontSize: '13px', color: '#101828', fontFamily: F,
    outline: 'none', background: '#FFFFFF', boxSizing: 'border-box', transition: 'border-color 0.15s',
  });
  const sel = (id: string): React.CSSProperties => ({ ...inp(id), appearance: 'none', paddingRight: '30px', cursor: 'pointer' });
  const lbl: React.CSSProperties = { display: 'block', fontSize: '11px', fontWeight: 600, color: '#344054', fontFamily: F, marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.04em' };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(16,24,40,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }} transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        style={{
          width: '920px', maxWidth: '96vw', maxHeight: '90vh',
          background: '#FFFFFF', borderRadius: '10px',
          boxShadow: '0 16px 48px rgba(16,24,40,0.22)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Gradient header + step indicator */}
        <div style={{ background: 'linear-gradient(135deg, #1FA97A 0%, #0D7A54 100%)', padding: '20px 28px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#FFFFFF', fontFamily: F }}>New Purchase Request</h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.72)', fontFamily: F }}>
                Complete all steps to create your purchase request
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ width: '30px', height: '30px', border: 'none', borderRadius: '6px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <X size={14} color="#FFFFFF" strokeWidth={2.5} />
            </button>
          </div>

          {/* Step rail — compact cards + progress (replaces flat underline tabs) */}
          <div style={{ paddingBottom: 18 }}>
            <div
              role="tablist"
              aria-label="Purchase request steps"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 10,
              }}
            >
              {steps.map((s, i) => {
                const active = s.id === step;
                const done = STEP_IDX[step] > i;
                const locked = i > maxReached;
                const clickable = i <= maxReached && !active;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-current={active ? 'step' : undefined}
                    disabled={!clickable && !active}
                    onClick={() => {
                      if (clickable) {
                        if (s.id === 'glSplit') initGL();
                        goTo(s.id as ModalStep);
                      }
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 6,
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: active
                        ? '1px solid rgba(255,255,255,0.95)'
                        : '1px solid rgba(255,255,255,0.22)',
                      background: active
                        ? 'rgba(255,255,255,0.97)'
                        : done
                          ? 'rgba(255,255,255,0.14)'
                          : 'rgba(255,255,255,0.08)',
                      cursor: clickable ? 'pointer' : active ? 'default' : 'not-allowed',
                      opacity: locked ? 0.45 : 1,
                      textAlign: 'left',
                      transition: 'background 0.2s, border-color 0.2s, transform 0.15s',
                      boxShadow: active ? '0 10px 28px rgba(15,23,42,0.18)' : 'none',
                      transform: active ? 'translateY(-1px)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                      <span
                        aria-hidden
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 800,
                          fontFamily: F,
                          background: active ? '#0D7A54' : done ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)',
                          color: active ? '#FFFFFF' : done ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                          border: `1px solid ${active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.2)'}`,
                        }}
                      >
                        {done && !active ? (
                          <CheckCircle size={14} color="#FFFFFF" strokeWidth={2.5} />
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: active ? 700 : 600,
                          fontFamily: F,
                          color: active ? '#0f172a' : '#FFFFFF',
                          letterSpacing: '-0.01em',
                          lineHeight: 1.25,
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        fontFamily: F,
                        lineHeight: 1.35,
                        color: active ? '#475467' : 'rgba(255,255,255,0.62)',
                        paddingLeft: 34,
                      }}
                    >
                      {s.hint}
                    </span>
                  </button>
                );
              })}
            </div>
            <div
              aria-hidden
              style={{
                marginTop: 12,
                height: 3,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.18)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${((STEP_IDX[step] + 1) / steps.length) * 100}%`,
                  borderRadius: 999,
                  background: 'linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0.85) 100%)',
                  transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative', minHeight: 0 }}>
          <AnimatePresence mode="wait" custom={dir}>
            {step === 'header' && (
              <motion.div
                key="header" custom={dir}
                initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                style={{ padding: '24px 28px' }}
              >
                <HeaderStep form={headerForm} setForm={setHeaderForm} vendorSearch={vendorSearch} setVendorSearch={setVendorSearch} vendorOpen={vendorOpen} setVendorOpen={setVendorOpen} focused={focused} setFocused={setFocused} inp={inp} sel={sel} lbl={lbl} />
              </motion.div>
            )}
            {step === 'lineItem' && (
              <motion.div
                key="lineItem" custom={dir}
                initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                style={{ padding: '24px 28px' }}
              >
                <LineItemStep form={lineItemForm} setForm={setLineItemForm} focused={focused} setFocused={setFocused} inp={inp} sel={sel} lbl={lbl} />
              </motion.div>
            )}
            {step === 'glSplit' && (
              <motion.div
                key="glSplit" custom={dir}
                initial={{ opacity: 0, x: dir * 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                style={{ padding: '24px 28px' }}
              >
                <GLSplitStep
                  glSplits={glSplits} filteredGL={filteredGL} glSearch={glSearch} setGlSearch={setGlSearch}
                  glFilter={glFilter} setGlFilter={setGlFilter} depts={depts} subtotal={subtotal}
                  totalAllocPct={totalAllocPct} totalAllocAmt={totalAllocAmt} isBalanced={isBalanced}
                  onAdd={addGL} onRemove={removeGL} onUpdatePct={updateSplitPct} onUpdateAmt={updateSplitAmt}
                  focused={focused} setFocused={setFocused}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 28px', borderTop: '1px solid #EEF1F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FAFAFA', flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ height: '38px', padding: '0 18px', background: 'transparent', color: '#667085', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, fontFamily: F, cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#F2F4F7')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
          >
            Cancel
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            {step !== 'header' && (
              <button
                onClick={() => goTo(step === 'glSplit' ? 'lineItem' : 'header')}
                style={{ height: '38px', padding: '0 18px', background: '#FFFFFF', color: '#344054', border: '1.5px solid #D0D5DD', borderRadius: '6px', fontSize: '13px', fontWeight: 600, fontFamily: F, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#F9FAFB')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#FFFFFF')}
              >
                Back
              </button>
            )}

            {step !== 'glSplit' && (
              <button
                onClick={() => { if (step === 'header') goTo('lineItem'); else if (step === 'lineItem') { initGL(); goTo('glSplit'); } }}
                style={{ height: '38px', padding: '0 22px', background: '#1FA97A', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, fontFamily: F, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#178F67')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#1FA97A')}
              >
                Continue →
              </button>
            )}

            {step === 'glSplit' && (
              <button
                onClick={handleComplete}
                disabled={glSplits.length === 0}
                style={{ height: '38px', padding: '0 22px', background: glSplits.length === 0 ? '#D0D5DD' : '#1FA97A', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, fontFamily: F, cursor: glSplits.length === 0 ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={(e) => { if (glSplits.length > 0) (e.currentTarget as HTMLElement).style.background = '#178F67'; }}
                onMouseLeave={(e) => { if (glSplits.length > 0) (e.currentTarget as HTMLElement).style.background = '#1FA97A'; }}
              >
                Create Purchase Request
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Step 1: Header ─── */
function HeaderStep({ form, setForm, vendorSearch, setVendorSearch, vendorOpen, setVendorOpen, focused, setFocused, inp, sel, lbl }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
      <div>
        <label style={lbl}>Type <span style={{ color: '#F04438' }}>*</span></label>
        <div style={{ position: 'relative' }}>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} onFocus={() => setFocused('type')} onBlur={() => setFocused(null)} style={sel('type')}>
            {PR_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <ChevronDown size={13} color="#98A2B3" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <label style={lbl}>Vendor <span style={{ color: '#F04438' }}>*</span></label>
        <div style={{ position: 'relative' }}>
          <input
            value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)}
            onFocus={() => { setFocused('vendor'); setVendorOpen(true); }} onBlur={() => { setTimeout(() => { setVendorOpen(false); setFocused(null); }, 150); }}
            style={inp('vendor')} placeholder="Search vendor…"
          />
          <Search size={13} color="#98A2B3" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
        {vendorOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#FFFFFF', border: '1px solid #E4E7EC', borderRadius: '6px', boxShadow: '0 4px 16px rgba(16, 24, 40, 0.1)', zIndex: 50, overflow: 'hidden', maxHeight: '180px', overflowY: 'auto' }}>
            {VENDORS.filter((v) => v.toLowerCase().includes(vendorSearch.toLowerCase())).map((v) => (
              <div key={v} onMouseDown={() => { setForm({ ...form, vendor: v }); setVendorSearch(v); setVendorOpen(false); }}
                style={{ padding: '9px 12px', cursor: 'pointer', fontSize: '13px', color: '#101828', fontFamily: F, background: form.vendor === v ? '#F0FDF9' : 'transparent', transition: 'background 0.1s' }}
                onMouseEnter={(e) => { if (form.vendor !== v) (e.currentTarget as HTMLElement).style.background = '#F5F7FA'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = form.vendor === v ? '#F0FDF9' : 'transparent'; }}
              >
                {v}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label style={lbl}>Department <span style={{ color: '#F04438' }}>*</span></label>
        <div style={{ position: 'relative' }}>
          <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} onFocus={() => setFocused('dept')} onBlur={() => setFocused(null)} style={sel('dept')}>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <ChevronDown size={13} color="#98A2B3" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>

      <div>
        <label style={lbl}>Delivery Location</label>
        <div style={{ position: 'relative' }}>
          <select value={form.deliveryLocation} onChange={(e) => setForm({ ...form, deliveryLocation: e.target.value })} onFocus={() => setFocused('dloc')} onBlur={() => setFocused(null)} style={sel('dloc')}>
            {DELIVERY_LOCS.map((l) => <option key={l}>{l}</option>)}
          </select>
          <ChevronDown size={13} color="#98A2B3" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>

      <div>
        <label style={lbl}>Shipping Method</label>
        <div style={{ position: 'relative' }}>
          <select value={form.shippingMethod} onChange={(e) => setForm({ ...form, shippingMethod: e.target.value })} onFocus={() => setFocused('ship')} onBlur={() => setFocused(null)} style={sel('ship')}>
            {SHIPPING.map((s) => <option key={s}>{s}</option>)}
          </select>
          <ChevronDown size={13} color="#98A2B3" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>

      <div>
        <label style={lbl}>Needed By <span style={{ color: '#F04438' }}>*</span></label>
        <input type="date" value={form.neededBy} onChange={(e) => setForm({ ...form, neededBy: e.target.value })} onFocus={() => setFocused('nby')} onBlur={() => setFocused(null)} style={inp('nby')} />
      </div>

      <div>
        <label style={lbl}>Requested By</label>
        <input value={form.requestedBy} onChange={(e) => setForm({ ...form, requestedBy: e.target.value })} onFocus={() => setFocused('reqby')} onBlur={() => setFocused(null)} style={inp('reqby')} />
      </div>

      <div>
        <label style={lbl}>Priority</label>
        <div style={{ position: 'relative' }}>
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} onFocus={() => setFocused('prio')} onBlur={() => setFocused(null)} style={sel('prio')}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
          <ChevronDown size={13} color="#98A2B3" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2: Line Item ─── */
function LineItemStep({ form, setForm, focused, setFocused, inp, sel, lbl }: any) {
  const subtotal = form.quantity * form.unitCost;
  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '14px 18px', background: '#F0FDF9', border: '1px solid #BBF7E0', borderRadius: '8px', fontSize: '13px', color: '#344054', fontFamily: F }}>
        Defaults set here will auto-populate for additional line items. Fill in item details below.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={lbl}>Item Description <span style={{ color: '#F04438' }}>*</span></label>
          <input value={form.itemDescription} onChange={(e) => setForm({ ...form, itemDescription: e.target.value })} onFocus={() => setFocused('idesc')} onBlur={() => setFocused(null)} placeholder="Enter a clear description of the item…" style={inp('idesc')} />
        </div>

        <div>
          <label style={lbl}>Category</label>
          <div style={{ position: 'relative' }}>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} onFocus={() => setFocused('cat')} onBlur={() => setFocused(null)} style={sel('cat')}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <ChevronDown size={13} color="#98A2B3" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        <div />

        <div>
          <label style={lbl}>Quantity <span style={{ color: '#F04438' }}>*</span></label>
          <input type="number" min={1} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })} onFocus={() => setFocused('qty')} onBlur={() => setFocused(null)} style={inp('qty')} />
        </div>

        <div>
          <label style={lbl}>Unit Cost <span style={{ color: '#F04438' }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#667085', fontFamily: F }}>$</span>
            <input type="number" min={0} step={0.01} value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: parseFloat(e.target.value) || 0 })} onFocus={() => setFocused('ucost')} onBlur={() => setFocused(null)} style={{ ...inp('ucost'), paddingLeft: '22px' }} />
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: '#F9FAFB', border: '1px solid #E4E7EC', borderRadius: '8px', padding: '12px 20px', display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qty × Unit</span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#344054', fontFamily: F, marginTop: '2px' }}>{form.quantity} × ${form.unitCost.toFixed(2)}</div>
            </div>
            <div style={{ width: '1px', height: '32px', background: '#E4E7EC' }} />
            <div>
              <span style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subtotal</span>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1FA97A', fontFamily: F, marginTop: '2px' }}>${subtotal.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3: GL Split ─── */
function GLSplitStep({ glSplits, filteredGL, glSearch, setGlSearch, glFilter, setGlFilter, depts, subtotal, totalAllocPct, totalAllocAmt, isBalanced, onAdd, onRemove, onUpdatePct, onUpdateAmt, focused, setFocused }: any) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Left 40% */}
        <div style={{ width: '40%', flexShrink: 0 }}>
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', height: '36px', padding: '0 10px', border: `1.5px solid ${focused === 'glsearch' ? '#1FA97A' : '#D0D5DD'}`, borderRadius: '6px', background: '#FFFFFF', transition: 'border-color 0.15s', marginBottom: '8px' }}>
              <Search size={13} color="#98A2B3" strokeWidth={2} />
              <input value={glSearch} onChange={(e) => setGlSearch(e.target.value)} placeholder="Search GL accounts…" onFocus={() => setFocused('glsearch')} onBlur={() => setFocused(null)} style={{ border: 'none', outline: 'none', fontSize: '13px', color: '#101828', fontFamily: F, background: 'transparent', flex: 1 }} />
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {depts.map((d: string) => (
                <button key={d} onClick={() => setGlFilter(d)} style={{ padding: '4px 10px', borderRadius: '100px', border: `1px solid ${glFilter === d ? '#1FA97A' : '#E4E7EC'}`, background: glFilter === d ? '#E6F7F1' : '#FFFFFF', fontSize: '11px', fontWeight: 600, color: glFilter === d ? '#1FA97A' : '#667085', fontFamily: F, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div style={{ border: '1px solid #E4E7EC', borderRadius: '8px', overflow: 'hidden', maxHeight: '280px', overflowY: 'auto' }}>
            {filteredGL.map((acc: any) => {
              const added = glSplits.some((s: GLSplit) => s.code === acc.code);
              return (
                <div key={acc.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid #F2F4F7', background: added ? '#F0FDF9' : 'transparent', transition: 'background 0.12s' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#344054', fontFamily: F }}>{acc.code}</div>
                    <div style={{ fontSize: '11px', color: '#667085', fontFamily: F, marginTop: '1px' }}>{acc.name}</div>
                  </div>
                  <button
                    onClick={() => onAdd(acc)}
                    disabled={added}
                    style={{ width: '26px', height: '26px', border: `1px solid ${added ? '#BBF7E0' : '#D0D5DD'}`, borderRadius: '5px', background: added ? '#E6F7F1' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: added ? 'default' : 'pointer' }}
                  >
                    {added ? <CheckCircle size={12} color="#1FA97A" strokeWidth={2.5} /> : <Plus size={12} color="#667085" strokeWidth={2.5} />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 60% */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#101828', fontFamily: F }}>GL Allocation</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#667085', fontFamily: F }}>Allocated:</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: isBalanced ? '#1FA97A' : '#F59E0B', fontFamily: F }}>{totalAllocPct.toFixed(1)}%</span>
            </div>
          </div>

          {glSplits.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', border: '2px dashed #E4E7EC', borderRadius: '8px' }}>
              <span style={{ fontSize: '13px', color: '#98A2B3', fontFamily: F }}>Add GL accounts from the left panel</span>
            </div>
          ) : (
            <div style={{ border: '1px solid #E4E7EC', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 32px', padding: '9px 12px', background: '#F9FAFB', borderBottom: '1px solid #E4E7EC', gap: '8px' }}>
                {['GL Account', 'Amount ($)', 'Percent (%)', ''].map((h) => (
                  <span key={h} style={{ fontSize: '10px', fontWeight: 600, color: '#667085', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
                ))}
              </div>
              {glSplits.map((split: GLSplit) => (
                <div key={split.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 32px', padding: '10px 12px', borderBottom: '1px solid #F2F4F7', alignItems: 'center', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#344054', fontFamily: F }}>{split.code}</div>
                    <div style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F, marginTop: '1px' }}>{split.name}</div>
                  </div>
                  <input type="number" step={0.01} value={split.amount.toFixed(2)} onChange={(e) => onUpdateAmt(split.id, parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', height: '30px', border: '1px solid #D0D5DD', borderRadius: '4px', padding: '0 7px', fontSize: '12px', fontFamily: F, color: '#101828', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => (e.target.style.borderColor = '#1FA97A')} onBlur={(e) => (e.target.style.borderColor = '#D0D5DD')}
                  />
                  <input type="number" step={0.1} min={0} max={100} value={split.percentage} onChange={(e) => onUpdatePct(split.id, parseFloat(e.target.value) || 0)}
                    style={{ width: '100%', height: '30px', border: '1px solid #D0D5DD', borderRadius: '4px', padding: '0 7px', fontSize: '12px', fontFamily: F, color: '#101828', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => (e.target.style.borderColor = '#1FA97A')} onBlur={(e) => (e.target.style.borderColor = '#D0D5DD')}
                  />
                  <button onClick={() => onRemove(split.id)} style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#98A2B3' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#F04438'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#98A2B3'; }}
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
              ))}

              {/* Remaining */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 32px', padding: '10px 12px', gap: '8px', background: isBalanced ? '#F0FDF9' : '#FFFBEB', borderTop: '1.5px solid #E4E7EC', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#344054', fontFamily: F }}>Remaining</span>
                <span style={{ fontSize: '12px', color: isBalanced ? '#1FA97A' : '#D97706', fontFamily: F, fontWeight: 600 }}>${Math.max(0, subtotal - totalAllocAmt).toFixed(2)}</span>
                <span style={{ fontSize: '12px', color: isBalanced ? '#1FA97A' : '#D97706', fontFamily: F, fontWeight: 600 }}>{Math.max(0, 100 - totalAllocPct).toFixed(1)}%</span>
                {isBalanced && <CheckCircle size={14} color="#1FA97A" strokeWidth={2.5} />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
