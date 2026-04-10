import type { User, Community, Post } from "@/domain/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { woodySurface } from "@/lib/woody-ui";
import { getUserById } from "@/domain/selectors";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { useMeComposerUser } from "@/features/profile/hooks/useMeComposerUser";
import { PostComposerForm } from "./PostComposerForm";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const styles = {
  card: cn(
    woodySurface.card,
    "flex flex-col gap-0 py-0 transition-shadow duration-200 hover:shadow-[0_4px_14px_rgba(58,45,36,0.06)]"
  ),
  content: "px-4 pt-4 pb-4 sm:px-5 sm:pt-5 sm:pb-5",
  header: "flex flex-row items-start gap-3",
  headerLeft: "flex min-w-0 flex-1 items-start gap-3",
  avatar: "size-9 shrink-0",
  headerMeta: "min-w-0 flex-1",
  authorName: "font-semibold text-[var(--woody-text)] text-[0.95rem] leading-tight truncate",
  authorPronouns: "text-[var(--woody-muted)] text-xs",
};

function mergeSessionIntoSeedUser(
  seed: User,
  sessionId: string,
  authId: string | undefined,
  authName?: string,
  authAvatar?: string,
  authUsername?: string
): User {
  if (authId !== sessionId) return seed;
  return {
    ...seed,
    name: authName?.trim() || seed.name,
    username: authUsername?.trim() || seed.username,
    avatarUrl: authAvatar !== undefined ? authAvatar || null : seed.avatarUrl,
  };
}

export interface CreatePostCardProps {
  /** Comunidade fixa (página da comunidade). */
  forcedCommunity?: Community;
  initialCommunityId?: string;
  /** `none` na página dedicada (feedback via banner no feed). */
  composerFeedback?: "full" | "none";
  onPostCreated?: (post: Post) => void;
  className?: string;
}

export function CreatePostCard({
  forcedCommunity,
  initialCommunityId,
  composerFeedback = "full",
  onPostCreated,
  className,
}: CreatePostCardProps) {
  const viewerId = useViewerId();
  const { user: authUser, isAuthenticated } = useAuth();
  const { user: meFromApi } = useMeComposerUser();
  const seedUser = getUserById(viewerId);
  const seedMerged =
    seedUser != null
      ? mergeSessionIntoSeedUser(
          seedUser,
          viewerId,
          authUser?.id,
          authUser?.name,
          authUser?.avatarUrl,
          authUser?.username
        )
      : undefined;

  const sessionOnlyUser: User | undefined =
    authUser != null
      ? {
          id: authUser.id,
          name: authUser.name?.trim() || authUser.username,
          username: authUser.username,
          avatarUrl: authUser.avatarUrl ?? null,
          pronouns: undefined,
          bio: undefined,
        }
      : undefined;

  const currentUser = isAuthenticated ? (meFromApi ?? sessionOnlyUser) : seedMerged;

  if (!currentUser) {
    return null;
  }

  return (
    <Card className={cn(styles.card, className)}>
      <CardContent className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Avatar size="default" className={styles.avatar}>
              <AvatarImage src={currentUser.avatarUrl ?? undefined} alt={currentUser.name} />
              <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-xs">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className={styles.headerMeta}>
              <div className="flex flex-wrap items-baseline gap-1">
                <span className={styles.authorName}>{currentUser.name}</span>
                {currentUser.pronouns && (
                  <>
                    <span className={styles.authorPronouns}>•</span>
                    <span className={cn(styles.authorPronouns, "truncate")}>{currentUser.pronouns}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <PostComposerForm
          className="mt-3"
          viewerId={viewerId}
          forcedCommunity={forcedCommunity}
          initialCommunityId={initialCommunityId}
          composerFeedback={composerFeedback}
          onPostCreated={onPostCreated}
        />
      </CardContent>
    </Card>
  );
}
