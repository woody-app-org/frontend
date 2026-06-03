import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { StoryRing } from "@/components/ui/StoryRing";
import { cn } from "@/lib/utils";
import { Heart, UserPlus } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { fetchMySuggestions } from "@/features/users/services/userSocial.service";
import type { User } from "@/domain/types";
import { SOCIAL_GRAPH_CHANGED_EVENT, BLOCK_RELATIONSHIP_CHANGED_EVENT } from "@/lib/socialGraphEvents";
import { isOwnProfileRoute, profilePathForUser } from "@/features/profile/lib/profilePaths";
import { FeedDecorWaves } from "./FeedDecorWaves";
import { RightPanelProfileCard } from "./RightPanelProfileCard";

// Máximo de sugestões visíveis no painel (fixo — sem cálculo de viewport)
const SUGGESTIONS_VISIBLE = 3;

export interface RightPanelProps {
  className?: string;
}

const styles = {
  panel: "hidden md:flex min-h-0 w-full min-w-0 flex-col bg-transparent overflow-y-auto overflow-x-hidden",
  panelInner: "flex min-h-0 flex-col gap-3 pb-3",
  sectionCard:
    "overflow-hidden rounded-2xl border border-black/[0.07] bg-[var(--woody-card)] shadow-[0_2px_10px_rgba(10,10,10,0.04),0_0_0_1px_rgba(255,255,255,0.65)_inset]",
  sectionHead:
    "flex items-center gap-2.5 border-b border-black/[0.06] bg-gradient-to-br from-[var(--woody-nav)]/16 via-[var(--woody-card)] to-[var(--woody-card)] px-3.5 py-2.5",
  sectionHeadMark: "h-7 w-1 shrink-0 rounded-full bg-[var(--woody-nav)] shadow-[0_0_0_1px_rgba(139,195,74,0.2)]",
  sectionHeadTitle:
    "text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[var(--woody-text)]/88 leading-none",
  list: "divide-y divide-black/[0.055]",
  item: "flex min-w-0 items-center gap-2 px-3 py-2",
  itemLink:
    "flex min-w-0 min-h-0 flex-1 items-center gap-2.5 rounded-xl py-0.5 transition-colors hover:bg-black/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/30 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--woody-card)]",
  itemName:
    "min-w-0 flex-1 text-[13px] font-semibold leading-tight text-[var(--woody-text)] break-words [overflow-wrap:anywhere]",
  emptyState: "flex items-center gap-2 px-3 py-2.5 text-xs text-[var(--woody-muted)]",
  emptyStateIcon: "size-3.5 shrink-0 text-[var(--woody-muted)]/80",
  iconBtn:
    "flex size-8 shrink-0 items-center justify-center rounded-lg text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/12 transition-colors",
} as const;

type UserItem = {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  hasActiveStories?: boolean;
};

function SectionHeader({ title }: { title: string }) {
  return (
    <div className={styles.sectionHead} role="presentation">
      <span className={styles.sectionHeadMark} aria-hidden />
      <h2 className={styles.sectionHeadTitle}>{title}</h2>
    </div>
  );
}

function SuggestionUserRow({ user }: { user: UserItem }) {
  return (
    <li className={styles.item}>
      <Link to={profilePathForUser(user)} className={styles.itemLink} aria-label={`Ver perfil de ${user.name}`}>
        <StoryRing
          avatarUrl={user.avatarUrl}
          displayName={user.name}
          hasActiveStories={user.hasActiveStories ?? false}
          size="sm"
        />
        <span className={styles.itemName}>{user.name}</span>
      </Link>
      <Link
        to={profilePathForUser(user)}
        className={styles.iconBtn}
        aria-label={`Seguir ou ver ${user.name}`}
      >
        <UserPlus className="size-3.5" strokeWidth={2} aria-hidden />
      </Link>
    </li>
  );
}

