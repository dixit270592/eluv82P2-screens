import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Paperclip,
  Pencil,
  MessageCircle,
  ChevronDown,
  Upload,
  X,
} from 'lucide-react';

import { UI_FONT_STACK as F } from '../tokens/typography';

export type HistoryCategory =
  | 'all'
  | 'data_entry'
  | 'revisions'
  | 'approvals'
  | 'po_processing'
  | 'receipts'
  | 'conversations'
  | 'invoicing';

export type HistoryStatus = 'error' | 'success' | 'neutral';

export interface HistoryActivityItem {
  id: string;
  initials: string;
  bg: string;
  name: string;
  /** Short action line, e.g. "Invoice Created" */
  actionLabel: string;
  /** Extra context below the action */
  detail?: string;
  time: string;
  category: Exclude<HistoryCategory, 'all'>;
  status: HistoryStatus;
}

type PanelMode = 'feed' | 'upload' | 'note' | 'conversation';

const FILTER_OPTIONS: { value: HistoryCategory; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'data_entry', label: 'Data Entry' },
  { value: 'revisions', label: 'Revisions' },
  { value: 'approvals', label: 'Approvals' },
  { value: 'po_processing', label: 'PO Processing' },
  { value: 'receipts', label: 'Receipts' },
  { value: 'conversations', label: 'Conversations' },
  { value: 'invoicing', label: 'Invoicing' },
];

const MOCK_USERS: { id: string; name: string; initials: string }[] = [
  { id: 'u1', name: 'Simon L.', initials: 'SL' },
  { id: 'u2', name: 'John Sample', initials: 'JS' },
  { id: 'u3', name: 'David Connor', initials: 'DC' },
  { id: 'u4', name: 'Maria Chen', initials: 'MC' },
  { id: 'u5', name: 'Alex Rivera', initials: 'AR' },
];

const MAX_FILES = 10;
const MAX_BYTES = 5 * 1024 * 1024;

