import { NavLink } from "react-router-dom";
import { Home, PenLine, Search, UsersRound } from "lucide-react";
import catIllustration from "@/assets/cat.svg";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";

export interface SidebarProps {
  className?: string;
  onOpenSearch?: () => void;
  isSearchOpen?: boolean;
  onOpenCreatePost?: () => void;
  isCreatePostOpen?: boolean;
}

/** Navegação macro do app: apenas áreas principais (ex.: Home). Filtros do feed ficam na área central. */
export function Sidebar({
  className,
  onOpenSearch,
  isSearchOpen,
  onOpenCreatePost,
  isCreatePostOpen,
}: SidebarProps) {
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
              woodyFocus.ringSidebar,
              isActive
                ? "bg-[var(--woody-item-active)] text-white font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                : "text-[var(--woody-sidebar-text-inactive)] font-medium hover:bg-[var(--woody-item-hover)]"
            )
          }
        >
          <Home className="size-5 shrink-0" aria-hidden />
          Home
        </NavLink>

        <NavLink
          to="/communities"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-[background-color,color,box-shadow] duration-200",
              woodyFocus.ringSidebar,
              isActive
                ? "bg-[var(--woody-item-active)] text-white font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                : "text-[var(--woody-sidebar-text-inactive)] font-medium hover:bg-[var(--woody-item-hover)]"
            )
          }
        >
          <UsersRound className="size-5 shrink-0" aria-hidden />
          Comunidades
        </NavLink>

        <button
          type="button"
          onClick={onOpenCreatePost}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-[background-color,color,box-shadow] duration-200",
            woodyFocus.ringSidebar,
            isCreatePostOpen
              ? "bg-[var(--woody-item-active)] text-white font-semibold shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
              : "text-[var(--woody-sidebar-text-inactive)] font-medium hover:bg-[var(--woody-item-hover)]"
          )}
          aria-label="Nova publicação"
          aria-pressed={!!isCreatePostOpen}
        >
          <PenLine className="size-5 shrink-0" aria-hidden />
          Criar publicação
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-[background-color,color,box-shadow] duration-200",
            woodyFocus.ringSidebar,
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

      <div className="flex shrink-0 justify-center p-4 opacity-90" aria-hidden>
        <div className="relative flex h-[96px] w-[156px] items-end justify-center">
          <img
            src={catIllustration}
            alt=""
            className="relative z-[1] max-h-[82px] w-auto max-w-[138px] translate-y-1 object-contain object-bottom select-none"
            draggable={false}
          />
          {/* Galho: sai da esquerda do bloco; ponta só arredondada à direita */}
          <div
            className="absolute bottom-5 -left-1 z-0 h-[14px] w-[calc(100%+0.5rem)] max-w-[170px] rounded-r-full rounded-l-full bg-[#5D4E37] shadow-[inset_0_-2px_0_rgba(0,0,0,0.14)]"
            aria-hidden
          />
        </div>
      </div>
    </aside>
  );
}
