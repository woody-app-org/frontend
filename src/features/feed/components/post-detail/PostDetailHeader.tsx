import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Post } from "@/domain/types";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { PostCommunityContextBar } from "../PostCommunityContextBar";
import { PostProfileContextBar } from "../PostProfileContextBar";
import { PostOverflowMenu } from "../PostOverflowMenu";
import { ProBadge } from "@/features/subscription/components/ProBadge";
import { profilePathForUser } from "@/features/profile/lib/profilePaths";
import { resolvePostDetailBackTarget } from "../../lib/postDetailNavState";

export interface PostDetailHeaderProps {
  post: Post;
  /** Após excluir no detalhe, navegar para esta rota. */
  postDeleteRedirectTo?: string;
  onPostUpdated?: (post: Post) => void;
  /** Conteúdo renderizado dentro da coluna direita (abaixo do username) */
  children?: React.ReactNode;
}

const menuTriggerClass =
  "shrink-0 touch-manipulation text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/10 rounded-md p-2 min-h-11 min-w-11 sm:min-h-9 sm:min-w-9 sm:p-1.5";

export function PostDetailHeader({
  post,
  postDeleteRedirectTo = "/feed",
  onPostUpdated,
  children,
}: PostDetailHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const viewerId = useViewerId();

  const handleBack = () => {
    const target = resolvePostDetailBackTarget(location, location.state);
    if (target.kind === "path") {
      navigate(target.path);
      return;
    }
    navigate(-1);
  };
  const initials = post.author.username.slice(0, 2).toUpperCase();

  return (
    <header className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" type="button" onClick={handleBack}>
          <ChevronLeft className="size-4" />
          Voltar
        </Button>
        <PostOverflowMenu
          post={post}
          viewerId={viewerId}
          onPin={(id) => console.log("Pin", id)}
          deleteRedirectTo={postDeleteRedirectTo}
          onPostUpdated={onPostUpdated}
          stopTriggerPropagation={false}
          triggerClassName={menuTriggerClass}
        />
      </div>

      {post.community ? (
        <PostCommunityContextBar preview={post.community} variant="community" />
      ) : post.publicationContext === "profile" ? (
        <PostProfileContextBar
          authorId={post.author.id}
          authorUsername={post.author.username}
          authorDisplayName={post.author.name}
          variant="community"
        />
      ) : null}

      <div className="flex items-start gap-3">
        <Link
          to={profilePathForUser(post.author)}
          className="shrink-0 overflow-hidden rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--woody-card)]"
        >
          <Avatar size="default" className="size-10 ring-0">
            <AvatarImage src={post.author.avatarUrl ?? undefined} alt={post.author.name} className="block" />
            <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1 pr-8">
          <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
            <Link
              to={profilePathForUser(post.author)}
              className="inline-flex items-baseline gap-1 min-w-0 rounded-md hover:bg-[var(--woody-nav)]/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/30"
              aria-label={`Ver perfil de ${post.author.name}`}
            >
              <span className="text-[1.2rem] font-semibold text-[var(--woody-text)] truncate">{post.author.username}</span>
              {post.author.subscriptionBadge ? <ProBadge variant="inline" tier={post.author.subscriptionBadge} /> : null}
            </Link>
            <span className="text-[var(--woody-muted)] text-[0.8rem] leading-tight shrink-0">· {post.createdAt}</span>
          </div>
          {(post.communityBoostActive && post.publicationContext === "community") ? (
            <div className="flex flex-wrap items-center gap-1 mt-1">
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--woody-nav)]/10 px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--woody-nav)] ring-1 ring-[var(--woody-nav)]/20">
                <TrendingUp className="size-3" aria-hidden />
                Impulsionado
              </span>
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </header>
  );
}
