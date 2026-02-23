import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FeedErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function FeedErrorState({
  message = "Algo deu errado ao carregar o feed.",
  onRetry,
  className,
}: FeedErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
    >
      <AlertCircle className="size-12 text-[var(--woody-accent)] mb-4" />
      <h3 className="text-lg font-semibold text-[var(--woody-text)] mb-1">
        Erro ao carregar
      </h3>
      <p className="text-sm text-[var(--woody-muted)] max-w-sm mb-4">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          className="bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90"
        >
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
