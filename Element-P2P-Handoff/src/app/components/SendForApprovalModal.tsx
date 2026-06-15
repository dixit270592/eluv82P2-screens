import { useState } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

import { UI_FONT_STACK as F } from '../tokens/typography';

interface Approver {
  name: string;
  level: number;
  status: string;
}

interface SendForApprovalModalProps {
  onClose: () => void;
  onSend: (selectedApprovers: string[]) => void;
}

const APPROVAL_LEVELS: Approver[] = [
  { name: 'Elements Admin', level: 1, status: 'Pending' },
];

export function SendForApprovalModal({ onClose, onSend }: SendForApprovalModalProps) {
  const [selectedApprovers, setSelectedApprovers] = useState<Set<string>>(new Set(['Elements Admin']));

  const handleToggleApprover = (name: string) => {
    const newSelected = new Set(selectedApprovers);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedApprovers(newSelected);
  };

  const handleSend = () => {
    onSend(Array.from(selectedApprovers));
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
        zIndex: 200, padding: '20px', backdropFilter: 'blur(2px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ duration: 0.22 }}
        style={{
          width: '640px', maxWidth: '96vw',
          background: '#FFFFFF', borderRadius: '8px',
          boxShadow: '0 10px 40px rgba(16,24,40,0.2)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid #EEF1F5', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#101828', fontFamily: F }}>
              Send For Approval
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

        {/* Body - Table */}
        <div style={{ padding: '18px 22px' }}>
          <div style={{ border: '1px solid #E4E7EC', borderRadius: '6px', overflow: 'hidden' }}>
            {/* Table Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '10px', padding: '10px 14px', background: '#F9FAFB', borderBottom: '1px solid #E4E7EC' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#667085', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Level</span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#667085', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approvers</span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: '#667085', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</span>
            </div>

            {/* Table Rows */}
            {APPROVAL_LEVELS.map((approver, index) => (
              <div key={index}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '10px', padding: '14px', borderBottom: index < APPROVAL_LEVELS.length - 1 ? '1px solid #F2F4F7' : 'none', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#101828', fontFamily: F }}>Level {approver.level}</div>
                    {index === 0 && (
                      <div style={{ fontSize: '11px', color: '#667085', fontFamily: F, marginTop: '2px' }}>Note: At least one user must be selected</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => handleToggleApprover(approver.name)}>
                    <div
                      style={{
                        width: '16px', height: '16px', borderRadius: '3px',
                        border: selectedApprovers.has(approver.name) ? 'none' : '1.5px solid #D0D5DD',
                        background: selectedApprovers.has(approver.name) ? '#1FA97A' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {selectedApprovers.has(approver.name) && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: '13px', color: '#344054', fontFamily: F }}>{approver.name}</span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#667085', fontFamily: F }}>{approver.status}</span>
                </div>
              </div>
            ))}
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
            onClick={handleSend}
            disabled={selectedApprovers.size === 0}
            style={{
              height: '36px', padding: '0 18px',
              background: selectedApprovers.size === 0 ? '#98A2B3' : '#1FA97A',
              color: '#fff', border: 'none',
              borderRadius: '5px', fontSize: '13px', fontWeight: 600,
              fontFamily: F, cursor: selectedApprovers.size === 0 ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { if (selectedApprovers.size > 0) (e.currentTarget as HTMLElement).style.background = '#178F67'; }}
            onMouseLeave={(e) => { if (selectedApprovers.size > 0) (e.currentTarget as HTMLElement).style.background = '#1FA97A'; }}
          >
            Send
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