function StatusDot({ status }: { status: HistoryStatus }) {
  const color = status === 'error' ? '#F04438' : status === 'success' ? '#12B76A' : '#98A2B3';
  return (
    <span
      title={status === 'error' ? 'Issue' : status === 'success' ? 'Completed' : 'In progress'}
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

function HistoryPanelHeader({
  filter,
  onFilterChange,
  filterOpen,
  onFilterOpenChange,
  mode,
  onModeAttachment,
  onModeNote,
  onModeConversation,
}: {
  filter: HistoryCategory;
  onFilterChange: (v: HistoryCategory) => void;
  filterOpen: boolean;
  onFilterOpenChange: (v: boolean) => void;
  mode: PanelMode;
  onModeAttachment: () => void;
  onModeNote: () => void;
  onModeConversation: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onFilterOpenChange(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [onFilterOpenChange]);

  const label = FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? 'All';

  const iconBtn = (key: string, title: string, Icon: typeof Paperclip, active: boolean, onClick: () => void) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: `1px solid ${active ? '#1FA97A' : '#E4E7EC'}`,
        background: active ? '#F0FDF9' : '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
      }}
    >
      <Icon size={13} color={active ? '#1FA97A' : '#667085'} strokeWidth={2} />
    </button>
  );

  return (
    <header
      style={{
        padding: '10px 12px 8px',
        borderBottom: '1px solid #EEF1F5',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minHeight: 28,
          flexWrap: 'nowrap',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color: '#101828',
            fontFamily: F,
            lineHeight: 1.2,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          History
        </h2>

        {/* Compact inline filter — does not span full width */}
        <div style={{ position: 'relative', flex: '0 1 auto', minWidth: 0 }} ref={ref}>
          <button
            type="button"
            id="history-filter-trigger"
            aria-haspopup="listbox"
            aria-expanded={filterOpen}
            aria-controls="history-filter-listbox"
            title={`Filter: ${label}`}
            onClick={() => onFilterOpenChange(!filterOpen)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              height: 26,
              maxWidth: 118,
              padding: '0 8px',
              border: `1px solid ${filterOpen ? '#1FA97A' : '#E4E7EC'}`,
              borderRadius: 6,
              background: '#F9FAFB',
              fontSize: 11,
              fontWeight: 600,
              color: '#344054',
              fontFamily: F,
              cursor: 'pointer',
              transition: 'border-color 0.12s ease',
            }}
          >
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                minWidth: 0,
              }}
            >
              {label}
            </span>
            <ChevronDown
              size={12}
              color="#667085"
              strokeWidth={2.2}
              style={{
                flexShrink: 0,
                transform: filterOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.18s ease',
              }}
              aria-hidden
            />
          </button>
          {filterOpen && (
            <ul
              id="history-filter-listbox"
              role="listbox"
              aria-label="Filter history"
              aria-labelledby="history-filter-trigger"
              style={{
                position: 'absolute',
                zIndex: 20,
                left: 0,
                top: '100%',
                marginTop: 4,
                minWidth: 'max(100%, 200px)',
                width: 'max-content',
                maxWidth: 'min(260px, calc(100vw - 32px))',
                maxHeight: 200,
                overflowY: 'auto',
                listStyle: 'none',
                margin: 0,
                padding: '4px 0',
                background: '#FFFFFF',
                border: '1px solid #E4E7EC',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(16,24,40,0.12)',
              }}
            >
              {FILTER_OPTIONS.map((opt, index) => (
                <li
                  key={opt.value}
                  style={{
                    borderBottom: index < FILTER_OPTIONS.length - 1 ? '1px solid #F2F4F7' : 'none',
                  }}
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={filter === opt.value}
                    onClick={() => {
                      onFilterChange(opt.value);
                      onFilterOpenChange(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      border: 'none',
                      background: filter === opt.value ? '#E6F7F1' : 'transparent',
                      color: filter === opt.value ? '#027A48' : '#344054',
                      fontSize: 12,
                      fontWeight: filter === opt.value ? 600 : 400,
                      fontFamily: F,
                      cursor: 'pointer',
                      lineHeight: 1.35,
                    }}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 4 }} aria-hidden />

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {iconBtn('attach', 'Attachment', Paperclip, mode === 'upload', onModeAttachment)}
          {iconBtn('note', 'Add Note', Pencil, mode === 'note', onModeNote)}
          {iconBtn('chat', 'Start Conversation', MessageCircle, mode === 'conversation', onModeConversation)}
        </div>
      </div>
    </header>
  );
}

function HistoryFeed({
  items,
}: {
  items: HistoryActivityItem[];
}) {
  return (
    <div
      role="feed"
      aria-label="Activity history"
      style={{ padding: '12px 12px 16px', flex: 1, minHeight: 0, overflowY: 'auto' }}
    >
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', position: 'relative' }}>
        {/* timeline rail */}
        <li
          aria-hidden
          style={{
            position: 'absolute',
            left: 11,
            top: 10,
            bottom: 10,
            width: 2,
            background: '#EEF1F5',
            borderRadius: 1,
          }}
        />
        {items.map((item, index) => (
          <li
            key={item.id}
            style={{
              position: 'relative',
              paddingLeft: 32,
              paddingBottom: index === items.length - 1 ? 0 : 16,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 6,
                top: 2,
                width: 11,
                height: 11,
                borderRadius: '50%',
                background: item.bg,
                border: '2px solid #FFFFFF',
                boxSizing: 'content-box',
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 8,
              }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#101828', fontFamily: F, lineHeight: 1.3 }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#344054', fontFamily: F, marginTop: 4, lineHeight: 1.35 }}>
                  {item.actionLabel}
                </div>
                {item.detail ? (
                  <div style={{ fontSize: 10, color: '#667085', fontFamily: F, marginTop: 4, lineHeight: 1.35 }}>
                    {item.detail}
                  </div>
                ) : null}
                <time
                  dateTime={item.time}
                  style={{ fontSize: 10, color: '#98A2B3', fontFamily: F, display: 'block', marginTop: 4 }}
                >
                  {item.time}
                </time>
              </div>
              <StatusDot status={item.status} />
            </div>
          </li>
        ))}
      </ol>
      {items.length === 0 && (
        <p style={{ margin: 0, fontSize: 11, color: '#98A2B3', fontFamily: F, textAlign: 'center', padding: '20px 12px' }}>
          No activity for this filter.
        </p>
      )}
    </div>
  );
}

function UploadSection({
  onCancel,
  onFilesAdded,
}: {
  onCancel: () => void;
  onFilesAdded: (names: string[]) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList?.length) return;
      const arr = Array.from(fileList);
      const valid: string[] = [];
      for (const f of arr) {
        if (f.size > MAX_BYTES) continue;
        valid.push(f.name);
        if (valid.length >= MAX_FILES) break;
      }
      if (valid.length) onFilesAdded(valid);
    },
    [onFilesAdded],
  );

  return (
    <section
      aria-label="Attachments"
      style={{
        padding: '12px 16px 16px',
        borderTop: '1px solid #EEF1F5',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#101828', fontFamily: F }}>Attachments</span>
        <button
          type="button"
          onClick={onCancel}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            color: '#667085',
          }}
          aria-label="Close upload"
        >
          <X size={16} />
        </button>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 10, color: '#98A2B3', fontFamily: F }}>
        You can upload a maximum of 10 files, 5MB each
      </p>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `1.5px dashed ${dragOver ? '#1FA97A' : '#D0D5DD'}`,
          borderRadius: 8,
          padding: '20px 16px',
          textAlign: 'center',
          background: dragOver ? '#F0FDF9' : '#FAFAFA',
          cursor: 'pointer',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          accept="*/*"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Upload size={22} color="#667085" style={{ marginBottom: 10 }} strokeWidth={1.8} />
        <div style={{ fontSize: 12, fontWeight: 600, color: '#344054', fontFamily: F }}>Drag &amp; Drop</div>
        <div style={{ fontSize: 11, color: '#98A2B3', fontFamily: F, marginTop: 6 }}>or click to browse</div>
      </div>
    </section>
  );
}

