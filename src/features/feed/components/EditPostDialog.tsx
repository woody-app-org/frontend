import { useEffect, useId, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { woodyDialogScroll, woodyFocus } from "@/lib/woody-ui";
import type { Post } from "@/domain/types";
import { updatePostMock } from "@/domain/services/contentModerationMock.service";
import { postComposerFieldStyles } from "../lib/postComposerFieldStyles";
import { showSuccessToast } from "@/lib/toast";
import { POST_COMPOSER_CONTENT_MAX_LENGTH } from "../services/post.service";
import { HashtagChipsField } from "./HashtagChipsField";
import { hashtagsToApiTags } from "../lib/postComposerHashtags";

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
  const [content, setContent] = useState(post.content);
  const [hashtags, setHashtags] = useState<string[]>(post.tags ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setContent(post.content);
    setHashtags(post.tags ? [...post.tags] : []);
    setError(null);
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
    if (text.length > POST_COMPOSER_CONTENT_MAX_LENGTH) {
      setError(`O texto pode ter no máximo ${POST_COMPOSER_CONTENT_MAX_LENGTH} caracteres.`);
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
  const canSave =
    (trimmed.length > 0 || hasMedia) && !isSaving && trimmed.length <= POST_COMPOSER_CONTENT_MAX_LENGTH;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          woodyDialogScroll,
          "max-h-[min(92vh,760px)] flex flex-col gap-0 border-[var(--woody-accent)]/15 p-0 sm:max-w-2xl"
        )}
      >
        <DialogHeader className="shrink-0 border-b border-[var(--woody-accent)]/10 px-4 py-4 sm:px-5">
          <DialogTitle className="text-[var(--woody-text)]">Editar publicação</DialogTitle>
          <DialogDescription>
            Ajusta o texto e as hashtags. As alterações ficam visíveis para todas as leitoras após guardar.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={(e) => void handleSubmit(e)} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
            <div className="space-y-1.5">
              <label htmlFor={`${formId}-body`} className="text-sm font-medium text-[var(--woody-text)]">
                Texto
              </label>
              <Textarea
                id={`${formId}-body`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                maxLength={POST_COMPOSER_CONTENT_MAX_LENGTH}
                className={postComposerFieldStyles.textarea}
                disabled={isSaving}
              />
            </div>
            <HashtagChipsField hashtags={hashtags} onHashtagsChange={setHashtags} disabled={isSaving} />
            {error ? (
              <p className="text-sm text-[var(--woody-accent)]" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--woody-accent)]/10 bg-[var(--woody-card)] px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
            <Button
              type="button"
              variant="outline"
              className={cn(woodyFocus.ring, "w-full sm:w-auto")}
              disabled={isSaving}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form={formId}
              disabled={!canSave}
              className="w-full bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90 sm:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Salvando…
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
