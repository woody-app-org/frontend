import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, MessageCircle } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";
import { MobileBottomNav } from "./MobileBottomNav";
import { cn } from "@/lib/utils";
import type { FeedFilter } from "../types";

export interface FeedLayoutProps {
  children: React.ReactNode;
  activeFilter: FeedFilter;
  onFilterChange: (filter: FeedFilter) => void;
  className?: string;
}

// --- Estilos do header (evitar classes gigantes no JSX) ---

const styles = {
  header:
    "sticky top-0 z-50 w-full bg-[var(--woody-header)] text-white shrink-0",
  headerInner:
    "flex items-center justify-between h-14 md:h-16 px-3 md:px-6 gap-3 md:gap-4",
  logo: "flex items-center shrink-0 md:w-[250px] md:justify-start",
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

export function FeedLayout({
  children,
  activeFilter,
  onFilterChange,
  className,
}: FeedLayoutProps) {
  const [activeNav, setActiveNav] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("people");

  return (
    <div className={cn("min-h-screen flex flex-col bg-[var(--woody-bg)]", className)}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link
            to="/"
            className={styles.logo}
            aria-label="Woody - Início"
          >
            <span className={styles.logoText}>W</span>
          </Link>

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
            <button
              type="button"
              className={styles.avatarBtn}
              aria-label="Perfil"
            >
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
                alt=""
                className={styles.avatarImg}
              />
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr_320px] flex-1 min-h-0 w-full">
        <Sidebar
          activeFilter={activeFilter}
          activeNav={activeNav}
          onFilterChange={onFilterChange}
          onNavChange={setActiveNav}
        />
        <main className="min-w-0 flex flex-col pb-16 md:pb-0">
          {children}
        </main>
        <RightPanel />
      </div>

      <MobileBottomNav />
    </div>
  );
}
