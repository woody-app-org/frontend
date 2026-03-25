import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Post } from "@/features/feed/types";
import type { SearchMode } from "@/features/feed/components/SearchModeSegment";
import { SharedSearchPanel } from "./SharedSearchPanel";

export interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourcePosts: Post[];
  className?: string;
}

export function SearchModal({ open, onOpenChange, sourcePosts, className }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("people");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
    return () => window.clearTimeout(t);
  }, [open]);

  // Quando fechar, mantém estado (boa UX); mas se quiser resetar no futuro:
  // useEffect(() => { if (!open) setQuery(""); }, [open]);
  const title = useMemo(() => "Busca", []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("p-0 overflow-hidden", className)} aria-label="Buscar">
        <div className="p-4 sm:p-6">
          <DialogHeader className="mb-4">
            <div className="min-w-0">
              <DialogTitle className="text-[var(--woody-header)]">{title}</DialogTitle>
              <div className="mt-1 text-sm text-[var(--woody-muted)]">
                Tópicos e pessoas, no mesmo lugar.
              </div>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Fechar busca"
                className={cn(
                  "size-10 shrink-0 rounded-full",
                  "text-[var(--woody-text)]/80 hover:text-[var(--woody-text)]",
                  "hover:bg-black/5 transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/30"
                )}
              >
                <X className="size-5 mx-auto" aria-hidden />
              </button>
            </DialogClose>
          </DialogHeader>

          <SharedSearchPanel
            query={query}
            onQueryChange={setQuery}
            mode={mode}
            onModeChange={setMode}
            autoFocusRef={inputRef}
            sourcePosts={sourcePosts}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

