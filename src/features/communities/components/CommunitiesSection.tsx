import { cn } from "@/lib/utils";

export interface CommunitiesSectionProps {
  /** Texto curto opcional acima do título (ex.: “Destaques”). */
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  /** Conteúdo à direita do título (desktop). */
  headerExtra?: React.ReactNode;
  /** Id estável para aria-labelledby (evita colisão se o título se repetir). */
  sectionId?: string;
}

export function CommunitiesSection({
  eyebrow,
  title,
  description,
  children,
  className,
  headerExtra,
  sectionId,
}: CommunitiesSectionProps) {
  const headingId = sectionId ?? titleId(title);
  return (
    <section className={cn("min-w-0", className)} aria-labelledby={headingId}>
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          {eyebrow ? (
            <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--woody-accent)]">
              {eyebrow}
            </p>
          ) : null}
          <h2 id={headingId} className="text-lg font-bold text-[var(--woody-text)] sm:text-xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--woody-muted)]">
              {description}
            </p>
          ) : null}
        </div>
        {headerExtra ? <div className="shrink-0">{headerExtra}</div> : null}
      </div>
      {children}
    </section>
  );
}

function titleId(title: string): string {
  return `communities-section-${slugify(title.slice(0, 48))}`;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "section";
}
