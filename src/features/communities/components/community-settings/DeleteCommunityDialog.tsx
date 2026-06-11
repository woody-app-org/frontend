import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";

export interface DeleteCommunityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  communityName: string;
  isPending: boolean;
  onConfirm: () => void | Promise<void>;
}

export function DeleteCommunityDialog({
  open,
  onOpenChange,
  communityName,
  isPending,
  onConfirm,
}: DeleteCommunityDialogProps) {
  const [confirmText, setConfirmText] = useState("");

  const isMatch = confirmText.trim() === communityName;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return;
        if (!next) setConfirmText("");
        onOpenChange(next);
      }}
    >
      <DialogContent
        className={cn("border-[var(--woody-accent)]/15 sm:max-w-lg", "gap-0 p-0 overflow-hidden")}
      >
        <DialogHeader className="flex-col items-stretch justify-start gap-2 px-4 pt-5 pb-2 sm:px-6 sm:pt-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <AlertTriangle className="size-5" aria-hidden />
            </div>
            <DialogTitle className="text-[var(--woody-text)]">Excluir esta comunidade permanentemente?</DialogTitle>
          </div>
          <DialogDescription className="text-pretty pt-1">
            <span className="font-semibold text-red-600 dark:text-red-400">
              Esta ação é irreversível.
            </span>{" "}
            Todas as publicações, comentários, membros e dados desta comunidade serão apagados
            permanentemente e não poderão ser recuperados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 px-4 pb-4 sm:px-6">
          <Label htmlFor="delete-community-confirm" className="text-sm text-[var(--woody-text)]">
            Para confirmar, digite o nome da comunidade{" "}
            <span className="font-semibold">{communityName}</span>:
          </Label>
          <Input
            id="delete-community-confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={communityName}
            autoComplete="off"
            disabled={isPending}
            className={cn(
              "rounded-xl border-[var(--woody-accent)]/25 bg-[var(--woody-bg)]",
              "focus-visible:border-[var(--woody-accent)]/35 focus-visible:ring-[var(--woody-accent)]/20"
            )}
          />
        </div>

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
            disabled={isPending || !isMatch}
            onClick={() => void onConfirm()}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Excluindo…
              </>
            ) : (
              "Excluir comunidade permanentemente"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
