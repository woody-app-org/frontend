import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus, woodySurface } from "@/lib/woody-ui";

export interface CommunityNotFoundProps {
  className?: string;
}

export function CommunityNotFound({ className }: CommunityNotFoundProps) {
  return (
    <div
      className={cn(
        woodySurface.card,
        "mx-auto flex max-w-md flex-col items-center px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--woody-nav)]/10 text-[var(--woody-nav)]">
        <SearchX className="size-7" strokeWidth={1.75} aria-hidden />
      </div>
      <h1 className="text-lg font-bold text-[var(--woody-text)]">Comunidade não encontrada</h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--woody-muted)]">
        O link pode estar incorreto ou este espaço não existe mais. Volte para a lista e escolha outra
        comunidade.
      </p>
      <Button
        asChild
        className={cn(
          woodyFocus.ring,
          "mt-6 rounded-xl bg-[var(--woody-nav)] px-6 font-semibold text-white hover:bg-[var(--woody-nav)]/92"
        )}
      >
        <Link to="/communities">Ver comunidades</Link>
      </Button>
    </div>
  );
}
