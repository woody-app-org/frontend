import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StoryRing } from "@/components/ui/StoryRing";
import { cn } from "@/lib/utils";
import { Heart, UserPlus, Users } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { StartConversationButton } from "@/features/messages/components/StartConversationButton";
import {
  fetchMyFollowing,
  fetchMySuggestions,
} from "@/features/users/services/userSocial.service";
import type { User } from "@/domain/types";
import { SOCIAL_GRAPH_CHANGED_EVENT } from "@/lib/socialGraphEvents";
import { profilePathForUser } from "@/features/profile/lib/profilePaths";
import { FeedDecorWaves } from "./FeedDecorWaves";

/** Quantas linhas de utilizadora mostrar em cada cartão do painel — sem scroll interno; adapta ao ecrã. */
function useSidebarUserRowCap(): number {
  const [cap, setCap] = useState(4);

  useEffect(() => {
    const update = () => {
      const h = window.visualViewport?.height ?? window.innerHeight;
      const w = window.innerWidth;
      if (h < 640) setCap(3);
      else if (h < 740 || w < 900) setCap(4);
      else if (h < 900) setCap(5);
      else setCap(6);
    };
    update();
    window.addEventListener("resize", update);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      vv?.removeEventListener("resize", update);
    };
  }, []);

  return cap;
}

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

function FollowingUserRow({ user }: { user: UserItem }) {
  const numericId = Number.parseInt(user.id, 10);
  const canDm = Number.isFinite(numericId) && numericId > 0;

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
      {canDm ? (
        <StartConversationButton otherUserId={numericId} peerLabel={user.name} variant="icon" className="size-8 min-h-8 min-w-8" />
      ) : null}
    </li>
  );
}

function toRow(u: User): UserItem {
  return {
    id: u.id,
    name: u.name,
    avatarUrl: u.avatarUrl,
    hasActiveStories: u.hasActiveStories,
  };
}

export function RightPanel({ className }: RightPanelProps) {
  const { isAuthenticated } = useAuth();
  const rowCap = useSidebarUserRowCap();
  const [suggestions, setSuggestions] = useState<UserItem[]>([]);
  const [following, setFollowing] = useState<UserItem[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const load = useCallback(async () => {
    await Promise.resolve();
    if (!isAuthenticated) {
      setSuggestions([]);
      setFollowing([]);
      setLoadState("idle");
      return;
    }
    setLoadState("loading");
    try {
      const [sug, fol] = await Promise.all([fetchMySuggestions(12), fetchMyFollowing()]);
      setSuggestions(sug.map(toRow));
      setFollowing(fol.map(toRow));
      setLoadState("done");
    } catch {
      setSuggestions([]);
      setFollowing([]);
      setLoadState("error");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  useEffect(() => {
    const onSocialChange = () => {
      void load();
    };
    window.addEventListener(SOCIAL_GRAPH_CHANGED_EVENT, onSocialChange);
    return () => window.removeEventListener(SOCIAL_GRAPH_CHANGED_EVENT, onSocialChange);
  }, [load]);

  const hasSuggestions = suggestions.length > 0;
  const hasFollowing = following.length > 0;
  const showAuthHint = !isAuthenticated;
  const visibleSuggestions = suggestions.slice(0, rowCap);
  const visibleFollowing = following.slice(0, rowCap);

  return (
    <aside data-feed-right-panel className={cn(styles.panel, className)}>
      <div className={styles.panelInner}>
        <section className={styles.sectionCard}>
          <SectionHeader title="Sugestões para você" />
          {showAuthHint ? (
            <div className={styles.emptyState}>
              <Users className={styles.emptyStateIcon} aria-hidden />
              <span>Inicie sessão para ver sugestões de perfis.</span>
            </div>
          ) : loadState === "error" ? (
            <div className={styles.emptyState}>
              <span>Não foi possível carregar sugestões.</span>
            </div>
          ) : loadState === "loading" && !hasSuggestions ? (
            <div className={styles.emptyState}>
              <span>A carregar…</span>
            </div>
          ) : !hasSuggestions ? (
            <div className={styles.emptyState}>
              <Users className={styles.emptyStateIcon} aria-hidden />
              <span>Nenhuma sugestão no momento.</span>
            </div>
          ) : (
            <ul className={cn(styles.list, "m-0 list-none p-0")}>
              {visibleSuggestions.map((user) => (
                <SuggestionUserRow key={user.id} user={user} />
              ))}
            </ul>
          )}
        </section>

        <section className={styles.sectionCard}>
          <SectionHeader title="Pessoas em sintonia" />
          {showAuthHint ? (
            <div className={styles.emptyState}>
              <Users className={styles.emptyStateIcon} aria-hidden />
              <span>Inicie sessão para ver quem segue.</span>
            </div>
          ) : loadState === "loading" && !hasFollowing ? (
            <div className={styles.emptyState}>
              <span>A carregar…</span>
            </div>
          ) : loadState === "error" ? (
            <div className={styles.emptyState}>
              <span>Não foi possível carregar a lista.</span>
            </div>
          ) : !hasFollowing ? (
            <div className={styles.emptyState}>
              <Users className={styles.emptyStateIcon} aria-hidden />
              <span>Ainda não segue ninguém.</span>
            </div>
          ) : (
            <ul className={cn(styles.list, "m-0 list-none p-0")}>
              {visibleFollowing.map((user) => (
                <FollowingUserRow key={user.id} user={user} />
              ))}
            </ul>
          )}
        </section>

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
