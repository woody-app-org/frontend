import { useParams, useNavigate } from "react-router-dom";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { FeedErrorState } from "@/features/feed/components/FeedErrorState";
import { useUserProfile } from "../hooks/useUserProfile";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileAbout } from "../components/ProfileAbout";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { ProfilePostsSection } from "../components/ProfilePostsSection";
import { ProfileCommunitiesSection } from "../components/ProfileCommunitiesSection";
import { ProfileSkeleton } from "../components/ProfileSkeleton";
import { COMMUNITIES_PAGE_VIEWER_ID } from "@/features/communities/lib/communitiesPageModel";

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
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
  } = useUserProfile(userId);

  if (!userId) {
    navigate("/feed", { replace: true });
    return null;
  }

  return (
    <FeedLayout>
      <div className="flex flex-col flex-1 w-full max-w-4xl mx-auto px-3 md:px-6 py-4 md:py-5 pb-16 md:pb-6">
        {isLoading && <ProfileSkeleton />}

        {!isLoading && error && (
          <FeedErrorState message={error.message} onRetry={refetch} />
        )}

        {!isLoading && !error && profile && (
          <>
            <ProfileHeader profile={profile} className="mb-4 md:mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
              <div className="min-w-0 flex flex-col gap-6">
                <ProfileAbout bio={profile.bio} />
                <ProfileCommunitiesSection
                  userId={profile.id}
                  isOwnProfile={profile.id === COMMUNITIES_PAGE_VIEWER_ID}
                  shortName={profile.name.split(/\s+/)[0]}
                />
                <ProfilePostsSection
                  posts={posts}
                  isLoading={false}
                  page={page}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={hasPreviousPage}
                  onPreviousPage={previousPage}
                  onNextPage={nextPage}
                  onPin={(id) => console.log("Pin", id)}
                  onReport={(id) => console.log("Report", id)}
                />
              </div>
              <ProfileSidebar profile={profile} />
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
