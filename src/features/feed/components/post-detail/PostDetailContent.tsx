import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Post } from "@/domain/types";
import { legacyImageUrlsToPostMediaAttachments } from "@/domain/mediaAttachment";
import { PostMediaGallery } from "@/components/media/PostMediaGallery";

export interface PostDetailContentProps {
  post: Post;
}

export function PostDetailContent({ post }: PostDetailContentProps) {
  const legacyRaw =
    post.imageUrls && post.imageUrls.length > 0
      ? post.imageUrls
      : post.imageUrl
        ? [post.imageUrl]
        : [];
  const legacy = legacyRaw.map((u) => resolvePublicMediaUrl(u));
  const legacyItems = legacy.length > 0 ? legacyImageUrlsToPostMediaAttachments(legacy) : [];

  const galleryItems =
    post.mediaAttachments && post.mediaAttachments.length > 0 ? post.mediaAttachments : legacyItems;

  return (
    <article className="space-y-4">
      {/* Tags removidas daqui — agora exibidas no PostDetailHeader, abaixo do username */}
      <p
        className={cn(
          "whitespace-pre-wrap text-[1.05rem] leading-[1.55] text-[var(--woody-text)] sm:text-[1.1rem] sm:leading-[1.58]"
        )}
      >
        {post.content}
      </p>
      {galleryItems.length > 0 ? (
        <PostMediaGallery items={galleryItems} className="mt-2 sm:mt-3" variant="detail" />
      ) : null}
      <p className="text-[0.8125rem] leading-snug text-[var(--woody-muted)]">{post.createdAt}</p>
    </article>
  );
}
