import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ReplyToggleProps {
  replyCount: number;
  expanded: boolean;
  onToggle: () => void;
  /** Região de respostas controlada por este botão (acessibilidade). */
  ariaControls?: string;
  className?: string;
}

export function ReplyToggle({ replyCount, expanded, onToggle, ariaControls, className }: ReplyToggleProps) {
  const label = expanded ? "Ocultar respostas" : replyCount === 1 ? "Ver 1 resposta" : `Ver ${replyCount} respostas`;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-expanded={expanded}
      aria-controls={ariaControls}
      onClick={onToggle}
      className={cn(
        "touch-manipulation",
        "-ml-1.5 h-auto min-h-11 min-w-0 gap-1.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium sm:min-h-9 sm:px-2 sm:py-1.5 sm:text-xs",
        expanded
          ? "bg-[var(--woody-nav)]/14 text-[var(--woody-text)] ring-1 ring-inset ring-[var(--woody-accent)]/16"
          : "text-[var(--woody-accent)]",
        "hover:bg-[var(--woody-nav)]/12 hover:text-[var(--woody-text)]",
        "transition-[color,background-color,box-shadow,transform] duration-200 active:scale-[0.99]",
        className
      )}
    >
      {expanded ? (
        <ChevronDown className="size-4 shrink-0 opacity-90 sm:size-3.5" aria-hidden />
      ) : (
        <ChevronRight className="size-4 shrink-0 opacity-90 sm:size-3.5" aria-hidden />
      )}
      <span className="leading-snug">{label}</span>
    </Button>
  );
}
