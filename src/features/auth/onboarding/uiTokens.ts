/** Estilos compartilhados das etapas (alinhados ao LoginForm / auth). */
export const onboardingStyles = {
  stepTitle: "text-xl md:text-2xl font-bold text-[var(--auth-text-on-maroon)]",
  stepLead: "text-sm text-[var(--auth-text-on-maroon)]/85 mt-2 mb-6",
  primaryBtn:
    "w-full sm:w-auto min-w-[140px] rounded-xl h-11 px-6 bg-[var(--auth-button)] text-white hover:bg-[var(--auth-button-hover)] focus-visible:ring-2 focus-visible:ring-[var(--auth-ornament)]/50 transition-[transform,colors] duration-200 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none font-medium",
  secondaryBtn:
    "w-full sm:w-auto min-w-[140px] rounded-xl h-11 px-6 border border-white/40 text-[var(--auth-text-on-maroon)] hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[var(--auth-ornament)]/50 transition-[transform,colors] duration-200 active:scale-[0.99] font-medium",
  footerRow: "mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between sm:items-center",
  placeholderBox:
    "rounded-xl border border-white/20 bg-[var(--auth-panel-beige)]/10 px-4 py-8 text-center text-sm text-[var(--auth-text-on-maroon)]/80",
} as const;
