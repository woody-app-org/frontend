import { useEffect, useId, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { woodyDialogScroll, woodyFocus } from "@/lib/woody-ui";
import type { Post } from "@/domain/types";
import { updatePostMock } from "@/domain/services/contentModerationMock.service";
import { postComposerFieldStyles } from "../lib/postComposerFieldStyles";

export interface EditPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
  viewerId: string;
  onSaved: (post: Post) => void;
}

export function EditPostDialog({ open, onOpenChange, post, viewerId, onSaved }: EditPostDialogProps) {
  const formId = useId();
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(post.title);
    setContent(post.content);
    setError(null);
  }, [open, post.id, post.title, post.content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const result = await updatePostMock(post.id, viewerId, { title, content });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onSaved(result.data);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = title.trim().length > 0 && content.trim().length > 0 && !isSaving;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          woodyDialogScroll,
          "max-h-[min(92vh,760px)] flex flex-col gap-0 border-[var(--woody-accent)]/15 p-0 sm:max-w-lg"
        )}
      >
        <DialogHeader className="shrink-0 border-b border-[var(--woody-accent)]/10 px-4 py-4 sm:px-5">
          <DialogTitle className="text-[var(--woody-text)]">Editar publicação</DialogTitle>
          <DialogDescription>
            Ajuste o título e o texto. As alterações aparecem para todas as leitoras após salvar.
          </DialogDescription>
        </DialogHeader>

        <form id={formId} onSubmit={(e) => void handleSubmit(e)} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
            <div className="space-y-1.5">
              <label htmlFor={`${formId}-title`} className="text-sm font-medium text-[var(--woody-text)]">
                Título
              </label>
              <Input
                id={`${formId}-title`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={postComposerFieldStyles.input}
                disabled={isSaving}
                maxLength={280}
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor={`${formId}-body`} className="text-sm font-medium text-[var(--woody-text)]">
                Texto
              </label>
              <Textarea
                id={`${formId}-body`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className={postComposerFieldStyles.textarea}
                disabled={isSaving}
              />
            </div>
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
