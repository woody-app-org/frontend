import type { Comment, Post } from "../types";

/** Texto exibido quando o comentário está oculto pela autora do post (leitoras que não são a autora do comentário). */
export const HIDDEN_COMMENT_PLACEHOLDER =
  "Este comentário foi ocultado pela autora da publicação.";

/**
 * Corpo seguro para exibir à `viewerId` (respeita máscara de ocultação).
 * Comentários soft-deleted não entram na lista enriquecida; este helper cobre o caso oculto.
 */
export function getCommentContentForViewer(comment: Comment): string {
  if (comment.contentModerationMask === "hidden_by_post_author") {
    return HIDDEN_COMMENT_PLACEHOLDER;
  }
  return comment.content;
}

/** Indica se o texto original deve ser substituído por placeholder na UI. */
export function isCommentContentMaskedForViewer(comment: Comment): boolean {
  return comment.contentModerationMask === "hidden_by_post_author";
}

/** Post removido não deve renderizar detalhe; listagens já filtram no mock. */
export function isPostRemoved(post: Post): boolean {
  return post.deletedAt != null && post.deletedAt !== "";
}
