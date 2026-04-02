import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";

export interface DeletePostConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Trecho do título para contextualizar (pode ser truncado). */
  postTitlePreview: string;
  isDeleting: boolean;
  onConfirm: () => void | Promise<void>;
  errorMessage?: string | null;
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function DeletePostConfirmationDialog({
  open,
  onOpenChange,
  postTitlePreview,
  isDeleting,
  onConfirm,
  errorMessage,
}: DeletePostConfirmationDialogProps) {
  const preview = truncate(postTitlePreview, 72);

  return (
    <Dialog open={open} onOpenChange={(next) => !isDeleting && onOpenChange(next)}>
      <DialogContent
        className={cn(
          "border-[var(--woody-accent)]/15 sm:max-w-md",
          "gap-0 p-0 overflow-hidden"
        )}
      >
        <DialogHeader className="px-4 pt-5 pb-2 sm:px-6 sm:pt-6">
          <DialogTitle className="text-[var(--woody-text)]">Excluir publicação?</DialogTitle>
          <DialogDescription className="text-pretty pt-1">
            {preview ? (
              <>
                Esta ação remove <span className="font-medium text-[var(--woody-text)]/90">“{preview}”</span> do feed.
                Os comentários deixam de ficar visíveis no mock.
              </>
            ) : (
              <>Esta publicação será removida do feed. Os comentários deixam de ficar visíveis no mock.</>
            )}
          </DialogDescription>
        </DialogHeader>
        {errorMessage ? (
          <p className="px-4 pb-2 text-sm text-[var(--woody-accent)] sm:px-6" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <div className="flex flex-col-reverse gap-2 border-t border-[var(--woody-accent)]/10 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button
            type="button"
            variant="outline"
            className={cn(woodyFocus.ring, "w-full sm:w-auto")}
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            className={cn(woodyFocus.ring, "w-full sm:w-auto")}
            disabled={isDeleting}
            onClick={() => void onConfirm()}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Excluindo…
              </>
            ) : (
              "Excluir"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
