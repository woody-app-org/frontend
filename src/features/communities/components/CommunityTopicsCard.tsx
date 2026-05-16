import { Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodySurface } from "@/lib/woody-ui";
import { CommunityTag } from "./CommunityTag";

const MAX_VISIBLE_TAGS = 5;

export interface CommunityTopicsCardProps {
  tags: string[];
  className?: string;
}

const panel = cn(woodySurface.card, "p-4 sm:p-5");

/**
 * Tags da comunidade na lateral — não repetir no hero.
 */
export function CommunityTopicsCard({ tags, className }: CommunityTopicsCardProps) {
  if (!tags.length) {
    return null;
  }

  const visible = tags.slice(0, MAX_VISIBLE_TAGS);
  const extra = tags.length - visible.length;

  return (
    <section className={cn(panel, className)} aria-labelledby="community-topics-heading">
      <div className="flex items-center gap-2">
        <Hash className="size-4 shrink-0 text-[var(--woody-accent)]" aria-hidden />
        <h2 id="community-topics-heading" className="text-sm font-bold text-[var(--woody-text)]">
          Tópicos
        </h2>
      </div>
      <p className="mt-1 text-xs leading-snug text-[var(--woody-muted)]">
        Assuntos que costumam aparecer por aqui.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {visible.map((tag) => (
          <CommunityTag key={tag} label={tag} className="max-w-[200px]" />
        ))}
        {extra > 0 ? (
          <span
            className="inline-flex items-center rounded-full border border-dashed border-[var(--woody-accent)]/30 px-2.5 py-0.5 text-[0.6875rem] font-semibold text-[var(--woody-muted)]"
            title={`Mais ${extra} ${extra === 1 ? "tópico" : "tópicos"}`}
          >
            +{extra}
          </span>
        ) : null}
      </div>
    </section>
  );
}
