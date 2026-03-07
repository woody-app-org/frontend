import { useParams, useNavigate } from "react-router-dom";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { FeedErrorState } from "@/features/feed/components/FeedErrorState";
import { useUserProfile } from "../hooks/useUserProfile";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileAbout } from "../components/ProfileAbout";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { ProfilePostsSection } from "../components/ProfilePostsSection";
import { ProfileSkeleton } from "../components/ProfileSkeleton";

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
    navigate("/", { replace: true });
    return null;
  }

  return (
    <FeedLayout activeFilter="forYou" onFilterChange={() => {}}>
      <div className="flex flex-col flex-1 w-full max-w-4xl mx-auto px-3 md:px-6 py-4 md:py-5 pb-16 md:pb-6">
        {isLoading && <ProfileSkeleton />}

        {!isLoading && error && (
          <FeedErrorState message={error.message} onRetry={refetch} />
        )}

        {!isLoading && !error && profile && (
          <>
            <ProfileHeader profile={profile} className="mb-4 md:mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
              <div className="min-w-0 flex flex-col">
                <ProfileAbout bio={profile.bio} className="mb-6" />
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
              onClick={() => navigate("/")}
              className="mt-4 text-sm font-medium text-[var(--woody-accent)] hover:underline"
            >
              Voltar ao feed
            </button>
          </div>
        )}
      </div>
    </FeedLayout>
  );
}
