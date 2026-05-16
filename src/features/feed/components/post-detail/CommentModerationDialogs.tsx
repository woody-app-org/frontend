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

const shellClass = cn(
  "border-[var(--woody-accent)]/15 sm:max-w-lg",
  "gap-0 p-0 overflow-hidden"
);

const footerClass =
  "flex flex-col-reverse gap-2 border-t border-[var(--woody-accent)]/10 px-4 py-4 sm:flex-row sm:justify-end sm:px-6";

export interface DeleteCommentConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isBusy: boolean;
  onConfirm: () => void | Promise<void>;
  errorMessage?: string | null;
}

export function DeleteCommentConfirmationDialog({
  open,
  onOpenChange,
  isBusy,
  onConfirm,
  errorMessage,
}: DeleteCommentConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !isBusy && onOpenChange(next)}>
      <DialogContent className={shellClass}>
        <DialogHeader className="px-4 pt-5 pb-2 sm:px-6 sm:pt-6">
          <DialogTitle className="text-[var(--woody-text)]">Excluir comentário?</DialogTitle>
          <DialogDescription className="text-pretty pt-1">
            Ele some para todas as pessoas e a contagem de respostas do post é atualizada.
          </DialogDescription>
        </DialogHeader>
        {errorMessage ? (
          <p className="px-4 pb-2 text-sm text-[var(--woody-accent)] sm:px-6" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <div className={footerClass}>
          <Button
            type="button"
            variant="outline"
            className={cn(woodyFocus.ring, "w-full sm:w-auto")}
            disabled={isBusy}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            className={cn(woodyFocus.ring, "w-full sm:w-auto")}
            disabled={isBusy}
            onClick={() => void onConfirm()}
          >
            {isBusy ? (
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

export interface HideCommentConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isBusy: boolean;
  onConfirm: () => void | Promise<void>;
  errorMessage?: string | null;
}

export function HideCommentConfirmationDialog({
  open,
  onOpenChange,
  isBusy,
  onConfirm,
  errorMessage,
}: HideCommentConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !isBusy && onOpenChange(next)}>
      <DialogContent className={shellClass}>
        <DialogHeader className="px-4 pt-5 pb-2 sm:px-6 sm:pt-6">
          <DialogTitle className="text-[var(--woody-text)]">Ocultar comentário?</DialogTitle>
          <DialogDescription className="text-pretty pt-1">
            Outras leitoras verão um aviso discreto no lugar do texto. Você e a autora do comentário
            continuam vendo o conteúdo.
          </DialogDescription>
        </DialogHeader>
        {errorMessage ? (
          <p className="px-4 pb-2 text-sm text-[var(--woody-accent)] sm:px-6" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <div className={footerClass}>
          <Button
            type="button"
            variant="outline"
            className={cn(woodyFocus.ring, "w-full sm:w-auto")}
            disabled={isBusy}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className={cn(
              woodyFocus.ring,
              "w-full bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90 sm:w-auto"
            )}
            disabled={isBusy}
            onClick={() => void onConfirm()}
          >
            {isBusy ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Ocultando…
              </>
            ) : (
              "Ocultar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
