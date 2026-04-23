import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { FeedDecorWaves } from "./FeedDecorWaves";

export interface RightPanelProps {
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const styles = {
  panel: "hidden md:flex min-h-0 w-full min-w-0 flex-col bg-transparent overflow-y-auto overflow-x-hidden",
  panelInner: "flex min-h-0 flex-col gap-2.5 pb-3",
  sectionCard:
    "overflow-hidden rounded-xl border border-black/[0.08] bg-[var(--woody-card)] shadow-[0_1px_4px_rgba(10,10,10,0.04)]",
  sectionHead: "flex items-stretch bg-[var(--woody-ink)] text-white",
  sectionHeadAccent: "w-1.5 shrink-0 bg-[var(--woody-nav)]",
  sectionHeadTitle:
    "flex items-center py-2 pl-2.5 pr-2.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] leading-none text-white",
  list: "divide-y divide-black/[0.06]",
  item: "flex min-w-0 items-center gap-2 px-2.5 py-1.5",
  itemLink:
    "flex min-w-0 min-h-0 flex-1 items-center gap-2 rounded-md py-0 transition-colors hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/35 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--woody-card)]",
  itemAvatar: "size-7 shrink-0 rounded-full",
  itemName:
    "min-w-0 flex-1 text-[13px] font-medium leading-tight text-[var(--woody-text)] break-words [overflow-wrap:anywhere]",
  emptyState: "flex items-center gap-2 px-2.5 py-2 text-xs text-[var(--woody-muted)]",
  emptyStateIcon: "size-3.5 shrink-0 text-[var(--woody-muted)]/80",
  iconBtn:
    "flex size-7 shrink-0 items-center justify-center rounded-md text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/12 transition-colors",
} as const;

type UserItem = { id: string; name: string; avatarUrl: string | null };

function SectionHeader({ title }: { title: string }) {
  return (
    <div className={styles.sectionHead} role="presentation">
      <div className={styles.sectionHeadAccent} aria-hidden />
      <h2 className={styles.sectionHeadTitle}>{title}</h2>
    </div>
  );
}

function SuggestionUserRow({ user }: { user: UserItem }) {
  return (
    <li className={styles.item}>
      <Link to={`/profile/${user.id}`} className={styles.itemLink} aria-label={`Ver perfil de ${user.name}`}>
        <Avatar className={styles.itemAvatar}>
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
          <AvatarFallback className="bg-[var(--woody-tag-bg)] text-[var(--woody-tag-text)] text-[10px] leading-none">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <span className={styles.itemName}>{user.name}</span>
      </Link>
      <Link
        to={`/profile/${user.id}`}
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
      <Link to={`/profile/${user.id}`} className={styles.itemLink} aria-label={`Ver perfil de ${user.name}`}>
        <Avatar className={styles.itemAvatar}>
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
          <AvatarFallback className="bg-[var(--woody-tag-bg)] text-[var(--woody-tag-text)] text-[10px] leading-none">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <span className={styles.itemName}>{user.name}</span>
      </Link>
      {canDm ? (
        <StartConversationButton otherUserId={numericId} peerLabel={user.name} variant="icon" className="size-7 min-h-7 min-w-7" />
      ) : null}
    </li>
  );
}

function toRow(u: User): UserItem {
  return { id: u.id, name: u.name, avatarUrl: u.avatarUrl };
}

export function RightPanel({ className }: RightPanelProps) {
  const { isAuthenticated } = useAuth();
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
      const [sug, fol] = await Promise.all([fetchMySuggestions(6), fetchMyFollowing()]);
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

  return (
    <aside data-feed-right-panel className={cn(styles.panel, className)}>
      <div className={styles.panelInner}>
        <section className={styles.sectionCard}>
          <SectionHeader title="Sugestões para você" />
          <div className={!hasSuggestions && !showAuthHint ? "min-h-0" : undefined}>
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
              <ul className={cn(styles.list, "list-none p-0 m-0")}>
                {suggestions.map((user) => (
                  <SuggestionUserRow key={user.id} user={user} />
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className={styles.sectionCard}>
          <SectionHeader title="Pessoas em sintonia" />
          <div>
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
              <ul className={cn(styles.list, "list-none p-0 m-0")}>
                {following.map((user) => (
                  <FollowingUserRow key={user.id} user={user} />
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="relative overflow-hidden rounded-xl border border-white/[0.1] bg-[var(--woody-ink)] px-3 py-3 text-white shadow-[0_1px_6px_rgba(10,10,10,0.1)]">
          <FeedDecorWaves className="opacity-80" variant="promo" />
          <div
            className="pointer-events-none absolute -right-5 -bottom-6 size-24 rounded-full border border-[var(--woody-nav)]/22"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[var(--woody-nav)]/12 to-transparent opacity-90"
            aria-hidden
          />
          <div className="relative z-[1] flex size-7 items-center justify-center rounded-md border border-[var(--woody-nav)]/35 bg-black/40">
            <Heart className="size-3.5 text-[var(--woody-nav)] stroke-[2]" aria-hidden />
          </div>
          <p className="relative z-[1] mt-1.5 text-[0.8125rem] font-semibold leading-snug">
            Conexões verdadeiras começam aqui.
          </p>
          <p className="relative z-[1] mt-0.5 text-[10px] leading-snug text-white/70">
            Participa, partilha e descobre novas perspectivas.
          </p>
          <Link
            to="/planos"
            className="relative z-[1] mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--woody-nav)] hover:underline"
          >
            Saiba mais
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
