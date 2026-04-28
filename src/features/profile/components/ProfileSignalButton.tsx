import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { ProfileSignalDialog } from "./ProfileSignalDialog";

export interface ProfileSignalButtonProps {
  recipientUserId: number;
  recipientName: string;
}

export function ProfileSignalButton({ recipientUserId, recipientName }: ProfileSignalButtonProps) {
  const [open, setOpen] = useState(false);

  if (!Number.isFinite(recipientUserId) || recipientUserId < 1) return null;

  return (
    <div className="flex min-w-0 flex-col gap-1 items-stretch sm:items-end">
      <Button
        type="button"
        variant="outline"
        aria-label={`Enviar sinal para ${recipientName}`}
        className={cn(
          woodyFocus.ring,
          "touch-manipulation min-h-10 w-full rounded-lg border-[var(--woody-accent)]/25 bg-[var(--woody-bg)] text-sm font-medium text-[var(--woody-text)] transition-transform hover:bg-[var(--woody-nav)]/10 active:scale-[0.98] sm:min-h-9 sm:w-auto"
        )}
        onClick={() => setOpen(true)}
      >
        <span className="relative inline-flex size-4 items-center justify-center">
          <Heart className="size-4 text-[var(--woody-nav)]" aria-hidden />
          <Sparkles className="absolute -right-1 -top-1 size-2.5 text-[var(--woody-nav)]" aria-hidden />
        </span>
        Enviar sinal
      </Button>
      <ProfileSignalDialog
        open={open}
        onOpenChange={setOpen}
        recipientUserId={recipientUserId}
        recipientName={recipientName}
      />
    </div>
  );
}
