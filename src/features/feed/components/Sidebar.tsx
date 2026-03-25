import { NavLink } from "react-router-dom";
import { Home, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarProps {
  className?: string;
  onOpenSearch?: () => void;
  isSearchOpen?: boolean;
}

/** Navegação macro do app: apenas áreas principais (ex.: Home). Filtros do feed ficam na área central. */
export function Sidebar({ className, onOpenSearch, isSearchOpen }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-[260px] shrink-0 min-h-0 bg-[var(--woody-sidebar)]",
        "shadow-[8px_0_20px_rgba(0,0,0,0.18),4px_0_12px_rgba(0,0,0,0.12)]",
        className
      )}
    >
      <nav
        className="flex flex-col flex-1 min-h-0 overflow-y-auto py-4 px-3 gap-1"
        aria-label="Navegação principal"
      >
        <NavLink
          to="/feed"
          end
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-[background-color,color,box-shadow] duration-200",
              isActive
                ? "bg-[var(--woody-item-active)] text-white font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                : "text-[var(--woody-sidebar-text-inactive)] font-medium hover:bg-[var(--woody-item-hover)]"
            )
          }
        >
          <Home className="size-5 shrink-0" aria-hidden />
          Home
        </NavLink>

        <button
          type="button"
          onClick={onOpenSearch}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-[background-color,color,box-shadow] duration-200",
            isSearchOpen
              ? "bg-[var(--woody-item-active)] text-white font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
              : "text-[var(--woody-sidebar-text-inactive)] font-medium hover:bg-[var(--woody-item-hover)]"
          )}
          aria-label="Abrir busca"
          aria-pressed={!!isSearchOpen}
        >
          <Search className="size-5 shrink-0" aria-hidden />
          Busca
        </button>
      </nav>

      <div className="p-4 flex justify-center opacity-80 shrink-0">
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="opacity-80" aria-hidden>
          <rect x="10" y="45" width="100" height="8" rx="2" fill="#5D4E37" />
          <ellipse cx="35" cy="38" rx="12" ry="10" fill="#1a1a1a" />
          <path d="M25 38 L30 35 L35 38 L40 35 L45 38" stroke="#1a1a1a" strokeWidth="2" fill="none" />
          <circle cx="38" cy="36" r="1.5" fill="#fff" />
          <rect x="55" y="52" width="12" height="18" rx="2" fill="#5D4E37" />
          <path d="M58 52 L66 42 L74 52 Z" fill="#2D5A27" />
          <rect x="75" y="52" width="12" height="18" rx="2" fill="#5D4E37" />
          <path d="M78 52 L86 42 L94 52 Z" fill="#2D5A27" />
        </svg>
      </div>
    </aside>
  );
}
