import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Save, Send, X, Search, Settings, ChevronDown, Plus, Trash2, ArrowLeft,
  CheckCircle2, AlertCircle, MoreHorizontal, RefreshCw, Calendar, Clock, RotateCcw, Edit3, DollarSign, ExternalLink,
  FilePlus, FileText,
} from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { PurchaseRequestModal, LineItemData, PRHeaderData } from '../components/PurchaseRequestModal';
import { AddItemModal, AddItemData } from '../components/AddItemModal';
import { SendForApprovalModal } from '../components/SendForApprovalModal';
import { GLDistributionModal } from '../components/GLDistributionModal';
import { PurchaseRequestHistoryPanel, type HistoryActivityItem, type HistoryStatus } from '../components/PurchaseRequestHistoryPanel';
import { SkipToMainContent } from '../components/SkipToMainContent';
import { PRWorkflowHeader, WorkflowActionButton } from '../components/pr-workflow';
import type { PRStatus as WorkflowPRStatus, ViewRole } from '../types/prWorkflow';
import { UI_FONT_STACK as F } from '../tokens/typography';
import { printTransaction } from '../utils/printTransaction';
import { isStarred as checkStarred, toggleStarred } from '../utils/starredTransactions';
const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const DEFAULT_HEADER: PRHeaderData = {
  description: 'Standard Purchase Request',
  type: 'Standard Purchase Request',
  vendor: '84 Lumber',
  department: 'Accounting & Finance',
  deliveryLocation: 'NY Office, Loading Lock 3',
};

interface ExtendedLineItem extends LineItemData {
  type?: string;
  unitOfMeasure?: string;
  taxGroup?: string;
  glAccountsCount?: number;
}

interface RFQRecord {
  id: string;
  status: 'draft' | 'sent' | 'closed';
  vendors: number;
  lineItems: number;
  amount: number;
  createdAt: string;
}

const DEFAULT_LINE_ITEMS: ExtendedLineItem[] = [
  { id: '1', item: '84 Lumber', vendor: '84 Lumber', quantity: 1, cost: 100.0, subtotal: 100.0, glAccount: '6100 - Computer Equipment', type: 'Goods', unitOfMeasure: 'Each', taxGroup: 'Standard', glAccountsCount: 1 },
  { id: '2', item: 'Ted 3', vendor: '84 Lumber', quantity: 2, cost: 200.0, subtotal: 400.0, glAccount: '6200 - Software & Licenses', type: 'Goods', unitOfMeasure: 'Each', taxGroup: 'Standard', glAccountsCount: 1 },
  { id: '3', item: 'Ted 3', vendor: '84 Lumber', quantity: 2, cost: 200.0, subtotal: 400.0, glAccount: '6200 - Software & Licenses', type: 'Goods', unitOfMeasure: 'Each', taxGroup: 'Standard', glAccountsCount: 1 },
];

type PRStatus = 'unsubmitted' | 'recalled' | 'awaiting_approval' | 'submitted' | 'approved' | 'rejected';

const toWorkflowStatus = (status: PRStatus): WorkflowPRStatus => status as WorkflowPRStatus;

const TABS = ['Items', 'RFQ', 'Purchase Order', 'Receipt'];

