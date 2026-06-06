import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { WoodyLogo } from "@/components/branding/WoodyLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { isBetaClosed } from "@/config/beta";
import { PostDetailContent } from "../components/post-detail/PostDetailContent";
import { PostShareButton } from "../components/share/PostShareButton";
import { PostUnavailableView } from "../components/share/PostUnavailableView";
import { PostCommunityContextBar } from "../components/PostCommunityContextBar";
import { usePublicPost } from "../hooks/usePublicPost";
import { ProBadge } from "@/features/subscription/components/ProBadge";

export function PublicPostPage() {
  const { publicId: routeHandle } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const { post, isLoading, loadFailed, postUrlRedirect } = usePublicPost(routeHandle);
  const enterHref = isBetaClosed() ? "/auth/login" : "/auth";

  useEffect(() => {
    if (!postUrlRedirect) return;
    navigate(postUrlRedirect, { replace: true });
  }, [postUrlRedirect, navigate]);

  if (!routeHandle) {
    return <PostUnavailableView showPublicShell />;
  }

  return (
    <div className="min-h-svh bg-[linear-gradient(180deg,#f4f2ec_0%,#f0efe8_55%,#ebe8df_100%)] text-[var(--woody-ink)]">
      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-white/92 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/landing"
            className="outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--woody-lime)]/45"
          >
            <WoodyLogo className="h-7 w-auto sm:h-8" />
          </Link>
          <Button
            asChild
            size="sm"
            className="bg-[var(--woody-accent)] text-white hover:bg-[var(--woody-accent)]/90"
          >
            <Link to={enterHref}>Entrar na Woody</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {isLoading ? (
          <div className="rounded-2xl border border-[var(--woody-accent)]/12 bg-[var(--woody-card)] p-6 text-sm text-[var(--woody-muted)]">
            Carregando publicação...
          </div>
        ) : null}

        {!isLoading && (loadFailed || !post) ? <PostUnavailableView /> : null}

        {!isLoading && post ? (
          <Card className="border-[var(--woody-accent)]/15 bg-[var(--woody-card)] px-4 py-5 sm:px-6 sm:py-6">
            <div className="space-y-5">
              {post.community ? <PostCommunityContextBar preview={post.community} variant="feed" /> : null}

              <div className="flex items-start gap-3">
                <Avatar className="size-10 shrink-0">
                  {post.author.avatarUrl ? (
                    <AvatarImage src={post.author.avatarUrl} alt="" />
                  ) : null}
                  <AvatarFallback className="bg-[var(--woody-nav)]/15 text-sm font-semibold text-[var(--woody-nav)]">
                    {post.author.username.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-1">
                    <span className="font-semibold text-[var(--woody-text)]">{post.author.username}</span>
                    {post.author.subscriptionBadge ? <ProBadge variant="inline" tier={post.author.subscriptionBadge} /> : null}
                  </div>
                </div>
              </div>

              <PostDetailContent post={post} />

              <div className="flex flex-wrap items-center gap-2 border-t border-[var(--woody-accent)]/10 pt-4">
                <PostShareButton post={post} variant="detail" />
              </div>

              <div className="rounded-xl border border-[var(--woody-accent)]/12 bg-[var(--woody-nav)]/6 px-4 py-4 text-center">
                <p className="text-sm font-medium text-[var(--woody-text)]">Queres participar na conversa?</p>
                <p className="mt-1 text-xs text-[var(--woody-muted)]">
                  Entra na Woody para curtir, comentar e seguir esta autora.
                </p>
                <Button
                  asChild
                  className="mt-3 bg-[var(--woody-accent)] text-white hover:bg-[var(--woody-accent)]/90"
                >
                  <Link to={enterHref}>Entrar na Woody</Link>
                </Button>
              </div>
            </div>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
