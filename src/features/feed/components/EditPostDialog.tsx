import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Hash, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Post } from "@/domain/types";
import { updatePostMock } from "@/domain/services/contentModerationMock.service";
import { showSuccessToast } from "@/lib/toast";
import { getPostContentMaxLength } from "../services/post.service";
import { HashtagChipsField } from "./HashtagChipsField";
import { hashtagsToApiTags } from "../lib/postComposerHashtags";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useSubscriptionCapabilities } from "@/features/subscription/useSubscriptionCapabilities";

export interface EditPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
  viewerId: string;
  onSaved: (post: Post) => void;
}

function hasPostMedia(post: Post): boolean {
  if (post.imageUrl?.trim()) return true;
  if (post.mediaAttachments && post.mediaAttachments.length > 0) return true;
  if (post.imageUrls && post.imageUrls.length > 0) return true;
  return false;
}

export function EditPostDialog({ open, onOpenChange, post, viewerId, onSaved }: EditPostDialogProps) {
  const formId = useId();
  const viewer = useCurrentUser();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isProUser } = useSubscriptionCapabilities();
  const contentMaxLength = getPostContentMaxLength(isProUser);

  const [content, setContent] = useState(post.content);
  const [hashtags, setHashtags] = useState<string[]>(post.tags ?? []);
  const [showHashtagField, setShowHashtagField] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setContent(post.content);
    setHashtags(post.tags ? [...post.tags] : []);
    setError(null);
    setShowHashtagField((post.tags?.length ?? 0) > 0);
    // Foca o textarea ao abrir
    const t = window.setTimeout(() => textareaRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [open, post.id, post.content, post.tags]);

  const hasMedia = useMemo(() => hasPostMedia(post), [post]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const text = content.trim();
    if (!text && !hasMedia) {
      setError("A publicação precisa de texto ou de mídia.");
      return;
    }
    if (text.length > contentMaxLength) {
      setError(`O texto pode ter no máximo ${contentMaxLength} caracteres.`);
      return;
    }

    setIsSaving(true);
    try {
      const tags = hashtagsToApiTags(hashtags);
      const result = await updatePostMock(post.id, viewerId, { content: text, tags });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onSaved(result.data);
      showSuccessToast("Publicação atualizada.", { id: `woody-post-updated-${post.id}` });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const trimmed = content.trim();
  const charsLeft = contentMaxLength - trimmed.length;
  const canSave =
    (trimmed.length > 0 || hasMedia) && !isSaving && trimmed.length <= contentMaxLength;

  const viewerInitials = (viewer?.username ?? viewer?.name ?? "?").slice(0, 2).toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-0 p-0 max-w-[min(560px,calc(100vw-1rem))] max-h-[min(92dvh,700px)] border-[var(--woody-accent)]/15">
        {/* Cabeçalho */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--woody-accent)]/10 px-4 py-3">
          <span className="text-sm font-semibold text-[var(--woody-text)]">Editar publicação</span>
          <DialogClose asChild>
            <button
              type="button"
              className="rounded-full p-1.5 text-[var(--woody-muted)] hover:bg-[var(--woody-nav)]/10 hover:text-[var(--woody-text)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/30"
              aria-label="Fechar"
            >
              <X className="size-4" aria-hidden />
            </button>
          </DialogClose>
        </div>

        {/* Corpo — scrollável */}
        <form
          id={formId}
          onSubmit={(e) => void handleSubmit(e)}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          <div className="flex gap-3 px-4 pt-4 pb-2">
            {/* Avatar */}
            <Avatar size="default" className="size-10 shrink-0 ring-0">
              <AvatarImage src={viewer?.avatarUrl ?? undefined} alt={viewer?.username ?? ""} className="block" />
              <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-xs">
                {viewerInitials}
              </AvatarFallback>
            </Avatar>

            {/* Textarea social */}
            <Textarea
              ref={textareaRef}
              id={`${formId}-body`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="O que você quer dizer?"
              disabled={isSaving}
              maxLength={contentMaxLength}
              className={cn(
                "field-sizing-auto min-h-[6rem] w-full resize-none rounded-none border-0 bg-transparent py-1 pl-0 pr-0.5",
                "text-[1.1rem] leading-[1.5] text-[var(--woody-text)]",
                "placeholder:text-[var(--woody-muted)]/70",
                "shadow-none outline-none ring-0 focus-visible:ring-0 focus-visible:outline-none",
                "max-h-[min(40dvh,18rem)] overflow-y-auto"
              )}
            />
          </div>

          {/* Hashtags — aparece quando ativado ou se já existem */}
          {showHashtagField ? (
            <div className="px-4 pb-3 pl-[3.75rem]">
              <HashtagChipsField
                hashtags={hashtags}
                onHashtagsChange={setHashtags}
                disabled={isSaving}
                composerBare
              />
            </div>
          ) : null}

          {/* Erro */}
          {error ? (
            <p className="px-4 pb-2 text-sm text-red-500" role="alert">
              {error}
            </p>
          ) : null}
        </form>

        {/* Rodapé fixo */}
        <div className="shrink-0 border-t border-[var(--woody-accent)]/10 px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Ações da toolbar */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowHashtagField((v) => !v)}
              disabled={isSaving}
              aria-label="Adicionar hashtags"
              className={cn(
                "size-9 rounded-full text-[var(--woody-nav)] transition-colors",
                "hover:bg-[var(--woody-accent)]/14 disabled:opacity-40",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/35",
                showHashtagField && "bg-[var(--woody-accent)]/12"
              )}
            >
              <Hash className="size-4 mx-auto" aria-hidden />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Contador de caracteres */}
            {trimmed.length > 0 ? (
              <span
                className={cn(
                  "text-xs tabular-nums text-[var(--woody-muted)]",
                  charsLeft < 50 && "text-amber-500",
                  charsLeft < 0 && "text-red-500 font-semibold"
                )}
              >
                {charsLeft}
              </span>
            ) : null}

            <Button
              type="submit"
              form={formId}
              disabled={!canSave}
              className="bg-[var(--woody-nav)] px-5 text-white hover:bg-[var(--woody-nav)]/90 focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/35"
            >
              {isSaving ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  Salvando…
                </span>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
