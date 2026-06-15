import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, Calendar, Plus } from 'lucide-react';
import { GLDistributionModal } from './GLDistributionModal';

import { UI_FONT_STACK as F } from '../tokens/typography';

export interface AddItemData {
  description: string;
  type: string;
  unitOfMeasure: string;
  quantity: number;
  cost: number;
  requiredBy: string;
  vendorTerms: string;
  taxGroup: string;
  vendor: string;
  projectAccount: string;
  glAccounts: Array<{ account: string; name: string; amount: number; percentage: number }>;
}

interface AddItemModalProps {
  onClose: () => void;
  onSave: (data: AddItemData) => void;
}

const TYPES = ['Goods', 'Services', 'Fixed Assets', 'Inventory Item'];
const UNITS = ['Each', 'Box', 'Dozen', 'Kilogram', 'Meter', 'Liter', 'Piece'];
const VENDOR_TERMS = ['Net 30', 'Net 60', 'Net 90', 'Due on Receipt', 'COD'];
const TAX_GROUPS = ['Standard Tax', 'Zero Rated', 'Exempt', 'Out of Scope'];
const VENDORS = ['84 Lumber', 'Dell Technologies', 'Microsoft Corporation', 'Amazon Web Services', 'Adobe Systems'];
const PROJECT_ACCOUNTS = ['Project A - Operations', 'Project B - Marketing', 'Project C - Development', 'General - Admin'];

