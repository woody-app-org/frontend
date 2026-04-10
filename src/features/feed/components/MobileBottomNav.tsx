import { Home, UsersRound, PlusSquare, Search, Bookmark } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";

const ITEMS = [
  { id: "home", path: "/feed", label: "Home", icon: Home },
  { id: "comunidades", path: "/communities", label: "Comunidades", icon: UsersRound },
  { id: "create", path: "/criar", label: "Criar", icon: PlusSquare },
  { id: "search", path: "/feed", label: "Busca", icon: Search },
  { id: "salvos", path: "/salvos", label: "Salvos", icon: Bookmark },
];

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
        "md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2 px-1.5 bg-[var(--woody-header)]/95 backdrop-blur-md border-t border-[var(--woody-divider)] shadow-[0_-4px_20px_rgba(58,45,36,0.05)] safe-area-pb",
        className
      )}
    >
      {ITEMS.map((item) => {
        const isActive =
          item.id === "home"
            ? location.pathname === "/feed" || location.pathname === "/"
            : item.id === "comunidades"
              ? location.pathname.startsWith("/communities")
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
              "flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 min-w-[52px] max-w-[72px] rounded-xl transition-colors duration-200",
              woodyFocus.ring,
              isActive
                ? "text-[var(--woody-nav)] bg-[var(--woody-nav)]/12 font-semibold"
                : "text-[var(--woody-text)] font-medium hover:bg-[var(--woody-nav)]/6"
            )}
          >
            <Icon
              className={cn("size-5", isActive && "stroke-[var(--woody-nav)]")}
            />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
