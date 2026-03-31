import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Comment, Post } from "@/domain/types";
import { CommentsList } from "./CommentsList";
import { PostDetailActions } from "./PostDetailActions";
import { PostDetailContent } from "./PostDetailContent";
import { PostDetailHeader } from "./PostDetailHeader";

export interface PostDetailViewProps {
  post: Post;
  comments: Comment[];
  isCommentsLoading: boolean;
  commentsError: string | null;
  focusCommentsOnOpen?: boolean;
  isMutatingLike: boolean;
  isCreatingComment: boolean;
  onToggleLike: () => void;
  onCreateComment: (body: string) => Promise<boolean>;
}

export function PostDetailView({
  post,
  comments,
  isCommentsLoading,
  commentsError,
  focusCommentsOnOpen = false,
  isMutatingLike,
  isCreatingComment,
  onToggleLike,
  onCreateComment,
}: PostDetailViewProps) {
  const commentsRef = useRef<HTMLElement>(null);
  const [commentBody, setCommentBody] = useState("");

  useEffect(() => {
    if (!focusCommentsOnOpen) return;
    if (isCommentsLoading) return;
    const id = window.setTimeout(() => {
      commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      commentsRef.current?.focus();
    }, 30);
    return () => window.clearTimeout(id);
  }, [focusCommentsOnOpen, isCommentsLoading]);

  const submitComment = async () => {
    const ok = await onCreateComment(commentBody);
    if (ok) setCommentBody("");
  };

  return (
    <Card className="border-[var(--woody-accent)]/15 bg-[var(--woody-card)] px-4 py-4 sm:px-6 sm:py-5">
      <div className="space-y-5">
        <PostDetailHeader post={post} />
        <PostDetailContent post={post} />
        <PostDetailActions
          post={post}
          isMutatingLike={isMutatingLike}
          onLike={onToggleLike}
          onComment={() => commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />

        <section
          ref={commentsRef}
          tabIndex={-1}
          aria-label="Comentários"
          className="space-y-4 border-t border-[var(--woody-accent)]/10 pt-6 outline-none"
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-base font-semibold text-[var(--woody-text)]">Comentários</h2>
              {!isCommentsLoading ? (
                <span className="text-xs text-[var(--woody-muted)] tabular-nums">{comments.length} respostas</span>
              ) : null}
            </div>
            <div className="rounded-xl border border-[var(--woody-accent)]/10 bg-[var(--woody-nav)]/[0.04] p-3 sm:p-4">
              <Textarea
                placeholder="Escreva seu comentário..."
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                className="min-h-[92px] border-[var(--woody-accent)]/20 bg-[var(--woody-card)] text-[var(--woody-text)]"
              />
              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  disabled={isCreatingComment || !commentBody.trim()}
                  onClick={submitComment}
                  className="bg-[var(--woody-accent)] text-white hover:bg-[var(--woody-accent)]/90"
                >
                  <Send className="size-4" />
                  Comentar
                </Button>
              </div>
            </div>
          </div>

          <CommentsList comments={comments} isLoading={isCommentsLoading} error={commentsError} />
        </section>
      </div>
    </Card>
  );
}
