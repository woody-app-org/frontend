import { useMemo, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { subscribeUserDisplayPatches, getUserDisplayPatchesVersion } from "@/domain/mocks/userDisplayPatchStore";
import { getUserById } from "@/domain/selectors";

const MOCK_SUGGESTIONS: { id: string; name: string; avatarUrl: string }[] = [];

const MOCK_FOLLOWING = [
  {
    id: "1",
    name: "Débora da Silva",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    name: "Débora da Silva",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    name: "Débora da Silva",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: "4",
    name: "Débora da Silva",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
  {
    id: "5",
    name: "Débora da Silva",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  },
  {
    id: "6",
    name: "Débora da Silva",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
  },
];

export interface RightPanelProps {
  className?: string;
}

// --- Helpers ---

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// --- Estilos padronizados ---

const styles = {
  panel:
    "hidden md:flex flex-col w-full min-w-0 min-h-0 bg-[var(--woody-bg)] border-l border-[var(--woody-nav)]/15 overflow-y-auto",
  panelInner: "p-4 space-y-4",
  sectionTitle:
    "text-base font-bold text-[var(--woody-text)] mb-3",
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
  emptyState:
    "flex items-center gap-2 py-3 text-sm text-[var(--woody-muted)]",
  emptyStateIcon: "size-4 shrink-0 text-[var(--woody-muted)]/80",
} as const;

// --- UserRow (reutilizável: Sugestões + Seguindo) ---

type UserItem = { id: string; name: string; avatarUrl: string };

function UserRow({ user, className }: { user: UserItem; className?: string }) {
  return (
    <li>
      <Link
        to={`/profile/${user.id}`}
        className={cn(styles.item, styles.itemHover, className)}
        aria-label={`Ver perfil de ${user.name}`}
      >
        <Avatar size="default" className={styles.itemAvatar}>
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-xs">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <span className={styles.itemName}>{user.name}</span>
      </Link>
    </li>
  );
}

// --- Component ---

export function RightPanel({ className }: RightPanelProps) {
  const hasSuggestions = MOCK_SUGGESTIONS.length > 0;
  const userDisplayRev = useSyncExternalStore(
    subscribeUserDisplayPatches,
    getUserDisplayPatchesVersion,
    getUserDisplayPatchesVersion
  );
  const followingResolved = useMemo(
    () =>
      MOCK_FOLLOWING.map((item) => {
        const u = getUserById(item.id);
        return u
          ? { id: u.id, name: u.name, avatarUrl: u.avatarUrl ?? item.avatarUrl }
          : item;
      }),
    [userDisplayRev]
  );

  return (
    <aside className={cn(styles.panel, className)}>
      <div className={styles.panelInner}>
        <section>
          <h2 className={styles.sectionTitle}>Sugestões</h2>
          <Card className={styles.card}>
            <CardContent className={cn(styles.cardContent, !hasSuggestions && "py-0")}>
              {!hasSuggestions ? (
                <div className={styles.emptyState}>
                  <Users className={styles.emptyStateIcon} aria-hidden />
                  <span>Nenhuma sugestão no momento.</span>
                </div>
              ) : (
                <ul className={styles.list}>
                  {MOCK_SUGGESTIONS.map((user) => (
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
              <ul className={styles.list}>
                {followingResolved.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </aside>
  );
}
