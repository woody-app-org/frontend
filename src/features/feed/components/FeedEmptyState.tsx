import { FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FeedEmptyStateProps {
  className?: string;
}

export function FeedEmptyState({ className }: FeedEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <FileQuestion className="size-12 text-[var(--woody-muted)] mb-4" />
      <h3 className="text-lg font-semibold text-[var(--woody-text)] mb-1">
        Nenhum post por aqui
      </h3>
      <p className="text-sm text-[var(--woody-muted)] max-w-sm">
        Quando houver discussões no feed, elas aparecerão aqui. Tente outro filtro ou volte mais tarde.
      </p>
    </div>
  );
}
