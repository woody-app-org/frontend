import type { ReactNode } from "react";
import { FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodySurface } from "@/lib/woody-ui";

export interface FeedEmptyStateProps {
  className?: string;
  title?: string;
  description?: ReactNode;
}

export function FeedEmptyState({
  className,
  title = "Nenhum post por aqui",
  description = "Quando houver discussões nas suas comunidades, elas aparecerão aqui. Experimente outro filtro ou explore grupos em Comunidades.",
}: FeedEmptyStateProps) {
  return (
    <div
      className={cn(
        woodySurface.emptyDashed,
        "flex flex-col items-center justify-center py-11 px-4 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[var(--woody-nav)]/10 text-[var(--woody-nav)]">
        <FileQuestion className="size-6" strokeWidth={1.75} aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-[var(--woody-text)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--woody-muted)] max-w-sm">{description}</p>
    </div>
  );
}
