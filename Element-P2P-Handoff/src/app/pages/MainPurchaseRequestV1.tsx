import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Save, Send, CheckCircle2, AlertCircle, Package, Calendar, Building2, MapPin, User, Tag, ArrowLeft } from 'lucide-react';
import { SidebarV1 } from '../components/SidebarV1';
import { TopHeaderV1 } from '../components/TopHeaderV1';
import { RightPanel } from '../components/RightPanel';
import { PurchaseRequestModalV1 } from '../components/PurchaseRequestModalV1';
import { LineItemData, PRHeaderData } from '../components/PurchaseRequestModal';
import { UI_FONT_STACK as F } from '../tokens/typography';
const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const initialLineItems: LineItemData[] = [
  { id: '1', item: 'Dell Latitude 5540 Laptop (16GB, 512GB SSD)', vendor: 'Dell Technologies', quantity: 5, cost: 1299.0, subtotal: 6495.0, glAccount: '6100 - Computer Equipment' },
  { id: '2', item: 'Samsung 27" 4K Monitor (U28R55)', vendor: 'Samsung Electronics', quantity: 8, cost: 349.99, subtotal: 2799.92, glAccount: '6100 - Computer Equipment' },
  { id: '3', item: 'Logitech MX Master 3 Mouse', vendor: 'Logitech', quantity: 12, cost: 99.99, subtotal: 1199.88, glAccount: '6100 - Computer Equipment' },
];

type PRStatus = 'draft' | 'submitted' | 'approved';

