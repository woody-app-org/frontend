import React, { useEffect, useMemo, useState } from "react";
import { Rss, Flame, User, Users, Search, Bookmark } from "lucide-react";
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
  activeNav?: string; // "comunidades" | "explorar" | "salvos"
  onFilterChange?: (filter: FeedFilter) => void;
  onNavChange?: (id: string) => void;
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
        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors",
        isActive
          ? "bg-[var(--woody-item-active)] text-white font-semibold"
          : "text-[var(--woody-sidebar-text-inactive)] font-medium hover:bg-[var(--woody-item-hover)]",
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
  const initialOpen: SectionKey | null = useMemo(() => {
    if (["trending", "forYou", "following"].includes(activeFilter)) return "feed";
    if (activeNav === "comunidades") return "comunidades";
    if (activeNav === "explorar") return "explorar";
    if (activeNav === "salvos") return "salvos";
    return null;
  }, [activeFilter, activeNav]);

  const [openSection, setOpenSection] = useState<SectionKey | null>(initialOpen);

  useEffect(() => {
    setOpenSection(initialOpen);
  }, [initialOpen]);

  const feedActiveId = ["trending", "forYou", "following"].includes(activeFilter) ? activeFilter : null;

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
          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors cursor-pointer",
          isActive ? "bg-[var(--woody-section-active)] text-white" : "text-[var(--woody-sidebar-text)]",
          !isActive && "hover:bg-[var(--woody-section-hover)]",
          isOpen && !isActive && "bg-white/5"
        )}
      >
        <span className="shrink-0 text-current">{icon}</span>
        <span className="font-semibold text-sm">{label}</span>
      </button>
    );
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-[260px] shrink-0 bg-[var(--woody-sidebar)]",
        "shadow-[6px_0_18px_rgba(0,0,0,0.12)]",
        className
      )}
    >
      <div className={cn("flex flex-col flex-1 min-h-0 py-4 px-3", GAP_SECTION)}>
        {/* FEED */}
        <section className={cn("flex flex-col", GAP_ITEMS)}>
          <SectionHeader
            icon={<Rss className="size-5" />}
            label="Feed"
            sectionKey="feed"
            isActive={openSection === "feed"}
            onClick={() => setOpenSection((prev) => (prev === "feed" ? null : "feed"))}
          />

          {openSection === "feed" && (
            <div className="mt-2 flex flex-col gap-1 pl-6">
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

        <div className="my-2 border-t border-[var(--woody-divider)]" />

        {/* COMUNIDADES */}
        <section className={cn("flex flex-col", GAP_ITEMS)}>
          <SectionHeader
            icon={<Users className="size-5" />}
            label="Comunidades"
            sectionKey="comunidades"
            isActive={openSection === "comunidades"}
            onClick={() => setOpenSection((prev) => (prev === "comunidades" ? null : "comunidades"))}
          />

          {openSection === "comunidades" && (
            <div className="mt-2 flex flex-col gap-1 pl-6">
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

        {/* EXPLORAR */}
        <section className={cn("flex flex-col", GAP_ITEMS)}>
          <SectionHeader
            icon={<Search className="size-5" />}
            label="Explorar"
            sectionKey="explorar"
            isActive={openSection === "explorar"}
            onClick={() => setOpenSection((prev) => (prev === "explorar" ? null : "explorar"))}
          />

          {openSection === "explorar" && (
            <div className="mt-2 flex flex-col gap-1 pl-6">
              <NavButton isActive={activeNav === "explorar"} onClick={() => onNavChange?.("explorar")}>
                <span className="shrink-0 [&>svg]:size-4">
                  <Search className="size-4" />
                </span>
                Buscar
              </NavButton>
            </div>
          )}
        </section>

        {/* SALVOS */}
        <section className={cn("flex flex-col", GAP_ITEMS)}>
          <SectionHeader
            icon={<Bookmark className="size-5" />}
            label="Salvos"
            sectionKey="salvos"
            isActive={openSection === "salvos"}
            onClick={() => setOpenSection((prev) => (prev === "salvos" ? null : "salvos"))}
          />

          {openSection === "salvos" && (
            <div className="mt-2 flex flex-col gap-1 pl-6">
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

      {/* Rodapé (gato) - mantém como estava */}
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