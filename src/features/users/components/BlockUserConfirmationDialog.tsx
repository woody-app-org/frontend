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

export interface BlockUserConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName?: string;
  isPending: boolean;
  onConfirm: () => void | Promise<void>;
}

export function BlockUserConfirmationDialog({
  open,
  onOpenChange,
  displayName,
  isPending,
  onConfirm,
}: BlockUserConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent
        className={cn(
          "border-[var(--woody-accent)]/15 sm:max-w-lg",
          "gap-0 p-0 overflow-hidden"
        )}
      >
        <DialogHeader className="px-4 pt-5 pb-2 sm:px-6 sm:pt-6">
          <DialogTitle className="text-[var(--woody-text)]">Bloquear esta usuária?</DialogTitle>
          <DialogDescription className="text-pretty pt-1">
            {displayName ? (
              <>
                <span className="font-medium text-[var(--woody-text)]">{displayName}</span> não será
                notificada. Depois do bloqueio, vocês deixam de ver perfis, publicações e interações
                uma da outra na Woody.
              </>
            ) : (
              <>
                Ela não será notificada. Depois do bloqueio, vocês deixam de ver perfis, publicações
                e interações uma da outra na Woody.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 border-t border-[var(--woody-accent)]/10 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button
            type="button"
            variant="outline"
            className={cn(woodyFocus.ring, "w-full min-h-11 touch-manipulation sm:w-auto")}
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            className={cn(woodyFocus.ring, "w-full min-h-11 touch-manipulation sm:w-auto")}
            disabled={isPending}
            onClick={() => void onConfirm()}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Bloqueando…
              </>
            ) : (
              "Bloquear"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
