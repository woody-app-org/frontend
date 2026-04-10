import { Link } from "react-router-dom";
import { useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Community, Post, User } from "@/domain/types";
import { SearchModeSegment, type SearchMode } from "@/features/feed/components/SearchModeSegment";
import { getCommunityCategoryLabel } from "@/domain/categoryLabels";
import { useSearch } from "../hooks/useSearch";

export interface SharedSearchPanelProps {
  query: string;
  onQueryChange: (next: string) => void;
  mode: SearchMode;
  onModeChange: (next: SearchMode) => void;
  autoFocusRef?: React.RefObject<HTMLInputElement | null>;
  className?: string;
  /** Quando true (ex.: dentro do modal), a lista de resultados rola dentro do painel em vez de expandir a página. */
  scrollableResults?: boolean;
}

const placeholders: Record<SearchMode, string> = {
  posts: "Buscar por título, texto ou comunidade…",
  people: "Nome, @usuária ou bio…",
  communities: "Nome da comunidade, tema ou tag…",
};

export function SharedSearchPanel({
  query,
  onQueryChange,
  mode,
  onModeChange,
  autoFocusRef,
  className,
  scrollableResults = false,
}: SharedSearchPanelProps) {
  const fallbackRef = useRef<HTMLInputElement | null>(null);
  const inputRef = autoFocusRef ?? fallbackRef;

  const { isLoading, posts, people, communities } = useSearch({
    query,
    mode,
  });

  const hasQuery = query.trim().length > 0;
  const hasResults =
    mode === "posts"
      ? posts.length > 0
      : mode === "people"
        ? people.length > 0
        : communities.length > 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        scrollableResults && "min-h-0 flex-1",
        className
      )}
    >
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--woody-muted)] pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholders[mode]}
          className={cn(
            "w-full h-11 pl-9 pr-10 rounded-xl",
            "bg-white/60 border border-black/10",
            "text-[var(--woody-text)] placeholder:text-[var(--woody-muted)] text-sm",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/30 transition-shadow"
          )}
        />
        {isLoading ? (
          <Loader2
            className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-[var(--woody-muted)]"
            aria-label="Carregando"
          />
        ) : null}
      </div>

      <SearchModeSegment
        value={mode}
        onChange={onModeChange}
        className="w-full max-w-[480px] self-start shrink-0"
      />

      <div
        className={cn(
          scrollableResults
            ? "min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] pr-1"
            : "min-h-[240px]"
        )}
        role="region"
        aria-label="Resultados da busca"
      >
        {!hasQuery ? (
          <EmptyState
            title="Busca global"
            description="Encontre postagens, pessoas e comunidades em toda a plataforma."
          />
        ) : isLoading ? (
          <SkeletonResults mode={mode} />
        ) : !hasResults ? (
          <EmptyState
            title="Nada por aqui"
            description={
              mode === "posts"
                ? "Nenhuma postagem combina com a sua busca."
                : mode === "people"
                  ? "Nenhuma pessoa encontrada."
                  : "Nenhuma comunidade encontrada."
            }
          />
        ) : mode === "posts" ? (
          <PostsResults posts={posts} />
        ) : mode === "people" ? (
          <PeopleResults people={people} />
        ) : (
          <CommunitiesResults communities={communities} />
        )}
      </div>
    </div>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-xl border border-black/10 bg-white/40 px-6 py-10">
      <div className="text-[var(--woody-text)] font-semibold">{title}</div>
      <div className="mt-1 text-sm text-[var(--woody-muted)]">{description}</div>
    </div>
  );
}

function SkeletonResults({ mode }: { mode: SearchMode }) {
  const rows = mode === "people" ? 6 : mode === "communities" ? 5 : 4;
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-xl border border-black/10 bg-white/40 animate-pulse"
        />
      ))}
    </div>
  );
}

function PostsResults({ posts }: { posts: Post[] }) {
  return (
    <div className="flex flex-col gap-2">
      {posts.slice(0, 12).map((p) => (
        <div
          key={p.id}
          className="rounded-xl border border-black/10 bg-white/55 px-4 py-3 transition-colors hover:bg-white/75"
        >
          <div className="text-xs font-medium text-[var(--woody-nav)]">
            {p.community?.name ? (
              <Link
                to={`/communities/${p.community.slug}`}
                className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/30 rounded"
              >
                {p.community.name}
              </Link>
            ) : (
              "Comunidade"
            )}
          </div>
          <div className="mt-1 text-sm font-semibold text-[var(--woody-text)] line-clamp-2">
            {p.title || "Discussão"}
          </div>
          <div className="mt-0.5 text-xs text-[var(--woody-muted)] line-clamp-1">
            {p.author?.name ? `por ${p.author.name}` : " "}
          </div>
          {p.content ? (
            <div className="mt-1 text-sm text-[var(--woody-text)]/80 line-clamp-2">{p.content}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function PeopleResults({ people }: { people: User[] }) {
  return (
    <ul className="flex flex-col gap-2 list-none p-0 m-0">
      {people.slice(0, 14).map((u) => (
        <li key={u.id}>
          <Link
            to={`/profile/${u.id}`}
            className="flex items-center gap-3 rounded-xl border border-black/10 bg-white/55 px-4 py-3 transition-colors hover:bg-white/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/30"
          >
            <div className="size-9 rounded-full bg-black/10 overflow-hidden shrink-0">
              {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="size-9 object-cover" /> : null}
            </div>
            <div className="min-w-0 text-left">
              <div className="text-sm font-semibold text-[var(--woody-text)] truncate">{u.name}</div>
              <div className="text-xs text-[var(--woody-muted)] truncate">@{u.username}</div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CommunitiesResults({ communities }: { communities: Community[] }) {
  return (
    <ul className="flex flex-col gap-2 list-none p-0 m-0">
      {communities.slice(0, 14).map((c) => (
        <li key={c.id}>
          <Link
            to={`/communities/${c.slug}`}
            className="flex items-start gap-3 rounded-xl border border-black/10 bg-white/55 px-4 py-3 transition-colors hover:bg-white/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/30"
          >
            <div className="size-10 rounded-xl bg-black/10 overflow-hidden shrink-0 mt-0.5">
              {c.avatarUrl ? (
                <img src={c.avatarUrl} alt="" className="size-10 object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 text-left">
              <div className="text-sm font-semibold text-[var(--woody-text)]">{c.name}</div>
              <div className="text-xs text-[var(--woody-muted)]">
                {getCommunityCategoryLabel(c.category)} · {c.memberCount} membros
              </div>
              <div className="mt-1 text-xs text-[var(--woody-text)]/80 line-clamp-2">{c.description}</div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
