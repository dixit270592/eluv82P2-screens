import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  CommentAuthor,
  PageComment,
  PageCommentReply,
} from '../types/pageComments';

const STORAGE_KEY = 'eluv8_page_comments';
const AUTHOR_KEY = 'eluv8_comment_author';

interface PageCommentsContextType {
  comments: PageComment[];
  author: CommentAuthor;
  setAuthor: (author: CommentAuthor) => void;
  addComment: (
    route: string,
    xPct: number,
    yPct: number,
    text: string,
  ) => PageComment;
  updateComment: (id: string, text: string) => void;
  deleteComment: (id: string) => void;
  addReply: (commentId: string, text: string) => void;
  deleteReply: (commentId: string, replyId: string) => void;
  toggleResolved: (id: string) => void;
  exportComments: () => string;
  importComments: (json: string) => boolean;
  getCommentsForRoute: (route: string) => PageComment[];
}

const PageCommentsContext = createContext<PageCommentsContextType | null>(null);

function loadComments(): PageComment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PageComment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveComments(comments: PageComment[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
  } catch {
    /* noop */
  }
}

function loadAuthor(): CommentAuthor {
  try {
    const stored = localStorage.getItem(AUTHOR_KEY);
    if (stored === 'client' || stored === 'developer') return stored;
  } catch {
    /* noop */
  }
  return 'client';
}

function createId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function PageCommentsProvider({ children }: { children: React.ReactNode }) {
  const [comments, setComments] = useState<PageComment[]>(loadComments);
  const [author, setAuthorState] = useState<CommentAuthor>(loadAuthor);

  useEffect(() => {
    saveComments(comments);
  }, [comments]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as PageComment[];
          if (Array.isArray(parsed)) setComments(parsed);
        } catch {
          /* noop */
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setAuthor = useCallback((next: CommentAuthor) => {
    setAuthorState(next);
    try {
      localStorage.setItem(AUTHOR_KEY, next);
    } catch {
      /* noop */
    }
  }, []);

  const addComment = useCallback(
    (route: string, xPct: number, yPct: number, text: string) => {
      const comment: PageComment = {
        id: createId(),
        route,
        xPct,
        yPct,
        text: text.trim(),
        author,
        createdAt: new Date().toISOString(),
        replies: [],
      };
      setComments((prev) => [...prev, comment]);
      return comment;
    },
    [author],
  );

  const updateComment = useCallback((id: string, text: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, text: text.trim() } : c)),
    );
  }, []);

  const deleteComment = useCallback((id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addReply = useCallback(
    (commentId: string, text: string) => {
      const reply: PageCommentReply = {
        id: createId(),
        text: text.trim(),
        author,
        createdAt: new Date().toISOString(),
      };
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c,
        ),
      );
    },
    [author],
  );

  const deleteReply = useCallback((commentId: string, replyId: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, replies: c.replies.filter((r) => r.id !== replyId) }
          : c,
      ),
    );
  }, []);

  const toggleResolved = useCallback((id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c)),
    );
  }, []);

  const exportComments = useCallback(() => JSON.stringify(comments, null, 2), [comments]);

  const importComments = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as PageComment[];
      if (!Array.isArray(parsed)) return false;
      setComments(parsed);
      return true;
    } catch {
      return false;
    }
  }, []);

  const getCommentsForRoute = useCallback(
    (route: string) => comments.filter((c) => c.route === route),
    [comments],
  );

  const value = useMemo(
    () => ({
      comments,
      author,
      setAuthor,
      addComment,
      updateComment,
      deleteComment,
      addReply,
      deleteReply,
      toggleResolved,
      exportComments,
      importComments,
      getCommentsForRoute,
    }),
    [
      comments,
      author,
      setAuthor,
      addComment,
      updateComment,
      deleteComment,
      addReply,
      deleteReply,
      toggleResolved,
      exportComments,
      importComments,
      getCommentsForRoute,
    ],
  );

  return (
    <PageCommentsContext.Provider value={value}>
      {children}
    </PageCommentsContext.Provider>
  );
}

export function usePageComments() {
  const ctx = useContext(PageCommentsContext);
  if (!ctx) {
    throw new Error('usePageComments must be used within PageCommentsProvider');
  }
  return ctx;
}
