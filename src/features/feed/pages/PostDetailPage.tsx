import { useMemo } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { FeedLayout } from "../components/FeedLayout";
import { PostDetailView } from "../components/post-detail/PostDetailView";
import { usePostDetail } from "../hooks/usePostDetail";

export function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const { search } = useLocation();
  const focusComments = useMemo(() => new URLSearchParams(search).get("focus") === "comments", [search]);
  const {
    post,
    comments,
    isLoading,
    isCommentsLoading,
    isMutatingLike,
    isCreatingComment,
    error,
    commentsError,
    refetch,
    toggleLike,
    createComment,
  } = usePostDetail(postId);

  if (!postId) return <Navigate to="/feed" replace />;

  return (
    <FeedLayout showRightPanel={false}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 pb-20 md:pb-8">
        {isLoading ? (
          <div className="rounded-2xl border border-[var(--woody-accent)]/12 bg-[var(--woody-card)] p-6 text-sm text-[var(--woody-muted)]">
            Carregando publicação...
          </div>
        ) : null}

        {!isLoading && !post ? (
          <div className="rounded-2xl border border-[var(--woody-accent)]/12 bg-[var(--woody-card)] p-6">
            <h1 className="text-lg font-semibold text-[var(--woody-text)]">Publicação não encontrada</h1>
            <p className="mt-2 text-sm text-[var(--woody-muted)]">
              Essa publicação não existe mais ou não está disponível no momento.
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                to="/feed"
                className="inline-flex rounded-md bg-[var(--woody-accent)] px-3 py-2 text-sm font-medium text-white"
              >
                Voltar ao feed
              </Link>
              <button
                type="button"
                onClick={() => void refetch()}
                className="inline-flex rounded-md border border-[var(--woody-accent)]/20 px-3 py-2 text-sm font-medium text-[var(--woody-text)]"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        ) : null}

        {!isLoading && post ? (
          <>
            {error ? (
              <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-200">
                {error}
              </div>
            ) : null}
            <PostDetailView
              post={post}
              postDeleteRedirectTo="/feed"
              comments={comments}
              isCommentsLoading={isCommentsLoading}
              commentsError={commentsError}
              focusCommentsOnOpen={focusComments}
              isMutatingLike={isMutatingLike}
              isCreatingComment={isCreatingComment}
              onToggleLike={() => void toggleLike()}
              onCreateComment={async (body) => createComment(body, null)}
              onReplySubmit={(body, parentId) => createComment(body, parentId)}
            />
          </>
        ) : null}
      </div>
    </FeedLayout>
  );
}
