import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ReplyToggleProps {
  replyCount: number;
  expanded: boolean;
  onToggle: () => void;
  className?: string;
}

export function ReplyToggle({ replyCount, expanded, onToggle, className }: ReplyToggleProps) {
  const label = expanded ? "Ocultar respostas" : replyCount === 1 ? "Ver 1 resposta" : `Ver ${replyCount} respostas`;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-expanded={expanded}
      onClick={onToggle}
      className={cn(
        "-ml-1.5 h-auto gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[var(--woody-accent)]",
        "hover:bg-[var(--woody-nav)]/10 hover:text-[var(--woody-text)]",
        "transition-colors duration-150 active:scale-[0.99]",
        className
      )}
    >
      {expanded ? (
        <ChevronDown className="size-3.5 shrink-0 opacity-90" aria-hidden />
      ) : (
        <ChevronRight className="size-3.5 shrink-0 opacity-90" aria-hidden />
      )}
      {label}
    </Button>
  );
}
