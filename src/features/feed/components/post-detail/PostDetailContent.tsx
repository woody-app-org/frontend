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
      {post.title ? <h1 className="text-balance text-2xl font-bold text-[var(--woody-text)]">{post.title}</h1> : null}
      {post.tags?.length ? (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-[var(--woody-accent)]/10 bg-[var(--woody-nav)]/15 px-2.5 py-0.5 text-xs font-medium text-[var(--woody-muted)]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
      <p className={cn("whitespace-pre-wrap text-[0.98rem] leading-relaxed text-[var(--woody-text)]/90")}>{post.content}</p>
      {galleryItems.length > 0 ? (
        <PostMediaGallery items={galleryItems} className="mt-0" variant="detail" />
      ) : null}
    </article>
  );
}
