export type CommentAuthor = 'client' | 'developer';

export interface PageCommentReply {
  id: string;
  text: string;
  author: CommentAuthor;
  createdAt: string;
}

export interface PageComment {
  id: string;
  route: string;
  /** Horizontal position as % of document width */
  xPct: number;
  /** Vertical position as % of document height */
  yPct: number;
  text: string;
  author: CommentAuthor;
  createdAt: string;
  replies: PageCommentReply[];
  resolved?: boolean;
}

export const COMMENT_AUTHOR_LABELS: Record<CommentAuthor, string> = {
  client: 'Client',
  developer: 'Developer',
};
