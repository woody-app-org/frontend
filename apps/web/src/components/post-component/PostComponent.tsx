/* eslint-disable @next/next/no-img-element */
import { Post } from "./Post";

import { Heart, MessageCircle, Bookmark, MoreVertical } from "lucide-react";

type PostComponentProps = {
  post: Post;
};

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const difInMinutes = Math.floor((Date.now() - date.getTime()) / 60000);

  if (difInMinutes < 60) {
    return `${difInMinutes} min atrás`;
  }

  const difInHours = Math.floor(difInMinutes / 60);
  return `${difInHours}h atrás`;
}

export function PostComponent({ post }: PostComponentProps) {
  return (
    <article className="w-full rounded-3xl bg-[#FAF1E6] p-6 shadow-sm">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.authorPic}
            alt={post.authorName}
            className="h-10 w-10 rounded-full object-cover"
          />

          <div>
            <p className="font-semibold text-[#684132]">{post.authorName}</p>
            <p className="text-sm text-[#684132]">
              {formatTimeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        <button className="text-[#684132] hover:text-[#684132]">
          <MoreVertical size={25} />
        </button>
      </header>

      {post.tags && (
        <div className="mb-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#E07A5F] px-3 py-1 text-sm text-white"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="mb-4 text-[#684132]">{post.description}</p>

      <footer className="flex items-center gap-4 text-[#684132]">
        <button className="flex items-center gap-1 hover:text-[#684132]">
          <Heart />{" "}
          <span className="font-semibold text-[#684132]">{post.likes}</span>
        </button>

        <button className="hover:text-[#5A3E2B]">
          <MessageCircle />
        </button>

        <button className="hover:text-[#5A3E2B]">
          <Bookmark />
        </button>
      </footer>
    </article>
  );
}