function NoteSection({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (body: string, visibility: 'internal' | 'public') => void;
}) {
  const [body, setBody] = useState('');
  const [visibility, setVisibility] = useState<'internal' | 'public'>('internal');

  return (
    <section
      aria-label="Add note"
      style={{
        padding: '12px 16px 16px',
        borderTop: '1px solid #EEF1F5',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#101828', fontFamily: F }}>Add note</span>
        <button type="button" onClick={onCancel} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }} aria-label="Close">
          <X size={16} color="#667085" />
        </button>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a note…"
        rows={4}
        style={{
          width: '100%',
          resize: 'vertical',
          minHeight: 88,
          padding: '10px 12px',
          border: '1px solid #E4E7EC',
          borderRadius: 6,
          fontSize: 12,
          fontFamily: F,
          color: '#101828',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <span style={{ fontSize: 11, color: '#667085', fontFamily: F }}>Visibility</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: F, color: '#344054', cursor: 'pointer' }}>
          <input
            type="radio"
            name="note-vis"
            checked={visibility === 'internal'}
            onChange={() => setVisibility('internal')}
          />
          Internal
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: F, color: '#344054', cursor: 'pointer' }}>
          <input type="radio" name="note-vis" checked={visibility === 'public'} onChange={() => setVisibility('public')} />
          Public
        </label>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 14px',
            border: '1px solid #D0D5DD',
            borderRadius: 6,
            background: '#FFFFFF',
            fontSize: 12,
            fontWeight: 600,
            color: '#344054',
            fontFamily: F,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            if (!body.trim()) return;
            onSubmit(body.trim(), visibility);
            setBody('');
          }}
          style={{
            padding: '8px 14px',
            border: 'none',
            borderRadius: 6,
            background: '#1FA97A',
            fontSize: 12,
            fontWeight: 600,
            color: '#FFFFFF',
            fontFamily: F,
            cursor: 'pointer',
          }}
        >
          Submit
        </button>
      </div>
    </section>
  );
}

