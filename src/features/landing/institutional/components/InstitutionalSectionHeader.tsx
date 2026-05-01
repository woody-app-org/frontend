import { cn } from "@/lib/utils";

export interface InstitutionalSectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function InstitutionalSectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: InstitutionalSectionHeaderProps) {
  return (
    <header
      className={cn(
        "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-700",
        align === "center" && "mx-auto max-w-3xl text-center",
        className
      )}
    >
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--woody-muted)]">{eyebrow}</p>
      ) : null}
      <h1
        className={cn(
          "mt-3 font-serif text-[clamp(1.85rem,4.2vw,3rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-[var(--woody-ink)]",
          eyebrow && "mt-2"
        )}
      >
        {title}
      </h1>
      {description ? (
        <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-[var(--woody-muted)] md:text-[1.1rem]">
          {description}
        </p>
      ) : null}
    </header>
  );
}
