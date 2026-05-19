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

export interface DeleteStoryConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDeleting: boolean;
  onConfirm: () => void | Promise<void>;
}

export function DeleteStoryConfirmationDialog({
  open,
  onOpenChange,
  isDeleting,
  onConfirm,
}: DeleteStoryConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !isDeleting && onOpenChange(next)}>
      <DialogContent
        className={cn(
          "z-[120] border-[var(--woody-accent)]/15 sm:max-w-md",
          "gap-0 p-0 overflow-hidden"
        )}
      >
        <DialogHeader className="px-4 pt-5 pb-2 sm:px-6 sm:pt-6">
          <DialogTitle className="text-[var(--woody-text)]">Excluir este story?</DialogTitle>
          <DialogDescription className="text-pretty pt-1 text-[var(--woody-muted)]">
            Ele deixará de aparecer para outras pessoas.
          </DialogDescription>
        </DialogHeader>
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
