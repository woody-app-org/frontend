import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  fetchMyFollowing,
  fetchMySuggestions,
} from "@/features/users/services/userSocial.service";
import type { User } from "@/domain/types";

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
  panel:
    "hidden md:flex flex-col w-full min-w-0 min-h-0 bg-[var(--woody-bg)] border-l border-[var(--woody-nav)]/15 overflow-y-auto",
  panelInner: "p-4 space-y-4",
  sectionTitle: "text-base font-bold text-[var(--woody-text)] mb-3",
  card:
    "rounded-2xl border border-[var(--woody-accent)]/20 bg-[var(--woody-card)] shadow-[0_1px_3px_rgba(92,58,59,0.06)] py-0 gap-0",
  cardContent: "p-4",
  list: "space-y-0",
  item:
    "flex items-start gap-3 rounded-md py-2 px-1 -mx-1 cursor-pointer transition-colors min-w-0",
  itemHover: "hover:bg-[var(--woody-nav)]/8",
  itemAvatar: "size-9 shrink-0",
  itemName:
    "flex-1 min-w-0 text-sm font-medium leading-snug text-[var(--woody-text)] break-words [overflow-wrap:anywhere]",
  emptyState: "flex items-center gap-2 py-3 text-sm text-[var(--woody-muted)]",
  emptyStateIcon: "size-4 shrink-0 text-[var(--woody-muted)]/80",
} as const;

type UserItem = { id: string; name: string; avatarUrl: string | null };

function UserRow({ user, className }: { user: UserItem; className?: string }) {
  return (
    <li>
      <Link
        to={`/profile/${user.id}`}
        className={cn(styles.item, styles.itemHover, className)}
        aria-label={`Ver perfil de ${user.name}`}
      >
        <Avatar size="default" className={styles.itemAvatar}>
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
          <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-xs">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <span className={styles.itemName}>{user.name}</span>
      </Link>
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
    if (!isAuthenticated) {
      setSuggestions([]);
      setFollowing([]);
      setLoadState("idle");
      return;
    }
    setLoadState("loading");
    try {
      const [sug, fol] = await Promise.all([fetchMySuggestions(8), fetchMyFollowing()]);
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
    void load();
  }, [load]);

  const hasSuggestions = suggestions.length > 0;
  const hasFollowing = following.length > 0;
  const showAuthHint = !isAuthenticated;

  return (
    <aside className={cn(styles.panel, className)}>
      <div className={styles.panelInner}>
        <section>
          <h2 className={styles.sectionTitle}>Sugestões</h2>
          <Card className={styles.card}>
            <CardContent className={cn(styles.cardContent, !hasSuggestions && !showAuthHint && "py-0")}>
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
                <ul className={styles.list}>
                  {suggestions.map((user) => (
                    <UserRow key={user.id} user={user} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
        <section>
          <h2 className={styles.sectionTitle}>Seguindo</h2>
          <Card className={styles.card}>
            <CardContent className={styles.cardContent}>
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
                <ul className={styles.list}>
                  {following.map((user) => (
                    <UserRow key={user.id} user={user} />
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </aside>
  );
}