export function AddItemModal({ onClose, onSave }: AddItemModalProps) {
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Goods');
  const [unitOfMeasure, setUnitOfMeasure] = useState('Each');
  const [quantity, setQuantity] = useState('');
  const [cost, setCost] = useState('');
  const [requiredBy, setRequiredBy] = useState('');
  const [vendorTerms, setVendorTerms] = useState('Net 60');
  const [taxGroup, setTaxGroup] = useState('');
  const [vendor, setVendor] = useState('');
  const [projectAccount, setProjectAccount] = useState('');
  const [glAccounts, setGLAccounts] = useState<Array<{ account: string; name: string; amount: number; percentage: number }>>([]);
  const [showGLModal, setShowGLModal] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSave = () => {
    const itemData: AddItemData = {
      description,
      type,
      unitOfMeasure,
      quantity: parseFloat(quantity) || 1,
      cost: parseFloat(cost) || 0,
      requiredBy,
      vendorTerms,
      taxGroup,
      vendor,
      projectAccount,
      glAccounts,
    };
    onSave(itemData);
  };

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

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(16,24,40,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '20px', backdropFilter: 'blur(2px)',
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          style={{
            width: '640px', maxWidth: '96vw', maxHeight: '90vh',
            background: '#FFFFFF', borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(16,24,40,0.2)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #EEF1F5', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#101828', fontFamily: F }}>
                Add Item
              </h2>
              <button
                onClick={onClose}
                style={{
                  width: '28px', height: '28px', border: '1px solid #E4E7EC', borderRadius: '5px',
                  background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <X size={13} color="#667085" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Description - Full width */}
              <div>
                <label style={lbl}>Description <span style={{ color: '#F04438' }}>*</span></label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description…"
                  onFocus={() => setFocused('desc')}
                  onBlur={() => setFocused(null)}
                  style={inp('desc')}
                />
              </div>

              {/* Type - Full width */}
              <div>
                <label style={lbl}>Type <span style={{ color: '#F04438' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    onFocus={() => setFocused('type')}
                    onBlur={() => setFocused(null)}
                    style={sel('type')}
                  >
                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={12} color="#98A2B3" style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Row: Unit of Measure + Quantity */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={lbl}>Unit of Measure <span style={{ color: '#F04438' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={unitOfMeasure}
                      onChange={(e) => setUnitOfMeasure(e.target.value)}
                      onFocus={() => setFocused('unit')}
                      onBlur={() => setFocused(null)}
                      style={sel('unit')}
                    >
                      {UNITS.map((u) => <option key={u}>{u}</option>)}
                    </select>
                    <ChevronDown size={12} color="#98A2B3" style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                    onFocus={() => setFocused('qty')}
                    onBlur={() => setFocused(null)}
                    style={inp('qty')}
                  />
                </div>
              </div>

              {/* Row: Cost + Required By */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={lbl}>Cost</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '10px', fontSize: '13px', color: '#667085', fontFamily: F, zIndex: 1 }}>Rs.</span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      onFocus={() => setFocused('cost')}
                      onBlur={() => setFocused(null)}
                      style={{ ...inp('cost'), paddingLeft: '35px' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Required By</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="date"
                      value={requiredBy}
                      onChange={(e) => setRequiredBy(e.target.value)}
                      onFocus={() => setFocused('reqBy')}
                      onBlur={() => setFocused(null)}
                      style={{ ...inp('reqBy'), paddingRight: '10px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Row: Vendor Terms + Tax Group */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={lbl}>Vendor Terms</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={vendorTerms}
                      onChange={(e) => setVendorTerms(e.target.value)}
                      onFocus={() => setFocused('vterms')}
                      onBlur={() => setFocused(null)}
                      style={sel('vterms')}
                    >
                      {VENDOR_TERMS.map((v) => <option key={v}>{v}</option>)}
                    </select>
                    <ChevronDown size={12} color="#98A2B3" style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>Tax Group <span style={{ color: '#F04438' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={taxGroup}
                      onChange={(e) => setTaxGroup(e.target.value)}
                      onFocus={() => setFocused('tax')}
                      onBlur={() => setFocused(null)}
                      style={sel('tax')}
                    >
                      <option value="">Select tax group…</option>
                      {TAX_GROUPS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={12} color="#98A2B3" style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
              </div>

              {/* Select Vendor - Full width */}
              <div>
                <label style={lbl}>Select Vendor</label>
                <div style={{ position: 'relative' }}>
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
              </div>

              {/* Project Account - Full width */}
              <div>
                <label style={lbl}>Project Account</label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={projectAccount}
                    onChange={(e) => setProjectAccount(e.target.value)}
                    onFocus={() => setFocused('project')}
                    onBlur={() => setFocused(null)}
                    style={sel('project')}
                  >
                    <option value="">Select project account…</option>
                    {PROJECT_ACCOUNTS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <ChevronDown size={12} color="#98A2B3" style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                </div>
              </div>

              {/* Add Multiple GL Accounts button */}
              <div>
                <button
                  onClick={() => setShowGLModal(true)}
                  style={{
                    height: '36px', padding: '0 16px',
                    background: '#FFFFFF', border: '1.5px solid #D0D5DD',
                    borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                    color: '#344054', fontFamily: F, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#F9FAFB';
                    (e.currentTarget as HTMLElement).style.borderColor = '#1FA97A';
                    (e.currentTarget as HTMLElement).style.color = '#1FA97A';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = '#FFFFFF';
                    (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD';
                    (e.currentTarget as HTMLElement).style.color = '#344054';
                  }}
                >
                  <Plus size={13} strokeWidth={2.5} />
                  Add Multiple GL Account(s)
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '12px 22px', borderTop: '1px solid #EEF1F5',
              display: 'flex', justifyContent: 'flex-end', gap: '10px',
              background: '#FAFAFA', flexShrink: 0,
            }}
          >
            <button
              onClick={handleSave}
              style={{
                height: '36px', padding: '0 18px',
                background: '#1FA97A', color: '#fff', border: 'none',
                borderRadius: '5px', fontSize: '13px', fontWeight: 600,
                fontFamily: F, cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#178F67')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#1FA97A')}
            >
              Save
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* GL Distribution Modal */}
      <AnimatePresence>
        {showGLModal && (
          <GLDistributionModal
            onClose={() => setShowGLModal(false)}
            onApply={(accounts) => {
              setGLAccounts(accounts);
              setShowGLModal(false);
            }}
            totalAmount={parseFloat(cost) || 0}
          />
        )}
      </AnimatePresence>
    </>
  );
}
