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

export function FeedLayout({
  children,
  activeFilter,
  onFilterChange,
  className,
}: FeedLayoutProps) {
  const [activeNav, setActiveNav] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className={cn("min-h-screen flex flex-col bg-[var(--woody-bg)]", className)}>
      <header className="sticky top-0 z-50 w-full bg-[var(--woody-nav)] text-white shrink-0">
        <div className="flex items-center justify-between h-14 md:h-16 px-3 md:px-6 gap-3 md:gap-4">
          <Link to="/" className="flex items-center shrink-0 md:w-[250px] md:justify-start" aria-label="Woody - Início">
            <span className="text-2xl font-bold tracking-tight text-white select-none">
              W
            </span>
          </Link>

          <div className="hidden md:flex flex-1 justify-center items-center min-w-0 max-w-xl mx-2">
            <div className="relative w-full max-w-md flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/70 pointer-events-none" />
              <input
                type="search"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/60 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div className="hidden lg:flex items-center gap-2 ml-3 shrink-0">
              <button
                type="button"
                className="h-9 px-4 rounded-full text-sm font-medium bg-white text-[var(--woody-text)] hover:bg-white/90"
              >
                Tópicos
              </button>
              <button
                type="button"
                className="h-9 px-4 rounded-full text-sm font-medium bg-white text-[var(--woody-text)] hover:bg-white/90"
              >
                Pessoas
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 shrink-0 md:w-[320px] md:justify-end">
            <button
              type="button"
              className="p-2 rounded-full hover:bg-white/10 relative"
              aria-label="Notificações"
            >
              <Bell className="size-5" />
              <span className="absolute top-1 right-1 size-2 rounded-full bg-amber-400" />
            </button>
            <button
              type="button"
              className="hidden md:block p-2 rounded-full hover:bg-white/10"
              aria-label="Mensagens"
            >
              <MessageCircle className="size-5" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded-full hover:bg-white/10 overflow-hidden"
              aria-label="Perfil"
            >
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
                alt=""
                className="size-8 rounded-full object-cover"
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
