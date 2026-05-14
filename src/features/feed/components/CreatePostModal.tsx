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
          "flex min-h-0 flex-col gap-0 overflow-hidden p-0",
          // Telemóvel: cartão centrado, margens e altura limitada (evita “ecrã inteiro” desproporcionado)
          "mx-auto max-h-[min(82dvh,28rem)] w-[calc(100vw-1.25rem)] max-w-md rounded-2xl border border-black/10",
          // Tablet/desktop: modal largo como antes
          "sm:max-h-[min(92dvh,900px)] sm:w-[min(100vw-2rem,44rem)] sm:max-w-[min(100vw-2rem,44rem)]"
        )}
        aria-label={community ? `Nova publicação em ${community.name}` : "Nova publicação no perfil"}
      >
        <DialogTitle className="sr-only">
          {community ? `Nova publicação em ${community.name}` : "Nova publicação"}
        </DialogTitle>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Fechar"
              className={cn(
                "absolute right-2 top-[max(0.35rem,env(safe-area-inset-top))] z-10 size-9 rounded-full sm:right-3 sm:top-3 sm:size-10",
                "text-[var(--woody-text)]/75 hover:text-[var(--woody-text)]",
                "hover:bg-black/[0.06] transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/25"
              )}
            >
              <X className="mx-auto size-[1.15rem] sm:size-5" aria-hidden />
            </button>
          </DialogClose>

          <div className="flex min-h-0 flex-1 flex-col pt-[max(2.35rem,env(safe-area-inset-top))] sm:pt-[max(2.75rem,env(safe-area-inset-top))]">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
