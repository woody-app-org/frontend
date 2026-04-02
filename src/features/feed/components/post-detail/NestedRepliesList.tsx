import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface NestedRepliesListProps {
  children: ReactNode;
  /** Profundidade atual (0 = primeiro nível de resposta). */
  depth: number;
  /** Para `aria-controls` no botão que expande esta região. */
  regionId: string;
  className?: string;
}

/**
 * Container leve para respostas: guia vertical + fundo só no primeiro nível (contraste sutil com raízes).
 */
export function NestedRepliesList({ children, depth, regionId, className }: NestedRepliesListProps) {
  return (
    <div
      id={regionId}
      role="region"
      aria-label="Respostas ao comentário"
      className={cn(
        "mt-2.5 min-w-0 max-w-full border-l border-[var(--woody-accent)]/14",
        "ml-0 pl-2 sm:pl-3.5",
        depth === 0 &&
          "rounded-r-lg bg-[var(--woody-nav)]/[0.035] py-1.5 pr-1 sm:py-2 sm:pr-1.5",
        depth >= 1 && "border-[var(--woody-accent)]/10 pl-1.5 sm:pl-2.5",
        className
      )}
    >
      <div className="space-y-2.5 sm:space-y-3">{children}</div>
    </div>
  );
}
