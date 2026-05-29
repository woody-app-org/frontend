import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { resolvePublicMediaUrl } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PostMediaItem } from "@/components/media/PostMediaRenderer";
import { isWoodyMediaType } from "@/domain/mediaAttachment";
import type { SharedPostPreviewDto } from "@/features/messages/types";
import { postPath } from "@/features/feed/lib/postPaths";
import { firstLineOfPost } from "@/features/feed/lib/postTextPreview";

export interface SharedPostPreviewCardProps {
  preview: SharedPostPreviewDto;
  className?: string;
}

function authorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function SharedPostPreviewCard({ preview, className }: SharedPostPreviewCardProps) {
  if (preview.isUnavailable || !preview.publicId) {
    return (
      <div
        className={cn(
          "rounded-xl border border-[var(--woody-divider)] bg-[var(--woody-bg)]/60 px-3 py-2.5 text-sm text-[var(--woody-muted)]",
          className
        )}
      >
        Publicação indisponível.
      </div>
    );
  }

  const authorName = preview.authorDisplayName?.trim() || preview.authorUsername || "Autora";
  const content = preview.contentPreview?.trim()
    ? preview.contentPreview
    : firstLineOfPost("");

  const mediaTypeRaw = (preview.firstMediaType ?? "image").toLowerCase();
  const mediaType = isWoodyMediaType(mediaTypeRaw) ? mediaTypeRaw : "image";
  const mediaUrl = preview.firstMediaUrl ? resolvePublicMediaUrl(preview.firstMediaUrl) : null;

  const card = (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[var(--woody-divider)] bg-[var(--woody-bg)]/50 text-left transition-colors",
        "hover:border-[var(--woody-nav)]/25 hover:bg-[var(--woody-nav)]/5",
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
          <p className="truncate text-xs font-semibold text-[var(--woody-text)]">{authorName}</p>
          {preview.communityName ? (
            <p className="truncate text-[0.65rem] text-[var(--woody-muted)]">{preview.communityName}</p>
          ) : null}
        </div>
      </div>
      {content ? (
        <p className="line-clamp-3 px-3 py-2 text-sm leading-snug text-[var(--woody-text)]">{content}</p>
      ) : null}
      {mediaUrl ? (
        <div className="px-3 pb-3">
          <PostMediaItem
            item={{ url: mediaUrl, mediaType }}
            variant="message"
            displayMode="hero"
            className="max-h-40 w-full overflow-hidden rounded-lg"
          />
        </div>
      ) : null}
    </div>
  );

  return (
    <Link to={postPath(preview.publicId)} className="block no-underline" onClick={(e) => e.stopPropagation()}>
      {card}
    </Link>
  );
}