export function MainPurchaseRequestV2() {
  const navigate = useNavigate();
  const { prId = 'PR-26016-774' } = useParams();
  const location = useLocation();

  const stateHeader: PRHeaderData = location.state?.prHeader || DEFAULT_HEADER;
  const stateItems: ExtendedLineItem[] = location.state?.lineItems || [];

  // Load from localStorage
  const getStorageKey = (id: string) => `pr-data-${id}`;
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem(getStorageKey(prId));
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          lineItems: parsed.lineItems || [],
          prHeader: parsed.prHeader || DEFAULT_HEADER,
          headerFieldData: parsed.headerFieldData || null,
          rfqRecords: parsed.rfqRecords || [],
        };
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return null;
  };

  const savedData = loadFromStorage();
  const cameFromCreation = Boolean(location.state?.prHeader);

  const getInitialLineItems = (): ExtendedLineItem[] => {
    if (savedData !== null) return savedData.lineItems;
    if (stateItems.length > 0) return stateItems;
    if (cameFromCreation) return stateItems;
    return DEFAULT_LINE_ITEMS;
  };

  const [lineItems, setLineItems] = useState<ExtendedLineItem[]>(getInitialLineItems);
  const [rfqRecords, setRfqRecords] = useState<RFQRecord[]>(savedData?.rfqRecords || []);
  const [prHeader, setPrHeader] = useState<PRHeaderData>(savedData?.prHeader || stateHeader);
  const [headerFieldData, setHeaderFieldData] = useState(savedData?.headerFieldData || {
    department: stateHeader.department,
    deliveryLocation: 'Sample Address',
    shippingMethod: 'Fed Ex',
    description: 'Testing the filter profile',
    vendor: 'Shivam Vyas',
    requiredBy: 'March-13-2026',
  });
  const [status, setStatus] = useState<PRStatus>('unsubmitted');
  const [viewRole, setViewRole] = useState<ViewRole>('requester');
  const [poCreated, setPoCreated] = useState(false);
  const [activeTab, setActiveTab] = useState('Items');
  const [modalOpen, setModalOpen] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [sendApprovalModalOpen, setSendApprovalModalOpen] = useState(false);
  const [glDistributionRow, setGLDistributionRow] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ type: 'cancel' | 'recall' | null; show: boolean }>({ type: null, show: false });
  const [headerEditMode, setHeaderEditMode] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);
  const [editingHeaderField, setEditingHeaderField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [budgetPopupRow, setBudgetPopupRow] = useState<string | null>(null);
  const [budgetReportRow, setBudgetReportRow] = useState<string | null>(null);
  const [isStarred, setIsStarred] = useState(() => checkStarred(prId));
  const [activityFeed, setActivityFeed] = useState<HistoryActivityItem[]>([
    {
      id: 'seed-1',
      initials: 'SL',
      bg: '#E8956D',
      name: 'Simon L.',
      actionLabel: 'Purchase line updated',
      detail: 'Centre Pleagettron Purchase',
      time: '9:19 PM',
      category: 'data_entry',
      status: 'neutral',
    },
    {
      id: 'seed-2',
      initials: 'JS',
      bg: '#1A7A6E',
      name: 'John Sample',
      actionLabel: 'Required date set',
      detail: 'Recoution Date: Purchase',
      time: '8:39 PM',
      category: 'revisions',
      status: 'success',
    },
    {
      id: 'seed-3',
      initials: 'RB',
      bg: '#7B5EA7',
      name: 'Jonte Sample',
      actionLabel: 'Request created',
      detail: 'Ref: 1079, 2025',
      time: '8:39 PM',
      category: 'data_entry',
      status: 'neutral',
    },
  ]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      const dataToSave = {
        lineItems,
        prHeader,
        headerFieldData,
        rfqRecords,
      };
      localStorage.setItem(getStorageKey(prId), JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [lineItems, prHeader, headerFieldData, rfqRecords, prId]);

  useEffect(() => {
    setIsStarred(checkStarred(prId));
  }, [prId]);

  const subtotalAll = lineItems.reduce((s, i) => s + i.subtotal, 0);
  const budgetTotal = 11000;
  const budgetReferenceTotal = budgetTotal * 0.384;
  const budgetPct = Math.min((subtotalAll / budgetTotal) * 100, 100);
  const daysRemaining = 45;
  const nextApprover = { name: 'David Connor', initials: 'DC' };
  const nextAction = {
    type: 'single' as const,
    name: nextApprover.name,
    initials: nextApprover.initials,
    avatarBg: '#1A7A6E',
  };
  const tabCounts: Record<string, number> = {
    Items: lineItems.length,
    RFQ: rfqRecords.length,
    'Purchase Order': poCreated ? 1 : 0,
    Receipt: 0,
  };

  const statusLabels: Record<PRStatus, string> = {
    unsubmitted: 'Draft',
    recalled: 'Recalled',
    awaiting_approval: 'Awaiting Approval',
    submitted: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  const appendHistoryActivity = (item: Omit<HistoryActivityItem, 'id' | 'time'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    setActivityFeed((prev) => [{ ...item, id: `act-${Date.now()}`, time: timeStr }, ...prev]);
  };

  const addActivity = (
    actionLabel: string,
    detail: string,
    category: HistoryActivityItem['category'] = 'data_entry',
    status: HistoryStatus = 'success',
  ) => {
    appendHistoryActivity({
      initials: 'YO',
      bg: '#1FA97A',
      name: 'You',
      actionLabel,
      detail,
      category,
      status,
    });
  };

  const showToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    addActivity('Draft saved', 'Purchase request saved', 'data_entry', 'success');
    showToast('Draft saved', 'success');
  };

  const handleSubmit = () => {
    if (lineItems.length === 0) { showToast('Add at least one line item', 'error'); return; }
    setSendApprovalModalOpen(true);
  };

  const handleSendForApproval = (_approvers: string[]) => {
    setStatus('submitted');
    addActivity('Submitted for approval', 'Purchase request submitted for approval', 'approvals', 'neutral');
    setSendApprovalModalOpen(false);
    showToast('Transaction sent for approval successfully', 'success');
  };

  const handleCancel = () => {
    setConfirmDialog({ type: 'cancel', show: true });
  };

  const handleRecall = () => {
    setConfirmDialog({ type: 'recall', show: true });
  };

  const confirmCancel = () => {
    addActivity('Request cancelled', 'Purchase request cancelled', 'data_entry', 'error');
    setConfirmDialog({ type: null, show: false });
    showToast('Request cancelled', 'info');
    navigate('/');
  };

  const confirmRecall = () => {
    setStatus('recalled');
    addActivity('Recalled from approval', 'Purchase request recalled from approval', 'approvals', 'neutral');
    setConfirmDialog({ type: null, show: false });
    showToast('Request recalled', 'info');
  };

  const handleCopy = () => {
    const newId = `PR-${Date.now()}`;
    try {
      const dataToSave = { lineItems, prHeader, headerFieldData };
      localStorage.setItem(getStorageKey(newId), JSON.stringify(dataToSave));
      navigate(`/pr/${newId}`, { state: { prHeader, lineItems } });
      showToast('Request copied to new draft', 'success');
    } catch {
      showToast('Failed to copy request', 'error');
    }
  };

  const handleCreatePO = () => {
    setPoCreated(true);
    showToast('Purchase order created', 'success');
  };

  const handleEmailPO = () => showToast('PO email sent', 'success');

  const handleCreateChangeOrder = () => showToast('Change order created', 'info');

  const handlePrint = () => {
    printTransaction({
      prId,
      department: headerFieldData.department,
      requiredBy: headerFieldData.requiredBy,
      status: statusLabels[status],
      description: headerFieldData.description,
      vendor: headerFieldData.vendor,
      deliveryLocation: headerFieldData.deliveryLocation,
      lineItems: lineItems.map((item) => ({
        description: item.item,
        vendor: item.vendor,
        quantity: item.quantity,
        cost: item.cost,
        subtotal: item.subtotal,
      })),
      total: subtotalAll,
    });
    addActivity('Transaction printed', `Printed ${prId}`, 'data_entry', 'neutral');
    showToast('Opening print preview…', 'info');
  };

  const handleToggleStar = () => {
    const starred = toggleStarred(prId);
    setIsStarred(starred);
    addActivity(
      starred ? 'Transaction starred' : 'Star removed',
      starred ? `${prId} added to starred` : `${prId} removed from starred`,
      'data_entry',
      'neutral',
    );
    showToast(starred ? 'Transaction starred' : 'Star removed', starred ? 'success' : 'info');
  };

  const handleCreateRFQ = () => {
    if (lineItems.length === 0) {
      showToast('Add at least one line item before creating an RFQ', 'error');
      return;
    }
    const rfqId = `RFQ-${new Date().getFullYear()}-${String(rfqRecords.length + 1).padStart(3, '0')}`;
    const uniqueVendors = new Set(lineItems.map((item) => item.vendor).filter(Boolean));
    const newRfq: RFQRecord = {
      id: rfqId,
      status: 'draft',
      vendors: Math.max(uniqueVendors.size, 1),
      lineItems: lineItems.length,
      amount: subtotalAll,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setRfqRecords((prev) => [...prev, newRfq]);
    setActiveTab('RFQ');
    addActivity('RFQ created', `${rfqId} created from ${lineItems.length} line item(s)`, 'data_entry', 'success');
    showToast(`${rfqId} created successfully`, 'success');
  };

  const handleApprove = () => {
    setStatus('approved');
    addActivity('Request approved', 'Purchase request approved', 'approvals', 'success');
    showToast('Request approved!', 'success');
  };

  const handleReject = () => {
    setStatus('rejected');
    addActivity('Request rejected', 'Purchase request rejected', 'approvals', 'error');
    showToast('Request rejected', 'error');
  };

  const handleRequireChanges = () => {
    setStatus('unsubmitted');
    addActivity('Changes requested', 'Changes requested on purchase request', 'revisions', 'neutral');
    showToast('Changes required', 'info');
  };

  const handleModalComplete = (data: { header: PRHeaderData; lineItem?: LineItemData }) => {
    if (data.lineItem) {
      setLineItems((prev) => [...prev, data.lineItem!]);
      addActivity('Line item added', `Added ${data.lineItem.item}`, 'data_entry', 'success');
      showToast('Line item added', 'success');
    }
    setModalOpen(false);
  };

  const handleAddItemSave = (data: AddItemData) => {
    const newItem: ExtendedLineItem = {
      id: Date.now().toString(),
      item: data.description,
      vendor: data.vendor || '84 Lumber',
      quantity: data.quantity,
      cost: data.cost,
      subtotal: data.quantity * data.cost,
      glAccount: data.glAccounts.length > 0 ? `${data.glAccounts[0].account} - ${data.glAccounts[0].name}` : '6100 - Office Supplies',
      type: data.type,
      unitOfMeasure: data.unitOfMeasure,
      taxGroup: data.taxGroup,
      glAccountsCount: data.glAccounts.length,
    };
    setLineItems((prev) => [...prev, newItem]);
    addActivity('Item added', `Added ${data.description}`, 'data_entry', 'success');
    showToast('Item added successfully', 'success');
    setAddItemModalOpen(false);
  };

  const startEdit = (rowId: string, field: string, val: string | number) => { setEditingCell({ rowId, field }); setEditValue(String(val)); };

  const startHeaderEdit = (field: string) => {
    setEditingHeaderField(field);
    setEditValue(headerFieldData[field as keyof typeof headerFieldData]);
  };

  const commitHeaderEdit = () => {
    if (!editingHeaderField) return;
    setHeaderFieldData((prev) => ({ ...prev, [editingHeaderField]: editValue }));
    setEditingHeaderField(null);
    showToast('Field updated', 'success');
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const { rowId, field } = editingCell;

    if (rowId === 'blank-row') {
      const newItem: ExtendedLineItem = {
        id: Date.now().toString(),
        item: field === 'item' ? editValue : '',
        vendor: field === 'vendor' ? editValue : (prHeader.vendor || '84 Lumber'),
        quantity: field === 'quantity' ? (parseFloat(editValue) || 1) : 1,
        cost: field === 'cost' ? (parseFloat(editValue) || 0) : 0,
        subtotal: 0,
        glAccount: '6100 - Office Supplies',
        type: field === 'type' ? editValue : 'Goods',
        unitOfMeasure: field === 'unitOfMeasure' ? editValue : 'Each',
        taxGroup: field === 'taxGroup' ? editValue : 'Standard',
        glAccountsCount: 1,
      };
      newItem.subtotal = newItem.quantity * newItem.cost;
      setLineItems((prev) => [...prev, newItem]);
      setEditingCell(null);
      return;
    }

    setLineItems((prev) => prev.map((item) => {
      if (item.id !== rowId) return item;
      const u = { ...item };
      if (field === 'item') u.item = editValue;
      else if (field === 'vendor') u.vendor = editValue;
      else if (field === 'type') u.type = editValue;
      else if (field === 'unitOfMeasure') u.unitOfMeasure = editValue;
      else if (field === 'taxGroup') u.taxGroup = editValue;
      else if (field === 'quantity') { u.quantity = parseFloat(editValue) || item.quantity; u.subtotal = u.quantity * u.cost; }
      else if (field === 'cost') { u.cost = parseFloat(editValue) || item.cost; u.subtotal = u.quantity * u.cost; }
      return u;
    }));
    setEditingCell(null);
  };

  const addNewRow = () => {
    const newItem: ExtendedLineItem = {
      id: Date.now().toString(),
      item: '',
      vendor: '84 Lumber',
      quantity: 1,
      cost: 0,
      subtotal: 0,
      glAccount: '6100 - Office Supplies',
      type: 'Goods',
      unitOfMeasure: 'Each',
      taxGroup: 'Standard',
      glAccountsCount: 1,
    };
    setLineItems((prev) => [...prev, newItem]);
    addActivity('Row added', 'New item row added', 'data_entry', 'neutral');
    setTimeout(() => startEdit(newItem.id, 'item', ''), 100);
  };

  const isEditing = (rowId: string, field: string) => editingCell?.rowId === rowId && editingCell?.field === field;

  const baseFilteredItems = lineItems.filter((i) => !searchQuery || i.item.toLowerCase().includes(searchQuery.toLowerCase()) || i.vendor.toLowerCase().includes(searchQuery.toLowerCase()));

  const blankRow: ExtendedLineItem = {
    id: 'blank-row',
    item: '',
    vendor: prHeader.vendor || '84 Lumber',
    quantity: 1,
    cost: 0,
    subtotal: 0,
    glAccount: '6100 - Office Supplies',
    type: 'Goods',
    unitOfMeasure: 'Each',
    taxGroup: 'Standard',
    glAccountsCount: 1,
  };

  const filteredItems = lineItems.length > 0 && !searchQuery ? [...baseFilteredItems, blankRow] : baseFilteredItems;

  const CellInput = ({ rowId, field }: { rowId: string; field: string }) => (
    <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={commitEdit}
      onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingCell(null); }}
      style={{ width: '100%', height: '28px', border: '1.5px solid #1FA97A', borderRadius: '4px', padding: '0 7px', fontSize: '13px', fontFamily: F, color: '#101828', outline: 'none', background: '#F0FDF9' }}
    />
  );

  const CellSelect = ({ rowId, field, options }: { rowId: string; field: string; options: string[] }) => (
    <select autoFocus value={editValue} onChange={(e) => { setEditValue(e.target.value); setTimeout(commitEdit, 0); }} onBlur={commitEdit}
      style={{ width: '100%', height: '30px', border: '1.5px solid #1FA97A', borderRadius: '4px', padding: '0 7px', fontSize: '13px', fontFamily: F, color: '#101828', outline: 'none', background: '#F0FDF9', cursor: 'pointer' }}
    >
      {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: F, background: '#F5F7FA', overflow: 'hidden' }}>
      <SkipToMainContent />
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopHeader onNewRequest={() => setModalOpen(true)} prId={prId} prStatus={status} />

        {/* Two-column */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <main id="main-content" tabIndex={-1} style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 32px', minWidth: 0 }}>
            {/* Toast */}
            <AnimatePresence>
              {toast && (
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
                  style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 300, display: 'flex', alignItems: 'center', gap: '9px', padding: '10px 18px', background: '#FFFFFF', border: `1px solid ${toast.type === 'success' ? '#BBF7E0' : toast.type === 'error' ? '#FEE4E2' : '#E4E7EC'}`, borderRadius: '7px', boxShadow: '0 4px 20px rgba(16,24,40,0.1)', minWidth: '260px' }}>
                  {toast.type === 'success' && <CheckCircle2 size={14} color="#1FA97A" />}
                  {toast.type === 'error' && <AlertCircle size={14} color="#F04438" />}
                  {toast.type === 'info' && <AlertCircle size={14} color="#667085" />}
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#101828', fontFamily: F }}>{toast.msg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <PRWorkflowHeader
              prId={prId}
              department={headerFieldData.department}
              requiredBy={headerFieldData.requiredBy}
              status={toWorkflowStatus(status)}
              viewRole={viewRole}
              onViewRoleChange={setViewRole}
              poCreated={poCreated}
              nextAction={nextAction}
              onBack={() => navigate('/purchase-requests')}
              isStarred={isStarred}
              handlers={{
                onSave: handleSave,
                onSubmit: handleSubmit,
                onCancel: handleCancel,
                onRecall: handleRecall,
                onCopy: handleCopy,
                onApprove: handleApprove,
                onReject: handleReject,
                onRequireChange: handleRequireChanges,
                onCreatePO: handleCreatePO,
                onEmailPO: handleEmailPO,
                onCreateChangeOrder: handleCreateChangeOrder,
                onPrint: handlePrint,
                onToggleStar: handleToggleStar,
              }}
            />

            {/* PR Details */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E4E7EC', borderRadius: '10px', boxShadow: '0 1px 4px rgba(16,24,40,0.04)', marginBottom: '16px', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #EEF1F5' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#101828', fontFamily: F }}>Request Details</span>
                <button
                  type="button"
                  onClick={() => setHeaderEditMode(!headerEditMode)}
                  style={{ width: '32px', height: '32px', border: '1px solid #E4E7EC', borderRadius: '6px', background: headerEditMode ? '#F0FDF9' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                  title="Edit / unlock header fields"
                >
                  <Settings size={14} color={headerEditMode ? '#1FA97A' : '#667085'} strokeWidth={1.8} />
                </button>
              </div>
              <div style={{ position: 'relative', padding: '20px 24px', opacity: headerEditMode ? 0.65 : 1, pointerEvents: headerEditMode ? 'none' : 'auto', transition: 'opacity 0.2s' }}>
              {headerEditMode && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.88)', zIndex: 10 }}>
                  <span style={{ fontSize: '13px', color: '#1FA97A', fontFamily: F, fontWeight: 600 }}>Header editing enabled</span>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', columnGap: '32px', rowGap: '24px' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#98A2B3', fontFamily: F }}>Type</span>
                    <span style={{ fontSize: '12px', color: '#2D5BFF', fontFamily: F, fontWeight: 500 }}>{prHeader.type}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#98A2B3', fontFamily: F }}>Current Status:</span>
                    <span style={{ fontSize: '12px', color: '#027A48', fontFamily: F, fontWeight: 500, background: '#ECFDF3', padding: '2px 8px', borderRadius: '12px' }}>New</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#98A2B3', fontFamily: F }}>Department/Location</span>
                    {editingHeaderField === 'department' ? (
                      <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={commitHeaderEdit}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitHeaderEdit(); if (e.key === 'Escape') setEditingHeaderField(null); }}
                        style={{ width: '180px', height: '24px', border: '1.5px solid #1FA97A', borderRadius: '4px', padding: '0 6px', fontSize: '12px', fontFamily: F, color: '#101828', outline: 'none', background: '#F0FDF9' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#101828', fontFamily: F, fontWeight: 500 }}>{headerFieldData.department}</span>
                        <button onClick={() => startHeaderEdit('department')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                          <Edit3 size={12} color="#667085" strokeWidth={1.8} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#98A2B3', fontFamily: F }}>Delivery Location</span>
                    {editingHeaderField === 'deliveryLocation' ? (
                      <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={commitHeaderEdit}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitHeaderEdit(); if (e.key === 'Escape') setEditingHeaderField(null); }}
                        style={{ width: '180px', height: '24px', border: '1.5px solid #1FA97A', borderRadius: '4px', padding: '0 6px', fontSize: '12px', fontFamily: F, color: '#101828', outline: 'none', background: '#F0FDF9' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#101828', fontFamily: F, fontWeight: 500 }}>{headerFieldData.deliveryLocation}</span>
                        <button onClick={() => startHeaderEdit('deliveryLocation')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                          <Edit3 size={12} color="#667085" strokeWidth={1.8} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#98A2B3', fontFamily: F }}>Shipping Method</span>
                    {editingHeaderField === 'shippingMethod' ? (
                      <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={commitHeaderEdit}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitHeaderEdit(); if (e.key === 'Escape') setEditingHeaderField(null); }}
                        style={{ width: '180px', height: '24px', border: '1.5px solid #1FA97A', borderRadius: '4px', padding: '0 6px', fontSize: '12px', fontFamily: F, color: '#101828', outline: 'none', background: '#F0FDF9' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#101828', fontFamily: F, fontWeight: 500 }}>{headerFieldData.shippingMethod}</span>
                        <button onClick={() => startHeaderEdit('shippingMethod')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                          <Edit3 size={12} color="#667085" strokeWidth={1.8} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '24px', borderLeft: '1px solid #F0F1F3' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#98A2B3', fontFamily: F }}>PR Number</span>
                    <span style={{ fontSize: '12px', color: '#2D5BFF', fontFamily: F, fontWeight: 700 }}>{prId}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#98A2B3', fontFamily: F }}>Description:</span>
                    {editingHeaderField === 'description' ? (
                      <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={commitHeaderEdit}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitHeaderEdit(); if (e.key === 'Escape') setEditingHeaderField(null); }}
                        style={{ width: '180px', height: '24px', border: '1.5px solid #1FA97A', borderRadius: '4px', padding: '0 6px', fontSize: '12px', fontFamily: F, color: '#101828', outline: 'none', background: '#F0FDF9' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#101828', fontFamily: F, fontWeight: 500 }}>{headerFieldData.description}</span>
                        <button onClick={() => startHeaderEdit('description')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                          <Edit3 size={12} color="#667085" strokeWidth={1.8} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#98A2B3', fontFamily: F }}>Vendor</span>
                    {editingHeaderField === 'vendor' ? (
                      <input autoFocus value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={commitHeaderEdit}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitHeaderEdit(); if (e.key === 'Escape') setEditingHeaderField(null); }}
                        style={{ width: '180px', height: '24px', border: '1.5px solid #1FA97A', borderRadius: '4px', padding: '0 6px', fontSize: '12px', fontFamily: F, color: '#101828', outline: 'none', background: '#F0FDF9' }}
                      />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#101828', fontFamily: F, fontWeight: 500 }}>{headerFieldData.vendor}</span>
                        <button onClick={() => startHeaderEdit('vendor')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                          <Edit3 size={12} color="#667085" strokeWidth={1.8} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#98A2B3', fontFamily: F }}>Required By</span>
                    <span style={{ fontSize: '12px', color: '#101828', fontFamily: F, fontWeight: 500 }}>{headerFieldData.requiredBy}</span>
                  </div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '24px', borderLeft: '1px solid #F0F1F3' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#98A2B3', fontFamily: F }}>Sub Total</span>
                    <span style={{ fontSize: '12px', color: '#101828', fontFamily: F, fontWeight: 600 }}>{fmt(subtotalAll)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#98A2B3', fontFamily: F }}>Tax</span>
                    <span style={{ fontSize: '12px', color: '#101828', fontFamily: F, fontWeight: 600 }}>{fmt(0)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#98A2B3', fontFamily: F }}>Total</span>
                    <span style={{ fontSize: '12px', color: '#101828', fontFamily: F, fontWeight: 600 }}>{fmt(subtotalAll)}</span>
                  </div>
                </div>
              </div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E4E7EC', borderRadius: '10px', boxShadow: '0 1px 4px rgba(16,24,40,0.04)', overflow: 'hidden' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottomWidth: '2px', borderBottomStyle: 'solid', borderBottomColor: '#E4E7EC', marginBottom: 0, paddingLeft: '4px' }}>
              {TABS.map((tab) => {
                const active = tab === activeTab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 16px', border: 'none', borderBottomWidth: '2.5px', borderBottomStyle: 'solid', borderBottomColor: active ? '#1FA97A' : 'transparent', background: 'none', cursor: 'pointer', fontFamily: F, fontSize: '13px', fontWeight: active ? 600 : 400, color: active ? '#1FA97A' : '#667085', marginBottom: '-2px', whiteSpace: 'nowrap' }}>
                    {tab}{tabCounts[tab] > 0 ? ` (${tabCounts[tab]})` : ' (0)'}
                  </button>
                );
              })}
              <button style={{ marginLeft: 'auto', padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', color: '#667085' }}>
                <MoreHorizontal size={16} strokeWidth={1.8} />
              </button>
            </div>

            {/* Items table */}
            {activeTab === 'Items' && (
              <div style={{ overflow: 'hidden' }}>
                {/* Toolbar */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #EEF1F5', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '32px', padding: '0 12px', border: '1px solid #E4E7EC', borderRadius: '5px', background: '#F9FAFB', flex: 1, maxWidth: '260px' }}>
                    <Search size={12} color="#98A2B3" strokeWidth={2} />
                    <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search items..." style={{ border: 'none', background: 'transparent', fontSize: '12px', color: '#101828', fontFamily: F, outline: 'none', flex: 1 }} />
                  </div>
                  <div style={{ flex: 1 }} />
                  <button onClick={() => setModalOpen(true)} style={{ height: '32px', padding: '0 14px', background: '#FFFFFF', border: '1.5px solid #D0D5DD', borderRadius: '5px', fontSize: '12px', fontWeight: 600, color: '#344054', fontFamily: F, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.15s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F0FDF9'; (e.currentTarget as HTMLElement).style.borderColor = '#1FA97A'; (e.currentTarget as HTMLElement).style.color = '#1FA97A'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#FFFFFF'; (e.currentTarget as HTMLElement).style.borderColor = '#D0D5DD'; (e.currentTarget as HTMLElement).style.color = '#344054'; }}
                  >
                    <Plus size={13} strokeWidth={2.5} /> Select Item Form Inventory
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '32px', padding: '0 10px', border: '1px solid #E4E7EC', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', color: '#667085', fontFamily: F, background: '#FFFFFF' }}>
                    Filter <ChevronDown size={11} strokeWidth={2} color="#98A2B3" />
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
                        {[['Description ↑', 'auto'], ['Type', '100px'], ['Unit', '90px'], ['Vendor', '130px'], ['Quantity', '80px'], ['Cost', '100px'], ['Tax', '90px'], ['GL', '70px'], ['Sub Total', '100px'], ['', '70px'], ['', '36px']].map(([label, w]) => (
                          <th key={`${label}-${w}`} style={{ padding: '10px 14px', textAlign: 'left', width: w, fontSize: '11px', fontWeight: 600, color: '#667085', fontFamily: F, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>{label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {filteredItems.map((item) => {
                          const isNewRow = !item.item;
                          return (
                            <motion.tr key={item.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}
                              style={{ borderBottom: '1px solid #F2F4F7', background: isNewRow ? '#FFFEF0' : (hoveredRow === item.id ? '#FAFAFA' : '#FFFFFF'), transition: 'background 0.1s' }}
                              onMouseEnter={() => setHoveredRow(item.id)} onMouseLeave={() => setHoveredRow(null)}
                            >
                              {/* Description */}
                              <td style={{ padding: '12px 14px' }}>
                                {isEditing(item.id, 'item') ? <CellInput rowId={item.id} field="item" /> : (
                                  <div onClick={() => startEdit(item.id, 'item', item.item)} style={{ cursor: 'text' }}>
                                    <div style={{ fontSize: '13px', color: item.item ? '#101828' : '#98A2B3', fontFamily: F, fontWeight: 500 }}>{item.item || 'Enter description...'}</div>
                                    <div style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F, marginTop: '4px' }}>{item.glAccount.split(' - ')[0]}</div>
                                  </div>
                                )}
                              </td>
                              {/* Type */}
                              <td style={{ padding: '12px 14px' }}>
                                {isEditing(item.id, 'type') ? <CellSelect rowId={item.id} field="type" options={['Goods', 'Services', 'Assets']} /> : (
                                  <span onClick={() => startEdit(item.id, 'type', item.type || 'Goods')} style={{ fontSize: '13px', color: '#344054', fontFamily: F, cursor: 'pointer' }}>{item.type || 'Goods'}</span>
                                )}
                              </td>
                              {/* Unit of Measure */}
                              <td style={{ padding: '12px 14px' }}>
                                {isEditing(item.id, 'unitOfMeasure') ? <CellSelect rowId={item.id} field="unitOfMeasure" options={['Each', 'Box', 'Case', 'Hour', 'Day']} /> : (
                                  <span onClick={() => startEdit(item.id, 'unitOfMeasure', item.unitOfMeasure || 'Each')} style={{ fontSize: '13px', color: '#344054', fontFamily: F, cursor: 'pointer' }}>{item.unitOfMeasure || 'Each'}</span>
                                )}
                              </td>
                              {/* Vendor */}
                              <td style={{ padding: '12px 14px' }}>
                                {isEditing(item.id, 'vendor') ? <CellInput rowId={item.id} field="vendor" /> : (
                                  <div onClick={() => startEdit(item.id, 'vendor', item.vendor)} style={{ cursor: 'text' }}>
                                    <div style={{ fontSize: '13px', color: '#344054', fontFamily: F }}>{item.vendor}</div>
                                    <div style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F, marginTop: '4px' }}>Vendor #123</div>
                                  </div>
                                )}
                              </td>
                              {/* Quantity */}
                              <td style={{ padding: '12px 14px' }}>
                                {isEditing(item.id, 'quantity') ? <CellInput rowId={item.id} field="quantity" /> : (
                                  <span onClick={() => startEdit(item.id, 'quantity', item.quantity)} style={{ fontSize: '13px', color: item.id === 'blank-row' ? '#98A2B3' : '#344054', fontFamily: F, cursor: 'text' }}>{item.id === 'blank-row' ? '' : item.quantity}</span>
                                )}
                              </td>
                              {/* Cost */}
                              <td style={{ padding: '12px 14px' }}>
                                {isEditing(item.id, 'cost') ? <CellInput rowId={item.id} field="cost" /> : (
                                  <div onClick={() => startEdit(item.id, 'cost', item.cost)} style={{ cursor: 'text' }}>
                                    <div style={{ fontSize: '13px', color: item.id === 'blank-row' ? '#98A2B3' : '#344054', fontFamily: F }}>{item.id === 'blank-row' ? '' : fmt(item.cost)}</div>
                                    {item.id !== 'blank-row' && <div style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F, marginTop: '4px' }}>Per {item.unitOfMeasure || 'Unit'}</div>}
                                  </div>
                                )}
                              </td>
                              {/* Tax Group */}
                              <td style={{ padding: '12px 14px' }}>
                                {isEditing(item.id, 'taxGroup') ? <CellSelect rowId={item.id} field="taxGroup" options={['Standard', 'Exempt', 'Reduced']} /> : (
                                  <span onClick={() => startEdit(item.id, 'taxGroup', item.taxGroup || 'Standard')} style={{ fontSize: '13px', color: '#344054', fontFamily: F, cursor: 'pointer' }}>{item.taxGroup || 'Standard'}</span>
                                )}
                              </td>
                              {/* GL Distribution */}
                              <td style={{ padding: '12px 14px' }}>
                                {item.id !== 'blank-row' && (
                                  <button
                                    onClick={() => setGLDistributionRow(item.id)}
                                    style={{ height: '24px', padding: '0 8px', background: '#F9FAFB', border: '1px solid #E4E7EC', borderRadius: '4px', fontSize: '11px', fontWeight: 600, color: '#667085', fontFamily: F, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.15s' }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F0FDF9'; (e.currentTarget as HTMLElement).style.borderColor = '#1FA97A'; (e.currentTarget as HTMLElement).style.color = '#1FA97A'; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; (e.currentTarget as HTMLElement).style.borderColor = '#E4E7EC'; (e.currentTarget as HTMLElement).style.color = '#667085'; }}
                                  >
                                    {item.glAccountsCount || 1} GL
                                  </button>
                                )}
                              </td>
                              {/* Subtotal */}
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: item.id === 'blank-row' ? '#98A2B3' : '#101828', fontFamily: F }}>{item.id === 'blank-row' ? '' : fmt(item.subtotal)}</span>
                              </td>
                              {/* Action Icons */}
                              <td style={{ padding: '12px 14px' }}>
                                {item.id !== 'blank-row' && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <button
                                      onClick={() => setBudgetPopupRow(item.id)}
                                      style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '5px',
                                        border: 'none',
                                        background: 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s',
                                      }}
                                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; }}
                                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                    >
                                      <DollarSign size={14} color="#EF4444" strokeWidth={2} />
                                    </button>
                                    <button
                                      onClick={() => setBudgetReportRow(item.id)}
                                      style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '5px',
                                        border: 'none',
                                        background: 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s',
                                      }}
                                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
                                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                                    >
                                      <ExternalLink size={14} color="#667085" strokeWidth={2} />
                                    </button>
                                  </div>
                                )}
                              </td>
                              {/* Delete */}
                              <td style={{ padding: '12px 14px' }}>
                                {item.id !== 'blank-row' && (
                                  <button onClick={() => { setLineItems((prev) => prev.filter((i) => i.id !== item.id)); showToast('Item removed', 'info'); }}
                                    style={{ width: '26px', height: '26px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#98A2B3', opacity: hoveredRow === item.id ? 1 : 0, transition: 'opacity 0.15s, background 0.15s' }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#F04438'; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#98A2B3'; }}
                                  ><Trash2 size={12} strokeWidth={2} /></button>
                                )}
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                      {filteredItems.length === 0 && (
                        <tr><td colSpan={11}><div style={{ padding: '40px 24px', textAlign: 'center', color: '#98A2B3', fontSize: '13px', fontFamily: F }}>No items found. Click "Add Item" to start adding items.</div></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {lineItems.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '2px solid #E4E7EC', background: '#F9FAFB' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#344054', fontFamily: F }}>Total</span>
                    <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#667085', fontFamily: F }}>Sub Total</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#101828', fontFamily: F }}>Total: {fmt(subtotalAll)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'RFQ' && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #EEF1F5', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1 }} />
                  <WorkflowActionButton onClick={handleCreateRFQ} icon={<FilePlus size={12} strokeWidth={2} />} variant="green">
                    Create RFQ
                  </WorkflowActionButton>
                </div>

                {rfqRecords.length === 0 ? (
                  <div style={{ padding: '56px 24px', textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <FileText size={22} color="#98A2B3" strokeWidth={1.8} />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#344054', fontFamily: F, marginBottom: '6px' }}>No RFQs yet</div>
                    <div style={{ fontSize: '13px', color: '#98A2B3', fontFamily: F, marginBottom: '20px', maxWidth: '320px', margin: '0 auto 20px' }}>
                      Create a request for quote to send line items to vendors for pricing.
                    </div>
                    <WorkflowActionButton onClick={handleCreateRFQ} icon={<FilePlus size={12} strokeWidth={2} />} variant="green">
                      Create RFQ
                    </WorkflowActionButton>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                      <thead>
                        <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
                          {['RFQ Number', 'Status', 'Vendors', 'Line Items', 'Amount', 'Created', ''].map((label) => (
                            <th key={label} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: '#667085', fontFamily: F, letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rfqRecords.map((rfq) => (
                          <tr key={rfq.id} style={{ borderBottom: '1px solid #F2F4F7' }}>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#101828', fontFamily: F }}>{rfq.id}</span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#667085', fontFamily: F, background: '#F2F4F7', padding: '3px 8px', borderRadius: '12px', textTransform: 'capitalize' }}>
                                {rfq.status}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: '#344054', fontFamily: F }}>{rfq.vendors}</td>
                            <td style={{ padding: '14px 16px', fontSize: '13px', color: '#344054', fontFamily: F }}>{rfq.lineItems}</td>
                            <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 700, color: '#101828', fontFamily: F }}>{fmt(rfq.amount)}</td>
                            <td style={{ padding: '14px 16px', fontSize: '12px', color: '#667085', fontFamily: F }}>{rfq.createdAt}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <button
                                type="button"
                                onClick={() => showToast(`${rfq.id} opened`, 'info')}
                                style={{ height: '28px', padding: '0 10px', border: '1px solid #E4E7EC', borderRadius: '5px', background: '#FFFFFF', fontSize: '12px', fontWeight: 500, color: '#344054', fontFamily: F, cursor: 'pointer' }}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab !== 'Items' && activeTab !== 'RFQ' && (
              <div style={{ padding: '56px 24px', textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: '#98A2B3', fontFamily: F }}>{activeTab} — No records yet</span>
              </div>
            )}
            </div>
          </main>

          {/* Right panel */}
          <aside style={{ width: '280px', flexShrink: 0, overflowY: 'auto', background: '#FFFFFF', borderLeft: '1px solid #E4E7EC', display: 'flex', flexDirection: 'column' }}>
            {/* Budget Insights — dense, aligned, minimal vertical rhythm */}
            <div style={{ padding: '16px 16px', borderBottom: '1px solid #EEF1F5' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#101828', fontFamily: F, marginBottom: '12px', letterSpacing: '-0.01em' }}>Budgets Insights</div>

              {/* Amounts: reference vs this request */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  marginBottom: '12px',
                  padding: '8px 10px',
                  background: '#F9FAFB',
                  borderRadius: '6px',
                  border: '1px solid #EEF1F5',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#667085', fontFamily: F, lineHeight: 1.2 }}>Total ${budgetReferenceTotal.toFixed(4)}</span>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: '#98A2B3', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>Reference</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#101828', fontFamily: F, lineHeight: 1.15 }}>{fmt(subtotalAll)}</span>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: '#98A2B3', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap', textAlign: 'right' }}>This request</span>
                </div>
              </div>

              {/* Utilization */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <RefreshCw size={11} color="#1FA97A" strokeWidth={2} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#344054', fontFamily: F }}>Progress</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: budgetPct > 80 ? '#B42318' : '#B45309', fontFamily: F }}>{Math.round(budgetPct)}%</span>
                </div>
                <div style={{ height: '5px', background: '#EEF1F5', borderRadius: '100px', overflow: 'hidden', position: 'relative' }}>
                  {/* scaleX avoids layout thrash vs transitioning width */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: '100%',
                      transformOrigin: 'left center',
                      transform: `scaleX(${Math.min(budgetPct, 100) / 100})`,
                      background: budgetPct > 80 ? '#F04438' : '#F59E0B',
                      borderRadius: '100px',
                      transition: 'transform 0.4s ease',
                    }}
                  />
                </div>
              </div>

              {/* Period — label + count + calendar (no duplicate “Days remaining” caption) */}
              <div
                style={{
                  marginBottom: '12px',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #F5E9D6',
                  background: '#FFFCF5',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', minWidth: 0, flex: 1 }}>
                    <Clock size={12} color="#667085" strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontSize: '10px', color: '#667085', fontFamily: F, lineHeight: 1.25 }}>Days remaining in current period</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1FA97A', fontFamily: F, lineHeight: 1.1, whiteSpace: 'nowrap' }}>{daysRemaining} days</span>
                    <Calendar size={12} color="#98A2B3" strokeWidth={2} aria-hidden />
                  </div>
                </div>
              </div>

              {/* Budget inset */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid #EEF1F5' }}>
                <span style={{ fontSize: '11px', color: '#667085', fontFamily: F }}>Budget Inarset</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1FA97A', fontFamily: F }}>{fmt(budgetTotal)}</span>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#98A2B3', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Details</span>
                <div style={{ fontSize: '11px', fontFamily: F, lineHeight: 1.3, color: '#344054' }}>
                  <span style={{ color: '#98A2B3' }}>Prosact</span>
                  <span style={{ color: '#D0D5DD' }} aria-hidden>
                    {' · '}
                  </span>
                  <span style={{ fontWeight: 600 }}>David Connor</span>
                </div>
                <span style={{ fontSize: '10px', color: '#98A2B3', fontFamily: F, lineHeight: 1.2 }}>30+00 K8</span>
              </div>
            </div>

            {/* History & actions */}
            <PurchaseRequestHistoryPanel items={activityFeed} onAppendItem={appendHistoryActivity} />
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && <PurchaseRequestModal onClose={() => setModalOpen(false)} onComplete={handleModalComplete} />}
      </AnimatePresence>

      <AnimatePresence>
        {addItemModalOpen && <AddItemModal onClose={() => setAddItemModalOpen(false)} onSave={handleAddItemSave} />}
      </AnimatePresence>

      <AnimatePresence>
        {sendApprovalModalOpen && <SendForApprovalModal onClose={() => setSendApprovalModalOpen(false)} onSend={handleSendForApproval} />}
      </AnimatePresence>

      <AnimatePresence>
        {glDistributionRow && <GLDistributionModal onClose={() => setGLDistributionRow(null)} onApply={(accounts) => {
          setLineItems((prev) => prev.map((item) => item.id === glDistributionRow ? { ...item, glAccountsCount: accounts.length } : item));
          showToast('GL accounts updated', 'success');
          setGLDistributionRow(null);
        }} totalAmount={lineItems.find((i) => i.id === glDistributionRow)?.subtotal || 0} />}
      </AnimatePresence>

      {/* Budget Popup */}
      <AnimatePresence>
        {budgetPopupRow && (() => {
          const item = lineItems.find(i => i.id === budgetPopupRow);
          if (!item) return null;

          const totalBudget = 200.00;
          const spendBudget = item.subtotal;

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setBudgetPopupRow(null)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(16, 24, 40, 0.4)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  boxShadow: '0 20px 50px rgba(16, 24, 40, 0.2)',
                  padding: '24px',
                  minWidth: '300px',
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '14px', color: '#667085', fontFamily: F, marginBottom: '4px' }}>Total Budget:</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#101828', fontFamily: F }}>Rs. {totalBudget.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#667085', fontFamily: F, marginBottom: '4px' }}>Spend Budget:</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#101828', fontFamily: F }}>Rs. {spendBudget.toFixed(2)}</div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Budget Report Popup */}
      <AnimatePresence>
        {budgetReportRow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setBudgetReportRow(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(16, 24, 40, 0.4)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 20px 50px rgba(16, 24, 40, 0.2)',
                width: '100%',
                maxWidth: '900px',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #E4E7EC',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#101828',
                    fontFamily: F,
                  }}
                >
                  Budget Report
                </h2>
              </div>

              {/* Content */}
              <div style={{ padding: '20px 24px 24px' }}>
                {/* Search Bar */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ position: 'relative' }}>
                    <Search
                      size={16}
                      color="#98A2B3"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search here..."
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        border: '1.5px solid #D0D5DD',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontFamily: F,
                        color: '#101828',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = '#1FA97A';
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = '#D0D5DD';
                      }}
                    />
                  </div>
                </div>

                {/* Budget Table */}
                <div
                  style={{
                    border: '2px solid #4ECDC4',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '24px',
                  }}
                >
                  {/* Table Header */}
                  <div
                    style={{
                      background: '#4ECDC4',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: '#FFFFFF',
                        fontFamily: F,
                      }}
                    >
                      E2M
                    </span>
                    <button
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <ChevronDown size={20} strokeWidth={2} />
                    </button>
                  </div>

                  {/* Info Section */}
                  <div
                    style={{
                      background: '#FFFFFF',
                      padding: '12px 16px',
                      borderBottom: '1px solid #E4E7EC',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#98A2B3',
                          fontFamily: F,
                          marginBottom: '2px',
                        }}
                      >
                        GL Description:
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#101828',
                          fontFamily: F,
                          fontWeight: 500,
                        }}
                      >
                        Test
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#98A2B3',
                          fontFamily: F,
                          marginBottom: '2px',
                        }}
                      >
                        Start Date:
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#101828',
                          fontFamily: F,
                          fontWeight: 500,
                        }}
                      >
                        04/01/2026
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#98A2B3',
                          fontFamily: F,
                          marginBottom: '2px',
                        }}
                      >
                        End Date:
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#101828',
                          fontFamily: F,
                          fontWeight: 500,
                        }}
                      >
                        03/31/2027
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#98A2B3',
                          fontFamily: F,
                          marginBottom: '2px',
                        }}
                      >
                        Period:
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#101828',
                          fontFamily: F,
                          fontWeight: 500,
                        }}
                      >
                        Quarterly
                      </div>
                    </div>
                  </div>

                  {/* Data Table */}
                  <div>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                      }}
                    >
                      <thead>
                        <tr style={{ background: '#F9FAFB' }}>
                          {[
                            'PERIOD',
                            'ACTUAL',
                            'COMMITTED',
                            'PENDING',
                            'TOTAL',
                            'BUDGET',
                            'VARIANCE',
                          ].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: '10px 12px',
                                textAlign: 'left',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#101828',
                                fontFamily: F,
                                borderBottom: '1px solid #E4E7EC',
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            period: 'Period1',
                            actual: 'Rs.0.00',
                            committed: 'Rs.696.00',
                            pending: 'Rs.300.00',
                            total: 'Rs.996.00',
                            budget: 'Rs.200.00',
                            variance: 'Rs.-796.00',
                            varianceColor: '#DC2626',
                          },
                          {
                            period: 'Period2',
                            actual: 'Rs.0.00',
                            committed: 'Rs.0.00',
                            pending: 'Rs.5.20',
                            total: 'Rs.5.20',
                            budget: 'Rs.200.00',
                            variance: 'Rs.194.80',
                            varianceColor: '#059669',
                          },
                          {
                            period: 'Period3',
                            actual: 'Rs.0.00',
                            committed: 'Rs.0.00',
                            pending: 'Rs.0.00',
                            total: 'Rs.0.00',
                            budget: 'Rs.200.00',
                            variance: 'Rs.200.00',
                            varianceColor: '#059669',
                          },
                          {
                            period: 'Period4',
                            actual: 'Rs.0.00',
                            committed: 'Rs.0.00',
                            pending: 'Rs.0.00',
                            total: 'Rs.0.00',
                            budget: 'Rs.200.00',
                            variance: 'Rs.200.00',
                            varianceColor: '#059669',
                          },
                        ].map((row, idx) => (
                          <tr
                            key={idx}
                            style={{
                              borderBottom:
                                idx !== 3 ? '1px solid #F2F4F7' : 'none',
                            }}
                          >
                            <td
                              style={{
                                padding: '10px 12px',
                                fontSize: '12px',
                                color: '#344054',
                                fontFamily: F,
                              }}
                            >
                              {row.period}
                            </td>
                            <td
                              style={{
                                padding: '10px 12px',
                                fontSize: '12px',
                                color: '#344054',
                                fontFamily: F,
                              }}
                            >
                              {row.actual}
                            </td>
                            <td
                              style={{
                                padding: '10px 12px',
                                fontSize: '12px',
                                color: '#344054',
                                fontFamily: F,
                              }}
                            >
                              {row.committed}
                            </td>
                            <td
                              style={{
                                padding: '10px 12px',
                                fontSize: '12px',
                                color: '#344054',
                                fontFamily: F,
                              }}
                            >
                              {row.pending}
                            </td>
                            <td
                              style={{
                                padding: '10px 12px',
                                fontSize: '12px',
                                color: '#344054',
                                fontFamily: F,
                              }}
                            >
                              {row.total}
                            </td>
                            <td
                              style={{
                                padding: '10px 12px',
                                fontSize: '12px',
                                color: '#344054',
                                fontFamily: F,
                              }}
                            >
                              {row.budget}
                            </td>
                            <td
                              style={{
                                padding: '10px 12px',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: row.varianceColor,
                                fontFamily: F,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              {row.variance}
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                ⟳
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    onClick={() => setBudgetReportRow(null)}
                    style={{
                      padding: '10px 24px',
                      border: '1.5px solid #D0D5DD',
                      borderRadius: '6px',
                      background: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#344054',
                      fontFamily: F,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setBudgetReportRow(null);
                    }}
                    style={{
                      padding: '10px 24px',
                      border: 'none',
                      borderRadius: '6px',
                      background: '#4ECDC4',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      fontFamily: F,
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#3BB5AD';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#4ECDC4';
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(16,24,40,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 300, backdropFilter: 'blur(2px)',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) setConfirmDialog({ type: null, show: false }); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.22 }}
              style={{
                width: '420px', maxWidth: '90vw',
                background: '#FFFFFF', borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(16,24,40,0.2)',
                padding: '24px',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#101828', fontFamily: F, marginBottom: '8px' }}>
                  {confirmDialog.type === 'cancel' ? 'Cancel Request' : 'Recall Request'}
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#667085', fontFamily: F, lineHeight: 1.5 }}>
                  {confirmDialog.type === 'cancel'
                    ? 'Are you sure you want to cancel this request? This action cannot be undone.'
                    : 'Are you sure you want to recall this request? It will be moved back to draft status.'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setConfirmDialog({ type: null, show: false })}
                  style={{ height: '36px', padding: '0 18px', background: '#FFFFFF', border: '1.5px solid #D0D5DD', borderRadius: '5px', fontSize: '13px', fontWeight: 600, color: '#344054', fontFamily: F, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#F9FAFB')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#FFFFFF')}
                >
                  No, Keep It
                </button>
                <button
                  onClick={() => confirmDialog.type === 'cancel' ? confirmCancel() : confirmRecall()}
                  style={{ height: '36px', padding: '0 18px', background: confirmDialog.type === 'cancel' ? '#F04438' : '#D97706', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '13px', fontWeight: 600, fontFamily: F, cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = confirmDialog.type === 'cancel' ? '#D92D20' : '#B45309')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = confirmDialog.type === 'cancel' ? '#F04438' : '#D97706')}
                >
                  Yes, {confirmDialog.type === 'cancel' ? 'Cancel' : 'Recall'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Small reusable button with color variants ── */
function Btn({ onClick, icon, variant, disabled, children }: { onClick: () => void; icon?: React.ReactNode; variant: 'blue' | 'green' | 'amber' | 'red' | 'gray'; disabled?: boolean; children: React.ReactNode }) {
  const colorMap = {
    blue: { bg: '#2D9CDB', hover: '#1A7AB8', text: '#FFFFFF' },
    green: { bg: '#1FA97A', hover: '#178F67', text: '#FFFFFF' },
    amber: { bg: '#D97706', hover: '#B45309', text: '#FFFFFF' },
    red: { bg: '#F04438', hover: '#D92D20', text: '#FFFFFF' },
    gray: { bg: '#FFFFFF', hover: '#F9FAFB', text: '#344054', border: '1.5px solid #D0D5DD' },
  };

  const colors = colorMap[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        height: '32px', padding: '0 14px',
        background: disabled ? '#98A2B3' : colors.bg,
        border: colors.border || 'none',
        borderRadius: '5px', fontSize: '12px', fontWeight: 600,
        color: disabled ? '#FFFFFF' : colors.text,
        fontFamily: F, cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', gap: '5px',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.background = colors.hover; }}
      onMouseLeave={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.background = colors.bg; }}
    >
      {icon}{children}
    </button>
  );
}
