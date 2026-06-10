import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { profilePathForUser } from "@/features/profile/lib/profilePaths";
import { formatRelativeTimeUtc } from "@/lib/formatRelativeTimeUtc";
import { cn } from "@/lib/utils";
import { fetchStoryViewers } from "../services/stories.service";
import type { StoryViewer } from "../types";

export interface StoryViewersSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyId: string;
}

export function StoryViewersSheet({ open, onOpenChange, storyId }: StoryViewersSheetProps) {
  const [viewers, setViewers] = useState<StoryViewer[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) setLoadState("loading");
    }, 0);
    void fetchStoryViewers(storyId)
      .then((list) => {
        if (cancelled) return;
        setViewers(list);
        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, storyId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="z-[115] bg-black/65 backdrop-blur-[2px]"
        className={cn(
          "z-[120] border-[var(--woody-accent)]/15 sm:max-w-md",
          "gap-0 p-0 overflow-hidden mx-4 w-[calc(100vw-2rem)] max-w-md max-h-[70vh] flex flex-col"
        )}
      >
        <DialogHeader className="px-4 pt-5 pb-2 sm:px-6 sm:pt-6">
          <DialogTitle className="flex items-center gap-2 text-[var(--woody-text)]">
            <Eye className="size-4" aria-hidden />
            {viewers.length > 0
              ? `Visualizado por ${viewers.length}`
              : "Visualizações"}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 sm:px-3">
          {loadState === "loading" ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-[var(--woody-muted)]">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Carregando…
            </div>
          ) : null}

          {loadState === "error" ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--woody-muted)]">
              Não foi possível carregar quem viu este story.
            </p>
          ) : null}

          {loadState === "ready" && viewers.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--woody-muted)]">
              Ainda ninguém viu este story.
            </p>
          ) : null}

          {loadState === "ready"
            ? viewers.map((viewer) => (
                <Link
                  key={viewer.userId}
                  to={profilePathForUser({ id: viewer.userId, username: viewer.username })}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[var(--woody-accent)]/8"
                >
                  <Avatar className="size-10 shrink-0">
                    <AvatarImage src={viewer.avatarUrl ?? undefined} alt="" />
                    <AvatarFallback>{viewer.displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--woody-text)]">
                      {viewer.displayName}
                    </p>
                    {viewer.username ? (
                      <p className="truncate text-xs text-[var(--woody-muted)]">@{viewer.username}</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-xs text-[var(--woody-muted)]">
                    {formatRelativeTimeUtc(viewer.viewedAt)}
                  </span>
                </Link>
              ))
            : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
