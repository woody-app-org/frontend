/**
 * Alinha ações (toggle de respostas, composer de reply) com a coluna de texto do comentário
 * (avatar ~2.25rem + gap-3 ≈ 3rem no sm).
 */
export const COMMENT_THREAD_ACTION_INDENT = "ml-[2.75rem] sm:ml-[3.25rem]";

/** `id` estável para `aria-controls` no toggle de respostas. */
export function commentRepliesRegionId(commentId: string): string {
  return `comment-replies-${commentId}`;
}
