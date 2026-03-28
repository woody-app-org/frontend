/** Estilos compartilhados das etapas (alinhados ao LoginForm / auth). */
export const onboardingStyles = {
  stepTitle: "text-xl md:text-2xl font-bold text-[var(--auth-text-on-maroon)] tracking-tight",
  stepLead: "text-sm md:text-base text-[var(--auth-text-on-maroon)]/85 mt-2 mb-6 leading-relaxed",
  primaryBtn:
    "w-full sm:w-auto min-w-[160px] rounded-xl h-11 px-6 bg-[var(--auth-button)] text-white hover:bg-[var(--auth-button-hover)] focus-visible:ring-2 focus-visible:ring-[var(--auth-ornament)]/50 transition-[transform,colors,box-shadow] duration-200 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none font-medium shadow-sm",
  secondaryBtn:
    "w-full sm:w-auto min-w-[160px] rounded-xl h-11 px-6 border border-white/45 text-[var(--auth-text-on-maroon)] bg-white/5 hover:bg-white/12 focus-visible:ring-2 focus-visible:ring-[var(--auth-ornament)]/50 transition-[transform,colors,background-color] duration-200 active:scale-[0.99] font-medium",
  ghostBtn:
    "text-sm font-medium text-[var(--auth-text-on-maroon)]/90 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-[var(--auth-ornament)]/40 rounded transition-opacity disabled:opacity-45",
  footerRow: "mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between sm:items-center",
  sectionLabel:
    "text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--auth-text-on-maroon)]/55 mb-3",
  sectionCard:
    "rounded-2xl border border-white/12 bg-[var(--auth-panel-beige)]/[0.07] p-4 sm:p-5 space-y-4 backdrop-blur-[2px]",
  interestGrid: "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5",
  interestCard:
    "group relative flex gap-3 rounded-2xl border border-white/14 bg-[var(--auth-panel-beige)]/[0.06] p-3.5 sm:p-4 text-left transition-[transform,box-shadow,border-color,background-color] duration-200 hover:border-white/25 hover:bg-[var(--auth-panel-beige)]/10 active:scale-[0.99]",
  interestCardSelected:
    "border-[var(--auth-button)]/80 bg-[var(--auth-button)]/15 shadow-[0_0_0_1px_rgba(95,133,123,0.35)]",
  interestIconWrap:
    "flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--auth-panel-beige)]/15 text-[var(--auth-text-on-maroon)] transition-colors duration-200 group-hover:bg-[var(--auth-panel-beige)]/25",
  selectedBadge: "text-[11px] font-semibold text-[var(--auth-button)]",
} as const;
