/** Estilos compartilhados das etapas (alinhados ao LoginForm / auth e às superfícies Woody). */
export const onboardingStyles = {
  stepTitle:
    "text-[1.35rem] leading-tight sm:text-2xl md:text-[1.65rem] font-bold text-[var(--auth-text-on-maroon)] tracking-tight",
  stepLead:
    "text-sm md:text-[0.95rem] text-[var(--auth-text-on-maroon)]/82 mt-0 leading-relaxed max-w-prose",
  trustNote:
    "text-xs md:text-[0.8125rem] text-[var(--auth-text-on-maroon)]/65 leading-relaxed max-w-prose border-l-2 border-[var(--auth-button)]/45 pl-3 py-0.5",
  primaryBtn:
    "w-full sm:w-auto min-h-11 min-w-[160px] rounded-xl h-11 px-6 bg-[var(--auth-button)] text-white hover:bg-[var(--auth-button-hover)] hover:shadow-md focus-visible:ring-2 focus-visible:ring-[var(--auth-ornament)]/50 transition-[transform,colors,box-shadow] duration-200 ease-out active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none font-medium shadow-sm",
  secondaryBtn:
    "w-full sm:w-auto min-h-11 min-w-[160px] rounded-xl h-11 px-6 border border-white/45 text-[var(--auth-text-on-maroon)] bg-white/5 hover:bg-white/12 hover:border-white/55 focus-visible:ring-2 focus-visible:ring-[var(--auth-ornament)]/50 transition-[transform,colors,background-color,border-color] duration-200 ease-out active:scale-[0.99] font-medium",
  ghostBtn:
    "text-sm font-medium text-[var(--auth-text-on-maroon)]/90 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--auth-ornament)]/40 rounded px-1 -mx-1 transition-opacity disabled:opacity-45",
  footerRow:
    "mt-8 pt-4 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between sm:items-center border-t border-white/10",
  sectionLabel:
    "text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--auth-text-on-maroon)]/50 mb-2.5",
  sectionCard:
    "rounded-2xl border border-white/10 bg-[var(--auth-panel-beige)]/[0.06] p-4 sm:p-5 space-y-4 sm:space-y-4 backdrop-blur-[2px] shadow-sm",
  interestGrid: "grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3",
  interestCard:
    "group relative flex gap-3 rounded-2xl border border-white/12 bg-[var(--auth-panel-beige)]/[0.05] p-3.5 sm:p-4 text-left transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out hover:border-white/22 hover:bg-[var(--auth-panel-beige)]/09 active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--auth-panel-maroon)]",
  interestCardSelected:
    "border-[var(--auth-button)]/75 bg-[var(--auth-button)]/14 shadow-[0_0_0_1px_rgba(95,133,123,0.28)]",
  interestIconWrap:
    "flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--auth-panel-beige)]/12 text-[var(--auth-text-on-maroon)] transition-[colors,transform] duration-200 group-hover:bg-[var(--auth-panel-beige)]/20 motion-safe:group-hover:scale-[1.03]",
  selectedBadge:
    "text-[11px] font-semibold text-[var(--auth-button)] tracking-wide",
  /** Instrução destacada (ex.: regras de seleção de interesses). */
  prominentInstruction:
    "text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--auth-text-on-maroon)]/85 mb-3 sm:mb-4 leading-relaxed",
  demoCallout:
    "rounded-xl border border-dashed border-white/18 bg-[var(--auth-panel-beige)]/[0.05] px-3 py-2.5 text-center text-[11px] sm:text-xs text-[var(--auth-text-on-maroon)]/72",
} as const;
