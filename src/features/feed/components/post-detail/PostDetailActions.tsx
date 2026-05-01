import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Post } from "@/domain/types";
import { cn } from "@/lib/utils";
import { PostLikeIcon } from "../PostLikeIcon";
import { usePostLikeTapAnimation } from "../../hooks/usePostLikeTapAnimation";

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

export interface PostDetailActionsProps {
  post: Post;
  isMutatingLike: boolean;
  onLike: () => void;
  onComment: () => void;
}

export function PostDetailActions({
  post,
  isMutatingLike,
  onLike,
  onComment,
}: PostDetailActionsProps) {
  const { tapPhase, triggerTap } = usePostLikeTapAnimation();

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      <Button
        type="button"
        variant={post.likedByCurrentUser ? "default" : "ghost"}
        size="sm"
        disabled={isMutatingLike}
        onClick={() => {
          if (!isMutatingLike) triggerTap(!post.likedByCurrentUser);
          onLike();
        }}
        className={cn(
          "gap-1.5",
          post.likedByCurrentUser
            ? "bg-[var(--woody-accent)] text-white hover:bg-[var(--woody-accent)]/90"
            : "text-[var(--woody-text)]"
        )}
      >
        <PostLikeIcon liked={post.likedByCurrentUser} tapPhase={tapPhase} sizeClassName="size-4" />
        <span>{formatCount(post.likesCount)}</span>
      </Button>
      <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-[var(--woody-text)]" onClick={onComment}>
        <MessageCircle className="size-4" />
        <span>{formatCount(post.commentsCount)}</span>
      </Button>
    </div>
  );
}
