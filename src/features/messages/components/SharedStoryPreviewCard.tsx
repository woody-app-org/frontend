import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolvePublicMediaUrl } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SharedStoryPreviewDto } from "@/features/messages/types";

export interface SharedStoryPreviewCardProps {
  preview: SharedStoryPreviewDto;
  className?: string;
  onOpenStory?: (authorUserId: number) => void;
}

function authorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Mirror compacto de `SharedPostPreviewCard` para stories — usado quando se responde a um story por DM. */
export function SharedStoryPreviewCard({ preview, className, onOpenStory }: SharedStoryPreviewCardProps) {
  if (preview.isUnavailable) {
    return (
      <div
        className={cn(
          "rounded-xl border border-[var(--woody-divider)] bg-[var(--woody-bg)]/60 px-3 py-2.5 text-sm text-[var(--woody-muted)]",
          className
        )}
      >
        Story indisponível.
      </div>
    );
  }

  const authorName = preview.authorDisplayName?.trim() || preview.authorUsername || "Autora";
  const thumbnailUrl = preview.thumbnailUrl ? resolvePublicMediaUrl(preview.thumbnailUrl) : null;
  const mediaUrl = preview.mediaUrl ? resolvePublicMediaUrl(preview.mediaUrl) : null;
  const isVideo = preview.mediaType === "video";
  // Para vídeo, preferimos mostrar a miniatura (carrega instantaneamente); o `<video>`
  // só entra como último recurso, com a miniatura como pôster para não ficar em branco.
  const imagePreviewUrl = isVideo ? thumbnailUrl ?? null : mediaUrl ?? thumbnailUrl ?? null;
  const videoSrc = isVideo ? mediaUrl : null;
  const canOpen = Boolean(onOpenStory && preview.authorUserId);

  const content = (
    <>
      <div className="flex items-center gap-2 border-b border-[var(--woody-divider)]/80 px-3 py-2">
        <Avatar size="sm" className="ring-1 ring-[var(--woody-divider)]">
          {preview.authorProfilePic ? (
            <AvatarImage src={resolvePublicMediaUrl(preview.authorProfilePic)} alt="" />
          ) : null}
          <AvatarFallback className="bg-[var(--woody-nav)]/12 text-[0.65rem] font-semibold">
            {authorInitials(authorName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-[var(--woody-text)]">
            Story de {authorName}
          </p>
        </div>
      </div>

      <div
        className="relative aspect-[9/16] max-h-56 w-full overflow-hidden"
        style={{ backgroundColor: preview.backgroundColor || "var(--woody-nav)" }}
      >
        {imagePreviewUrl ? (
          <>
            <img src={imagePreviewUrl} alt="" className="size-full object-cover" loading="lazy" />
            {isVideo ? (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15">
                <span className="flex size-9 items-center justify-center rounded-full bg-black/45 text-white">
                  <Play className="size-4 translate-x-px" fill="currentColor" aria-hidden />
                </span>
              </span>
            ) : null}
          </>
        ) : videoSrc ? (
          <>
            <video
              src={videoSrc}
              className="size-full object-cover"
              muted
              playsInline
              preload="auto"
              // Sem thumbnailUrl, navegadores deixam o frame em preto até dar play;
              // forçamos a busca de um frame inicial para usar como capa.
              onLoadedData={(e) => {
                const v = e.currentTarget;
                if (v.currentTime === 0) v.currentTime = 0.05;
              }}
            />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15">
              <span className="flex size-9 items-center justify-center rounded-full bg-black/45 text-white">
                <Play className="size-4 translate-x-px" fill="currentColor" aria-hidden />
              </span>
            </span>
          </>
        ) : preview.textPreview ? (
          <p className="flex size-full items-center justify-center break-words px-4 text-center text-sm font-medium text-white">
            {preview.textPreview}
          </p>
        ) : null}
      </div>
    </>
  );

  if (canOpen) {
    return (
      <button
        type="button"
        onClick={() => onOpenStory!(preview.authorUserId!)}
        className={cn(
          "block w-full overflow-hidden rounded-xl border border-[var(--woody-divider)] bg-[var(--woody-bg)]/50 text-left transition-opacity hover:opacity-90",
          className
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[var(--woody-divider)] bg-[var(--woody-bg)]/50 text-left",
        className
      )}
    >
      {content}
    </div>
  );
}
