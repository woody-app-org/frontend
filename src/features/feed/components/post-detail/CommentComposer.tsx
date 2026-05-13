import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { CommentGifDraft } from "@/domain/types";
import { CommentForm } from "./CommentForm";

export interface CommentComposerProps {
  /**
   * Deve chamar `postCommentsMockApi.create` (via hook). Retorna se o envio foi aceito.
   * TODO(backend): trocar por serviço HTTP mantendo a mesma assinatura.
   */
  onCreateComment: (body: string, gif?: CommentGifDraft | null) => Promise<boolean>;
  isSubmitting: boolean;
  /** Quando os comentários terminaram de carregar (evita focar em conteúdo inexistente). */
  commentsReady: boolean;
  /** Se a página abriu com foco na thread (ex.: `?focus=comments`). */
  emphasizeEntry?: boolean;
  /** Fecha o composer de resposta quando a usuária interage com o campo raiz. */
  onInteractRoot?: () => void;
  className?: string;
}

export function CommentComposer({
  onCreateComment,
  isSubmitting,
  commentsReady,
  emphasizeEntry = false,
  onInteractRoot,
  className,
}: CommentComposerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!emphasizeEntry || !commentsReady) return;
    const t = window.setTimeout(() => {
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      textareaRef.current?.focus();
    }, 40);
    return () => window.clearTimeout(t);
  }, [emphasizeEntry, commentsReady]);

  const handleSubmit = async (payload: { text: string; gif: CommentGifDraft | null }) => {
    const ok = await onCreateComment(payload.text, payload.gif);
    if (!ok) return false;
    setBody("");
    textareaRef.current?.focus();
    return true;
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "rounded-xl border border-[var(--woody-accent)]/10 bg-[var(--woody-nav)]/[0.04] p-3 sm:p-4",
        className
      )}
    >
      <p className="mb-2 text-xs font-medium text-[var(--woody-muted)]">Sua resposta</p>
      <CommentForm
        id="post-detail-comment"
        value={body}
        onChange={setBody}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        textareaRef={textareaRef}
        onTextareaFocus={onInteractRoot}
        placeholder="O que você acha? Compartilhe com calma e respeito."
        submitLabel="Publicar"
      />
    </div>
  );
}
