import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Lightbulb } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { TopHeader } from '../../components/TopHeader';
import { SkipToMainContent } from '../../components/SkipToMainContent';
import { WorkflowRuleEditor } from '../../components/setup/WorkflowRuleEditor';
import { WorkflowRuleNavigator } from '../../components/setup/WorkflowRuleNavigator';
import { PrOptionHelp } from '../../components/setup/PrOptionHelp';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  WORKFLOW_FIELD_VALUES,
  cloneWorkflow,
  createEmptyTrigger,
  createSeedWorkflowTriggers,
  formatUserSummary,
  matchTrigger,
  type WorkflowTrigger,
} from '../../data/approvalWorkflowSetup';
import { WORKFLOW_HELP } from '../../data/approvalWorkflowHelp';
import { P2P_BRAND } from '../../tokens/brand';
import { UI_FONT_STACK as F } from '../../tokens/typography';

export function ApprovalWorkflowSetup() {
  const [saved, setSaved] = useState<WorkflowTrigger[]>(() => createSeedWorkflowTriggers());
  const [draft, setDraft] = useState<WorkflowTrigger[]>(() => createSeedWorkflowTriggers());
  const [selectedId, setSelectedId] = useState(() => createSeedWorkflowTriggers()[0]?.id ?? '');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [testRequestType, setTestRequestType] = useState('CapEx');

  const isDirty = JSON.stringify(saved) !== JSON.stringify(draft);

  const selectedRule = useMemo(
    () => draft.find((t) => t.id === selectedId) ?? draft[0],
    [draft, selectedId],
  );

  const selectedIndex = useMemo(
    () => (selectedRule ? draft.findIndex((t) => t.id === selectedRule.id) : 0),
    [draft, selectedRule],
  );

  useEffect(() => {
    if (!draft.some((t) => t.id === selectedId) && draft[0]) {
      setSelectedId(draft[0].id);
    }
  }, [draft, selectedId]);

  const matchedTrigger = useMemo(() => {
    return draft.find((t) => matchTrigger(t, { requestType: testRequestType }));
  }, [draft, testRequestType]);

  const updateRule = (next: WorkflowTrigger) => {
    setDraft((prev) => prev.map((t) => (t.id === next.id ? next : t)));
  };

  const addRule = () => {
    const next = createEmptyTrigger();
    setDraft((prev) => [...prev, next]);
    setSelectedId(next.id);
  };

  const removeRule = (id: string) => {
    setDraft((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (selectedId === id && next[0]) setSelectedId(next[0].id);
      return next;
    });
  };

  const handleSave = () => {
    setSaved(cloneWorkflow(draft));
    setShowSavedToast(true);
    window.setTimeout(() => setShowSavedToast(false), 2400);
  };

  const handleCancel = () => {
    const restored = cloneWorkflow(saved);
    setDraft(restored);
    if (!restored.some((t) => t.id === selectedId) && restored[0]) {
      setSelectedId(restored[0].id);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F5F7FA', fontFamily: F, overflow: 'hidden' }}>
      <SkipToMainContent />
      <Sidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopHeader />

        <main
          id="main-content"
          tabIndex={-1}
          style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 28px', minWidth: 0 }}
        >
          <nav aria-label="Breadcrumb" style={{ marginBottom: '16px' }}>
            <ol
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                margin: 0,
                padding: 0,
                listStyle: 'none',
                fontSize: '12px',
                color: '#64748B',
              }}
            >
              <li>Setup &amp; configuration</li>
              <li aria-hidden>
                <ChevronRight size={14} color="#CBD5E1" />
              </li>
              <li>Transaction Setup</li>
              <li aria-hidden>
                <ChevronRight size={14} color="#CBD5E1" />
              </li>
              <li style={{ color: P2P_BRAND.primaryStrong, fontWeight: 600 }}>Approval Workflow Setup</li>
            </ol>
          </nav>

          <header style={{ marginBottom: '20px' }}>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Approval Workflow Setup
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748B', maxWidth: '60ch', lineHeight: 1.5 }}>
              Pick a rule on the left, configure when it applies and who it routes to. Rules are checked in order —
              first match wins.
            </p>
          </header>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E4E7EC',
              borderRadius: '12px',
              boxShadow: '0 1px 4px rgba(16,24,40,0.04)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 'min(640px, calc(100vh - 220px))',
            }}
          >
            <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
              <WorkflowRuleNavigator
                rules={draft}
                selectedId={selectedRule?.id ?? ''}
                onSelect={setSelectedId}
                onAdd={addRule}
              />

              {selectedRule ? (
                <WorkflowRuleEditor
                  rule={selectedRule}
                  index={selectedIndex}
                  canRemove={draft.length > 1}
                  onChange={updateRule}
                  onRemove={() => removeRule(selectedRule.id)}
                />
              ) : null}
            </div>

            <footer
              style={{
                borderTop: '1px solid #EEF1F5',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap',
                background: '#FAFBFC',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setTestOpen(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    border: '1px solid #E4E7EC',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: F,
                  }}
                >
                  <Lightbulb size={16} color="#F59E0B" aria-hidden />
                  Test workflow
                </button>
                <PrOptionHelp helpId="test" text={WORKFLOW_HELP.test} />
                {showSavedToast ? (
                  <span style={{ fontSize: '12px', fontWeight: 600, color: P2P_BRAND.primaryStrong }}>Saved</span>
                ) : isDirty ? (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#B45309',
                      background: '#FFFBEB',
                      border: '1px solid #FDE68A',
                      borderRadius: '999px',
                      padding: '4px 10px',
                    }}
                  >
                    Unsaved changes
                  </span>
                ) : (
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                    {draft.length} rule{draft.length === 1 ? '' : 's'}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={!isDirty}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #E4E7EC',
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    color: isDirty ? '#475569' : '#94A3B8',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isDirty ? 'pointer' : 'not-allowed',
                    fontFamily: F,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isDirty}
                  style={{
                    padding: '8px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    background: isDirty ? P2P_BRAND.primary : '#94A3B8',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: isDirty ? 'pointer' : 'not-allowed',
                    fontFamily: F,
                    boxShadow: isDirty ? '0 1px 2px rgba(31, 169, 122, 0.28)' : 'none',
                  }}
                >
                  Save
                </button>
              </div>
            </footer>
          </div>
        </main>
      </div>

      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent style={{ fontFamily: F, maxWidth: '440px' }}>
          <DialogHeader>
            <DialogTitle style={{ fontSize: '16px', fontWeight: 600 }}>Test workflow</DialogTitle>
          </DialogHeader>
          <div style={{ padding: '4px 0 8px' }}>
            <label
              htmlFor="test-request-type"
              style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}
            >
              Sample request type
            </label>
            <select
              id="test-request-type"
              value={testRequestType}
              onChange={(e) => setTestRequestType(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px',
                border: '1px solid #E4E7EC',
                borderRadius: '8px',
                fontSize: '13px',
                fontFamily: F,
              }}
            >
              {(WORKFLOW_FIELD_VALUES['Request Type'] ?? []).map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            <div
              style={{
                marginTop: '16px',
                padding: '14px',
                borderRadius: '10px',
                background: matchedTrigger ? P2P_BRAND.surface : '#F8FAFC',
                border: `1px solid ${matchedTrigger ? P2P_BRAND.surfaceBorder : '#E4E7EC'}`,
              }}
            >
              {matchedTrigger ? (
                <>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600, color: P2P_BRAND.primaryStrong }}>
                    Match found — Rule {draft.findIndex((t) => t.id === matchedTrigger.id) + 1}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.45 }}>
                    Routes to{' '}
                    {matchedTrigger.actions[0]?.actionType === 'Route to user'
                      ? formatUserSummary(matchedTrigger.actions[0].userIds)
                      : matchedTrigger.actions[0]?.actionType}
                  </p>
                </>
              ) : (
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  No trigger matches this request type. It would fall through to default routing.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setTestOpen(false)}
              style={{
                padding: '9px 16px',
                border: 'none',
                borderRadius: '8px',
                background: P2P_BRAND.primary,
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: F,
              }}
            >
              Done
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