function ConversationSection({
  onCancel,
  onSend,
  messages,
}: {
  onCancel: () => void;
  onSend: (recipientIds: string[], text: string) => void;
  messages: { id: string; sender: string; text: string; time: string; mine: boolean }[];
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const toggleUser = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectedUsers = MOCK_USERS.filter((u) => selected.includes(u.id));

  return (
    <section
      aria-label="Conversation"
      style={{
        padding: '12px 16px 16px',
        borderTop: '1px solid #EEF1F5',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#101828', fontFamily: F }}>Conversation</span>
        <button type="button" onClick={onCancel} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }} aria-label="Close">
          <X size={16} color="#667085" />
        </button>
      </div>

      <div ref={wrapRef} style={{ position: 'relative', marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          style={{
            width: '100%',
            minHeight: 36,
            padding: '8px 12px',
            border: '1px solid #E4E7EC',
            borderRadius: 6,
            background: '#FFFFFF',
            textAlign: 'left',
            fontSize: 12,
            fontFamily: F,
            cursor: 'pointer',
          }}
        >
          {selectedUsers.length === 0 ? (
            <span style={{ color: '#98A2B3' }}>Select recipients…</span>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {selectedUsers.map((u) => (
                <span
                  key={u.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '4px 10px',
                    borderRadius: 100,
                    background: '#E6F7F1',
                    color: '#027A48',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {u.name}
                  <span
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleUser(u.id);
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleUser(u.id);
                    }}
                    style={{ cursor: 'pointer', lineHeight: 1 }}
                  >
                    ×
                  </span>
                </span>
              ))}
            </div>
          )}
        </button>
        {open && (
          <ul
            role="listbox"
            aria-label="Select users"
            style={{
              position: 'absolute',
              zIndex: 25,
              left: 0,
              right: 0,
              top: '100%',
              marginTop: 4,
              maxHeight: 160,
              overflowY: 'auto',
              listStyle: 'none',
              margin: 0,
              padding: 4,
              background: '#FFFFFF',
              border: '1px solid #E4E7EC',
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(16,24,40,0.12)',
            }}
          >
            {MOCK_USERS.map((u) => {
              const on = selected.includes(u.id);
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => toggleUser(u.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: 6,
                      background: on ? '#F0FDF9' : 'transparent',
                      fontSize: 12,
                      fontWeight: on ? 600 : 400,
                      color: on ? '#027A48' : '#344054',
                      fontFamily: F,
                      cursor: 'pointer',
                    }}
                  >
                    {u.name}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Message…"
        rows={3}
        style={{
          width: '100%',
          resize: 'vertical',
          minHeight: 64,
          padding: '10px 12px',
          border: '1px solid #E4E7EC',
          borderRadius: 6,
          fontSize: 12,
          fontFamily: F,
          marginBottom: 12,
          boxSizing: 'border-box',
        }}
      />
      <button
        type="button"
        onClick={() => {
          if (!text.trim() || selected.length === 0) return;
          onSend(selected, text.trim());
          setText('');
        }}
        style={{
          alignSelf: 'flex-end',
          padding: '8px 16px',
          border: 'none',
          borderRadius: 6,
          background: '#1FA97A',
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: F,
          cursor: 'pointer',
          marginBottom: 14,
        }}
      >
        Send Message
      </button>

      <div
        role="log"
        aria-live="polite"
        style={{
          flex: 1,
          minHeight: 120,
          maxHeight: 220,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          paddingTop: 8,
        }}
      >
        {messages.map((m) => (
          <article
            key={m.id}
            style={{
              alignSelf: m.mine ? 'flex-end' : 'flex-start',
              maxWidth: '92%',
              padding: '10px 12px',
              borderRadius: 10,
              background: m.mine ? '#E6F7F1' : '#F2F4F7',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 600, color: '#667085', fontFamily: F, marginBottom: 6 }}>
              {m.sender}
              <span style={{ fontWeight: 400, color: '#98A2B3', marginLeft: 8 }}>{m.time}</span>
            </div>
            <div style={{ fontSize: 12, color: '#101828', fontFamily: F, lineHeight: 1.45 }}>{m.text}</div>
          </article>
        ))}
        {messages.length === 0 && (
          <span style={{ fontSize: 11, color: '#98A2B3', fontFamily: F }}>No messages yet.</span>
        )}
      </div>
    </section>
  );
}

export interface PurchaseRequestHistoryPanelProps {
  items: HistoryActivityItem[];
  onAppendItem: (item: Omit<HistoryActivityItem, 'id' | 'time'>) => void;
}

export function PurchaseRequestHistoryPanel({ items, onAppendItem }: PurchaseRequestHistoryPanelProps) {
  const [mode, setMode] = useState<PanelMode>('feed');
  const [filter, setFilter] = useState<HistoryCategory>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const [chatMessages, setChatMessages] = useState<{ id: string; sender: string; text: string; time: string; mine: boolean }[]>([]);

  const goAttachment = useCallback(() => setMode((prev) => (prev === 'upload' ? 'feed' : 'upload')), []);
  const goNote = useCallback(() => setMode((prev) => (prev === 'note' ? 'feed' : 'note')), []);
  const goConversation = useCallback(() => setMode((prev) => (prev === 'conversation' ? 'feed' : 'conversation')), []);

  const filtered = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((i) => i.category === filter);
  }, [items, filter]);

  const handleNoteSubmit = (body: string, visibility: 'internal' | 'public') => {
    onAppendItem({
      initials: 'YO',
      bg: '#1FA97A',
      name: 'You',
      actionLabel: visibility === 'internal' ? 'Internal note added' : 'Public note added',
      detail: body,
      category: 'data_entry',
      status: 'success',
    });
    setMode('feed');
  };

  const handleUpload = (names: string[]) => {
    onAppendItem({
      initials: 'YO',
      bg: '#1FA97A',
      name: 'You',
      actionLabel: 'Attachment uploaded',
      detail: names.join(', '),
      category: 'data_entry',
      status: 'success',
    });
    setMode('feed');
  };

  const handleSend = (recipientIds: string[], text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const recipients = MOCK_USERS.filter((u) => recipientIds.includes(u.id)).map((u) => u.name).join(', ');
    setChatMessages((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        sender: 'You',
        text,
        time: timeStr,
        mine: true,
      },
    ]);
    onAppendItem({
      initials: 'YO',
      bg: '#1FA97A',
      name: 'You',
      actionLabel: 'Message sent',
      detail: `To: ${recipients}`,
      category: 'conversations',
      status: 'neutral',
    });
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <HistoryPanelHeader
        filter={filter}
        onFilterChange={setFilter}
        filterOpen={filterOpen}
        onFilterOpenChange={setFilterOpen}
        mode={mode}
        onModeAttachment={goAttachment}
        onModeNote={goNote}
        onModeConversation={goConversation}
      />

      {mode === 'feed' && <HistoryFeed items={filtered} />}

      {mode === 'upload' && <UploadSection onCancel={() => setMode('feed')} onFilesAdded={handleUpload} />}

      {mode === 'note' && <NoteSection onCancel={() => setMode('feed')} onSubmit={handleNoteSubmit} />}

      {mode === 'conversation' && (
        <ConversationSection onCancel={() => setMode('feed')} onSend={handleSend} messages={chatMessages} />
      )}
    </div>
  );
}
