import { Link, useLocation, useNavigate } from "react-router-dom";
import { Clock, ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Post } from "@/domain/types";
import { useViewerId } from "@/features/auth/hooks/useViewerId";
import { PostCommunityContextBar } from "../PostCommunityContextBar";
import { PostProfileContextBar } from "../PostProfileContextBar";
import { PostOverflowMenu } from "../PostOverflowMenu";
import { ProBadge } from "@/features/subscription/components/ProBadge";
import { resolvePostDetailBackTarget } from "../../lib/postDetailNavState";

export interface PostDetailHeaderProps {
  post: Post;
  /** Após excluir no detalhe, navegar para esta rota. */
  postDeleteRedirectTo?: string;
  onPostUpdated?: (post: Post) => void;
}

const menuTriggerClass =
  "shrink-0 touch-manipulation text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/10 rounded-md p-2 min-h-11 min-w-11 sm:min-h-9 sm:min-w-9 sm:p-1.5";

export function PostDetailHeader({
  post,
  postDeleteRedirectTo = "/feed",
  onPostUpdated,
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
  const initials = post.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
          authorDisplayName={post.author.name}
          variant="community"
        />
      ) : null}

      <div className="flex items-start gap-3">
        <Link
          to={`/profile/${post.author.id}`}
          className="shrink-0 overflow-hidden rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-accent)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--woody-card)]"
        >
          <Avatar size="default" className="size-10 ring-0">
            <AvatarImage src={post.author.avatarUrl ?? undefined} alt={post.author.name} className="block" />
            <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-sm font-semibold text-[var(--woody-text)]">{post.author.name}</p>
            {post.author.showProBadge ? <ProBadge variant="inline" /> : null}
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--woody-muted)]">
            <Clock className="size-3" />
            <span>{post.createdAt}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
