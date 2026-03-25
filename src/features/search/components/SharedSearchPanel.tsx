import { useMemo, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Post } from "@/features/feed/types";
import { SearchModeSegment, type SearchMode } from "@/features/feed/components/SearchModeSegment";
import { useSearch } from "../hooks/useSearch";

export interface SharedSearchPanelProps {
  query: string;
  onQueryChange: (next: string) => void;
  mode: SearchMode;
  onModeChange: (next: SearchMode) => void;
  autoFocusRef?: React.RefObject<HTMLInputElement | null>;
  sourcePosts: Post[];
  className?: string;
  /** Quando true (ex.: dentro do modal), a lista de resultados rola dentro do painel em vez de expandir a página. */
  scrollableResults?: boolean;
}

export function SharedSearchPanel({
  query,
  onQueryChange,
  mode,
  onModeChange,
  autoFocusRef,
  sourcePosts,
  className,
  scrollableResults = false,
}: SharedSearchPanelProps) {
  const fallbackRef = useRef<HTMLInputElement | null>(null);
  const inputRef = autoFocusRef ?? fallbackRef;

  const { isLoading, posts, people } = useSearch({
    query,
    mode,
    source: useMemo(() => ({ posts: sourcePosts }), [sourcePosts]),
  });

  const hasQuery = query.trim().length > 0;
  const hasResults = mode === "topics" ? posts.length > 0 : people.length > 0;

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
          placeholder={mode === "topics" ? "Buscar tópicos..." : "Buscar pessoas..."}
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
        className={cn(
          "w-full max-w-[360px] self-start shrink-0",
          // no modal o fundo do pill precisa “assentar” no card bege
          "bg-black/5 border-black/10 [&>button]:text-[var(--woody-text)] [&>button[aria-selected='false']]:text-[var(--woody-muted)]"
        )}
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
            title="Comece a buscar"
            description="Digite acima para encontrar tópicos e pessoas."
          />
        ) : isLoading ? (
          <SkeletonResults mode={mode} />
        ) : !hasResults ? (
          <EmptyState
            title="Nada por aqui"
            description={mode === "topics" ? "Nenhum tópico encontrado." : "Nenhuma pessoa encontrada."}
          />
        ) : mode === "topics" ? (
          <TopicsResults posts={posts} />
        ) : (
          <PeopleResults people={people} />
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
  const rows = mode === "topics" ? 4 : 6;
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

function TopicsResults({ posts }: { posts: Post[] }) {
  return (
    <div className="flex flex-col gap-2">
      {posts.slice(0, 10).map((p) => (
        <div
          key={p.id}
          className="rounded-xl border border-black/10 bg-white/55 px-4 py-3 hover:bg-white/70 transition-colors"
        >
          <div className="text-sm font-semibold text-[var(--woody-text)] line-clamp-1">
            {p.title || p.topic || "Tópico"}
          </div>
          <div className="mt-0.5 text-xs text-[var(--woody-muted)] line-clamp-1">
            {p.author?.name ? `por ${p.author.name}` : " "}
          </div>
          {p.content ? (
            <div className="mt-1 text-sm text-[var(--woody-text)]/80 line-clamp-2">
              {p.content}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function PeopleResults({ people }: { people: { id: string; name: string; avatarUrl: string | null; pronouns?: string }[] }) {
  return (
    <div className="flex flex-col gap-2">
      {people.slice(0, 12).map((u) => (
        <div
          key={u.id}
          className="flex items-center gap-3 rounded-xl border border-black/10 bg-white/55 px-4 py-3 hover:bg-white/70 transition-colors"
        >
          <div className="size-9 rounded-full bg-black/10 overflow-hidden shrink-0">
            {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="size-9 object-cover" /> : null}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[var(--woody-text)] truncate">{u.name}</div>
            {u.pronouns ? (
              <div className="text-xs text-[var(--woody-muted)] truncate">{u.pronouns}</div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

