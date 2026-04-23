import { useCallback, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { FileUp, Files, Flag, Scissors, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { SkipToMainContent } from '../components/SkipToMainContent';
import { UI_FONT_STACK as F } from '../tokens/typography';

type WorkflowTab = 'recent' | 'flagged';

const RECENT_COUNT = 3;
const FLAGGED_COUNT = 1;

export function UploadSplit() {
  const navigate = useNavigate();
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<WorkflowTab>('recent');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const openFilePicker = useCallback(() => fileInputRef.current?.click(), []);

  const onFile = useCallback((files: FileList | null) => {
    const f = files?.[0];
    if (f && f.type === 'application/pdf') setFileName(f.name);
    else if (f) setFileName(null);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: F, background: '#F5F7FA', overflow: 'hidden' }}>
      <SkipToMainContent />
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopHeader onNewRequest={() => navigate('/')} />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
          <aside
            aria-label="Upload and split navigation"
            style={{
              width: 208,
              flexShrink: 0,
              boxSizing: 'border-box',
              borderRight: '1px solid #E4E7EC',
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              padding: 'var(--space-4) var(--space-3)',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(145deg, #E6F7F1 0%, #D1Fae5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Scissors size={18} color="#1FA97A" strokeWidth={1.85} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#101828', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  Upload &amp; split
                </div>
                <div style={{ fontSize: 11, color: '#667085', marginTop: 2, lineHeight: 1.3 }}>PDF intake</div>
              </div>
            </div>

            <nav aria-label="Library views" style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
              <button
                type="button"
                aria-current={tab === 'recent' ? 'true' : undefined}
                onClick={() => setTab('recent')}
                style={railTabStyle(tab === 'recent')}
                onMouseEnter={(e) => {
                  if (tab !== 'recent') (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  if (tab !== 'recent') (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <Files size={16} strokeWidth={1.85} style={{ flexShrink: 0, opacity: tab === 'recent' ? 1 : 0.72 }} />
                <span style={{ flex: 1, textAlign: 'left' }}>Recent uploads</span>
                <span style={countPillStyle(tab === 'recent', false)}>{RECENT_COUNT}</span>
              </button>
              <button
                type="button"
                aria-current={tab === 'flagged' ? 'true' : undefined}
                onClick={() => setTab('flagged')}
                style={railTabStyle(tab === 'flagged')}
                onMouseEnter={(e) => {
                  if (tab !== 'flagged') (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  if (tab !== 'flagged') (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <Flag size={16} strokeWidth={1.85} style={{ flexShrink: 0, opacity: tab === 'flagged' ? 1 : 0.72 }} />
                <span style={{ flex: 1, textAlign: 'left' }}>Flagged</span>
                <span style={countPillStyle(tab === 'flagged', true)}>{FLAGGED_COUNT}</span>
              </button>
            </nav>
          </aside>

          <main id="main-content" tabIndex={-1} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', background: '#F5F7FA' }}>
            <div
              style={{
                flex: '1 1 0%',
                overflowY: 'auto',
                padding: 'var(--space-4) var(--space-4) var(--layout-sticky-clearance)',
                boxSizing: 'border-box',
              }}
            >
              <header style={{ marginBottom: 'var(--space-3)' }}>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#101828', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                  Upload &amp; split
                </h1>
                <p style={{ margin: '6px 0 0', fontSize: 13, color: '#667085', lineHeight: 1.5, maxWidth: '52ch' }}>
                  Linear intake for PDFs: upload once, review the draft split, then refine boundaries before handoff.
                </p>
              </header>

              <input
                ref={fileInputRef}
                id={inputId}
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => onFile(e.target.files)}
              />

              <ol
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                }}
              >
                <li
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 12,
                    background: '#FFFFFF',
                    border: '1px solid #E4E7EC',
                    boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 14, marginBottom: 'var(--space-3)' }}>
                    <div
                      aria-hidden
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 999,
                        background: '#ECFDF5',
                        color: '#065F46',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      1
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ marginTop: 2, flexShrink: 0 }}>
                        <FileUp size={18} color="#1FA97A" strokeWidth={1.85} />
                      </div>
                      <div>
                        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#101828', lineHeight: 1.35 }}>Upload PDF</h2>
                        <p style={{ margin: '6px 0 0', fontSize: 13, color: '#667085', lineHeight: 1.55, maxWidth: '62ch' }}>
                          One file per run — drop, browse, then run processing.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload PDF — drop a file here or press Enter to browse"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openFilePicker();
                      }
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      onFile(e.dataTransfer.files);
                    }}
                    onClick={openFilePicker}
                    style={{
                      borderRadius: 10,
                      border: `1.5px dashed ${isDragging ? '#1FA97A' : '#D0D5DD'}`,
                      background: isDragging ? '#F0FDF9' : '#F9FAFB',
                      padding: 'var(--space-3)',
                      cursor: 'pointer',
                      transition: 'background 0.18s ease-out, border-color 0.18s ease-out, box-shadow 0.18s ease-out',
                      boxShadow: isDragging ? '0 0 0 3px rgba(31, 169, 122, 0.12)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '1px solid #E4E7EC',
                        }}
                      >
                        <FileUp size={20} color="#667085" strokeWidth={1.75} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>Drop PDF here or browse</div>
                        <div style={{ fontSize: 12, color: '#667085', marginTop: 3, lineHeight: 1.45 }}>
                          <strong style={{ fontWeight: 600, color: '#344054' }}>application/pdf</strong>
                          <span aria-hidden> · </span>25 MB max (demo)
                        </div>
                        {fileName && (
                          <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: '#1FA97A' }}>Selected: {fileName}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
                <StepCard
                  step={2}
                  icon={<Sparkles size={18} color="#1FA97A" strokeWidth={1.85} />}
                  title="Processing / file ready"
                  body="We prepare your split draft before you refine boundaries."
                />
                <StepCard
                  step={3}
                  icon={<SlidersHorizontal size={18} color="#1FA97A" strokeWidth={1.85} />}
                  title="Refine"
                  body="Tune page ranges, merge or split sections, and flag outliers for a quick second review."
                />
              </ol>

              {tab === 'flagged' && (
                <section
                  aria-label="Flagged uploads"
                  style={{
                    marginTop: 'var(--space-4)',
                    padding: 'var(--space-3)',
                    borderRadius: 10,
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#B45309' }}>Flagged items need review</div>
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: '#92400E', lineHeight: 1.5, maxWidth: '60ch' }}>
                    You have <strong style={{ fontWeight: 700 }}>{FLAGGED_COUNT}</strong> upload{FLAGGED_COUNT === 1 ? '' : 's'} with validation warnings.
                    Open the Flagged tab in the rail to resolve before batch publish.
                  </p>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function railTabStyle(active: boolean): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '10px 10px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontFamily: F,
    fontSize: 12,
    fontWeight: active ? 600 : 500,
    color: active ? '#101828' : '#475467',
    background: active ? '#F2F4F7' : 'transparent',
    boxShadow: active ? 'inset 0 0 0 1px #E4E7EC' : 'none',
    transition: 'background 0.15s ease-out, color 0.15s ease-out, box-shadow 0.15s ease-out',
  };
}

function countPillStyle(active: boolean, warning: boolean): CSSProperties {
  const bg = warning ? (active ? '#FEF3C7' : '#FFFBEB') : active ? '#E6F7F1' : '#F9FAFB';
  const color = warning ? '#B45309' : '#0E7A54';
  const border = warning ? '1px solid #FCD34D' : '1px solid #BBF7D0';
  return {
    fontSize: 11,
    fontWeight: 700,
    minWidth: 22,
    padding: '2px 7px',
    borderRadius: 999,
    background: bg,
    color,
    border,
    lineHeight: 1.2,
    textAlign: 'center',
  };
}

function StepCard({
  step,
  icon,
  title,
  body,
}: {
  step: number;
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li
      style={{
        display: 'flex',
        gap: 14,
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 12,
        background: '#FFFFFF',
        border: '1px solid #E4E7EC',
        boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
      }}
    >
      <div
        aria-hidden
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          background: '#ECFDF5',
          color: '#065F46',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {step}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ marginTop: 2, flexShrink: 0 }}>{icon}</div>
        <div>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#101828', lineHeight: 1.35 }}>{title}</h2>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#667085', lineHeight: 1.55, maxWidth: '62ch' }}>{body}</p>
        </div>
      </div>
    </li>
  );
}
