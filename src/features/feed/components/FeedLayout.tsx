import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, MessageCircle, User } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";
import { MobileBottomNav } from "./MobileBottomNav";
import { cn } from "@/lib/utils";
import { SearchModal } from "@/features/search/components/SearchModal";

export interface FeedLayoutProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Coluna global à direita (Sugestões / Seguindo).
   * Desligar em páginas que já têm sidebar densa no miolo (ex.: detalhe de comunidade),
   * para não sobrepor conteúdo.
   */
  showRightPanel?: boolean;
}

// --- Estilos do header (evitar classes gigantes no JSX) ---

/** Container principal: max-width e gutter (src/index.css). Em desktop não limita altura para o scroll wrapper definir. */
const LAYOUT_CONTAINER =
  "w-full max-w-[var(--layout-max-width)] mx-auto px-[var(--layout-gutter)]";

/**
 * Mobile: fluxo natural + scroll no documento (body).
 * Desktop (md+): altura fixa ao viewport + scroll só no wrapper interno (scrollbar na lateral).
 */
const LAYOUT_ROOT =
  "min-h-screen w-full flex flex-col bg-[var(--woody-bg)] md:h-screen md:min-h-0 md:overflow-hidden";

/** Em mobile não usa overflow interno — evita “armadilha” sem altura definida + body bloqueado. */
const SCROLL_WRAPPER =
  "w-full flex flex-col md:flex-1 md:min-h-0 md:overflow-y-auto md:overflow-x-hidden";

const styles = {
  header:
    "sticky top-0 z-50 w-full bg-[var(--woody-header)] text-white shrink-0",
  headerInner:
    "flex items-center justify-between h-14 md:h-16 gap-3 md:gap-4",
  logoArea:
    "flex items-center shrink-0 h-full min-h-14 md:min-h-16 md:w-[260px] md:bg-[var(--woody-header-logo)]",
  logo: "flex items-center shrink-0 md:justify-start",
  logoText: "text-2xl font-bold tracking-tight text-white select-none",
  right: "flex items-center gap-1 md:gap-2 shrink-0 md:w-[320px] md:justify-end",
  iconBtn:
    "size-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors shrink-0",
  iconBtnHidden: "hidden md:flex",
  bellWrap: "relative",
  badge: "absolute top-1.5 right-1.5 size-1.5 rounded-full bg-amber-400",
  avatarBtn:
    "size-10 flex items-center justify-center rounded-full hover:bg-white/10 overflow-hidden ring-1 ring-white/15 shrink-0",
  avatarImg: "size-8 rounded-full object-cover",
} as const;

const SCROLL_KEYS = [" ", "PageDown", "PageUp", "ArrowDown", "ArrowUp"] as const;
const PAGE_SCROLL = 0.85;

function isScrollKey(key: string): key is (typeof SCROLL_KEYS)[number] {
  return SCROLL_KEYS.includes(key as (typeof SCROLL_KEYS)[number]);
}

function isEditableElement(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  const role = el.getAttribute("role");
  const editable = el.isContentEditable;
  return tag === "input" || tag === "textarea" || tag === "select" || editable || role === "textbox";
}

/** Modal/dialog em portal (fora de <main>): não interceptar wheel nem rolar o feed por baixo. */
function isInsideDialogLayer(node: EventTarget | null): boolean {
  if (!node || !(node instanceof Element)) return false;
  return Boolean(
    node.closest('[data-slot="dialog-content"]') || node.closest('[data-slot="dialog-overlay"]')
  );
}