function toRow(u: User): UserItem {
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    avatarUrl: u.avatarUrl,
    hasActiveStories: u.hasActiveStories,
  };
}

export function RightPanel({ className }: RightPanelProps) {
  const { pathname } = useLocation();
  const { isAuthenticated, user } = useAuth();
  const hideProfileCard = Boolean(user && isOwnProfileRoute(pathname, user));
  const [suggestions, setSuggestions] = useState<UserItem[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const load = useCallback(async () => {
    await Promise.resolve();
    if (!isAuthenticated) {
      setSuggestions([]);
      setLoadState("idle");
      return;
    }
    setLoadState("loading");
    try {
      // Pedimos apenas 3 sugestões — o painel mostra no máximo SUGGESTIONS_VISIBLE
      const sug = await fetchMySuggestions(SUGGESTIONS_VISIBLE);
      setSuggestions(sug.map(toRow));
      setLoadState("done");
    } catch {
      setSuggestions([]);
      setLoadState("error");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  useEffect(() => {
    const onSocialChange = () => void load();
    window.addEventListener(SOCIAL_GRAPH_CHANGED_EVENT, onSocialChange);
    window.addEventListener(BLOCK_RELATIONSHIP_CHANGED_EVENT, onSocialChange);
    return () => {
      window.removeEventListener(SOCIAL_GRAPH_CHANGED_EVENT, onSocialChange);
      window.removeEventListener(BLOCK_RELATIONSHIP_CHANGED_EVENT, onSocialChange);
    };
  }, [load]);

  const hasSuggestions = suggestions.length > 0;

  return (
    <aside data-feed-right-panel className={cn(styles.panel, className)}>
      <div className={styles.panelInner}>

        {/* ── Mini Profile Card (oculto no próprio perfil — evita duplicar o header) ── */}
        {isAuthenticated && user && !hideProfileCard ? (
          <RightPanelProfileCard user={user} />
        ) : null}

        {/* ── Sugestões para você (max 3, só quando existem) ────────────── */}
        {isAuthenticated && (hasSuggestions || loadState === "loading") ? (
          <section className={styles.sectionCard}>
            <SectionHeader title="Sugestões para você" />
            {loadState === "loading" && !hasSuggestions ? (
              <div className={styles.emptyState}>
                <span>Carregando…</span>
              </div>
            ) : (
              <ul className={cn(styles.list, "m-0 list-none p-0")}>
                {suggestions.slice(0, SUGGESTIONS_VISIBLE).map((u) => (
                  <SuggestionUserRow key={u.id} user={u} />
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {/* ── Card institucional ────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-black/[0.08] bg-gradient-to-b from-[var(--woody-card)] to-[var(--woody-main-surface)] px-3.5 py-3 shadow-[0_2px_8px_rgba(10,10,10,0.04)]">
          <FeedDecorWaves className="opacity-50" variant="promo" />
          <div
            className="pointer-events-none absolute -right-4 -bottom-5 size-20 rounded-full border border-[var(--woody-nav)]/18"
            aria-hidden
          />
          <div className="relative z-[1] flex size-7 items-center justify-center rounded-lg border border-[var(--woody-nav)]/28 bg-[var(--woody-nav)]/10">
            <Heart className="size-3.5 text-[var(--woody-nav)] stroke-[2]" aria-hidden />
          </div>
          <p className="relative z-[1] mt-2 text-[0.8125rem] font-semibold leading-snug text-[var(--woody-text)]">
            Descubra pessoas, conversas e comunidades com propósito.
          </p>
          <p className="relative z-[1] mt-0.5 text-[11px] leading-snug text-[var(--woody-muted)]">
            Participe, compartilhe e crie conexões reais.
          </p>
          <Link
            to="/planos"
            className="relative z-[1] mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--woody-nav)] hover:underline"
          >
            Saiba mais
            <span aria-hidden>→</span>
          </Link>
        </div>

      </div>
    </aside>
  );
}
