import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Check,
  Download,
  MessageSquare,
  MessageSquareOff,
  MessageSquarePlus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { usePageComments } from '../../context/PageCommentsContext';
import {
  COMMENT_AUTHOR_LABELS,
  type CommentAuthor,
  type PageComment,
} from '../../types/pageComments';
import { P2P_BRAND } from '../../tokens/brand';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';

const Z = 9999;

function toDocumentPct(clientX: number, clientY: number) {
  const doc = document.documentElement;
  const w = Math.max(doc.scrollWidth, 1);
  const h = Math.max(doc.scrollHeight, 1);
  return {
    xPct: ((window.scrollX + clientX) / w) * 100,
    yPct: ((window.scrollY + clientY) / h) * 100,
  };
}

function pctToViewport(xPct: number, yPct: number) {
  const doc = document.documentElement;
  const w = Math.max(doc.scrollWidth, 1);
  const h = Math.max(doc.scrollHeight, 1);
  return {
    left: (xPct / 100) * w - window.scrollX,
    top: (yPct / 100) * h - window.scrollY,
  };
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function AuthorBadge({ author }: { author: CommentAuthor }) {
  const isClient = author === 'client';
  return (
    <span
      className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{
        background: isClient ? '#EEF2FF' : '#ECFDF5',
        color: isClient ? '#4338CA' : P2P_BRAND.primaryStrong,
      }}
    >
      {COMMENT_AUTHOR_LABELS[author]}
    </span>
  );
}

function CommentThread({
  comment,
  onClose,
}: {
  comment: PageComment;
  onClose: () => void;
}) {
  const { addReply, deleteReply, deleteComment, toggleResolved } = usePageComments();
  const [replyText, setReplyText] = useState('');

  const submitReply = () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    addReply(comment.id, trimmed);
    setReplyText('');
  };

  return (
    <div
      className="w-72 rounded-lg border bg-white shadow-xl"
      data-page-comment-ui
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-2 border-b px-3 py-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <AuthorBadge author={comment.author} />
            {comment.resolved && (
              <span className="text-[10px] font-medium text-emerald-600">Resolved</span>
            )}
          </div>
          <p className="text-xs text-gray-500">{formatTime(comment.createdAt)}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="max-h-40 overflow-y-auto px-3 py-2">
        <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.text}</p>

        {comment.replies.length > 0 && (
          <div className="mt-3 space-y-2 border-t pt-2">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="group rounded-md bg-gray-50 px-2 py-1.5">
                <div className="mb-0.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <AuthorBadge author={reply.author} />
                    <span className="text-[10px] text-gray-400">
                      {formatTime(reply.createdAt)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteReply(comment.id, reply.id)}
                    className="rounded p-0.5 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                    aria-label="Delete reply"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
                <p className="text-xs text-gray-700 whitespace-pre-wrap">{reply.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t px-3 py-2">
        <Textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Write a reply…"
          className="min-h-14 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitReply();
          }}
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-gray-500"
              onClick={() => toggleResolved(comment.id)}
            >
              <Check className="size-3" />
              {comment.resolved ? 'Reopen' : 'Resolve'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-red-500 hover:text-red-600"
              onClick={() => {
                deleteComment(comment.id);
                onClose();
              }}
            >
              <Trash2 className="size-3" />
              Delete
            </Button>
          </div>
          <Button
            type="button"
            size="sm"
            className="h-7 text-xs"
            style={{ background: P2P_BRAND.primary }}
            onClick={submitReply}
            disabled={!replyText.trim()}
          >
            Reply
          </Button>
        </div>
      </div>
    </div>
  );
}

function NewCommentForm({
  x,
  y,
  onSubmit,
  onCancel,
}: {
  x: number;
  y: number;
  onSubmit: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ta = ref.current?.querySelector('textarea');
    ta?.focus();
  }, []);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  const maxLeft = window.innerWidth - 300;
  const maxTop = window.innerHeight - 200;
  const left = Math.min(Math.max(x, 8), maxLeft);
  const top = Math.min(Math.max(y, 8), maxTop);

  return (
    <div
      ref={ref}
      className="fixed w-72 rounded-lg border bg-white p-3 shadow-xl"
      style={{ left, top, zIndex: Z + 2 }}
      data-page-comment-ui
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.stopPropagation()}
    >
      <p className="mb-2 text-xs font-medium text-gray-500">Add feedback here</p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe the change or feedback…"
        className="min-h-20 text-sm"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
          if (e.key === 'Escape') onCancel();
        }}
      />
      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          style={{ background: P2P_BRAND.primary }}
          onClick={submit}
          disabled={!text.trim()}
        >
          Add comment
        </Button>
      </div>
    </div>
  );
}

