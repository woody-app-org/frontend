import { Heart, MessageCircle, MoreVertical, Pin, Flag } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Post } from "../types";

export interface PostCardProps {
  post: Post;
  onPin?: (postId: string) => void;
  onReport?: (postId: string) => void;
  className?: string;
}

export function PostCard({ post, onPin, onReport, className }: PostCardProps) {
  const initials = post.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card
      className={cn(
        "border-[var(--woody-accent)]/20 bg-[var(--woody-card)]",
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 px-5 py-3 pb-0">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar size="sm" className="size-9 shrink-0">
            <AvatarImage src={post.author.avatarUrl ?? undefined} alt={post.author.name} />
            <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-1">
              <span className="font-semibold text-[var(--woody-text)] truncate">
                {post.author.name}
              </span>
              {post.author.pronouns && (
                <>
                  <span className="text-[var(--woody-muted)] text-sm">•</span>
                  <span className="text-[var(--woody-muted)] text-sm truncate">
                    {post.author.pronouns}
                  </span>
                </>
              )}
            </div>
            {post.topic && (
              <p className="text-sm text-[var(--woody-muted)] mt-0.5">{post.topic}</p>
            )}
            <p className="text-xs text-[var(--woody-muted)] mt-0.5">{post.createdAt}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="shrink-0 text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/10"
              aria-label="Abrir menu"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[var(--woody-card)] border-[var(--woody-accent)]/20">
            <DropdownMenuItem
              onClick={() => onPin?.(post.id)}
              className="text-[var(--woody-text)] focus:bg-[var(--woody-nav)]/10"
            >
              <Pin className="size-4 mr-2" />
              Fixar
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onReport?.(post.id)}
              className="text-[var(--woody-accent)] focus:bg-[var(--woody-accent)]/10"
            >
              <Flag className="size-4 mr-2" />
              Reportar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-5 pt-2 pb-5">
        {post.title && (
          <h3 className="font-semibold text-[var(--woody-text)] mb-1">{post.title}</h3>
        )}
        <p className="text-[var(--woody-text)] text-sm whitespace-pre-wrap break-words">
          {post.content}
        </p>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt=""
            className="mt-3 w-full rounded-lg object-cover max-h-64 bg-[var(--woody-nav)]/5"
          />
        )}
        <div className="flex items-center gap-4 mt-3 text-[var(--woody-text)]">
          <span className="flex items-center gap-1.5 text-sm">
            <Heart className="size-4 fill-current" />
            {post.likesCount >= 1000
              ? `${(post.likesCount / 1000).toFixed(1)}k`
              : post.likesCount}
          </span>
          <span className="flex items-center gap-1.5 text-sm">
            <MessageCircle className="size-4" />
            {post.commentsCount >= 1000
              ? `${(post.commentsCount / 1000).toFixed(1)}k`
              : post.commentsCount}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
