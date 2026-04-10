import { useEffect, useMemo, useState } from "react";
import { HeartHandshake, Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodyFocus, woodyLayout, woodySurface } from "@/lib/woody-ui";
import type { Community, CommunityCategory } from "@/domain/types";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { CommunityCard } from "../components/CommunityCard";
import { CommunitiesEmptyState } from "../components/CommunitiesEmptyState";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { getCommunityCategoryLabel } from "../lib/communitiesPageModel";
import { fetchAllCommunities, fetchMyCommunityIdSet } from "../services/community.service";
import { getAuthUser } from "@/features/auth/services/auth.service";

const CATEGORY_ORDER: CommunityCategory[] = [
  "carreira",
  "bemestar",
  "cultura",
  "seguranca",
  "outro",
];

function normalizeSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

export function CommunitiesPage() {
  const viewerId = useViewerId();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [myIds, setMyIds] = useState<Set<string>>(new Set());
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const list = await fetchAllCommunities();
        if (cancel) return;
        setCommunities(list);
        setLoadError(null);
        if (getAuthUser()) {
          const ids = await fetchMyCommunityIdSet();
          if (!cancel) setMyIds(ids);
        } else {
          setMyIds(new Set());
        }
      } catch {
        if (!cancel) {
          setLoadError("Não foi possível carregar as comunidades.");
          setCommunities([]);
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, [viewerId]);

  const memberIds = myIds;

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CommunityCategory | "all">("all");

  const categoriesPresent = useMemo(() => {
    const set = new Set(communities.map((c) => c.category));
    return CATEGORY_ORDER.filter((c) => set.has(c));
  }, [communities]);

  const myCommunities = useMemo(
    () => communities.filter((c) => memberIds.has(c.id)),
    [communities, memberIds]
  );

  const filteredGrid = useMemo(() => {
    const q = normalizeSearch(query);
    const list = communities.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (!q) return true;
      const catLabel = normalizeSearch(getCommunityCategoryLabel(c.category));
      return (
        normalizeSearch(c.name).includes(q) ||
        normalizeSearch(c.slug).includes(q) ||
        normalizeSearch(c.description).includes(q) ||
        catLabel.includes(q) ||
        c.tags.some((t) => normalizeSearch(t).includes(q))
      );
    });
    return [...list].sort((a, b) => b.memberCount - a.memberCount);
  }, [query, category, communities]);

  return (
    <FeedLayout>
      <div
        className={cn(
          "mx-auto w-full max-w-6xl pb-20 md:pb-8",
          woodyLayout.pagePadWide,
          woodyLayout.stackGapTight
        )}
      >
        <header
          className={cn(
            woodySurface.cardHero,
            "relative overflow-hidden px-5 py-8 sm:px-8 sm:py-10"
          )}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[var(--woody-nav)]/10 blur-2xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/3 size-48 rounded-full bg-[var(--woody-accent)]/15 blur-2xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-4 md:max-w-3xl">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--woody-nav)]/12 px-3 py-1 text-xs font-semibold text-[var(--woody-text)] ring-1 ring-[var(--woody-accent)]/15">
              <Sparkles className="size-3.5 text-[var(--woody-nav)]" aria-hidden />
              Comunidades Woody
            </span>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-[var(--woody-text)] sm:text-3xl md:text-[2rem]">
              Espaços moderados para{" "}
              <span className="text-[var(--woody-nav)]">conversas que importam</span>
            </h1>
            <p className="text-sm leading-relaxed text-[var(--woody-muted)] sm:text-base md:max-w-2xl">
              Explore por tema, encontre grupos com propósito claro e entre quando se sentir à vontade —
              tudo permanece centrado em segurança e curadoria.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-[var(--woody-text)]/90">
              <span className="inline-flex items-center gap-2 rounded-xl bg-[var(--woody-bg)]/80 px-3 py-2 ring-1 ring-[var(--woody-accent)]/10">
                <HeartHandshake className="size-4 shrink-0 text-[var(--woody-accent)]" aria-hidden />
                Escalável à medida que a rede cresce
              </span>
            </div>
          </div>
        </header>

        {loadError ? (
          <p className="rounded-xl border border-[var(--woody-accent)]/15 bg-[var(--woody-nav)]/5 px-4 py-3 text-sm text-[var(--woody-muted)]">
            {loadError}
          </p>
        ) : null}

        {myCommunities.length > 0 ? (
          <section className="space-y-3" aria-labelledby="my-communities-heading">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 id="my-communities-heading" className="text-lg font-bold text-[var(--woody-text)]">
                  Minhas comunidades
                </h2>
                <p className="text-sm text-[var(--woody-muted)]">Acesso rápido aos grupos em que você já está.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myCommunities.map((c) => (
                <CommunityCard key={c.id} community={c} isMember visualWeight="emphasis" className="h-full" />
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-4" aria-labelledby="discover-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="discover-heading" className="text-lg font-bold text-[var(--woody-text)]">
                Descobrir comunidades
              </h2>
              <p className="text-sm text-[var(--woody-muted)]">
                Busca e filtros locais — ideal quando a lista crescer.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--woody-accent)]/16 bg-[var(--woody-card)]/95 p-3 sm:p-4 shadow-[0_1px_3px_rgba(58,45,36,0.05)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--woody-muted)] pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nome, tag ou descrição…"
                className={cn(
                  woodyFocus.ring,
                  "h-11 w-full rounded-xl border border-[var(--woody-accent)]/15 bg-[var(--woody-bg)]/80 pl-10 pr-3 text-sm text-[var(--woody-text)] placeholder:text-[var(--woody-muted)]",
                  "focus:outline-none focus-visible:ring-2"
                )}
                aria-label="Filtrar comunidades"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory("all")}
                className={cn(
                  woodyFocus.ring,
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                  category === "all"
                    ? "bg-[var(--woody-nav)] text-white"
                    : "bg-[var(--woody-bg)]/80 text-[var(--woody-text)] ring-1 ring-[var(--woody-accent)]/12 hover:bg-[var(--woody-nav)]/10"
                )}
              >
                Todas
              </button>
              {categoriesPresent.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    woodyFocus.ring,
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    category === cat
                      ? "bg-[var(--woody-nav)] text-white"
                      : "bg-[var(--woody-bg)]/80 text-[var(--woody-text)] ring-1 ring-[var(--woody-accent)]/12 hover:bg-[var(--woody-nav)]/10"
                  )}
                >
                  {getCommunityCategoryLabel(cat)}
                </button>
              ))}
            </div>
          </div>

          {filteredGrid.length === 0 ? (
            <CommunitiesEmptyState
              title="Nenhuma comunidade com esses filtros"
              description="Limpe a busca ou escolha outra categoria."
            />
          ) : (
            <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredGrid.map((c) => (
                <li key={c.id} className="min-w-0">
                  <CommunityCard
                    community={c}
                    isMember={memberIds.has(c.id)}
                    visualWeight="emphasis"
                    className="h-full"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </FeedLayout>
  );
}
