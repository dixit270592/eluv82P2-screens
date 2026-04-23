import { PieChart, Pie, Cell } from 'recharts';
import { CheckCircle2, AlertCircle, FileText, TrendingUp } from 'lucide-react';

import { UI_FONT_STACK as F } from '../tokens/typography';

export interface LineItem {
  id: string;
  item: string;
  vendor: string;
  quantity: number;
  cost: number;
  subtotal: number;
  glAccount: string;
}

interface RightPanelProps {
  lineItems: LineItem[];
  prStatus?: string;
}

const BUDGET_TOTAL = 150000;
const EXISTING_COMMITTED = 24000;

const activity = [
  { icon: FileText, bg: '#E6F7F1', color: '#1FA97A', msg: 'Purchase request created', actor: 'You', time: 'Just now' },
  { icon: CheckCircle2, bg: '#F5F7FA', color: '#667085', msg: 'Vendor Dell Inc. pre-approved', actor: 'Procurement', time: '2h ago' },
  { icon: TrendingUp, bg: '#F5F7FA', color: '#667085', msg: 'Q1 2026 budget period activated', actor: 'Finance Team', time: 'Yesterday' },
  { icon: CheckCircle2, bg: '#F5F7FA', color: '#667085', msg: 'Department budget reviewed', actor: 'Admin', time: '3 days ago' },
  { icon: AlertCircle, bg: '#FEF9EC', color: '#D97706', msg: 'Approval threshold set to $10K', actor: 'Finance Team', time: 'Jan 15' },
];

const approvals = [
  { name: 'Dept. Manager', user: 'Sarah Chen' },
  { name: 'Finance Review', user: 'Michael Torres' },
  { name: 'CFO Approval', user: 'Amanda Walsh' },
];

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function RightPanel({ lineItems, prStatus = 'draft' }: RightPanelProps) {
  const currentTotal = lineItems.reduce((s, i) => s + i.subtotal, 0);
  const committed = EXISTING_COMMITTED + currentTotal;
  const available = BUDGET_TOTAL - committed;
  const usedPct = Math.min((committed / BUDGET_TOTAL) * 100, 100);

  const pieData = [
    { name: 'Used', value: committed, color: '#1FA97A' },
    { name: 'Available', value: Math.max(available, 0), color: '#EEF1F5' },
  ];

  const submitted = prStatus === 'submitted';

  return (
    <div
      style={{
        width: '292px',
        flexShrink: 0,
        background: '#F5F7FA',
        borderLeft: '1px solid #E4E7EC',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Budget Insights ── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #EEF1F5', padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#101828', fontFamily: F }}>Budget Insights</span>
          <span style={{ fontSize: '11px', color: '#1FA97A', fontFamily: F, fontWeight: 500, cursor: 'pointer' }}>Q1 2026</span>
        </div>

        {/* Donut + numbers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Donut */}
          <div style={{ position: 'relative', width: '104px', height: '104px', flexShrink: 0 }}>
            <PieChart width={104} height={104}>
              <Pie
                data={pieData}
                cx={52}
                cy={52}
                innerRadius={34}
                outerRadius={48}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                strokeWidth={0}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            {/* Center label */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                overflow: 'visible',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#101828', fontFamily: F, lineHeight: 1, whiteSpace: 'nowrap' }}>
                {usedPct.toFixed(0)}%
              </span>
              <span style={{ fontSize: '9px', color: '#98A2B3', fontFamily: F, marginTop: '2px', whiteSpace: 'nowrap' }}>used</span>
            </div>
          </div>

          {/* Numbers */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#98A2B3', fontFamily: F, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                Total Budget
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#101828', fontFamily: F }}>
                {fmt(BUDGET_TOTAL)}
              </div>
            </div>
            <div
              style={{
                background: '#F9FAFB',
                border: '1px solid #EEF1F5',
                borderRadius: '6px',
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
              }}
            >
              <BRow label="Committed" value={fmt(committed)} color="#1FA97A" />
              <div style={{ height: '1px', background: '#EEF1F5' }} />
              <BRow label="Available" value={fmt(Math.max(available, 0))} color={available < 0 ? '#F04438' : '#344054'} />
            </div>
          </div>
        </div>

        {/* Meta */}
        <div
          style={{
            marginTop: '12px',
            background: '#F9FAFB',
            border: '1px solid #EEF1F5',
            borderRadius: '6px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <MRow label="Department" value="Engineering" />
          <MRow label="Cost Center" value="ENG-2026-001" />
          <MRow label="Budget Owner" value="Sarah Chen" />
        </div>
      </section>

      {/* ── Approval Workflow ── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid #EEF1F5', padding: '18px 20px' }}>
        <div style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#101828', fontFamily: F }}>Approval Workflow</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {approvals.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px' }}>
              {/* Circle + line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `2px solid ${submitted ? '#1FA97A' : '#E4E7EC'}`,
                    background: submitted ? '#E6F7F1' : '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s',
                  }}
                >
                  <span style={{ fontSize: '10px', fontWeight: 700, color: submitted ? '#1FA97A' : '#98A2B3', fontFamily: F }}>
                    {i + 1}
                  </span>
                </div>
                {i < approvals.length - 1 && (
                  <div style={{ width: '1px', height: '24px', background: submitted ? '#1FA97A' : '#E4E7EC', transition: 'background 0.3s' }} />
                )}
              </div>
              {/* Text */}
              <div style={{ paddingTop: '3px', paddingBottom: i < approvals.length - 1 ? '16px' : '0' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#101828', fontFamily: F }}>{step.name}</div>
                <div style={{ fontSize: '11px', color: '#667085', fontFamily: F, marginTop: '2px' }}>{step.user}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Activity Feed ── */}
      <section style={{ background: '#FFFFFF', padding: '18px 20px', flex: 1 }}>
        <div style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#101828', fontFamily: F }}>Activity</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activity.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={12} color={item.color} strokeWidth={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', color: '#101828', fontFamily: F, lineHeight: 1.45 }}>{item.msg}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                    <span style={{ fontSize: '11px', color: '#667085', fontFamily: F }}>{item.actor}</span>
                    <span style={{ fontSize: '11px', color: '#D0D5DD' }}>·</span>
                    <span style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F }}>{item.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function BRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '11px', color: '#667085', fontFamily: F }}>{label}</span>
      <span style={{ fontSize: '12px', fontWeight: 700, color, fontFamily: F }}>{value}</span>
    </div>
  );
}

function MRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '11px', color: '#98A2B3', fontFamily: F }}>{label}</span>
      <span style={{ fontSize: '11px', fontWeight: 600, color: '#344054', fontFamily: F }}>{value}</span>
    </div>
  );
}