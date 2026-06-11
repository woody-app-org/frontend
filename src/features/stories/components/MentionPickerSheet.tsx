import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { resolvePublicMediaUrl } from "@/lib/api";
import { useSearch } from "@/features/search/hooks/useSearch";

export interface MentionPick {
  userId: number;
  username: string;
}

export interface MentionPickerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (pick: MentionPick) => void;
}

/** Busca de pessoas para mencionar no story (gera um layer "@username" arrastável). */
export function MentionPickerSheet({ open, onOpenChange, onSelect }: MentionPickerSheetProps) {
  const [query, setQuery] = useState("");
  const { isLoading, people } = useSearch({ query, mode: "people" });

  const handlePick = (id: string, username: string) => {
    const userId = Number.parseInt(id, 10);
    if (!Number.isFinite(userId) || userId <= 0 || !username) return;
    onSelect({ userId, username });
    setQuery("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "z-[120] gap-4 border-white/12 bg-[#1c1c1c] text-white sm:max-w-md",
          "max-sm:bottom-0 max-sm:top-auto max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-2xl"
        )}
      >
        <DialogHeader className="mb-4">
          <DialogTitle className="text-white">Mencionar alguém</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar pessoas…"
            autoFocus
            className={cn(
              "h-10 w-full rounded-xl border border-white/15 bg-white/5 pl-9 pr-3 text-sm",
              "text-white placeholder:text-white/40",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/50"
            )}
          />
        </div>

        <div className="max-h-64 overflow-y-auto rounded-xl border border-white/10">
          {query.trim().length === 0 ? (
            <p className="px-3 py-4 text-sm text-white/50">Digite para buscar uma pessoa.</p>
          ) : people.length === 0 && !isLoading ? (
            <p className="px-3 py-4 text-sm text-white/50">Nenhuma pessoa encontrada.</p>
          ) : null}
          <ul className="divide-y divide-white/10">
            {people.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/8"
                  onClick={() => handlePick(p.id, p.username ?? "")}
                  disabled={!p.username}
                >
                  <Avatar size="sm">
                    {p.avatarUrl ? <AvatarImage src={resolvePublicMediaUrl(p.avatarUrl)} alt="" /> : null}
                    <AvatarFallback className="text-[0.65rem] font-semibold">
                      {(p.name || p.username || "?").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white">{p.name || p.username}</span>
                    {p.username ? (
                      <span className="block truncate text-xs text-white/50">@{p.username}</span>
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {isLoading ? (
            <div className="flex justify-center py-2">
              <Loader2 className="size-4 animate-spin text-white/50" aria-label="Buscando" />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
