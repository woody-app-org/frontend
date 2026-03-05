import { Heart, MessageCircle, MoreVertical, Pin, Flag, Clock } from "lucide-react";
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

// --- Helpers ---

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return String(count);
}

// --- Estilos padronizados (evitar classes gigantes inline) ---

const styles = {
  card:
    "rounded-2xl border border-[var(--woody-accent)]/20 bg-[var(--woody-card)] shadow-[0_1px_3px_rgba(92,58,59,0.06)] flex flex-col gap-0 px-4 pt-3 pb-3 sm:px-4",
  header:
    "flex flex-row items-start justify-between gap-3 p-0",
  headerLeft: "flex min-w-0 flex-1 items-start gap-3",
  avatar: "size-9 shrink-0",
  headerMeta: "min-w-0 flex-1",
  authorName: "font-semibold text-[var(--woody-text)] text-[0.95rem] leading-tight truncate",
  authorPronouns: "text-[var(--woody-muted)] text-xs",
  timestamp: "flex items-center gap-1 text-[var(--woody-muted)] text-xs mt-0.5",
  menuTrigger:
    "shrink-0 text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/10 rounded-md p-1.5 min-w-[2rem] min-h-[2rem]",
  titleRow:
    "flex flex-wrap items-center gap-2 gap-y-1 mt-2",
  title: "font-bold text-[var(--woody-text)] text-base sm:text-[1.05rem] leading-snug",
  pill:
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[var(--woody-nav)]/15 text-[var(--woody-muted)] border border-[var(--woody-accent)]/10",
  content:
    "text-[var(--woody-text)]/90 text-[0.9375rem] leading-relaxed whitespace-pre-wrap break-words",
  contentBlock: "p-0 pt-2 pb-0",
  imageWrap: "mt-3 w-full overflow-hidden rounded-xl bg-[var(--woody-nav)]/5",
  image: "w-full object-cover max-h-72 rounded-xl",
  footer:
    "flex items-center gap-5 mt-3 pt-0.5 text-[var(--woody-muted)]",
  footerItem:
    "flex items-center gap-1.5 text-xs transition-colors rounded-md py-1 px-1.5 -mx-1.5 hover:text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/5 [&_svg]:size-3.5",
} as const;

// --- Component ---

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
    <Card className={cn(styles.card, className)}>
      <CardHeader className={styles.header}>
        <div className={styles.headerLeft}>
          <Avatar size="default" className={styles.avatar}>
            <AvatarImage src={post.author.avatarUrl ?? undefined} alt={post.author.name} />
            <AvatarFallback className="bg-[var(--woody-nav)]/10 text-[var(--woody-text)] text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className={styles.headerMeta}>
            <div className="flex flex-wrap items-baseline gap-1">
              <span className={styles.authorName}>{post.author.name}</span>
              {post.author.pronouns && (
                <>
                  <span className={styles.authorPronouns}>•</span>
                  <span className={cn(styles.authorPronouns, "truncate")}>
                    {post.author.pronouns}
                  </span>
                </>
              )}
            </div>
            <div className={styles.timestamp}>
              <Clock className="size-3 shrink-0" aria-hidden />
              <span>{post.createdAt}</span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className={styles.menuTrigger}
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
      <CardContent className={styles.contentBlock}>
        <div className={styles.titleRow}>
          {post.title && <h3 className={styles.title}>{post.title}</h3>}
          {post.topic && <span className={styles.pill}>{post.topic}</span>}
        </div>
        <p className={cn(styles.content, (post.title || post.topic) && "mt-2")}>
          {post.content}
        </p>
        {post.imageUrl && (
          <div className={styles.imageWrap}>
            <img src={post.imageUrl} alt="" className={styles.image} />
          </div>
        )}
        <div className={styles.footer}>
          <span className={styles.footerItem}>
            <Heart className="size-[1em] stroke-current" strokeWidth={1.75} />
            {formatCount(post.likesCount)}
          </span>
          <span className={styles.footerItem}>
            <MessageCircle className="size-[1em] stroke-current" strokeWidth={1.75} />
            {formatCount(post.commentsCount)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
