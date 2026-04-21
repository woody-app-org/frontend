import { useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { FeedErrorState } from "@/features/feed/components/FeedErrorState";
import { useAuth } from "@/features/auth/context/AuthContext";
import { FollowProfileButton } from "../components/FollowProfileButton";
import { ProfileFollowListsDialog } from "../components/ProfileFollowListsDialog";
import { ProfileFollowStats } from "../components/ProfileFollowStats";
import type { ProfileFollowListKind } from "../hooks/useProfileFollowUsersList";
import { useUserProfile } from "../hooks/useUserProfile";
import { ProfileHeader } from "../components/ProfileHeader";
import { EditProfileDialog } from "../components/EditProfileDialog";
import { ProfileCommunitiesSection } from "../components/ProfileCommunitiesSection";
import { ProfilePostsSection } from "../components/ProfilePostsSection";
import { ProfileOverviewTab } from "../components/ProfileOverviewTab";
import { ProfileSkeleton } from "../components/ProfileSkeleton";
import { useProfilePermissions } from "@/features/auth/hooks/useProfilePermissions";
import type { UserProfile } from "../types";
import { cn } from "@/lib/utils";
import { woodyFocus, woodyLayout } from "@/lib/woody-ui";
import { dispatchSocialGraphChanged } from "@/lib/socialGraphEvents";
import { StartConversationButton } from "@/features/messages/components/StartConversationButton";

type ProfileTab = "posts" | "communities" | "about";

const TABS: { id: ProfileTab; label: string }[] = [
  { id: "posts", label: "Posts" },
  { id: "communities", label: "Comunidades" },
  { id: "about", label: "Sobre" },
];

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: authUser, patchUser, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<ProfileTab>("posts");
  const [editOpen, setEditOpen] = useState(false);
  const [followList, setFollowList] = useState<ProfileFollowListKind | null>(null);
  const [followListsRevision, setFollowListsRevision] = useState(0);
  const {
    profile,
    posts,
    isLoading,
    error,
    page,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    refetch,
    updatePostInList,
    removePostFromList,
    applyFollowPatch,
  } = useUserProfile(userId);
  const { isOwnProfile } = useProfilePermissions(userId);

  const bumpFollowLists = useCallback(() => {
    setFollowListsRevision((n) => n + 1);
  }, []);

  const handleFollowCommit = useCallback(
    (patch: { isFollowing: boolean; followersCount: number }) => {
      applyFollowPatch(patch);
      bumpFollowLists();
      dispatchSocialGraphChanged();
    },
    [applyFollowPatch, bumpFollowLists]
  );

  const handleFollowListOpenChange = useCallback((open: boolean) => {
    if (!open) setFollowList(null);
  }, []);

  const handleFollowListKindChange = useCallback((kind: ProfileFollowListKind) => {
    setFollowList(kind);
  }, []);

  const handleProfileSaved = useCallback(
    (next: UserProfile) => {
      void refetch();
      if (authUser?.id === next.id) {
        patchUser({
          name: next.name,
          username: next.username,
          avatarUrl: next.avatarUrl ?? undefined,
        });
      }
    },
    [authUser?.id, patchUser, refetch]
  );

  if (!userId) {
    navigate("/feed", { replace: true });
    return null;
  }

  const activeIndex = Math.max(0, TABS.findIndex((t) => t.id === tab));
  const profileNumericId = profile && !isOwnProfile ? Number.parseInt(profile.id, 10) : NaN;
  const canStartDmFromProfile =
    Boolean(profile) && !isOwnProfile && isAuthenticated && Number.isFinite(profileNumericId) && profileNumericId > 0;

  return (
    <FeedLayout>
      <div
        className={cn(
          "flex flex-col flex-1 w-full max-w-3xl mx-auto pb-16 md:pb-6",
          woodyLayout.pagePad
        )}
      >
        {isLoading && <ProfileSkeleton />}

        {!isLoading && error && <FeedErrorState message={error.message} onRetry={refetch} />}

        {!isLoading && !error && profile && (
          <>
            <ProfileHeader
              profile={profile}
              className="mb-5 md:mb-6"
              isOwnProfile={isOwnProfile}
              onEditProfile={isOwnProfile ? () => setEditOpen(true) : undefined}
              followStats={
                <ProfileFollowStats
                  followersCount={profile.followersCount ?? 0}
                  followingCount={profile.followingCount ?? 0}
                  onOpenFollowers={() => setFollowList("followers")}
                  onOpenFollowing={() => setFollowList("following")}
                />
              }
              followSlot={
                !isOwnProfile && isAuthenticated ? (
                  <div className="flex w-full flex-col gap-2 sm:items-end">
                    <FollowProfileButton
                      targetUserId={profile.id}
                      targetDisplayName={profile.name}
                      initialIsFollowing={profile.isFollowing}
                      initialFollowersCount={profile.followersCount}
                      onCommit={handleFollowCommit}
                    />
                    {canStartDmFromProfile ? (
                      <StartConversationButton
                        otherUserId={profileNumericId}
                        peerLabel={profile.name}
                        variant="outline"
                      />
                    ) : null}
                  </div>
                ) : undefined
              }
            />
            <ProfileFollowListsDialog
              open={followList !== null}
              onOpenChange={handleFollowListOpenChange}
              profileUserId={profile.id}
              profileName={profile.name}
              kind={followList ?? "followers"}
              onKindChange={handleFollowListKindChange}
              followersCount={profile.followersCount ?? 0}
              followingCount={profile.followingCount ?? 0}
              refreshEpoch={followListsRevision}
            />
            {isOwnProfile ? (
              <EditProfileDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                profile={profile}
                onSaved={handleProfileSaved}
              />
            ) : null}

            <div
              className={cn(
                "relative mb-6 grid grid-cols-3 gap-1 p-1 rounded-xl border border-[var(--woody-accent)]/16 bg-[var(--woody-card)]/98",
                "shadow-[0_1px_3px_rgba(58,45,36,0.05)]"
              )}
              role="tablist"
              aria-label="Seções do perfil"
            >
              <span
                aria-hidden
                className="absolute inset-y-1.5 left-1.5 w-[calc((100%-0.75rem)/3)] rounded-lg bg-[var(--woody-nav)] shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-transform duration-200 ease-out"
                style={{ transform: `translateX(${activeIndex * 100}%)` }}
              />
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    woodyFocus.ring,
                    "relative z-10 min-w-0 py-2.5 px-1 sm:px-3 rounded-lg text-sm transition-colors duration-200",
                    tab === t.id
                      ? "text-white font-semibold"
                      : "bg-transparent text-[var(--woody-text)]/85 font-medium hover:text-[var(--woody-text)]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="min-w-0">
              {tab === "posts" ? (
                <ProfilePostsSection
                  posts={posts}
                  isLoading={false}
                  page={page}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={hasPreviousPage}
                  onPreviousPage={previousPage}
                  onNextPage={nextPage}
                  onPin={(id) => console.log("Pin", id)}
                  onPostUpdated={updatePostInList}
                  onPostDeleted={removePostFromList}
                  hideSectionHeader
                />
              ) : null}

              {tab === "communities" ? (
                <ProfileCommunitiesSection
                  userId={profile.id}
                  isOwnProfile={isOwnProfile}
                  shortName={profile.name.split(/\s+/)[0]}
                  bare
                />
              ) : null}

              {tab === "about" ? <ProfileOverviewTab profile={profile} /> : null}
            </div>
          </>
        )}

        {!isLoading && !error && !profile && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-[var(--woody-muted)]">Perfil não encontrado.</p>
            <button
              type="button"
              onClick={() => navigate("/feed")}
              className="mt-4 text-sm font-medium text-[var(--woody-accent)] hover:underline"
            >
              Voltar ao início
            </button>
          </div>
        )}
      </div>
    </FeedLayout>
  );
}
