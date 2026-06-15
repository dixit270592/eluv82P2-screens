import { useState } from 'react';
import { motion } from 'motion/react';
import { X, ChevronDown, Plus } from 'lucide-react';
import { UI_FONT_STACK as F } from '../tokens/typography';

interface GLAccount {
  code: string;
  name: string;
}

interface SelectedGLAccount {
  account: string;
  name: string;
  amount: number;
  percentage: number;
}

interface GLDistributionModalProps {
  onClose: () => void;
  onApply: (accounts: SelectedGLAccount[]) => void;
  totalAmount: number;
}

const GL_ACCOUNTS: GLAccount[] = [
  { code: 'Account 1:Account 2', name: 'test segment:test segment' },
  { code: '10:1030', name: 'Finance & Administration-Cash Management' },
  { code: '10:1031', name: 'Finance & Administration Property Ltd' },
  { code: '10:7000', name: 'Finance & Administration Computer' },
  { code: '10:8000', name: 'Operations & Facilities Maintenance' },
];

const PREDEFINED_SPLITS = [
  { name: 'Equal Split', accounts: [{ code: 'Account 1:Account 2', name: 'test segment:test segment', percentage: 100 }] },
  { name: 'Finance Split', accounts: [{ code: '10:1030', name: 'Finance & Administration-Cash Mgmt', percentage: 50 }, { code: '10:1031', name: 'Finance & Administration Prty Ltd', percentage: 50 }] },
];

