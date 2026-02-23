import { Rss, Users, PlusSquare, Search, Bookmark } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const ITEMS = [
  { id: "feed", path: "/", label: "Feed", icon: Rss },
  { id: "comunidade", path: "/comunidade", label: "Comunidade", icon: Users },
  { id: "create", path: "/criar", label: "Criar", icon: PlusSquare },
  { id: "explorar", path: "/explorar", label: "Explorar", icon: Search },
  { id: "salvos", path: "/salvos", label: "Salvos", icon: Bookmark },
];

export interface MobileBottomNavProps {
  className?: string;
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2 px-2 bg-[var(--woody-bg)] border-t border-[var(--woody-nav)]/10 safe-area-pb",
        className
      )}
    >
      {ITEMS.map((item) => {
        const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-1 px-2 min-w-[56px] rounded-lg transition-colors",
              isActive
                ? "text-[var(--woody-nav)] bg-[var(--woody-nav)]/10"
                : "text-[var(--woody-text)] hover:bg-[var(--woody-nav)]/5"
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
