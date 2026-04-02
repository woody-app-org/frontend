import { cn } from "@/lib/utils";
import type { Post } from "@/domain/types";

export interface PostDetailContentProps {
  post: Post;
}

export function PostDetailContent({ post }: PostDetailContentProps) {
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
      {post.imageUrl ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--woody-accent)]/12 bg-[var(--woody-nav)]/5">
          <img src={post.imageUrl} alt="" className="max-h-[460px] w-full object-cover" />
        </div>
      ) : null}
    </article>
  );
}
