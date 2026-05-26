import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { SkipToMainContent } from '../components/SkipToMainContent';
import { UI_FONT_STACK as F } from '../tokens/typography';
import {
  LayoutDashboard,
  ListOrdered,
  FileText,
  ChevronRight,
  ExternalLink,
  Presentation,
  Link2,
  Check,
} from 'lucide-react';

/** Edit these bullets to match what you implemented for the client. */
const PRESENTATION_SECTIONS: {
  id: string;
  title: string;
  summary: string;
  updates: string[];
  path: string;
  demoLabel: string;
}[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    summary: 'Executive view, analytics, and configuration aligned with the latest feedback.',
    updates: [
      'Refresh this list with the specific dashboard changes you shipped (widgets, copy, layout).',
      'Add a second bullet per major client ask so reviewers can map feedback to screens.',
    ],
    path: '/',
    demoLabel: 'Open Dashboard',
  },
  {
    id: 'purchase-requests',
    title: 'Purchase requests list',
    summary: 'List experience, filters, and navigation into request detail.',
    updates: [
      'Starred filter, status chips, and row navigation into PR detail.',
      'New Request modal creates a PR and routes to /pr/:id with header state.',
    ],
    path: '/purchase-requests',
    demoLabel: 'Open list',
  },
  {
    id: 'pr-detail',
    title: 'Purchase request detail',
    summary: 'Full PR workspace (header, lines, actions) — primary workflow surface.',
    updates: [
      'PR workflow header with role preview (requester, approver, PO), print, and star.',
      'Line items, RFQ tab, history panel, localStorage persistence, and approval actions.',
    ],
    path: '/pr/PR-26016-774',
    demoLabel: 'Open sample PR',
  },
];

/** Full URL to this walkthrough (works on the live site and on localhost). */
function getPresentationPageUrl(): string {
  if (typeof window === 'undefined') return '';
  const base = import.meta.env.BASE_URL;
  return new URL('presentation', `${window.location.origin}${base}`).href;
}

export function ClientPresentation() {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(PRESENTATION_SECTIONS[0].id);
  const [linkCopied, setLinkCopied] = useState(false);

  const copyPresentationLink = useCallback(async () => {
    const url = getPresentationPageUrl();
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      window.prompt('Copy this link for your client:', url);
    }
  }, []);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveId(e.target.id);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: 0 },
    );
    PRESENTATION_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(165deg, #0f172a 0%, #1e293b 42%, #0f172a 100%)',
        color: '#e2e8f0',
        fontFamily: F,
      }}
    >
      <SkipToMainContent />
      {/* Side nav — fixed for live demo navigation */}
      <aside
        style={{
          width: 260,
          flexShrink: 0,
          padding: '28px 20px',
          borderRight: '1px solid rgba(148,163,184,0.15)',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          background: 'rgba(15,23,42,0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #2d5bff 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Presentation size={22} color="#fff" strokeWidth={1.8} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', color: '#f8fafc' }}>
              Client walkthrough
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Element P2P</div>
          </div>
        </div>
        <p style={{ fontSize: 12, lineHeight: 1.5, color: '#94a3b8', margin: '0 0 12px' }}>
          Use this page as your single entry URL. Jump to any area, then open the live screen.
        </p>
        <div
          style={{
            padding: '12px',
            borderRadius: 12,
            background: 'rgba(45,91,255,0.1)',
            border: '1px solid rgba(45,91,255,0.25)',
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Link2 size={14} color="#93c5fd" />
            Share with your client
          </div>
          <p style={{ fontSize: 11, lineHeight: 1.45, color: '#94a3b8', margin: '0 0 10px' }}>
            After you publish the site (see <strong style={{ color: '#cbd5e1' }}>SHARE-WITH-CLIENT.txt</strong> in the project folder), open this page on the live site and tap below to copy the exact link.
          </p>
          <button
            type="button"
            onClick={copyPresentationLink}
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 12px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontFamily: F,
              fontSize: 12,
              fontWeight: 600,
              color: '#0f172a',
              background: '#e2e8f0',
            }}
          >
            {linkCopied ? <Check size={16} color="#15803d" /> : <Link2 size={16} />}
            {linkCopied ? 'Copied' : 'Copy presentation link'}
          </button>
          <p
            title={getPresentationPageUrl()}
            style={{
              fontSize: 10,
              color: '#64748b',
              margin: '8px 0 0',
              wordBreak: 'break-all',
              lineHeight: 1.35,
            }}
          >
            {getPresentationPageUrl() || '…'}
          </p>
        </div>
        <nav aria-label="Presentation sections" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {PRESENTATION_SECTIONS.map((s) => {
            const active = activeId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                aria-current={active ? 'true' : undefined}
                onClick={() => scrollToSection(s.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: F,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? '#f8fafc' : '#cbd5e1',
                  background: active ? 'rgba(45,91,255,0.22)' : 'transparent',
                  boxShadow: active ? 'inset 0 0 0 1px rgba(45,91,255,0.35)' : 'none',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <ChevronRight
                  size={16}
                  style={{
                    opacity: active ? 1 : 0.45,
                    transform: active ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
                {s.title}
              </button>
            );
          })}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: 20 }}>
          <Link
            to="/"
            style={{
              fontSize: 12,
              color: '#93c5fd',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Skip guide — go to app home
            <ExternalLink size={14} />
          </Link>
        </div>
      </aside>

      <main id="main-content" tabIndex={-1} style={{ flex: 1, padding: '40px 48px 64px', maxWidth: 920 }}>
        <header style={{ marginBottom: 40 }}>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#f8fafc',
              margin: '0 0 12px',
              lineHeight: 1.15,
            }}
          >
            Updates ready for review
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: '#94a3b8', margin: 0, maxWidth: 62 }}>
            Structured tour of the latest build. During the session, use the left rail to move between topics,
            then use each section’s button to open the real UI in context.
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {PRESENTATION_SECTIONS.map((s) => (
            <section
              key={s.id}
              id={s.id}
              style={{
                scrollMarginTop: 24,
                padding: 28,
                borderRadius: 16,
                background: 'rgba(30,41,59,0.55)',
                border: '1px solid rgba(148,163,184,0.12)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(45,91,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {s.id === 'dashboard' && <LayoutDashboard size={22} color="#93c5fd" strokeWidth={1.8} />}
                    {s.id === 'purchase-requests' && <ListOrdered size={22} color="#93c5fd" strokeWidth={1.8} />}
                    {s.id === 'pr-detail' && <FileText size={22} color="#93c5fd" strokeWidth={1.8} />}
                  </div>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: '0 0 8px' }}>{s.title}</h2>
                    <p style={{ fontSize: 14, lineHeight: 1.55, color: '#94a3b8', margin: '0 0 14px' }}>{s.summary}</p>
                    <ul style={{ margin: 0, paddingLeft: 18, color: '#cbd5e1', fontSize: 13, lineHeight: 1.65 }}>
                      {s.updates.map((u, i) => (
                        <li key={`${s.id}-${i}`}>{u}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(s.path)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 18px',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: F,
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#fff',
                    background: 'linear-gradient(135deg, #2d5bff 0%, #4f46e5 100%)',
                    boxShadow: '0 8px 24px rgba(45,91,255,0.35)',
                    flexShrink: 0,
                  }}
                >
                  {s.demoLabel}
                  <ExternalLink size={16} />
                </button>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
