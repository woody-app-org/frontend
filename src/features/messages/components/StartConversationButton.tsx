import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { startOrGetConversation } from "../services/messages.service";

export type StartConversationButtonVariant = "primary" | "outline" | "icon";

export interface StartConversationButtonProps {
  otherUserId: number;
  /** Para acessibilidade e contexto de erro. */
  peerLabel?: string;
  variant?: StartConversationButtonVariant;
  /** Em listas compactas usa botão mais pequeno e sem largura total. */
  compact?: boolean;
  className?: string;
}

const primaryClass =
  "rounded-lg bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90 text-sm font-medium transition-transform active:scale-[0.98]";
const outlineClass =
  "rounded-lg border border-[var(--woody-nav)]/35 bg-[var(--woody-nav)]/6 text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/12 text-sm font-medium transition-transform active:scale-[0.98]";

export function StartConversationButton({
  otherUserId,
  peerLabel,
  variant = "primary",
  compact = false,
  className,
}: StartConversationButtonProps) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!Number.isFinite(otherUserId) || otherUserId < 1) return null;

  const who = peerLabel?.trim() || "utilizadora";
  const ariaBusy = busy ? "A abrir conversa" : `Enviar mensagem a ${who}`;

  const open = async () => {
    setBusy(true);
    setError(null);
    try {
      const conv = await startOrGetConversation(otherUserId);
      navigate(`/messages/${conv.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível abrir a conversa.");
    } finally {
      setBusy(false);
    }
  };

  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled={busy}
        title={error ?? ariaBusy}
        aria-label={ariaBusy}
        className={cn(woodyFocus.ring, "size-9 shrink-0 text-[var(--woody-nav)] hover:bg-[var(--woody-nav)]/10", className)}
        onClick={() => void open()}
      >
        <MessageCircle className="size-4" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1",
        compact ? "items-stretch" : "items-stretch sm:items-end",
        className
      )}
    >
      <Button
        type="button"
        variant={variant === "outline" ? "outline" : "default"}
        size={compact ? "sm" : "default"}
        disabled={busy}
        aria-label={ariaBusy}
        className={cn(
          woodyFocus.ring,
          "touch-manipulation",
          compact ? "h-9 w-auto shrink-0 px-3" : "min-h-10 w-full sm:min-h-9 sm:w-auto",
          variant === "outline" ? outlineClass : primaryClass,
          variant === "outline" ? "border-[var(--woody-accent)]/25 bg-[var(--woody-bg)]" : ""
        )}
        onClick={() => void open()}
      >
        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="size-4 shrink-0" />
          {busy ? "A abrir…" : "Mensagem"}
        </span>
      </Button>
      {error ? (
        <p className="max-w-[14rem] text-right text-xs leading-snug text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
