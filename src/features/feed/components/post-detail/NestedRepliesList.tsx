import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface NestedRepliesListProps {
  children: ReactNode;
  /** Profundidade atual (0 = primeiro nível de resposta). */
  depth: number;
  className?: string;
}

/**
 * Container leve para respostas: indentação + linha guia (sem caixas pesadas).
 */
export function NestedRepliesList({ children, depth, className }: NestedRepliesListProps) {
  return (
    <div
      className={cn(
        "mt-2 border-l border-[var(--woody-accent)]/18 pl-3 sm:pl-4",
        "ml-0 min-w-0 max-w-full",
        depth >= 2 && "border-[var(--woody-accent)]/12",
        className
      )}
    >
      <div className="space-y-1 sm:space-y-2">{children}</div>
    </div>
  );
}