export function FeedLayout({ children, className, showRightPanel = true }: FeedLayoutProps) {
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  // Só no desktop: trava scroll do body para o wrapper interno controlar (mobile usa scroll nativo).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const applyBodyOverflow = () => {
      if (mq.matches) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };
    applyBodyOverflow();
    mq.addEventListener("change", applyBodyOverflow);
    return () => {
      mq.removeEventListener("change", applyBodyOverflow);
      document.body.style.overflow = "";
    };
  }, []);

  // Redireciona wheel para o scroll wrapper (apenas desktop — touch não usa wheel).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handleWheel = (e: WheelEvent) => {
      if (!mq.matches) return;
      if (isInsideDialogLayer(e.target)) return;
      const wrapper = scrollWrapperRef.current;
      if (!wrapper) return;
      const main = wrapper.querySelector("main");
      if (main?.contains(e.target as Node)) return;
      e.preventDefault();
      wrapper.scrollBy({ top: e.deltaY, behavior: "auto" });
    };

    window.addEventListener("wheel", handleWheel, { capture: true, passive: false });
    return () => window.removeEventListener("wheel", handleWheel, { capture: true });
  }, []);

  // Teclas de navegação rolam o wrapper (apenas desktop).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mq.matches) return;
      if (!isScrollKey(e.key)) return;
      if (isEditableElement(document.activeElement)) return;
      if (isInsideDialogLayer(document.activeElement)) return;

      const wrapper = scrollWrapperRef.current;
      if (!wrapper) return;

      e.preventDefault();
      const page = wrapper.clientHeight * PAGE_SCROLL;

      switch (e.key) {
        case " ":
          wrapper.scrollBy({ top: e.shiftKey ? -page : page, behavior: "smooth" });
          break;
        case "PageDown":
          wrapper.scrollBy({ top: page, behavior: "smooth" });
          break;
        case "PageUp":
          wrapper.scrollBy({ top: -page, behavior: "smooth" });
          break;
        case "ArrowDown":
          wrapper.scrollBy({ top: 40, behavior: "smooth" });
          break;
        case "ArrowUp":
          wrapper.scrollBy({ top: -40, behavior: "smooth" });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, []);

  return (
    <div className={cn(LAYOUT_ROOT, className)}>
      <div ref={scrollWrapperRef} className={cn(SCROLL_WRAPPER)}>
        <div className={cn(LAYOUT_CONTAINER, "flex flex-col")}>
          <header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.logoArea}>
              <Link
                to="/"
                className={styles.logo}
                aria-label="Woody - Início"
              >
                <span className={styles.logoText}>W</span>
              </Link>
            </div>

            <div className={styles.right}>
              <button
                type="button"
                className={cn(styles.iconBtn, styles.iconBtnHidden)}
                aria-label="Mensagens"
              >
                <MessageCircle className="size-5" />
              </button>
              <button
                type="button"
                className={cn(styles.iconBtn, styles.bellWrap)}
                aria-label="Notificações"
              >
                <Bell className="size-5" />
                <span className={styles.badge} aria-hidden />
              </button>
              <Link
                to={user ? `/profile/${user.id}` : "/auth/login"}
                className={styles.avatarBtn}
                aria-label={user ? "Ir para meu perfil" : "Entrar"}
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className={styles.avatarImg} />
                ) : (
                  <span className="flex size-8 items-center justify-center rounded-full bg-white/15 text-white">
                    <User className="size-[1.35rem]" aria-hidden />
                  </span>
                )}
              </Link>
            </div>
          </div>
          </header>

          <div
            className={cn(
              "grid w-full grid-cols-1 gap-x-0 md:gap-x-[var(--layout-gap-columns)] md:items-start",
              showRightPanel
                ? "md:grid-cols-[250px_minmax(0,1fr)_minmax(0,260px)] lg:grid-cols-[250px_minmax(0,1fr)_minmax(0,230px)]"
                : "md:grid-cols-[250px_minmax(0,1fr)]"
            )}
          >
            <Sidebar
              className="md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:self-start"
              onOpenSearch={() => setIsSearchOpen(true)}
              isSearchOpen={isSearchOpen}
            />
            <main className="min-w-0 flex flex-col pb-16 md:pb-0 pt-4 md:pt-5" aria-label="Feed principal">
              {children}
            </main>
            {showRightPanel ? (
              <RightPanel className="md:sticky md:top-16 md:max-h-[calc(100vh-4rem)] md:overflow-y-auto md:self-start" />
            ) : null}
          </div>
        </div>
      </div>

      <MobileBottomNav onOpenSearch={() => setIsSearchOpen(true)} isSearchOpen={isSearchOpen} />

      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </div>
  );
}
