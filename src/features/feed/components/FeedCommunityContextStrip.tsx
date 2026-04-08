import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/context/AuthContext";
import { fetchAllCommunities, fetchMyCommunityIdSet } from "@/features/communities/services/community.service";
import type { Community } from "@/domain/types";

const MAX_ITEMS = 8;

export function FeedCommunityContextStrip({ className }: { className?: string }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Community[]>([]);
  const [mode, setMode] = useState<"mine" | "explore" | "empty" | "loading">("loading");

  const load = useCallback(async () => {
    setMode("loading");
    try {
      const all = await fetchAllCommunities();
      const sorted = [...all].sort((a, b) => a.name.localeCompare(b.name, "pt"));

      if (!isAuthenticated) {
        setItems(sorted.slice(0, MAX_ITEMS));
        setMode(sorted.length ? "explore" : "empty");
        return;
      }

      const mineIds = await fetchMyCommunityIdSet();
      const mine = sorted.filter((c) => mineIds.has(c.id));
      setItems(mine.slice(0, MAX_ITEMS));
      setMode(mine.length ? "mine" : "empty");
    } catch {
      setItems([]);
      setMode("empty");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section
      className={cn(
        "rounded-2xl border border-[var(--woody-accent)]/12 bg-[var(--woody-card)]/60 px-3 py-3 sm:px-4",
        className
      )}
      aria-label="Comunidades em contexto"
    >
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--woody-muted)]">
            Comunidades
          </p>
          <p className="text-sm text-[var(--woody-text)]/90">
            {mode === "explore" && !isAuthenticated
              ? "Explorar na Woody"
              : "Onde você conversa"}
          </p>
        </div>
        <Link
          to="/communities"
          className={cn(
            "flex shrink-0 items-center gap-0.5 text-xs font-semibold text-[var(--woody-nav)] hover:underline",
            woodyFocus.ring
          )}
        >
          Ver todas
          <ChevronRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      {mode === "loading" ? (
        <p className="text-sm text-[var(--woody-muted)] py-2">A carregar comunidades…</p>
      ) : mode === "empty" ? (
        <p className="text-sm text-[var(--woody-muted)] py-2">
          {isAuthenticated
            ? "Ainda não participa de nenhuma comunidade. Explore e entre num grupo."
            : "Inicie sessão para ver as comunidades em que participa, ou explore a lista completa."}
        </p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((c) => {
            const initials = c.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const member = mode === "mine";
            return (
              <Link
                key={c.id}
                to={`/communities/${c.slug}`}
                className={cn(
                  woodyFocus.ring,
                  "flex min-w-[7.25rem] max-w-[9rem] flex-col items-center gap-1.5 rounded-xl bg-[var(--woody-bg)]/70 px-2.5 py-2.5 ring-1 ring-[var(--woody-accent)]/10 transition-colors hover:bg-[var(--woody-bg)]"
                )}
              >
                <Avatar className="size-11 border-2 border-[var(--woody-card)] shadow-sm">
                  {c.avatarUrl ? (
                    <AvatarImage src={c.avatarUrl} alt="" className="object-cover" />
                  ) : null}
                  <AvatarFallback className="text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
                <span className="line-clamp-2 w-full text-center text-[0.7rem] font-semibold leading-tight text-[var(--woody-text)]">
                  {c.name}
                </span>
                {member ? (
                  <span className="text-[0.65rem] font-medium text-[var(--woody-nav)]">Membro</span>
                ) : (
                  <span className="text-[0.65rem] text-[var(--woody-muted)]">Explorar</span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
