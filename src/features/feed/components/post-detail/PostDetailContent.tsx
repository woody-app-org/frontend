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

  const hasTags = (post.tags?.length ?? 0) > 0;

  return (
    <article>
      <div>
        <p
          className={cn(
            "whitespace-pre-wrap text-[1.05rem] leading-[1.45] text-[var(--woody-text)] sm:text-[1.1rem] sm:leading-[1.45]"
          )}
        >
          {post.content}
        </p>
        {hasTags ? (
          <div className="flex flex-wrap gap-1 mt-1">
            {post.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full px-2.5 py-[0.1875rem] text-[0.75rem] font-semibold tracking-[0.01em] bg-[var(--woody-tag-bg)] text-[var(--woody-tag-text)] ring-1 ring-[rgba(139,195,74,0.28)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {galleryItems.length > 0 ? (
        <PostMediaGallery items={galleryItems} className="mt-2 sm:mt-3" variant="detail" />
      ) : null}
    </article>
  );
}
