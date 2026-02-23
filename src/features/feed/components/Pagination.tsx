import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPrevious: () => void;
  onNext: () => void;
  page?: number;
  className?: string;
}

export function Pagination({
  hasPreviousPage,
  hasNextPage,
  onPrevious,
  onNext,
  page = 1,
  className,
}: PaginationProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 py-4",
        className
      )}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={!hasPreviousPage}
        className="border-[var(--woody-nav)]/30 text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/10 disabled:opacity-50"
      >
        <ChevronLeft className="size-4 mr-1" />
        Anterior
      </Button>
      <span className="text-sm text-[var(--woody-muted)] px-2">Página {page}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!hasNextPage}
        className="border-[var(--woody-nav)]/30 text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/10 disabled:opacity-50"
      >
        Próximo
        <ChevronRight className="size-4 ml-1" />
      </Button>
    </div>
  );
}