export function MainPurchaseRequestV1() {
  const navigate = useNavigate();
  const { prId = 'PR-2026-0189' } = useParams();
  const location = useLocation();

  const stateItems: LineItemData[] = location.state?.lineItems || initialLineItems;

  const [lineItems, setLineItems] = useState<LineItemData[]>(stateItems);
  const [prStatus, setPrStatus] = useState<PRStatus>('draft');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const subtotalAll = lineItems.reduce((s, i) => s + i.subtotal, 0);
  const tax = subtotalAll * 0.085;
  const totalAll = subtotalAll + tax;

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleModalComplete = (data: { header: PRHeaderData; lineItem?: LineItemData }) => {
    if (data.lineItem) {
      setLineItems((prev) => [...prev, data.lineItem!]);
      showToast('Line item added successfully');
    }
    setModalOpen(false);
  };

  const startEdit = (rowId: string, field: string, val: string | number) => {
    setEditingCell({ rowId, field });
    setEditValue(String(val));
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const { rowId, field } = editingCell;
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== rowId) return item;
        const u = { ...item };
        if (field === 'item') u.item = editValue;
        else if (field === 'vendor') u.vendor = editValue;
        else if (field === 'quantity') { u.quantity = parseFloat(editValue) || item.quantity; u.subtotal = u.quantity * u.cost; }
        else if (field === 'cost') { u.cost = parseFloat(editValue) || item.cost; u.subtotal = u.quantity * u.cost; }
        return u;
      })
    );
    setEditingCell(null);
  };

  const isEditing = (rowId: string, field: string) => editingCell?.rowId === rowId && editingCell?.field === field;

  const CellInput = ({ rowId, field }: { rowId: string; field: string }) => (
    <input
      autoFocus value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onBlur={commitEdit}
      onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingCell(null); }}
      style={{ width: '100%', height: '30px', border: '1.5px solid #1FA97A', borderRadius: '4px', padding: '0 8px', fontSize: '13px', fontFamily: F, color: '#101828', outline: 'none', background: '#F0FDF9' }}
    />
  );

  const prMeta = [
    { icon: Tag, label: 'Type', value: 'Purchase Order' },
    { icon: Building2, label: 'Department', value: 'Engineering' },
    { icon: User, label: 'Requested By', value: 'John Davidson' },
    { icon: Package, label: 'Vendor', value: 'Dell Technologies (Primary)' },
    { icon: MapPin, label: 'Delivery Location', value: 'HQ — Engineering Floor 3' },
    { icon: Calendar, label: 'Required Date', value: 'Mar 15, 2026' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: F, background: '#F5F7FA', overflow: 'hidden' }}>
      <SidebarV1 />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopHeaderV1 onNewRequest={() => setModalOpen(true)} prStatus={prStatus} prId={prId} />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', minWidth: 0 }}>
            {/* Toast */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: -14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.97 }} transition={{ duration: 0.22 }}
                  style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 300, display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 20px', background: '#FFFFFF', border: `1px solid ${toast.type === 'success' ? '#BBF7E0' : toast.type === 'error' ? '#FEE4E2' : '#E4E7EC'}`, borderRadius: '8px', boxShadow: '0 4px 20px rgba(16,24,40,0.1)', minWidth: '280px' }}
                >
                  {toast.type === 'success' && <CheckCircle2 size={15} color="#1FA97A" />}
                  {toast.type === 'error' && <AlertCircle size={15} color="#F04438" />}
                  {toast.type === 'info' && <AlertCircle size={15} color="#667085" />}
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#101828', fontFamily: F }}>{toast.msg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submitted Banner */}
            <AnimatePresence>
              {prStatus === 'submitted' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: '16px', padding: '14px 18px', background: '#F0FDF9', border: '1px solid #BBF7E0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CheckCircle2 size={17} color="#1FA97A" />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#101828', fontFamily: F }}>Submitted for Approval</div>
                    <div style={{ fontSize: '12px', color: '#667085', fontFamily: F, marginTop: '2px' }}>{prId} has been sent to Sarah Chen (Dept. Manager) for review.</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Back link */}
            <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#667085', fontFamily: F, background: 'none', border: 'none', cursor: 'pointer', marginBottom: '16px', padding: '0', transition: 'color 0.15s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#1FA97A')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#667085')}
            >
              <ArrowLeft size={14} strokeWidth={2} />
              Back to Purchase Requests
            </button>

            {/* Title + Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '16px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#101828', fontFamily: F }}>Purchase Request</h1>
                <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#667085', fontFamily: F }}>{prId} · Created Feb 26, 2026 · Engineering Department</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                <button onClick={() => showToast('Changes discarded', 'info')} disabled={prStatus === 'submitted'} style={{ height: '40px', padding: '0 16px', background: 'transparent', color: '#667085', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, fontFamily: F, cursor: prStatus === 'submitted' ? 'not-allowed' : 'pointer', opacity: prStatus === 'submitted' ? 0.45 : 1, transition: 'background 0.15s' }}
                  onMouseEnter={(e) => { if (prStatus !== 'submitted') (e.currentTarget as HTMLElement).style.background = '#F2F4F7'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >Cancel</button>

                <button onClick={() => showToast('Saved as draft', 'success')} disabled={prStatus === 'submitted'} style={{ height: '40px', padding: '0 16px', background: '#FFFFFF', color: '#344054', border: '1.5px solid #D0D5DD', borderRadius: '6px', fontSize: '13px', fontWeight: 600, fontFamily: F, cursor: prStatus === 'submitted' ? 'not-allowed' : 'pointer', opacity: prStatus === 'submitted' ? 0.45 : 1, display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => { if (prStatus !== 'submitted') (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; }}
                ><Save size={14} strokeWidth={2} /> Save Draft</button>

                <button
                  onClick={() => { if (lineItems.length === 0) { showToast('Add at least one line item', 'error'); return; } setPrStatus('submitted'); showToast('Submitted for approval!', 'success'); }}
                  disabled={prStatus === 'submitted'}
                  style={{ height: '40px', padding: '0 20px', background: prStatus === 'submitted' ? '#98A2B3' : '#1FA97A', color: '#FFFFFF', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, fontFamily: F, cursor: prStatus === 'submitted' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '7px', transition: 'background 0.15s', boxShadow: prStatus !== 'submitted' ? '0 1px 4px rgba(31,169,122,0.3)' : 'none' }}
                  onMouseEnter={(e) => { if (prStatus !== 'submitted') (e.currentTarget as HTMLElement).style.background = '#178F67'; }}
                  onMouseLeave={(e) => { if (prStatus !== 'submitted') (e.currentTarget as HTMLElement).style.background = '#1FA97A'; }}
                ><Send size={14} strokeWidth={2} /> Submit for Approval</button>
              </div>
            </div>

            {/* Request Details */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E4E7EC', borderRadius: '10px', boxShadow: '0 1px 4px rgba(16,24,40,0.04)', padding: '20px 24px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#101828', fontFamily: F }}>Request Details</span>
                <button style={{ fontSize: '12px', color: '#1FA97A', fontFamily: F, fontWeight: 600, border: '1px solid #BBF7E0', cursor: 'pointer', padding: '4px 10px', borderRadius: '5px', background: '#F0FDF9' }} onClick={() => setModalOpen(true)}>Edit</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px' }}>
                {prMeta.map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '7px', background: '#F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={15} color="#667085" strokeWidth={1.8} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>{label}</div>
                      <div style={{ fontSize: '13px', color: '#101828', fontFamily: F, fontWeight: 500 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Line Items */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E4E7EC', borderRadius: '10px', boxShadow: '0 1px 4px rgba(16,24,40,0.04)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #EEF1F5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#101828', fontFamily: F }}>Line Items</span>
                  <span style={{ padding: '2px 9px', background: '#F2F4F7', borderRadius: '100px', fontSize: '12px', fontWeight: 600, color: '#667085', fontFamily: F }}>{lineItems.length} item{lineItems.length !== 1 ? 's' : ''}</span>
                </div>
                <button
                  onClick={() => setModalOpen(true)} disabled={prStatus === 'submitted'}
                  style={{ height: '34px', padding: '0 14px', background: '#FFFFFF', color: '#344054', border: '1.5px solid #D0D5DD', borderRadius: '6px', fontSize: '13px', fontWeight: 600, fontFamily: F, cursor: prStatus === 'submitted' ? 'not-allowed' : 'pointer', opacity: prStatus === 'submitted' ? 0.45 : 1, display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => { if (prStatus !== 'submitted') { (e.currentTarget as HTMLElement).style.background = '#F0FDF9'; (e.currentTarget as HTMLElement).style.borderColor = '#1FA97A'; (e.currentTarget as HTMLElement).style.color = '#1FA97A'; } }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD'; (e.currentTarget as HTMLElement).style.color = '#344054'; }}
                >
                  <Plus size={14} strokeWidth={2.5} /> Add Line
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
                      {[{ label: '#', w: '40px' }, { label: 'Item Description', w: 'auto' }, { label: 'Vendor', w: '150px' }, { label: 'GL Account', w: '170px' }, { label: 'Qty', w: '60px' }, { label: 'Unit Cost', w: '100px' }, { label: 'Subtotal', w: '110px' }, { label: '', w: '36px' }].map(({ label, w }) => (
                        <th key={label} style={{ padding: '10px 14px', textAlign: 'left', width: w, fontSize: '10px', fontWeight: 600, color: '#667085', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {lineItems.map((item, idx) => (
                        <motion.tr key={item.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}
                          style={{ borderBottom: '1px solid #F2F4F7', background: hoveredRow === item.id ? '#F9FAFB' : '#FFFFFF', transition: 'background 0.1s' }}
                          onMouseEnter={() => setHoveredRow(item.id)} onMouseLeave={() => setHoveredRow(null)}
                        >
                          <td style={{ padding: '12px 14px' }}><span style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F, fontWeight: 600 }}>{idx + 1}</span></td>
                          <td style={{ padding: '12px 14px' }}>
                            {isEditing(item.id, 'item') ? <CellInput rowId={item.id} field="item" /> : (
                              <div onClick={() => prStatus !== 'submitted' && startEdit(item.id, 'item', item.item)} style={{ fontSize: '13px', color: '#101828', fontFamily: F, fontWeight: 500, cursor: prStatus === 'submitted' ? 'default' : 'text', lineHeight: 1.4 }}>{item.item}</div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {isEditing(item.id, 'vendor') ? <CellInput rowId={item.id} field="vendor" /> : (
                              <div onClick={() => prStatus !== 'submitted' && startEdit(item.id, 'vendor', item.vendor)} style={{ fontSize: '12px', color: '#667085', fontFamily: F, cursor: prStatus === 'submitted' ? 'default' : 'text' }}>{item.vendor}</div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ padding: '3px 8px', background: '#EEF1F5', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: '#344054', fontFamily: F, whiteSpace: 'nowrap' }}>{item.glAccount}</span>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            {isEditing(item.id, 'quantity') ? <CellInput rowId={item.id} field="quantity" /> : (
                              <div onClick={() => prStatus !== 'submitted' && startEdit(item.id, 'quantity', item.quantity)} style={{ fontSize: '13px', fontWeight: 600, color: '#101828', fontFamily: F, cursor: prStatus === 'submitted' ? 'default' : 'text', textAlign: 'center' }}>{item.quantity}</div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {isEditing(item.id, 'cost') ? <CellInput rowId={item.id} field="cost" /> : (
                              <div onClick={() => prStatus !== 'submitted' && startEdit(item.id, 'cost', item.cost)} style={{ fontSize: '13px', color: '#101828', fontFamily: F, cursor: prStatus === 'submitted' ? 'default' : 'text' }}>{fmt(item.cost)}</div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#101828', fontFamily: F }}>{fmt(item.subtotal)}</span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {prStatus !== 'submitted' && (
                              <button onClick={() => { setLineItems((prev) => prev.filter((i) => i.id !== item.id)); showToast('Line item removed', 'info'); }}
                                style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hoveredRow === item.id ? 1 : 0, transition: 'opacity 0.15s, background 0.15s', color: '#98A2B3' }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#F04438'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#98A2B3'; }}
                              ><Trash2 size={13} strokeWidth={2} /></button>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    {lineItems.length === 0 && (
                      <tr><td colSpan={8}>
                        <div style={{ padding: '52px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '48px', height: '48px', background: '#F2F4F7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={20} color="#98A2B3" /></div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#344054', fontFamily: F }}>No line items yet</div>
                            <div style={{ fontSize: '13px', color: '#98A2B3', fontFamily: F, marginTop: '4px' }}>Click "+ Add Line" to add items</div>
                          </div>
                          <button onClick={() => setModalOpen(true)} style={{ marginTop: '4px', height: '36px', padding: '0 20px', background: '#1FA97A', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, fontFamily: F, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Plus size={14} strokeWidth={2.5} /> Add First Item
                          </button>
                        </div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {lineItems.length > 0 && (
                <div style={{ borderTop: '2px solid #E4E7EC', background: '#FAFAFA' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: '14px 20px', gap: '7px' }}>
                    <TRow label="Subtotal" value={fmt(subtotalAll)} />
                    <TRow label="Est. Tax (8.5%)" value={fmt(tax)} muted />
                    <div style={{ width: '300px', height: '1px', background: '#E4E7EC', margin: '2px 0' }} />
                    <TRow label="Total" value={fmt(totalAll)} bold />
                    {totalAll >= 10000 && prStatus === 'draft' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', padding: '6px 10px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px' }}>
                        <AlertCircle size={12} color="#D97706" />
                        <span style={{ fontSize: '11px', color: '#92400E', fontFamily: F, fontWeight: 500 }}>Exceeds $10K — CFO approval required</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>

          <RightPanel lineItems={lineItems} prStatus={prStatus} />
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <PurchaseRequestModalV1
            initialStep="lineItem"
            onClose={() => setModalOpen(false)}
            onComplete={handleModalComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TRow({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px', alignItems: 'center' }}>
      <span style={{ fontSize: '12px', color: muted ? '#98A2B3' : '#667085', fontFamily: F }}>{label}</span>
      <span style={{ fontSize: bold ? '15px' : '13px', fontWeight: bold ? 700 : 500, color: bold ? '#101828' : muted ? '#98A2B3' : '#344054', fontFamily: F }}>{value}</span>
    </div>
  );
}
