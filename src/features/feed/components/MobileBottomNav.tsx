import { Home, UsersRound, PlusSquare, Search, MessageCircle, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";

const ITEMS = [
  { id: "home", path: "/feed", label: "Início", icon: Home },
  { id: "comunidades", path: "/communities", label: "Comun.", icon: UsersRound },
  { id: "planos", path: "/planos", label: "Planos", icon: Sparkles },
  { id: "create", path: "/criar", label: "Criar", icon: PlusSquare },
  { id: "search", path: "/feed", label: "Busca", icon: Search },
  { id: "mensagens", path: "/messages", label: "Msgs", icon: MessageCircle },
] as const;

export interface MobileBottomNavProps {
  className?: string;
  onOpenSearch?: () => void;
  isSearchOpen?: boolean;
}

export function MobileBottomNav({ className, onOpenSearch, isSearchOpen }: MobileBottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-40 grid grid-cols-6 gap-0 border-t border-black/[0.08] bg-[var(--woody-card)]/97 py-1.5 px-0.5 text-[var(--woody-text)] shadow-[0_-4px_24px_rgba(10,10,10,0.08)] backdrop-blur-md safe-area-pb",
        className
      )}
    >
      {ITEMS.map((item) => {
        const isActive =
          item.id === "home"
            ? location.pathname === "/feed" || location.pathname === "/"
            : item.id === "comunidades"
              ? location.pathname.startsWith("/communities")
              : item.id === "planos"
                ? location.pathname.startsWith("/planos")
                : item.id === "search"
                  ? !!isSearchOpen
                  : location.pathname.startsWith(item.path);
        const Icon = item.icon;
        const isSearch = item.id === "search";
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (isSearch) {
                onOpenSearch?.();
                return;
              }
              navigate(item.path);
            }}
            className={cn(
              "flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl py-1 transition-colors duration-200",
              woodyFocus.ring,
              isActive
                ? "font-semibold text-[var(--woody-nav)]"
                : "font-medium text-[var(--woody-muted)] hover:bg-black/[0.04] hover:text-[var(--woody-text)]"
            )}
          >
            <Icon className={cn("size-[1.15rem] shrink-0", isActive && "stroke-[var(--woody-nav)]")} strokeWidth={2} />
            <span className="max-w-full truncate px-0.5 text-[0.625rem] leading-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
