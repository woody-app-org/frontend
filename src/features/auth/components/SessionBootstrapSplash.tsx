/**
 * Ecrã mínimo enquanto o JWT é validado com `/users/me` — evita flash de avatar/dados em cache.
 */
export function SessionBootstrapSplash() {
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[var(--woody-bg)] px-6"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-lg font-semibold tracking-tight text-[var(--woody-text)]">Woody</div>
      <p className="text-sm text-[var(--woody-muted)]">A verificar sessão…</p>
    </main>
  );
}
