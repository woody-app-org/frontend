"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, Images } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolvePublicMediaUrl } from "@/lib/api";
import { legacyImageUrlsToPostMediaAttachments } from "@/domain/mediaAttachment";
import type { PostMediaAttachment } from "@/domain/mediaAttachment";
import { PostMediaLightbox } from "@/components/media/PostMediaLightbox";
import type { Post } from "@/features/feed/types";

interface MediaEntry {
  attachment: PostMediaAttachment;
  postId: string;
  postIndex: number;
}

function collectMediaEntries(posts: Post[]): MediaEntry[] {
  const entries: MediaEntry[] = [];
  for (const post of posts) {
    const attachments =
      post.mediaAttachments && post.mediaAttachments.length > 0
        ? post.mediaAttachments
        : post.imageUrls && post.imageUrls.length > 0
          ? legacyImageUrlsToPostMediaAttachments(post.imageUrls.map(resolvePublicMediaUrl))
          : post.imageUrl
            ? legacyImageUrlsToPostMediaAttachments([resolvePublicMediaUrl(post.imageUrl)])
            : [];
    for (let i = 0; i < attachments.length; i++) {
      entries.push({ attachment: attachments[i], postId: post.id, postIndex: i });
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

  const entries = collectMediaEntries(posts);

  if (entries.length === 0) return null;

  const openLightbox = (items: PostMediaAttachment[], idx: number) => {
    setLightboxItems(items);
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  // Agrupa attachments por postId para o lightbox navegar dentro do post
  const attachmentsByPost = new Map<string, PostMediaAttachment[]>();
  for (const entry of entries) {
    if (!attachmentsByPost.has(entry.postId)) {
      attachmentsByPost.set(entry.postId, []);
    }
    attachmentsByPost.get(entry.postId)!.push(entry.attachment);
  }

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
          const { attachment, postId, postIndex } = entry;
          const postAttachments = attachmentsByPost.get(postId) ?? [attachment];
          const isVideo = attachment.mediaType === "video";
          const resolvedUrl = resolvePublicMediaUrl(attachment.thumbnailUrl ?? attachment.url);

          return (
            <button
              key={`${postId}-${postIndex}-${i}`}
              type="button"
              className="group relative aspect-square overflow-hidden bg-black/5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--woody-accent)]/50"
              aria-label={isVideo ? "Abrir vídeo" : "Abrir imagem"}
              onClick={() => openLightbox(postAttachments, postIndex)}
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
            </button>
          );
        })}
      </div>

      {/* Link para ver todas quando há mais de 12 */}
      {entries.length > 12 ? (
        <Link
          to={`/posts/${entries[12].postId}`}
          className="block text-center text-xs font-medium text-[var(--woody-muted)] hover:text-[var(--woody-text)] transition-colors py-1"
        >
          Ver todas as {entries.length} publicações com mídia
        </Link>
      ) : null}

      <PostMediaLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        items={lightboxItems}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        variant="feed"
      />
    </div>
  );
}
