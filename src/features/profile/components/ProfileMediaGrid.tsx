"use client";

import { useState } from "react";
import { Play, Images } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolvePublicMediaUrl } from "@/lib/api";
import { legacyImageUrlsToPostMediaAttachments } from "@/domain/mediaAttachment";
import type { PostMediaAttachment } from "@/domain/mediaAttachment";
import {
  PostMediaLightbox,
  type PostLightboxContext,
} from "@/components/media/PostMediaLightbox";
import type { Post } from "@/features/feed/types";

/** Agrupa a mídia com o post de origem para manter a relação mídia→post. */
interface MediaEntry {
  attachment: PostMediaAttachment;
  /** Todas as mídias do mesmo post (para navegação interna no lightbox). */
  siblingAttachments: PostMediaAttachment[];
  /** Índice desta mídia dentro das suas irmãs. */
  siblingIndex: number;
  postContext: PostLightboxContext;
}

function collectMediaEntries(posts: Post[]): MediaEntry[] {
  const entries: MediaEntry[] = [];

  for (const post of posts) {
    const attachments: PostMediaAttachment[] =
      post.mediaAttachments && post.mediaAttachments.length > 0
        ? post.mediaAttachments
        : post.imageUrls && post.imageUrls.length > 0
          ? legacyImageUrlsToPostMediaAttachments(post.imageUrls.map(resolvePublicMediaUrl))
          : post.imageUrl
            ? legacyImageUrlsToPostMediaAttachments([resolvePublicMediaUrl(post.imageUrl)])
            : [];

    if (attachments.length === 0) continue;

    const postContext: PostLightboxContext = {
      postId: post.id,
      authorName: post.author.name,
      authorAvatarUrl: post.author.avatarUrl,
      postTitle: post.title ?? undefined,
      postContent: post.content,
      createdAt: post.createdAt,
    };

    for (let i = 0; i < attachments.length; i++) {
      entries.push({
        attachment: attachments[i],
        siblingAttachments: attachments,
        siblingIndex: i,
        postContext,
      });
    }
  }

  return entries;
}

export interface ProfileMediaGridProps {
  /** Lista combinada de posts (fixados + normais). */
  posts: Post[];
  className?: string;
}

export function ProfileMediaGrid({ posts, className }: ProfileMediaGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState<PostMediaAttachment[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxContext, setLightboxContext] = useState<PostLightboxContext | undefined>();

  const entries = collectMediaEntries(posts);

  if (entries.length === 0) return null;

  const openLightbox = (entry: MediaEntry) => {
    setLightboxItems(entry.siblingAttachments);
    setLightboxIndex(entry.siblingIndex);
    setLightboxContext(entry.postContext);
    setLightboxOpen(true);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Images className="size-4 text-[var(--woody-muted)]" strokeWidth={1.75} />
        <h3 className="text-sm font-semibold text-[var(--woody-text)] tracking-tight">
          Fotos & Vídeos
        </h3>
        <span className="ml-auto text-xs text-[var(--woody-muted)]">
          {entries.length} {entries.length === 1 ? "item" : "itens"}
        </span>
      </div>

      <div
        className={cn(
          "grid grid-cols-3 gap-0.5 overflow-hidden rounded-xl",
          "ring-1 ring-black/[0.07]"
        )}
        aria-label="Galeria de fotos e vídeos"
      >
        {entries.slice(0, 12).map((entry, i) => {
          const { attachment, postContext } = entry;
          const isVideo = attachment.mediaType === "video";
          const resolvedUrl = resolvePublicMediaUrl(attachment.thumbnailUrl ?? attachment.url);

          return (
            <button
              key={`${postContext.postId}-${entry.siblingIndex}-${i}`}
              type="button"
              className="group relative aspect-square overflow-hidden bg-black/5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--woody-accent)]/50"
              aria-label={
                isVideo
                  ? `Abrir vídeo do post de ${postContext.authorName}`
                  : `Abrir foto ${entry.siblingIndex + 1} de ${entry.siblingAttachments.length} do post de ${postContext.authorName}`
              }
              onClick={() => openLightbox(entry)}
            >
              <img
                src={resolvedUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                loading="lazy"
                decoding="async"
              />
              {isVideo ? (
                <span
                  className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity group-hover:bg-black/30"
                  aria-hidden
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-black/55 text-white ring-1 ring-white/20 backdrop-blur-sm">
                    <Play className="size-4 ml-0.5" fill="currentColor" strokeWidth={0} />
                  </span>
                </span>
              ) : (
                <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
              )}

              {/* Indicador de múltiplas fotos no mesmo post */}
              {entry.siblingAttachments.length > 1 && entry.siblingIndex === 0 && !isVideo ? (
                <span
                  className="pointer-events-none absolute right-1.5 top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-black/60 px-1.5 text-[0.6rem] font-semibold tabular-nums text-white backdrop-blur-sm"
                  aria-hidden
                >
                  1/{entry.siblingAttachments.length}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Indicação de mais itens além dos 12 exibidos */}
      {entries.length > 12 ? (
        <p className="text-center text-xs text-[var(--woody-muted)]">
          +{entries.length - 12} {entries.length - 12 === 1 ? "item" : "itens"} adicionais nos posts abaixo
        </p>
      ) : null}

      <PostMediaLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        items={lightboxItems}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        variant="feed"
        postContext={lightboxContext}
      />
    </div>
  );
}
