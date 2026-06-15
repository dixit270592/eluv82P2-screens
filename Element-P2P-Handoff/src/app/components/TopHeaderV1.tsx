import { ChevronRight, Bell, Search, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import logoSvg from '../../imports/Logo-for-Figma.svg';

import { UI_FONT_STACK as F } from '../tokens/typography';

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  draft: { bg: '#F2F4F7', color: '#667085', label: 'Draft' },
  submitted: { bg: '#FEF3C7', color: '#D97706', label: 'Pending Approval' },
  approved: { bg: '#ECFDF5', color: '#059669', label: 'Approved' },
  unsubmitted: { bg: '#F2F4F7', color: '#667085', label: 'Draft' },
};

interface TopHeaderV1Props {
  onNewRequest?: () => void;
  prStatus?: string;
  prId?: string;
}

export function TopHeaderV1({ onNewRequest, prStatus = 'draft', prId }: TopHeaderV1Props) {
  const navigate = useNavigate();
  const sc = statusConfig[prStatus] || statusConfig.draft;

  return (
    <div
      style={{
        height: '58px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E4E7EC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0,
        gap: '16px',
      }}
    >
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
        <span
          onClick={() => navigate('/')}
          style={{ fontSize: '13px', color: '#667085', fontFamily: F, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s' }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#1FA97A')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#667085')}
        >
          Home
        </span>
        <ChevronRight size={13} color="#D0D5DD" strokeWidth={2} />
        <span
          onClick={() => navigate('/')}
          style={{ fontSize: '13px', color: '#667085', fontFamily: F, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.15s' }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#1FA97A')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#667085')}
        >
          Purchase Requests
        </span>
        {prId && (
          <>
            <ChevronRight size={13} color="#D0D5DD" strokeWidth={2} />
            <span style={{ fontSize: '13px', color: '#101828', fontFamily: F, fontWeight: 600, whiteSpace: 'nowrap' }}>{prId}</span>
            <div
              style={{
                marginLeft: '6px', padding: '2px 9px', borderRadius: '100px',
                fontSize: '11px', fontWeight: 600, fontFamily: F,
                background: sc.bg, color: sc.color, whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {sc.label}
            </div>
          </>
        )}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {/* Search */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            height: '34px', padding: '0 11px',
            background: '#F5F7FA', border: '1px solid #E4E7EC', borderRadius: '6px',
          }}
        >
          <Search size={13} color="#98A2B3" strokeWidth={2} />
          <input
            placeholder="Search..."
            style={{
              border: 'none', background: 'transparent', fontSize: '13px',
              color: '#101828', fontFamily: F, outline: 'none', width: '130px',
            }}
          />
        </div>

        {/* Bell */}
        <div
          style={{
            position: 'relative', width: '34px', height: '34px', borderRadius: '6px',
            border: '1px solid #E4E7EC', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', background: '#FFFFFF',
          }}
        >
          <Bell size={15} color="#667085" strokeWidth={1.8} />
          <div
            style={{
              position: 'absolute', top: '5px', right: '5px',
              width: '7px', height: '7px',
              background: '#F04438', borderRadius: '50%', border: '1.5px solid #FFFFFF',
            }}
          />
        </div>

        {/* New Request */}
        {onNewRequest && (
          <button
            onClick={onNewRequest}
            style={{
              height: '34px', padding: '0 16px',
              background: '#1FA97A', color: '#FFFFFF', border: 'none', borderRadius: '6px',
              fontSize: '13px', fontWeight: 600, fontFamily: F,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'background 0.15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#178F67')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#1FA97A')}
          >
            <Plus size={14} strokeWidth={2.5} />
            New Request
          </button>
        )}

        {/* User */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            cursor: 'pointer', padding: '4px 8px', borderRadius: '6px',
            border: '1px solid #E4E7EC', background: '#FFFFFF',
          }}
        >
          <div
            style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #1FA97A, #0E7A54)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <span style={{ color: '#fff', fontSize: '10px', fontWeight: 700, fontFamily: F }}>JD</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#101828', fontFamily: F, lineHeight: 1.2 }}>John Davidson</span>
            <span style={{ fontSize: '10px', color: '#98A2B3', fontFamily: F, lineHeight: 1.2 }}>Procurement Lead</span>
          </div>
          <ChevronDown size={12} color="#98A2B3" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
