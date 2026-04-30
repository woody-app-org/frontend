import { startTransition, useCallback, useEffect, useState, type ReactNode } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Activity, Bookmark } from "lucide-react";
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
import { ProfileSignalButton } from "../components/ProfileSignalButton";
import { ProfileSignalsTab } from "../components/ProfileSignalsTab";
import { useProfileSignalsUnreadCount } from "../hooks/useProfileSignalsUnreadCount";

type ProfileTab = "posts" | "about" | "communities" | "saved" | "activity" | "signals";

const BASE_TABS: { id: ProfileTab; label: string }[] = [
  { id: "posts", label: "Publicações" },
  { id: "about", label: "Sobre" },
  { id: "communities", label: "Comunidades" },
  { id: "saved", label: "Salvos" },
  { id: "activity", label: "Atividades" },
];

const OWN_PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  ...BASE_TABS,
  { id: "signals", label: "Sinais" },
];

function ProfileEmptyTab({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--woody-divider)] bg-[var(--woody-card)]/82 px-5 py-10 text-center shadow-[0_1px_3px_rgba(10,10,10,0.04)]">
      <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-[var(--woody-tag-bg)] text-[var(--woody-nav)]">
        {icon}
      </div>
      <h2 className="text-sm font-semibold text-[var(--woody-text)]">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-[var(--woody-muted)]">{description}</p>
    </div>
  );
}

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: authUser, patchUser, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<ProfileTab>("posts");
  const [editOpen, setEditOpen] = useState(false);
  const [followList, setFollowList] = useState<ProfileFollowListKind | null>(null);
  const [followListsRevision, setFollowListsRevision] = useState(0);
  const {
    profile,
    pinnedPosts,
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
    toggleProfilePin,
    pinningPostId,
    pinActionError,
    dismissPinActionError,
    pinActionSuccess,
    dismissPinActionSuccess,
    applyFollowPatch,
  } = useUserProfile(userId);
  const { isOwnProfile } = useProfilePermissions(userId);

  const { unreadCount: unreadSignalsCount } = useProfileSignalsUnreadCount(
    Boolean(isOwnProfile && authUser?.id)
  );

  useEffect(() => {
    if (!isOwnProfile) return;
    const q = searchParams.get("tab");
    if (q === "signals") {
      startTransition(() => {
        setTab("signals");
      });
    }
  }, [isOwnProfile, searchParams]);

  const selectTab = useCallback(
    (id: ProfileTab) => {
      setTab(id);
      if (!isOwnProfile) return;
      if (id === "signals") {
        setSearchParams({ tab: "signals" }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    },
    [isOwnProfile, setSearchParams]
  );

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

  const profileNumericId = profile && !isOwnProfile ? Number.parseInt(profile.id, 10) : NaN;
  const canStartDmFromProfile =
    Boolean(profile) && !isOwnProfile && isAuthenticated && Number.isFinite(profileNumericId) && profileNumericId > 0;
  const visibleTabs = isOwnProfile ? OWN_PROFILE_TABS : BASE_TABS;
  const activeTab = !isOwnProfile && tab === "signals" ? "posts" : tab;

  return (
    <FeedLayout>
      <div
        className={cn(
          "flex flex-col flex-1 w-full max-w-4xl mx-auto pb-16 md:pb-6",
          woodyLayout.pagePad
        )}
      >
        {isLoading && <ProfileSkeleton />}

        {!isLoading && error && <FeedErrorState message={error.message} onRetry={refetch} />}

        {!isLoading && !error && profile && (
          <>
            <ProfileHeader
              profile={profile}
              className="mb-6"
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
                  <div className="flex w-full max-w-full flex-col gap-2 sm:max-w-xl sm:ml-auto">
                    <FollowProfileButton
                      targetUserId={profile.id}
                      targetDisplayName={profile.name}
                      initialIsFollowing={profile.isFollowing}
                      initialFollowersCount={profile.followersCount}
                      onCommit={handleFollowCommit}
                    />
                    {canStartDmFromProfile ? (
                      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2 sm:justify-items-stretch">
                        <ProfileSignalButton
                          recipientUserId={profileNumericId}
                          recipientName={profile.name}
                          className="min-w-0"
                        />
                        <StartConversationButton
                          otherUserId={profileNumericId}
                          peerLabel={profile.name}
                          variant="outline"
                          className="min-w-0"
                        />
                      </div>
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
                "mb-4 overflow-x-auto border-b border-[var(--woody-divider)]/90 bg-transparent",
                "[-webkit-overflow-scrolling:touch]",
                "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              )}
              role="tablist"
              aria-label="Seções do perfil"
            >
              <div className="flex min-w-max items-end gap-8 px-1 sm:gap-10">
                {visibleTabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === t.id}
                    onClick={() => selectTab(t.id)}
                    className={cn(
                      woodyFocus.ring,
                      "relative min-h-11 rounded-none px-0 pb-3 pt-2 text-sm font-semibold transition-colors duration-200",
                      activeTab === t.id
                        ? "text-[var(--woody-text)]"
                        : "text-[var(--woody-muted)] hover:text-[var(--woody-text)]"
                    )}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {t.label}
                      {t.id === "signals" && unreadSignalsCount > 0 ? (
                        <span
                          className="inline-block size-2 shrink-0 rounded-full bg-[var(--woody-nav)]"
                          title={`${unreadSignalsCount} por ler`}
                          aria-hidden
                        />
                      ) : null}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-0 bottom-[-1px] h-0.5 rounded-full bg-[var(--woody-nav)] transition-opacity duration-200",
                        activeTab === t.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              {activeTab === "posts" ? (
                <ProfilePostsSection
                  pinnedPosts={pinnedPosts}
                  posts={posts}
                  isLoading={false}
                  page={page}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={hasPreviousPage}
                  onPreviousPage={previousPage}
                  onNextPage={nextPage}
                  onPostUpdated={updatePostInList}
                  onPostDeleted={removePostFromList}
                  hideSectionHeader
                  isOwnProfile={isOwnProfile}
                  onToggleProfilePin={toggleProfilePin}
                  pinningPostId={pinningPostId}
                  pinActionError={pinActionError}
                  onDismissPinError={dismissPinActionError}
                  pinActionSuccess={pinActionSuccess}
                  onDismissPinSuccess={dismissPinActionSuccess}
                />
              ) : null}

              {activeTab === "communities" ? (
                <ProfileCommunitiesSection
                  userId={profile.id}
                  isOwnProfile={isOwnProfile}
                  shortName={profile.name.split(/\s+/)[0]}
                  bare
                />
              ) : null}

              {activeTab === "about" ? <ProfileOverviewTab profile={profile} /> : null}

              {activeTab === "saved" ? (
                <ProfileEmptyTab
                  icon={<Bookmark className="size-5" aria-hidden />}
                  title={isOwnProfile ? "Salvos em construção" : "Salvos privados"}
                  description={
                    isOwnProfile
                      ? "A estrutura visual já está preparada para reunir publicações guardadas quando esta área estiver conectada."
                      : "As publicações salvas não são públicas neste perfil."
                  }
                />
              ) : null}

              {activeTab === "activity" ? (
                <ProfileEmptyTab
                  icon={<Activity className="size-5" aria-hidden />}
                  title="Atividades recentes"
                  description="Quando a atividade do perfil estiver disponível, comentários, participações e movimentos relevantes aparecerão aqui."
                />
              ) : null}

              {activeTab === "signals" && isOwnProfile ? <ProfileSignalsTab /> : null}
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
