import React, { useEffect, useMemo, useState } from "react";
import { Rss, Flame, User, Users, Search, Bookmark, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedFilter } from "../types";

type SectionKey = "feed" | "comunidades" | "explorar" | "salvos";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  filter?: FeedFilter;
}

const FEED_SUBITEMS: SidebarItem[] = [
  { id: "trending", label: "Em alta", icon: <Flame className="size-4" />, filter: "trending" },
  { id: "forYou", label: "Para você", icon: <User className="size-4" />, filter: "forYou" },
  { id: "following", label: "Seguindo", icon: <Users className="size-4" />, filter: "following" },
];

const GAP_SECTION = "gap-4";
const GAP_ITEMS = "gap-1";

export interface SidebarProps {
  activeFilter: FeedFilter;
  activeNav?: string; // para páginas fora do feed, ex: "comunidades"
  onFilterChange?: (filter: FeedFilter) => void;
  onNavChange?: (id: string) => void; // "comunidades" | "explorar" | "salvos"
  className?: string;
}

function NavButton({
  isActive,
  onClick,
  children,
  className,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left text-sm transition-colors",
        isActive
          ? "bg-[var(--woody-sidebar-active)] text-[var(--woody-sidebar-active-text,white)] font-semibold"
          : "text-[var(--woody-sidebar-text-inactive)] font-medium hover:bg-white/10",
        className
      )}
    >
      {children}
    </button>
  );
}

export function Sidebar({
  activeFilter,
  activeNav,
  onFilterChange,
  onNavChange,
  className,
}: SidebarProps) {
  // Determina qual seção deve estar aberta inicialmente com base no estado atual
  const initialOpen: SectionKey = useMemo(() => {
    if (["trending", "forYou", "following"].includes(activeFilter)) return "feed";
    if (activeNav === "comunidades") return "comunidades";
    if (activeNav === "explorar") return "explorar";
    if (activeNav === "salvos") return "salvos";
    return "feed";
  }, [activeFilter, activeNav]);

  const [openSection, setOpenSection] = useState<SectionKey>(initialOpen);

  // Mantém o accordion sincronizado quando rota/estado externo mudar
  useEffect(() => {
    setOpenSection(initialOpen);
  }, [initialOpen]);

  const feedActiveId = ["trending", "forYou", "following"].includes(activeFilter) ? activeFilter : null;

  const sectionButtonBase =
    "flex items-center justify-between w-full px-3 py-2 rounded-md transition-colors";

  const SectionHeader = ({
    icon,
    label,
    sectionKey,
    isActive,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    sectionKey: SectionKey;
    isActive: boolean;
    onClick: () => void;
  }) => {
    const isOpen = openSection === sectionKey;

    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          sectionButtonBase,
          isActive ? "text-[var(--woody-sidebar-text)]" : "text-[var(--woody-sidebar-text)]/90",
          "hover:bg-white/10"
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className="shrink-0 text-[var(--woody-sidebar-text)]">{icon}</span>
          <span className="font-semibold text-sm">{label}</span>
        </div>

        <ChevronDown
          className={cn(
            "size-4 text-[var(--woody-sidebar-text)] transition-transform",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </button>
    );
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-[260px] shrink-0 bg-[var(--woody-sidebar)]",
        "shadow-[6px_0_18px_rgba(0,0,0,0.12)]", // sombra mais visível (a sua estava fraca)
        className
      )}
    >
      <div className={cn("flex flex-col flex-1 min-h-0 py-4 px-3", GAP_SECTION)}>
        {/* SEÇÃO FEED */}
        <section className={cn("flex flex-col", GAP_ITEMS)}>
          <SectionHeader
            icon={<Rss className="size-5" />}
            label="Feed"
            sectionKey="feed"
            isActive={openSection === "feed"}
            onClick={() => setOpenSection("feed")}
          />

          {openSection === "feed" && (
            <div className="mt-1 flex flex-col gap-1 pl-1">
              {FEED_SUBITEMS.map((item) => {
                const isActive = feedActiveId === item.filter;
                return (
                  <NavButton
                    key={item.id}
                    isActive={isActive}
                    onClick={() => item.filter && onFilterChange?.(item.filter)}
                  >
                    <span className="shrink-0 [&>svg]:size-4">{item.icon}</span>
                    {item.label}
                  </NavButton>
                );
              })}
            </div>
          )}
        </section>

        {/* DIVISÓRIA */}
        <div className="border-t border-white/10" />

        {/* SEÇÃO COMUNIDADES */}
        <section className={cn("flex flex-col", GAP_ITEMS)}>
          <SectionHeader
            icon={<Users className="size-5" />}
            label="Comunidades"
            sectionKey="comunidades"
            isActive={openSection === "comunidades"}
            onClick={() => {
              setOpenSection("comunidades");
              onNavChange?.("comunidades");
            }}
          />

          {openSection === "comunidades" && (
            <div className="mt-1 flex flex-col gap-1 pl-1">
              <NavButton
                isActive={activeNav === "comunidades"}
                onClick={() => onNavChange?.("comunidades")}
              >
                <span className="shrink-0 [&>svg]:size-4">
                  <Users className="size-4" />
                </span>
                Ver comunidades
              </NavButton>
            </div>
          )}
        </section>

        {/* SEÇÃO EXPLORAR */}
        <section className={cn("flex flex-col", GAP_ITEMS)}>
          <SectionHeader
            icon={<Search className="size-5" />}
            label="Explorar"
            sectionKey="explorar"
            isActive={openSection === "explorar"}
            onClick={() => {
              setOpenSection("explorar");
              onNavChange?.("explorar");
            }}
          />

          {openSection === "explorar" && (
            <div className="mt-1 flex flex-col gap-1 pl-1">
              <NavButton isActive={activeNav === "explorar"} onClick={() => onNavChange?.("explorar")}>
                <span className="shrink-0 [&>svg]:size-4">
                  <Search className="size-4" />
                </span>
                Buscar
              </NavButton>
            </div>
          )}
        </section>

        {/* SEÇÃO SALVOS */}
        <section className={cn("flex flex-col", GAP_ITEMS)}>
          <SectionHeader
            icon={<Bookmark className="size-5" />}
            label="Salvos"
            sectionKey="salvos"
            isActive={openSection === "salvos"}
            onClick={() => {
              setOpenSection("salvos");
              onNavChange?.("salvos");
            }}
          />

          {openSection === "salvos" && (
            <div className="mt-1 flex flex-col gap-1 pl-1">
              <NavButton isActive={activeNav === "salvos"} onClick={() => onNavChange?.("salvos")}>
                <span className="shrink-0 [&>svg]:size-4">
                  <Bookmark className="size-4" />
                </span>
                Meus salvos
              </NavButton>
            </div>
          )}
        </section>
      </div>

      {/* Rodapé (gato) */}
      <div className="p-4 flex justify-center opacity-80 shrink-0">
        {/* mantém seu svg como está */}
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