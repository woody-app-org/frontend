import type { LucideIcon } from "lucide-react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodySurface } from "@/lib/woody-ui";

export interface CommunitiesEmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  className?: string;
}

export function CommunitiesEmptyState({
  title,
  description,
  icon: Icon = Sparkles,
  className,
}: CommunitiesEmptyStateProps) {
  return (
    <div
      className={cn(
        woodySurface.emptyDashed,
        "flex flex-col items-center justify-center px-6 py-10 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[var(--woody-nav)]/10 text-[var(--woody-nav)]">
        <Icon className="size-6" strokeWidth={1.75} aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-[var(--woody-text)]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--woody-muted)]">{description}</p>
    </div>
  );
}
