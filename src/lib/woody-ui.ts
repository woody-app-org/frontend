import { cn } from "@/lib/utils";

/**
 * Tokens visuais compartilhados (Woody) — superfícies, foco, seções e ritmo de página.
 * Preferir importar daqui em vez de duplicar sombras/bordas em cada componente.
 */

export const woodySurface = {
  card: cn(
    "rounded-2xl border border-[var(--woody-divider)] bg-[var(--woody-card)]",
    "shadow-[0_1px_3px_rgba(10,10,10,0.05)]"
  ),
  /** Heróis / destaques com elevação um pouco maior */
  cardHero: cn(
    "rounded-2xl border border-[var(--woody-divider)] bg-[var(--woody-card)]",
    "shadow-[0_2px_10px_rgba(10,10,10,0.06)]"
  ),
  emptyDashed: cn(
    "rounded-2xl border border-dashed border-[var(--woody-divider)]",
    "bg-[var(--woody-card)]/95 shadow-[0_1px_3px_rgba(10,10,10,0.04)]"
  ),
} as const;

export const woodyMotion = {
  /** Cartões clicáveis (ex. CommunityCard). */
  cardHover: cn(
    "transition-[box-shadow,border-color] duration-200 ease-out",
    "hover:border-[var(--woody-divider)] hover:shadow-[0_6px_22px_rgba(10,10,10,0.06)]"
  ),
  /** Variação mais suave para listas densas (ex. PostCard). */
  postCardHover: "transition-shadow duration-200 ease-out hover:shadow-[0_4px_14px_rgba(10,10,10,0.05)]",
} as const;

export const woodyFocus = {
  ring: cn(
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/45",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--woody-main-surface)]"
  ),
  ringSidebar: cn(
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--woody-nav)]/35",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--woody-sidebar)]"
  ),
} as const;

export const woodySection = {
  headerRow: "mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4",
  eyebrow: "mb-1 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[var(--woody-nav)]/85",
  title: "text-lg font-bold tracking-tight text-[var(--woody-text)] sm:text-xl",
  subtitle: "mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--woody-muted)]",
} as const;

export const woodyLayout = {
  pagePad: "px-3 md:px-6 py-4 md:py-5",
  pagePadWide: "px-3 md:px-6 py-5 md:py-7",
  /** Espaço vertical entre blocos principais (home, hubs). */
  stackGap: "flex flex-col gap-9 md:gap-11",
  stackGapTight: "flex flex-col gap-8 md:gap-10",
} as const;

/** Indicador discreto para conteúdo fixado / em destaque (posts no perfil, comentários no post). */
export const woodyPinPill = cn(
  "inline-flex max-w-full shrink-0 items-center rounded-full border border-[var(--woody-lime)]/35",
  "bg-[var(--woody-tag-bg)] px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide",
  "text-[var(--woody-tag-text)] sm:text-[0.65rem]"
);

/** Diferenciação visual: perfil pessoal vs ações de comunidade (moderadora). */
export const woodyContext = {
  personalBadge: cn(
    "inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-[var(--woody-divider)]",
    "bg-[var(--woody-tag-bg)] px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--woody-text)]"
  ),
  adminBadge: cn(
    "inline-flex w-fit max-w-full items-center gap-1.5 rounded-full border border-[var(--woody-lime)]/45",
    "bg-[var(--woody-tag-bg)] px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-[var(--woody-tag-text)]"
  ),
} as const;

/** Scroll e altura em modais longos (mobile / teclado); combinar com `DialogContent` existente. */
export const woodyDialogScroll = cn(
  "max-h-[min(88dvh,840px)] overflow-y-auto overflow-x-hidden overscroll-y-contain",
  "pb-[max(0.5rem,env(safe-area-inset-bottom))]"
);
