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

export interface LogoutConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: () => void | Promise<void>;
}

export function LogoutConfirmationDialog({
  open,
  onOpenChange,
  isPending,
  onConfirm,
}: LogoutConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent
        className={cn(
          "border-[var(--woody-accent)]/15 sm:max-w-lg",
          "gap-0 p-0 overflow-hidden"
        )}
      >
        <DialogHeader className="px-4 pt-5 pb-2 sm:px-6 sm:pt-6">
          <DialogTitle className="text-[var(--woody-text)]">Sair da conta?</DialogTitle>
          <DialogDescription className="text-pretty pt-1">
            Você precisará entrar de novo para ver o feed e suas comunidades.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col-reverse gap-2 border-t border-[var(--woody-accent)]/10 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button
            type="button"
            variant="outline"
            className={cn(woodyFocus.ring, "w-full sm:w-auto")}
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            className={cn(woodyFocus.ring, "w-full sm:w-auto")}
            disabled={isPending}
            onClick={() => void onConfirm()}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Saindo…
              </>
            ) : (
              "Sair"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
