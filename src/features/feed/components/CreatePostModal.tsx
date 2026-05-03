import { X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreatePostCard } from "./CreatePostCard";
import { useCreatePostComposer } from "../context/CreatePostComposerContext";

export function CreatePostModal() {
  const location = useLocation();
  const { createPostOpen, setCreatePostOpen, modalPublication, runAfterPostCreated } = useCreatePostComposer();

  const isCommunity = modalPublication.kind === "community";
  const community = isCommunity ? modalPublication.community : null;

  return (
    <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
      <DialogContent
        className={cn(
          "flex min-h-0 max-h-[min(90dvh,880px)] flex-col gap-0 overflow-hidden p-0",
          "w-[calc(100vw-1rem)] max-w-[min(100vw-1rem,52rem)] sm:max-w-[52rem]"
        )}
        aria-label={community ? `Nova publicação em ${community.name}` : "Nova publicação no perfil"}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-3 sm:gap-4 sm:p-6">
          <DialogHeader className="mb-0 shrink-0">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-balance text-[var(--woody-text)]">
                {community ? `Publicar em ${community.name}` : "Nova publicação"}
              </DialogTitle>
              <p className="mt-2 text-sm leading-relaxed text-[var(--woody-muted)]">
                {community
                  ? "A publicação ficará visível nesta comunidade. Preenche o texto e, se quiseres, tags ou fotos/vídeo."
                  : "Publicar no teu perfil — preenche o texto e, se quiseres, tags ou fotos/vídeo."}
              </p>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Fechar"
                className={cn(
                  "size-10 shrink-0 rounded-full",
                  "text-[var(--woody-text)]/80 hover:text-[var(--woody-text)]",
                  "hover:bg-black/5 transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/30"
                )}
              >
                <X className="mx-auto size-5" aria-hidden />
              </button>
            </DialogClose>
          </DialogHeader>

          <CreatePostCard
            composerFeedback="none"
            forceProfilePublication={!community}
            forcedCommunity={community ?? undefined}
            className="border-0 bg-transparent shadow-none"
            onPostCreated={(post) => {
              setCreatePostOpen(false);
              runAfterPostCreated(post, location.pathname);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
