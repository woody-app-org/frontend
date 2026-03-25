import { Link } from "react-router-dom";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { SEED_COMMUNITIES } from "@/domain/mocks/seed";

/**
 * Listagem inicial de comunidades (estrutura base; UI refinada em etapa futura).
 */
export function CommunitiesPage() {
  return (
    <FeedLayout>
      <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full px-3 md:px-6 py-4 md:py-5">
        <h1 className="text-xl font-bold text-[var(--woody-text)] mb-2">Comunidades</h1>
        <p className="text-sm text-[var(--woody-muted)] mb-6">
          Explore grupos e participe de conversas em espaços moderados.
        </p>
        <ul className="space-y-4 list-none p-0 m-0">
          {SEED_COMMUNITIES.map((c) => (
            <li key={c.id}>
              <Link
                to={`/communities/${c.slug}`}
                className="block rounded-2xl border border-[var(--woody-accent)]/20 bg-[var(--woody-card)] p-4 hover:bg-[var(--woody-nav)]/5 transition-colors"
              >
                <span className="font-semibold text-[var(--woody-text)]">{c.name}</span>
                <span className="block text-xs text-[var(--woody-muted)] mt-1 line-clamp-2">
                  {c.description}
                </span>
                <span className="inline-block mt-2 text-xs text-[var(--woody-muted)]">
                  {c.memberCount} membros · {c.category}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </FeedLayout>
  );
}