export function GLDistributionModal({ onClose, onApply, totalAmount }: GLDistributionModalProps) {
  const [selectedSplit, setSelectedSplit] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<SelectedGLAccount[]>([]);
  const [checkedAccounts, setCheckedAccounts] = useState<Set<string>>(new Set());

  const totalAllocated = selectedAccounts.reduce((sum, acc) => sum + acc.amount, 0);
  const totalPercentage = selectedAccounts.reduce((sum, acc) => sum + acc.percentage, 0);
  const remainingBalance = totalAmount - totalAllocated;

  const handleToggleAccount = (account: GLAccount) => {
    const key = account.code;
    const newChecked = new Set(checkedAccounts);

    if (newChecked.has(key)) {
      newChecked.delete(key);
      setSelectedAccounts(selectedAccounts.filter((a) => a.account !== key));
    } else {
      newChecked.add(key);
      const amount = totalAmount > 0 ? Math.round((totalAmount / (selectedAccounts.length + 1)) * 100) / 100 : 0;
      const percentage = totalAmount > 0 ? Math.round(100 / (selectedAccounts.length + 1)) : 0;
      setSelectedAccounts([...selectedAccounts, { account: key, name: account.name, amount, percentage }]);
    }
    setCheckedAccounts(newChecked);
  };

  const handleUpdateAmount = (account: string, amount: number) => {
    setSelectedAccounts(selectedAccounts.map((a) =>
      a.account === account
        ? { ...a, amount, percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 1000) / 10 : 0 }
        : a
    ));
  };

  const handleUpdatePercentage = (account: string, percentage: number) => {
    setSelectedAccounts(selectedAccounts.map((a) =>
      a.account === account
        ? { ...a, percentage, amount: Math.round((percentage / 100) * totalAmount * 100) / 100 }
        : a
    ));
  };

  const handleRemoveAccount = (account: string) => {
    setSelectedAccounts(selectedAccounts.filter((a) => a.account !== account));
    const newChecked = new Set(checkedAccounts);
    newChecked.delete(account);
    setCheckedAccounts(newChecked);
  };

  const handleApply = () => {
    onApply(selectedAccounts);
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
        zIndex: 250, padding: '20px', backdropFilter: 'blur(2px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.22 }}
        style={{
          width: '800px', maxWidth: '96vw', maxHeight: '90vh',
          background: '#FFFFFF', borderRadius: '8px',
          boxShadow: '0 10px 40px rgba(16,24,40,0.2)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #EEF1F5', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#101828', fontFamily: F }}>
              GL Distribution
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
          {/* Predefined splits */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#344054', fontFamily: F, marginBottom: '6px' }}>
              Predefined GL splits
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedSplit}
                onChange={(e) => setSelectedSplit(e.target.value)}
                style={{
                  width: '100%', height: '36px', appearance: 'none', paddingRight: '28px',
                  border: '1px solid #D0D5DD', borderRadius: '5px', background: '#FFFFFF',
                  color: '#667085', fontSize: '13px', fontFamily: F, cursor: 'pointer',
                  padding: '0 28px 0 10px', outline: 'none',
                }}
              >
                <option value="">Select a predefined split</option>
                {PREDEFINED_SPLITS.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
              <ChevronDown size={12} color="#98A2B3" style={{ position: 'absolute', right: '9px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
          </div>

          {/* Filter Section */}
          <div style={{ border: '1px solid #E4E7EC', borderRadius: '6px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#101828', fontFamily: F }}>Filter Section</span>
              <Plus size={14} color="#667085" strokeWidth={2.5} style={{ cursor: 'pointer' }} />
            </div>

            {/* Table */}
            <div style={{ padding: '10px 14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 2fr', gap: '10px', padding: '8px 0', borderBottom: '1px solid #EEF1F5' }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#667085', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.05em' }}></span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#667085', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.05em' }}>GL ACCOUNT</span>
                <span style={{ fontSize: '10px', fontWeight: 600, color: '#667085', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACCOUNT NAME</span>
              </div>

              {GL_ACCOUNTS.map((account) => (
                <div
                  key={account.code}
                  style={{ display: 'grid', gridTemplateColumns: '40px 1fr 2fr', gap: '10px', padding: '10px 0', borderBottom: '1px solid #F2F4F7', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => handleToggleAccount(account)}
                >
                  <div
                    style={{
                      width: '16px', height: '16px', borderRadius: '3px',
                      border: checkedAccounts.has(account.code) ? 'none' : '1.5px solid #D0D5DD',
                      background: checkedAccounts.has(account.code) ? '#1FA97A' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {checkedAccounts.has(account.code) && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: '#344054', fontFamily: F, fontWeight: 600 }}>{account.code}</span>
                  <span style={{ fontSize: '12px', color: '#667085', fontFamily: F }}>{account.name}</span>
                </div>
              ))}

              <div style={{ padding: '10px 0', fontSize: '12px', color: '#2D9CDB', fontFamily: F, fontWeight: 600 }}>
                Total Count: {checkedAccounts.size}
              </div>
            </div>
          </div>

          {/* Selected GL Accounts */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#2D9CDB', fontFamily: F, marginBottom: '10px' }}>
              Selected GL Accounts:
            </div>

            {selectedAccounts.length > 0 ? (
              <>
                <div style={{ border: '1px solid #E4E7EC', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 140px 120px 40px', gap: '10px', padding: '10px 14px', background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#667085', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.05em' }}>GL ACCOUNT</span>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#667085', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ACCOUNT NAME</span>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#667085', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AMOUNT</span>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#667085', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.05em' }}>PERCENTAGE</span>
                    <span></span>
                  </div>

                  {selectedAccounts.map((account) => (
                    <div key={account.account} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 140px 120px 40px', gap: '10px', padding: '12px 14px', borderBottom: '1px solid #F2F4F7', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#344054', fontFamily: F, fontWeight: 600 }}>{account.account}</span>
                      <span style={{ fontSize: '12px', color: '#667085', fontFamily: F }}>{account.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#667085', fontFamily: F }}>Rs.</span>
                        <input
                          type="number"
                          value={account.amount}
                          onChange={(e) => handleUpdateAmount(account.account, parseFloat(e.target.value) || 0)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: '100px', height: '28px', border: '1px solid #D0D5DD', borderRadius: '4px', padding: '0 6px', fontSize: '12px', fontFamily: F, color: '#101828', outline: 'none' }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          value={account.percentage}
                          onChange={(e) => handleUpdatePercentage(account.account, parseFloat(e.target.value) || 0)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ width: '80px', height: '28px', border: '1px solid #D0D5DD', borderRadius: '4px', padding: '0 6px', fontSize: '12px', fontFamily: F, color: '#101828', outline: 'none' }}
                        />
                        <span style={{ fontSize: '12px', color: '#667085', fontFamily: F }}>%</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveAccount(account.account); }}
                        style={{
                          width: '24px', height: '24px', border: 'none', background: 'transparent',
                          cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <X size={14} color="#98A2B3" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#F9FAFB', borderRadius: '6px' }}>
                  <div style={{ display: 'flex', gap: '80px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#667085', fontFamily: F, marginBottom: '2px' }}>Total Amount</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#101828', fontFamily: F }}>Rs. {totalAllocated.toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#667085', fontFamily: F, marginBottom: '2px' }}>Total %</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#101828', fontFamily: F }}>{totalPercentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#667085', fontFamily: F, marginBottom: '2px' }}>Remaining Balance</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: remainingBalance === 0 ? '#1FA97A' : '#F04438', fontFamily: F }}>{remainingBalance.toFixed(2)}</div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: '12px', color: '#98A2B3', fontFamily: F }}>
                Select GL accounts from the list above
              </div>
            )}
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
            onClick={onClose}
            style={{
              height: '36px', padding: '0 18px',
              background: '#FFFFFF', border: '1.5px solid #D0D5DD',
              borderRadius: '5px', fontSize: '13px', fontWeight: 600,
              color: '#344054', fontFamily: F, cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#F9FAFB')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#FFFFFF')}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            style={{
              height: '36px', padding: '0 18px',
              background: '#1FA97A', color: '#fff', border: 'none',
              borderRadius: '5px', fontSize: '13px', fontWeight: 600,
              fontFamily: F, cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#178F67')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#1FA97A')}
          >
            Apply
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
