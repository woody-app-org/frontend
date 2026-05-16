import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CommentsEmptyStateProps {
  className?: string;
}

export function CommentsEmptyState({ className }: CommentsEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl py-10 px-4 text-center",
        "bg-[var(--woody-nav)]/[0.04]",
        className
      )}
    >
      <MessageCircle className="size-8 text-[var(--woody-muted)]/70" strokeWidth={1.5} aria-hidden />
      <p className="max-w-sm text-sm text-[var(--woody-muted)]">
        Ninguém comentou ainda. Seja a primeira a participar da conversa.
      </p>
    </div>
  );
}
