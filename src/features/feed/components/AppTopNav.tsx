import { NavLink, Link } from "react-router-dom";
import { Home, MessageCircle, PenLine, Search, Sparkles, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";
import { PrivateNotificationsBell } from "./PrivateNotificationsBell";
import { UserAccountMenu } from "./UserAccountMenu";
import logoBlack from "@/assets/logo-black.svg";

export interface AppTopNavProps {
  onOpenSearch: () => void;
  isSearchOpen: boolean;
  onOpenCreatePost: () => void;
  isCreatePostOpen: boolean;
  /** Esconder barra no mobile (ex.: chat DM em ecrã cheio). */
  hideOnMobile?: boolean;
  className?: string;
}

const navBase =
  "inline-flex items-center gap-2 rounded-full px-3 py-2 text-[0.8125rem] font-medium leading-none tracking-[0.01em] transition-colors";
const navIdle = cn(
  navBase,
  "text-[var(--woody-muted)] hover:bg-black/[0.045] hover:text-[var(--woody-text)]",
  woodyFocus.ring
);
const navActive = cn(
  navBase,
  "bg-[var(--woody-nav)]/14 font-semibold text-[var(--woody-text)] ring-1 ring-[var(--woody-nav)]/28 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
  woodyFocus.ring
);

const iconBtn =
  "flex size-10 shrink-0 items-center justify-center rounded-full text-[var(--woody-text)] transition-colors hover:bg-black/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--woody-header)]";

export function AppTopNav({
  onOpenSearch,
  isSearchOpen,
  onOpenCreatePost,
  isCreatePostOpen,
  hideOnMobile,
  className,
}: AppTopNavProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full shrink-0 border-b border-black/[0.07] bg-[var(--woody-header)]/92 backdrop-blur-md backdrop-saturate-150",
        hideOnMobile && "max-md:hidden",
        className
      )}
    >
      <div className="mx-auto flex h-[var(--app-topnav-height)] w-full max-w-[var(--layout-max-width)] items-center gap-3 px-[var(--layout-gutter)] sm:gap-4">
        <Link
          to="/"
          className="flex shrink-0 items-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--woody-header)]"
          aria-label="Woody — Início"
        >
          <img
            src={logoBlack}
            alt="Woody"
            width={510}
            height={112}
            decoding="async"
            className="h-8 w-auto max-w-[min(200px,42vw)] object-contain object-left select-none sm:h-9 sm:max-w-[min(220px,36vw)] md:max-w-[min(240px,28vw)]"
          />
        </Link>

        <nav
          className="ml-1 hidden min-w-0 flex-1 items-center gap-0.5 md:flex lg:ml-3 lg:gap-1"
          aria-label="Navegação principal"
        >
          <NavLink to="/feed" end className={({ isActive }) => (isActive ? navActive : navIdle)}>
            <Home className="size-[1.05rem] shrink-0 stroke-[2]" aria-hidden />
            Início
          </NavLink>
          <NavLink to="/communities" className={({ isActive }) => (isActive ? navActive : navIdle)}>
            <UsersRound className="size-[1.05rem] shrink-0 stroke-[2]" aria-hidden />
            Comunidades
          </NavLink>
          <NavLink to="/planos" className={({ isActive }) => (isActive ? navActive : navIdle)}>
            <Sparkles className="size-[1.05rem] shrink-0 stroke-[2]" aria-hidden />
            Planos
          </NavLink>
          <button
            type="button"
            onClick={onOpenCreatePost}
            className={cn(isCreatePostOpen ? navActive : navIdle)}
            aria-label="Nova publicação"
            aria-pressed={isCreatePostOpen}
          >
            <PenLine className="size-[1.05rem] shrink-0 stroke-[2]" aria-hidden />
            Criar publicação
          </button>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button type="button" className={iconBtn} aria-label="Abrir busca" aria-pressed={isSearchOpen} onClick={onOpenSearch}>
            <Search className="size-5" strokeWidth={2} aria-hidden />
          </button>
          <Link to="/messages" className={iconBtn} aria-label="Mensagens">
            <MessageCircle className="size-5" strokeWidth={2} aria-hidden />
          </Link>
          <PrivateNotificationsBell variant="toolbar" />
          <UserAccountMenu />
        </div>
      </div>
    </header>
  );
}
