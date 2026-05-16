import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { INSTITUTIONAL_PATHS } from "../routes";

export interface InstitutionalBackLinkProps {
  className?: string;
}

export function InstitutionalBackLink({ className }: InstitutionalBackLinkProps) {
  return (
    <Link
      to={INSTITUTIONAL_PATHS.hub}
      className={cn(
        "group mb-10 inline-flex items-center gap-2 text-sm font-semibold text-[var(--woody-muted)] transition-colors hover:text-[var(--woody-ink)]",
        className
      )}
    >
      <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
      Institucional
    </Link>
  );
}
