import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { RightPanel } from "./RightPanel";
import { MobileBottomNav } from "./MobileBottomNav";
import { cn } from "@/lib/utils";
import { SearchModal } from "@/features/search/components/SearchModal";
import { CreatePostComposerProvider, useCreatePostComposer } from "../context/CreatePostComposerContext";
import { CreatePostModal } from "./CreatePostModal";
import { AppTopNav } from "./AppTopNav";

export interface FeedLayoutProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Coluna global à direita (Sugestões / Seguindo).
   * Desligar em páginas que já têm sidebar densa no miolo (ex.: detalhe de comunidade),
   * para não sobrepor conteúdo.
   */
  showRightPanel?: boolean;
  /**
   * Desktop: usa toda a largura da área de scroll (até `--layout-max-width`), em vez de `--feed-main-max`.
   * Útil para ecrãs densos como mensagens, com `showRightPanel={false}`.
   */
  wideMain?: boolean;
}

/** Desktop: área principal + painel direito (largura máx. alinhada ao protótipo). */
const MAIN_GRID =
  "w-full max-w-[var(--layout-max-width)] mx-auto px-[var(--layout-gutter)] grid grid-cols-1 gap-x-0 md:gap-x-[var(--layout-gap-columns)] md:items-start";

/**
 * Mobile: fluxo natural + scroll no documento (body).
 * Desktop (md+): coluna com topnav; scroll na área abaixo do header.
 */
const LAYOUT_ROOT =
  "min-h-screen w-full flex flex-col bg-[var(--woody-bg)] md:h-screen md:min-h-0 md:overflow-hidden";

const SCROLL_COLUMN = "flex min-w-0 flex-1 flex-col min-h-0 md:min-h-0 md:bg-[var(--woody-main-surface)]";

const SCROLL_WRAPPER =
  "w-full flex flex-col flex-1 min-h-0 md:flex-1 md:min-h-0 md:overflow-y-auto md:overflow-x-hidden";

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

function isInsideDialogLayer(node: EventTarget | null): boolean {
  if (!node || !(node instanceof Element)) return false;
  return Boolean(
    node.closest('[data-slot="dialog-content"]') || node.closest('[data-slot="dialog-overlay"]')
  );
}

function isMobileDirectMessageThread(pathname: string): boolean {
  return /^\/messages\/[^/]+$/.test(pathname);
}

function FeedLayoutShell({
  children,
  className,
  showRightPanel,
  wideMain = false,
  isSearchOpen,
  setIsSearchOpen,
}: FeedLayoutProps & {
  isSearchOpen: boolean;
  setIsSearchOpen: (v: boolean) => void;
}) {
  const stretchMainGrid = wideMain && !showRightPanel;
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const immersiveMobileDmChat = isMobileDirectMessageThread(location.pathname);
  const { openCreatePostModal, createPostOpen } = useCreatePostComposer();

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

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handleWheel = (e: WheelEvent) => {
      if (!mq.matches) return;
      if (isInsideDialogLayer(e.target)) return;
      const wrapper = scrollWrapperRef.current;
      if (!wrapper) return;
      const main = wrapper.querySelector("main");
      if (main?.contains(e.target as Node)) return;
      const rightPanel = wrapper.querySelector("[data-feed-right-panel]");
      if (rightPanel?.contains(e.target as Node)) return;
      e.preventDefault();
      wrapper.scrollBy({ top: e.deltaY, behavior: "auto" });
    };

    window.addEventListener("wheel", handleWheel, { capture: true, passive: false });
    return () => window.removeEventListener("wheel", handleWheel, { capture: true });
  }, []);

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
      <div
        className={cn(
          SCROLL_COLUMN,
          immersiveMobileDmChat && "max-md:flex max-md:min-h-[100dvh] max-md:flex-col"
        )}
      >
        <AppTopNav
          onOpenSearch={() => setIsSearchOpen(true)}
          isSearchOpen={isSearchOpen}
          onOpenCreatePost={openCreatePostModal}
          isCreatePostOpen={createPostOpen}
          hideOnMobile={immersiveMobileDmChat}
        />

        <div
          ref={scrollWrapperRef}
          data-feed-scroll-root
          className={cn(
            SCROLL_WRAPPER,
            immersiveMobileDmChat && "max-md:flex max-md:min-h-0 max-md:flex-1"
          )}
        >
          <div
            className={cn(
              MAIN_GRID,
              showRightPanel
                ? "md:grid-cols-[minmax(0,1fr)_minmax(var(--feed-right-min),var(--feed-right-max))]"
                : "md:grid-cols-1",
              stretchMainGrid && "md:flex-1 md:min-h-0 md:items-stretch",
              immersiveMobileDmChat && "max-md:min-h-0 max-md:flex-1"
            )}
          >
            <main
              className={cn(
                "min-w-0 flex w-full flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] pt-4 md:pb-10 md:pt-6",
                wideMain && !showRightPanel
                  ? "md:mx-0 md:h-full md:min-h-0 md:max-w-none md:justify-self-stretch"
                  : "md:mx-auto md:max-w-[var(--feed-main-max)] md:justify-self-center",
                immersiveMobileDmChat && "max-md:flex-1 max-md:min-h-0 max-md:pb-0 max-md:pt-0"
              )}
              aria-label="Feed principal"
            >
              {children}
            </main>
            {showRightPanel ? (
              <RightPanel className="hidden md:flex md:sticky md:top-[calc(var(--app-topnav-height)+0.75rem)] md:max-h-[calc(100dvh-var(--app-topnav-height)-1.25rem)] md:min-h-0 md:overflow-y-auto md:overscroll-y-contain md:self-start md:pt-6 md:justify-self-stretch" />
            ) : null}
          </div>
        </div>

        <MobileBottomNav
          className={immersiveMobileDmChat ? "max-md:hidden" : undefined}
          onOpenSearch={() => setIsSearchOpen(true)}
          isSearchOpen={isSearchOpen}
        />

        <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
        <CreatePostModal />
      </div>
    </div>
  );
}

export function FeedLayout({
  children,
  className,
  showRightPanel = true,
  wideMain = false,
}: FeedLayoutProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <CreatePostComposerProvider>
      <FeedLayoutShell
        className={className}
        showRightPanel={showRightPanel}
        wideMain={wideMain}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
      >
        {children}
      </FeedLayoutShell>
    </CreatePostComposerProvider>
  );
}
