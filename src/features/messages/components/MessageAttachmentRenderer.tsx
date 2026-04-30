import { woodyFocus } from "@/lib/woody-ui";
import { cn } from "@/lib/utils";
import type { PostMediaAttachment } from "@/domain/mediaAttachment";
import { isWoodyMediaType } from "@/domain/mediaAttachment";
import { PostMediaItem } from "@/components/media/PostMediaRenderer";
import type { MessageAttachmentResponseDto } from "../types";
import { VideoMessageAttachment } from "./VideoMessageAttachment";

function toBubbleItem(a: MessageAttachmentResponseDto): PostMediaAttachment {
  const raw = (a.mediaType ?? "image").toLowerCase();
  const mediaType = isWoodyMediaType(raw) ? raw : "image";
  return {
    url: a.url,
    mediaType,
    mimeType: a.contentType,
    thumbnailUrl: a.thumbnailUrl ?? null,
    durationSeconds: a.durationSeconds ?? null,
    storageKey: a.storageKey ?? null,
  };
}

export interface MessageAttachmentRendererProps {
  attachments: MessageAttachmentResponseDto[];
  /** Espaço extra quando há texto acima do anexo. */
  className?: string;
}

/**
 * Renderiza anexos de uma mensagem (imagem, GIF, sticker, vídeo) com layout compacto para bolhas.
 * Imagens reutilizam <code>PostMediaItem</code> variante <code>message</code>; vídeo usa <code>VideoMessageAttachment</code>.
 */
export function MessageAttachmentRenderer({ attachments, className }: MessageAttachmentRendererProps) {
  if (!attachments?.length) return null;
  return (
    <ul className={cn("list-none space-y-2 p-0", className)}>
      {attachments.map((a, idx) => {
        const item = toBubbleItem(a);
        const wrapLink = item.mediaType === "image";
        const inner =
          item.mediaType === "video" ? (
            <VideoMessageAttachment src={item.url} poster={item.thumbnailUrl ?? undefined} />
          ) : (
            <PostMediaItem item={item} variant="message" />
          );
        return (
          <li key={`att-${a.id}-${idx}-${item.storageKey ?? item.url}`}>
            {wrapLink ? (
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  woodyFocus.ring,
                  "block overflow-hidden rounded-lg ring-1 ring-[var(--woody-divider)]/80"
                )}
              >
                {inner}
              </a>
            ) : (
              <div className="overflow-hidden rounded-lg ring-1 ring-[var(--woody-divider)]/80">{inner}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
