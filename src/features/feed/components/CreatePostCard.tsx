import type { User, Community, Post } from "@/domain/types";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { woodySurface } from "@/lib/woody-ui";
import { getUserById } from "@/domain/selectors";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { useMeComposerUser } from "@/features/profile/hooks/useMeComposerUser";
import { PostComposerForm } from "./PostComposerForm";

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
  /** Comunidade fixa (página da comunidade ou modal contextual). */
  forcedCommunity?: Community;
  /** Só perfil: esconde escolha de destino (modal a partir do feed). */
  forceProfilePublication?: boolean;
  initialCommunityId?: string;
  /** Layout do compositor dentro de modais (área a rolar + barra inferior fixa). */
  embedMode?: "default" | "modal";
  onPostCreated?: (post: Post) => void;
  className?: string;
}

export function CreatePostCard({
  forcedCommunity,
  forceProfilePublication,
  initialCommunityId,
  embedMode = "default",
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

  const isModalEmbed = embedMode === "modal";

  return (
    <Card
      className={cn(
        woodySurface.card,
        "flex flex-col gap-0 border-[var(--woody-accent)]/12 py-0 shadow-[0_2px_12px_rgba(10,10,10,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_18px_rgba(10,10,10,0.07)]",
        isModalEmbed && "min-h-0 flex-1 rounded-none border-0 shadow-none hover:shadow-none",
        className
      )}
    >
      <CardContent
        className={cn(
          isModalEmbed ? "flex min-h-0 flex-1 flex-col p-0" : "px-4 py-4 sm:px-5 sm:py-5"
        )}
      >
        <PostComposerForm
          viewerId={viewerId}
          viewerPreview={currentUser}
          forcedCommunity={forcedCommunity}
          forceProfilePublication={forceProfilePublication}
          initialCommunityId={initialCommunityId}
          embedMode={embedMode}
          onPostCreated={onPostCreated}
        />
      </CardContent>
    </Card>
  );
}
