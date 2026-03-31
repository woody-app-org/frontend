import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Comment, Post } from "@/domain/types";
import { PostDetailActions } from "./PostDetailActions";
import { PostDetailContent } from "./PostDetailContent";
import { PostDetailHeader } from "./PostDetailHeader";

export interface PostDetailViewProps {
  post: Post;
  comments: Comment[];
  focusCommentsOnOpen?: boolean;
  isMutatingLike: boolean;
  isCreatingComment: boolean;
  onToggleLike: () => void;
  onCreateComment: (body: string) => Promise<boolean>;
}

export function PostDetailView({
  post,
  comments,
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
    const id = window.setTimeout(() => {
      commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      commentsRef.current?.focus();
    }, 30);
    return () => window.clearTimeout(id);
  }, [focusCommentsOnOpen]);

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

        <section ref={commentsRef} tabIndex={-1} aria-label="Comentários" className="space-y-4 outline-none">
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-[var(--woody-text)]">Comentários</h2>
            <div className="rounded-xl border border-[var(--woody-accent)]/12 bg-[var(--woody-nav)]/5 p-3">
              <Textarea
                placeholder="Escreva seu comentário..."
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                className="min-h-[92px] border-[var(--woody-accent)]/20 text-[var(--woody-text)]"
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

          {comments.length ? (
            <ul className="space-y-3">
              {comments.map((comment) => {
                const initials = comment.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <li key={comment.id} className="rounded-xl border border-[var(--woody-accent)]/10 bg-[var(--woody-nav)]/[0.04] p-3">
                    <div className="flex items-start gap-2.5">
                      <Avatar size="sm" className="mt-0.5">
                        <AvatarImage src={comment.author.avatarUrl ?? undefined} alt={comment.author.name} />
                        <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-[0.65rem]">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-[var(--woody-text)]">{comment.author.name}</span>
                          <span className="text-[11px] text-[var(--woody-muted)]">
                            {new Date(comment.createdAt).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[var(--woody-text)]/90">
                          {comment.body}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--woody-accent)]/20 p-4 text-sm text-[var(--woody-muted)]">
              Ainda não há comentários. Seja a primeira pessoa a comentar.
            </div>
          )}
        </section>
      </div>
    </Card>
  );
}
