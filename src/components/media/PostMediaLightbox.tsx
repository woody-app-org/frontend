"use client";

import { useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, ExternalLink, X } from "lucide-react";
import { Link } from "react-router-dom";
import type { PostMediaAttachment } from "@/domain/mediaAttachment";
import type { PostDetailNavState } from "@/features/feed/lib/postDetailNavState";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { PostMediaItem } from "./PostMediaRenderer";

/** Contexto mínimo do post de origem — renderizado na barra inferior do lightbox. */
export interface PostLightboxContext {
  postId: string;
  authorName: string;
  authorAvatarUrl?: string | null;
  postTitle?: string;
  postContent: string;
  createdAt: string;
}

export interface PostMediaLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: PostMediaAttachment[];
  index: number;
  onIndexChange: (i: number) => void;
  variant: "feed" | "detail";
  /** Quando presente, exibe barra inferior com contexto do post de origem. */
  postContext?: PostLightboxContext;
  /** Estado para o botão “Ver publicação” voltar ao sítio correcto. */
  postDetailLinkState?: PostDetailNavState;
}

export function PostMediaLightbox({
  open,
  onOpenChange,
  items,
  index,
  onIndexChange,
  variant,
  postContext,
  postDetailLinkState,
}: PostMediaLightboxProps) {
  const safeIndex = Math.min(Math.max(0, index), Math.max(0, items.length - 1));
  const current = items[safeIndex];
  const hasPrev = safeIndex > 0;
  const hasNext = safeIndex < items.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onIndexChange(safeIndex - 1);
  }, [hasPrev, onIndexChange, safeIndex]);

  const goNext = useCallback(() => {
    if (hasNext) onIndexChange(safeIndex + 1);
  }, [hasNext, onIndexChange, safeIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, goPrev, goNext]);

  if (!current) return null;

  const v = variant === "detail" ? "detail" : "feed";

  const authorInitials = postContext?.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const contentSnippet = postContext
    ? [postContext.postTitle, postContext.postContent]
        .filter(Boolean)
        .join(" — ")
        .slice(0, 110)
        .trimEnd() + (([postContext.postTitle, postContext.postContent].filter(Boolean).join(" — ").length > 110) ? "…" : "")
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "fixed inset-0 left-0 top-0 z-[101] flex h-[100dvh] max-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col rounded-none border-0 bg-black/92 p-0 shadow-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[min(92vh,58rem)] sm:max-w-[min(96vw,60rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:border-white/10 sm:bg-[#0c0c0c] sm:p-4"
        )}
      >
        <DialogTitle className="sr-only">
          {items.length > 1 ? `Foto ${safeIndex + 1} de ${items.length}` : "Foto"}
          {postContext ? ` — ${postContext.postTitle ?? postContext.postContent.slice(0, 40)}` : ""}
        </DialogTitle>

        {/* Barra superior: contador + fechar */}
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-2.5 sm:border-0 sm:px-1 sm:pb-3 sm:pt-0">
          <span className="text-xs font-medium tabular-nums text-white/75 sm:text-white/85">
            {items.length > 1 ? `${safeIndex + 1} / ${items.length}` : null}
          </span>
          {postContext && (
            <Link
              to={`/posts/${postContext.postId}`}
              state={postDetailLinkState}
              className="flex items-center gap-1 text-xs text-white/60 hover:text-white/90 transition-colors"
              onClick={() => onOpenChange(false)}
            >
              <ExternalLink className="size-3" />
              Ver publicação
            </Link>
          )}
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 rounded-full text-white hover:bg-white/10 hover:text-white"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </Button>
          </DialogClose>
        </div>

        {/* Área da mídia */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-2 sm:px-4">
          {items.length > 1 ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!hasPrev}
                onClick={goPrev}
                className={cn(
                  "absolute left-1 top-1/2 z-10 size-11 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-sm hover:bg-black/55 disabled:pointer-events-none disabled:opacity-25 sm:left-2 sm:size-10"
                )}
                aria-label="Foto anterior"
              >
                <ChevronLeft className="size-6 sm:size-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={!hasNext}
                onClick={goNext}
                className={cn(
                  "absolute right-1 top-1/2 z-10 size-11 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-sm hover:bg-black/55 disabled:pointer-events-none disabled:opacity-25 sm:right-2 sm:size-10"
                )}
                aria-label="Próxima foto"
              >
                <ChevronRight className="size-6 sm:size-5" />
              </Button>
            </>
          ) : null}

          <div className="flex max-h-[min(calc(100dvh-10rem),78vh)] w-full max-w-full items-center justify-center overflow-hidden sm:max-h-[min(72vh,44rem)]">
            <PostMediaItem
              key={`${current.storageKey ?? current.url}-${safeIndex}`}
              item={current}
              variant={v}
              displayMode="lightbox"
            />
          </div>
        </div>

        {/* Barra inferior de contexto do post */}
        {postContext && (
          <div className="shrink-0 border-t border-white/10 px-3 py-3 sm:px-4 sm:pb-1">
            <div className="flex items-start gap-3">
              <Avatar className="size-8 shrink-0">
                <AvatarImage src={postContext.authorAvatarUrl ?? undefined} alt={postContext.authorName} />
                <AvatarFallback className="bg-white/10 text-white text-xs">
                  {authorInitials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white leading-tight">
                    {postContext.authorName}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-white/50">
                    <Clock className="size-3" aria-hidden />
                    {postContext.createdAt}
                  </span>
                </div>
                {contentSnippet && (
                  <p className="mt-0.5 text-xs leading-relaxed text-white/65 line-clamp-2">
                    {contentSnippet}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