function CommentPin({
  comment,
  index,
  isActive,
  onClick,
}: {
  comment: PageComment;
  index: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const [pos, setPos] = useState(() => pctToViewport(comment.xPct, comment.yPct));

  useEffect(() => {
    const update = () => setPos(pctToViewport(comment.xPct, comment.yPct));
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [comment.xPct, comment.yPct]);

  return (
    <button
      type="button"
      data-page-comment-ui
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold text-white shadow-md transition-transform hover:scale-110"
      style={{
        left: pos.left,
        top: pos.top,
        zIndex: Z + (isActive ? 2 : 1),
        background: comment.resolved ? '#94A3B8' : P2P_BRAND.primary,
        outline: isActive ? `2px solid ${P2P_BRAND.primaryStrong}` : undefined,
        outlineOffset: 2,
      }}
      title={comment.text}
      aria-label={`Comment ${index + 1}`}
    >
      {index + 1}
    </button>
  );
}

export function PageCommentSystem() {
  const location = useLocation();
  const navigate = useNavigate();
  const route = location.pathname;
  const {
    comments,
    author,
    setAuthor,
    addComment,
    exportComments,
    importComments,
    getCommentsForRoute,
  } = usePageComments();

  const [enabled, setEnabled] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [newCommentPos, setNewCommentPos] = useState<{ xPct: number; yPct: number; x: number; y: number } | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const routeComments = getCommentsForRoute(route);
  const activeComment = routeComments.find((c) => c.id === activeCommentId) ?? null;
  const unresolvedCount = comments.filter((c) => !c.resolved).length;

  const closeAll = useCallback(() => {
    setContextMenu(null);
    setNewCommentPos(null);
    setActiveCommentId(null);
  }, []);

  useEffect(() => {
    closeAll();
  }, [route, closeAll]);

  useEffect(() => {
    if (!enabled) return;

    const onContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-page-comment-ui]')) return;

      e.preventDefault();
      setActiveCommentId(null);
      setNewCommentPos(null);
      setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-page-comment-ui]')) return;
      closeAll();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };

    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [enabled, closeAll]);

  const startNewComment = () => {
    if (!contextMenu) return;
    const pct = toDocumentPct(contextMenu.x, contextMenu.y);
    setNewCommentPos({ ...pct, x: contextMenu.x, y: contextMenu.y });
    setContextMenu(null);
  };

  const submitNewComment = (text: string) => {
    if (!newCommentPos) return;
    const comment = addComment(route, newCommentPos.xPct, newCommentPos.yPct, text);
    setNewCommentPos(null);
    setActiveCommentId(comment.id);
  };

  const scrollToComment = (comment: PageComment) => {
    const goToComment = () => {
      const doc = document.documentElement;
      const w = Math.max(doc.scrollWidth, 1);
      const h = Math.max(doc.scrollHeight, 1);
      window.scrollTo({
        left: (comment.xPct / 100) * w - window.innerWidth / 2,
        top: (comment.yPct / 100) * h - window.innerHeight / 2,
        behavior: 'smooth',
      });
      setActiveCommentId(comment.id);
      setPanelOpen(false);
    };

    if (comment.route !== route) {
      navigate(comment.route);
      requestAnimationFrame(() => requestAnimationFrame(goToComment));
    } else {
      goToComment();
    }
  };

  const handleExport = () => {
    const blob = new Blob([exportComments()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page-comments.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importComments(String(reader.result));
      if (!ok) alert('Could not import comments. Please check the file format.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      {/* Pin markers */}
      {enabled && (
        <div className="pointer-events-none fixed inset-0" style={{ zIndex: Z }}>
          {routeComments.map((comment, i) => (
            <div key={comment.id} className="pointer-events-auto">
              <CommentPin
                comment={comment}
                index={i}
                isActive={activeCommentId === comment.id}
                onClick={() =>
                  setActiveCommentId((prev) => (prev === comment.id ? null : comment.id))
                }
              />
            </div>
          ))}
        </div>
      )}

      {/* Active comment thread popover */}
      {enabled && activeComment && (() => {
        const pos = pctToViewport(activeComment.xPct, activeComment.yPct);
        const maxLeft = window.innerWidth - 300;
        const left = Math.min(Math.max(pos.left + 16, 8), maxLeft);
        const top = Math.min(Math.max(pos.top - 8, 8), window.innerHeight - 320);
        return (
          <div
            className="fixed"
            style={{ left, top, zIndex: Z + 3 }}
            data-page-comment-ui
          >
            <CommentThread
              comment={activeComment}
              onClose={() => setActiveCommentId(null)}
            />
          </div>
        );
      })()}

      {/* Right-click context menu */}
      {enabled && contextMenu && (
        <div
          className="fixed min-w-[160px] rounded-md border bg-white py-1 shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y, zIndex: Z + 2 }}
          data-page-comment-ui
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
            onClick={startNewComment}
          >
            <MessageSquarePlus className="size-4" style={{ color: P2P_BRAND.primary }} />
            Add comment here
          </button>
        </div>
      )}

      {/* New comment form */}
      {enabled && newCommentPos && (
        <NewCommentForm
          x={newCommentPos.x}
          y={newCommentPos.y}
          onSubmit={submitNewComment}
          onCancel={() => setNewCommentPos(null)}
        />
      )}

      {/* Floating controls */}
      <div
        className="fixed bottom-5 right-5 flex flex-col items-end gap-2"
        style={{ zIndex: Z + 4 }}
        data-page-comment-ui
      >
        <div className="flex items-center gap-1 rounded-full border bg-white px-2 py-1 shadow-lg">
          <span className="px-1 text-[10px] font-medium text-gray-400">As</span>
          {(['client', 'developer'] as CommentAuthor[]).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setAuthor(role)}
              className="rounded-full px-2.5 py-1 text-xs font-medium transition-colors"
              style={
                author === role
                  ? {
                      background: role === 'client' ? '#EEF2FF' : P2P_BRAND.surface,
                      color: role === 'client' ? '#4338CA' : P2P_BRAND.primaryStrong,
                    }
                  : { color: '#94A3B8' }
              }
            >
              {COMMENT_AUTHOR_LABELS[role]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEnabled((v) => !v)}
            aria-label={enabled ? 'Comments on' : 'Comments off'}
            title={enabled ? 'Comments on — click to hide pins' : 'Comments off — click to enable pins'}
            className="flex size-10 items-center justify-center rounded-full border bg-white shadow-lg transition-colors hover:bg-gray-50"
            style={{ color: enabled ? P2P_BRAND.primaryStrong : '#64748B' }}
          >
            {enabled ? <MessageSquare className="size-4" /> : <MessageSquareOff className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="relative flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-lg transition-colors hover:opacity-90"
            style={{
              background: P2P_BRAND.surface,
              borderColor: P2P_BRAND.surfaceBorder,
              color: P2P_BRAND.primaryStrong,
            }}
          >
            <MessageSquarePlus className="size-4" />
            Feedback
            {unresolvedCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unresolvedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* All comments panel */}
      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md" data-page-comment-ui>
          <SheetHeader>
            <SheetTitle>Page feedback</SheetTitle>
            <SheetDescription>
              Right-click anywhere on the page to pin a comment. Comments are saved in this
              browser — use export/import to share with your team.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4 pb-4">
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" className="flex-1" onClick={handleExport}>
                <Download className="size-3.5" />
                Export
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3.5" />
                Import
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={handleImport}
              />
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">
                  No comments yet. Right-click on the page to add one.
                </p>
              ) : (
                comments.map((comment, i) => (
                  <button
                    key={comment.id}
                    type="button"
                    onClick={() => scrollToComment(comment)}
                    className="w-full rounded-lg border p-3 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50/50"
                    style={{
                      opacity: comment.resolved ? 0.6 : 1,
                      borderColor: comment.route === route ? P2P_BRAND.surfaceBorder : undefined,
                    }}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ background: comment.resolved ? '#94A3B8' : P2P_BRAND.primary }}
                        >
                          {i + 1}
                        </span>
                        <AuthorBadge author={comment.author} />
                        {comment.resolved && (
                          <span className="text-[10px] text-emerald-600">Resolved</span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400">{formatTime(comment.createdAt)}</span>
                    </div>
                    <p className="line-clamp-2 text-sm text-gray-800">{comment.text}</p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      {comment.route}
                      {comment.replies.length > 0 && ` · ${comment.replies.length} repl${comment.replies.length === 1 ? 'y' : 'ies'}`}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
