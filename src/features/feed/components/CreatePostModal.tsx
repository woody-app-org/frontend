import { X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreatePostCard } from "./CreatePostCard";
import { useCreatePostComposer } from "../context/CreatePostComposerContext";

export function CreatePostModal() {
  const location = useLocation();
  const {
    createPostOpen,
    setCreatePostOpen,
    pageComposerCommunity,
    runAfterPostCreated,
  } = useCreatePostComposer();

  return (
    <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
      <DialogContent
        className={cn(
          "flex min-h-0 max-h-[min(90dvh,880px)] flex-col gap-0 overflow-hidden p-0",
          "w-[calc(100vw-1rem)] max-w-[min(100vw-1rem,640px)] sm:max-w-[640px]"
        )}
        aria-label="Nova publicação"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <DialogHeader className="mb-0 shrink-0">
            <div className="min-w-0">
              <DialogTitle className="text-[var(--woody-text)]">Nova publicação</DialogTitle>
              <p className="mt-1 text-sm text-[var(--woody-muted)]">
                Escolhe se publicas no teu perfil ou numa comunidade; depois preenche o texto e, se quiseres, tags ou
                imagem.
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
            forcedCommunity={pageComposerCommunity ?? undefined}
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
