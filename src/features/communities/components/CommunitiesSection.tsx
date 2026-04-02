import { cn } from "@/lib/utils";
import { woodySection } from "@/lib/woody-ui";

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
      <div className={woodySection.headerRow}>
        <div className="min-w-0 flex-1">
          {eyebrow ? <p className={woodySection.eyebrow}>{eyebrow}</p> : null}
          <h2 id={headingId} className={woodySection.title}>
            {title}
          </h2>
          {description ? <p className={woodySection.subtitle}>{description}</p> : null}
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
