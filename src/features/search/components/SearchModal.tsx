import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SearchMode } from "@/features/feed/components/SearchModeSegment";
import { SharedSearchPanel } from "./SharedSearchPanel";

export interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export function SearchModal({ open, onOpenChange, className }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("posts");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 50);
    return () => window.clearTimeout(t);
  }, [open]);

  const title = useMemo(() => "Busca", []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex min-h-0 max-h-[min(90dvh,880px)] flex-col gap-0 overflow-hidden p-0",
          className
        )}
        aria-label="Buscar"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-6">
          <DialogHeader className="mb-0 shrink-0">
            <div className="min-w-0">
              <DialogTitle className="text-[var(--woody-header)]">{title}</DialogTitle>
              <div className="mt-1 text-sm text-[var(--woody-muted)]">
                Postagens, pessoas e comunidades — um único lugar.
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
            scrollableResults
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
