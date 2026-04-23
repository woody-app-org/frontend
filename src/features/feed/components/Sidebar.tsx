import { NavLink, Link } from "react-router-dom";
import { ArrowRight, Home, PenLine, Search, Sparkles, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { FeedDecorWaves } from "./FeedDecorWaves";

export interface SidebarProps {
  className?: string;
  onOpenSearch?: () => void;
  isSearchOpen?: boolean;
  onOpenCreatePost?: () => void;
  isCreatePostOpen?: boolean;
}

const navItemInactive = cn(
  "flex w-full items-center gap-3.5 rounded-[0.875rem] px-3.5 py-3 text-left text-[0.9375rem] font-medium leading-none tracking-[0.01em]",
  "border-2 border-transparent text-white/[0.82] transition-colors duration-200",
  "hover:border-white/[0.08] hover:bg-white/[0.055] hover:text-white",
  woodyFocus.ringSidebar
);

const navItemActive = cn(
  "flex w-full items-center gap-3.5 rounded-[0.875rem] px-3.5 py-3 text-left text-[0.9375rem] font-semibold leading-none tracking-[0.01em]",
  "border border-[var(--woody-nav)] bg-black text-[var(--woody-nav)]",
  "shadow-[0_0_0_1px_rgba(139,195,74,0.55),0_0_32px_rgba(139,195,74,0.24),0_0_64px_rgba(139,195,74,0.08),inset_0_1px_0_rgba(255,255,255,0.07)]",
  woodyFocus.ringSidebar
);

/** Navegação macro do app (desktop). */
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
        "flex-col shrink-0 min-h-0 bg-[var(--woody-sidebar)] text-[var(--woody-sidebar-text)]",
        "border-r border-white/[0.08]",
        className
      )}
    >
      <div className="shrink-0 px-6 pt-8 pb-7 md:px-7 md:pt-9">
        <Link
          to="/"
          className="inline-block outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--woody-sidebar)]"
          aria-label="Woody - Início"
        >
          <span className="font-serif text-[2rem] font-normal leading-none tracking-[-0.03em] text-white md:text-[2.125rem] lg:text-[2.25rem]">
            Woody<span className="text-[var(--woody-nav)]">.</span>
          </span>
        </Link>
      </div>

      <nav
        className="flex flex-col flex-1 min-h-0 overflow-y-auto px-5 pb-6 gap-2 md:px-6"
        aria-label="Navegação principal"
      >
        <NavLink to="/feed" end className={({ isActive }) => (isActive ? navItemActive : navItemInactive)}>
          <Home className="size-[1.1875rem] shrink-0 stroke-[2]" aria-hidden />
          Início
        </NavLink>

        <NavLink to="/communities" className={({ isActive }) => (isActive ? navItemActive : navItemInactive)}>
          <UsersRound className="size-[1.1875rem] shrink-0 stroke-[2]" aria-hidden />
          Comunidades
        </NavLink>

        <NavLink to="/planos" className={({ isActive }) => (isActive ? navItemActive : navItemInactive)}>
          <Sparkles className="size-[1.1875rem] shrink-0 stroke-[2]" aria-hidden />
          Planos
        </NavLink>

        <button
          type="button"
          onClick={onOpenCreatePost}
          className={cn(isCreatePostOpen ? navItemActive : navItemInactive)}
          aria-label="Nova publicação"
          aria-pressed={!!isCreatePostOpen}
        >
          <PenLine className="size-[1.1875rem] shrink-0 stroke-[2]" aria-hidden />
          Criar publicação
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          className={cn(isSearchOpen ? navItemActive : navItemInactive)}
          aria-label="Abrir busca"
          aria-pressed={!!isSearchOpen}
        >
          <Search className="size-[1.1875rem] shrink-0 stroke-[2]" aria-hidden />
          Busca
        </button>
      </nav>

      <div className="mt-auto shrink-0 px-5 pb-7 pt-3 md:px-6">
        <div className="relative min-h-[20.5rem] overflow-hidden rounded-2xl border border-[var(--woody-nav)]/90 bg-black px-5 py-5 shadow-[0_0_0_1px_rgba(139,195,74,0.12),inset_0_1px_0_rgba(255,255,255,0.04)]">
          <FeedDecorWaves className="opacity-[0.95]" variant="sidebar" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-16deg, transparent, transparent 6px, rgba(139,195,74,0.32) 6px, rgba(139,195,74,0.32) 7px)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-6 bottom-0 h-24 w-32 rounded-full bg-[var(--woody-nav)]/[0.06] blur-2xl"
            aria-hidden
          />
          <div className="relative z-[1] mb-3 flex size-8 items-center justify-center rounded-md border border-[var(--woody-nav)]/40 bg-black/50">
            <Sparkles className="size-4 text-[var(--woody-nav)]" strokeWidth={2} aria-hidden />
          </div>
          <p className="relative z-[1] text-[1rem] font-bold leading-snug tracking-[-0.02em] text-white">
            Seu espaço, suas conexões.
          </p>
          <p className="relative z-[1] mt-2.5 max-w-[16rem] text-[0.6875rem] leading-relaxed text-white/58">
            Encontre conteúdo que faz sentido para ti.
          </p>
          <Link
            to="/communities"
            className={cn(
              "relative z-[1] mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--woody-nav)] px-4 text-[0.8125rem] font-bold tracking-wide text-[var(--woody-ink)] transition-colors",
              "shadow-[0_0_0_1px_rgba(139,195,74,0.35),0_10px_28px_rgba(139,195,74,0.18)]",
              "hover:bg-[#9ccc5c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            )}
          >
            Explorar agora
            <ArrowRight className="size-3.5 shrink-0" aria-hidden />
          </Link>
        </div>
      </div>
    </aside>
  );
}
