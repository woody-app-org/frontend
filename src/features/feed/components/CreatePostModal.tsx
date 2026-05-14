import { X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
          "flex max-h-[100dvh] min-h-0 flex-col gap-0 overflow-hidden p-0",
          "w-full max-w-none rounded-none sm:max-h-[min(90dvh,880px)] sm:max-w-[min(100vw-1rem,28rem)] sm:rounded-2xl"
        )}
        aria-label={community ? `Nova publicação em ${community.name}` : "Nova publicação no perfil"}
      >
        <DialogTitle className="sr-only">
          {community ? `Nova publicação em ${community.name}` : "Nova publicação"}
        </DialogTitle>

        <div className="flex shrink-0 items-center justify-end border-b border-black/[0.06] px-2 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-3">
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
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <CreatePostCard
            embedMode="modal"
            forceProfilePublication={!community}
            forcedCommunity={community ?? undefined}
            className="border-0 bg-transparent"
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
