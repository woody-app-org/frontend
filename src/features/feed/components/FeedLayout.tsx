import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, MessageCircle } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";
import { MobileBottomNav } from "./MobileBottomNav";
import { cn } from "@/lib/utils";

export interface FeedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

// --- Estilos do header (evitar classes gigantes no JSX) ---

/** Container principal: max-width e gutter (src/index.css). Em desktop não limita altura para o scroll wrapper definir. */
const LAYOUT_CONTAINER =
  "w-full max-w-[var(--layout-max-width)] mx-auto px-[var(--layout-gutter)]";

/** Raiz: altura fixa ao viewport em desktop. */
const LAYOUT_ROOT = "min-h-screen md:h-screen md:overflow-hidden flex flex-col bg-[var(--woody-bg)]";

/** Único scroll da página; em desktop scrollbar fica na lateral direita da viewport. */
const SCROLL_WRAPPER = "flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden md:h-screen";

const styles = {
  header:
    "sticky top-0 z-50 w-full bg-[var(--woody-header)] text-white shrink-0",
  headerInner:
    "flex items-center justify-between h-14 md:h-16 gap-3 md:gap-4",
  logoArea:
    "flex items-center shrink-0 h-full min-h-14 md:min-h-16 md:w-[260px] md:bg-[var(--woody-header-logo)]",
  logo: "flex items-center shrink-0 md:justify-start",
  logoText: "text-2xl font-bold tracking-tight text-white select-none",
  center: "hidden md:flex flex-1 justify-center items-center min-w-0 max-w-2xl mx-2",
  searchWrap: "relative flex-1 min-w-0 max-w-xl flex items-center",
  searchInput:
    "w-full h-9 md:h-10 pl-9 pr-4 rounded-full bg-white/10 border border-white/15 text-white placeholder:text-white/55 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25 transition-shadow",
  searchIcon: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/70 pointer-events-none",
  segmentWrap:
    "hidden lg:flex shrink-0 rounded-full bg-white/10 border border-white/15 p-1 ml-3",
  segmentBtn: "rounded-full px-4 h-8 text-sm font-medium transition-colors",
  segmentBtnActive: "bg-white text-[var(--woody-header)]",
  segmentBtnInactive: "text-white/80 hover:bg-white/10",
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

type SearchMode = "topics" | "people";

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

export function FeedLayout({ children, className }: FeedLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("people");
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  // Trava scroll do body; apenas o wrapper (scrollbar na lateral direita) role.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Redireciona wheel para o scroll wrapper quando o cursor está sobre sidebar/header/painel (não sobre o feed).
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
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

  // Teclas de navegação (Space, PageDown, etc.) rolam o wrapper quando o foco não está em campo editável.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isScrollKey(e.key)) return;
      if (isEditableElement(document.activeElement)) return;

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

            <div className={styles.center}>
              <div className={styles.searchWrap}>
                <Search className={styles.searchIcon} />
                <input
                  type="search"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <div className={styles.segmentWrap}>
                <button
                  type="button"
                  className={cn(
                    styles.segmentBtn,
                    searchMode === "topics" ? styles.segmentBtnActive : styles.segmentBtnInactive
                  )}
                  onClick={() => setSearchMode("topics")}
                >
                  Tópicos
                </button>
                <button
                  type="button"
                  className={cn(
                    styles.segmentBtn,
                    searchMode === "people" ? styles.segmentBtnActive : styles.segmentBtnInactive
                  )}
                  onClick={() => setSearchMode("people")}
                >
                  Pessoas
                </button>
              </div>
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
                to="/profile/1"
                className={styles.avatarBtn}
                aria-label="Ir para meu perfil"
              >
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
                  alt=""
                  className={styles.avatarImg}
                />
              </Link>
            </div>
          </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-[250px_1fr_260px] lg:grid-cols-[250px_1fr_230px] w-full gap-x-0 md:gap-x-[var(--layout-gap-columns)] md:items-start">
            <Sidebar className="md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:self-start" />
            <main className="min-w-0 flex flex-col pb-16 md:pb-0 pt-4 md:pt-5" aria-label="Feed principal">
              {children}
            </main>
            <RightPanel className="md:sticky md:top-16 md:max-h-[calc(100vh-4rem)] md:overflow-y-auto md:self-start" />
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
}
