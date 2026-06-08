import { cn } from "@/lib/utils";
import { resolvePublicMediaUrl } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { SharedStoryPreviewDto } from "@/features/messages/types";

export interface SharedStoryPreviewCardProps {
  preview: SharedStoryPreviewDto;
  className?: string;
}

function authorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/** Mirror compacto de `SharedPostPreviewCard` para stories — usado quando se responde a um story por DM. */
export function SharedStoryPreviewCard({ preview, className }: SharedStoryPreviewCardProps) {
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
  const mediaUrl = preview.mediaUrl
    ? resolvePublicMediaUrl(preview.mediaUrl)
    : preview.thumbnailUrl
      ? resolvePublicMediaUrl(preview.thumbnailUrl)
      : null;
  const isVideo = preview.mediaType === "video";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[var(--woody-divider)] bg-[var(--woody-bg)]/50 text-left",
        className
      )}
    >
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
        {mediaUrl ? (
          isVideo ? (
            <video src={mediaUrl} className="size-full object-cover" muted playsInline preload="metadata" />
          ) : (
            <img src={mediaUrl} alt="" className="size-full object-cover" loading="lazy" />
          )
        ) : preview.textPreview ? (
          <p className="flex size-full items-center justify-center break-words px-4 text-center text-sm font-medium text-white">
            {preview.textPreview}
          </p>
        ) : null}
      </div>
    </div>
  );
}
