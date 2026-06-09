import { useCallback, useMemo, useState } from "react";
import { woodyFocus } from "@/lib/woody-ui";
import { cn } from "@/lib/utils";
import type { PostMediaAttachment } from "@/domain/mediaAttachment";
import { isWoodyMediaType } from "@/domain/mediaAttachment";
import { PostMediaItem } from "@/components/media/PostMediaRenderer";
import { PostMediaLightbox } from "@/components/media/PostMediaLightbox";
import type { MessageAttachmentResponseDto } from "../types";
import { VideoMessageAttachment } from "./VideoMessageAttachment";

/** API Woody expõe `mimeType`; aceita `contentType` como alias legado. */
function resolveAttachmentMime(a: MessageAttachmentResponseDto): string | null {
  const m = a.mimeType ?? a.contentType;
  return m != null && String(m).trim() !== "" ? String(m) : null;
}

function toBubbleItem(a: MessageAttachmentResponseDto): PostMediaAttachment {
  const raw = (a.mediaType ?? "image").toLowerCase();
  const mediaType = isWoodyMediaType(raw) ? raw : "image";
  return {
    url: a.url,
    mediaType,
    mimeType: resolveAttachmentMime(a),
    thumbnailUrl: a.thumbnailUrl ?? null,
    durationSeconds: a.durationSeconds ?? null,
    storageKey: a.storageKey ?? null,
  };
}

function sameAttachment(a: PostMediaAttachment, b: PostMediaAttachment): boolean {
  if (a.storageKey && b.storageKey) return a.storageKey === b.storageKey;
  return a.url === b.url;
}

export interface MessageAttachmentRendererProps {
  attachments: MessageAttachmentResponseDto[];
  /** Espaço extra quando há texto acima do anexo. */
  className?: string;
}

/**
 * Renderiza anexos de uma mensagem (imagem, GIF, sticker, vídeo) com layout compacto para bolhas.
 * Imagens estáticas abrem no lightbox da app; GIF/sticker/vídeo ficam inline.
 */
export function MessageAttachmentRenderer({ attachments, className }: MessageAttachmentRendererProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const items = useMemo(() => attachments.map(toBubbleItem), [attachments]);
  const imageItems = useMemo(() => items.filter((item) => item.mediaType === "image"), [items]);

  const openImage = useCallback(
    (item: PostMediaAttachment) => {
      const idx = imageItems.findIndex((candidate) => sameAttachment(candidate, item));
      setLightboxIndex(Math.max(0, idx));
      setLightboxOpen(true);
    },
    [imageItems]
  );

  if (!attachments?.length) return null;

  return (
    <>
      <ul className={cn("list-none space-y-2 p-0", className)}>
        {attachments.map((a, idx) => {
          const item = items[idx] ?? toBubbleItem(a);
          const isStaticImage = item.mediaType === "image";
          const inner =
            item.mediaType === "video" ? (
              <VideoMessageAttachment src={item.url} poster={item.thumbnailUrl ?? undefined} />
            ) : (
              <PostMediaItem item={item} variant="message" />
            );
          return (
            <li key={`att-${a.id}-${idx}-${item.storageKey ?? item.url}`}>
              {isStaticImage ? (
                <button
                  type="button"
                  onClick={() => openImage(item)}
                  className={cn(
                    woodyFocus.ring,
                    "block w-full overflow-hidden rounded-lg text-left ring-1 ring-[var(--woody-divider)]/80"
                  )}
                  aria-label="Ampliar imagem"
                >
                  {inner}
                </button>
              ) : (
                <div className="overflow-hidden rounded-lg ring-1 ring-[var(--woody-divider)]/80">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>

      {imageItems.length > 0 ? (
        <PostMediaLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          items={imageItems}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          variant="feed"
        />
      ) : null}
    </>
  );
}
