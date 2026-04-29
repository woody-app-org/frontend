/** Evento disparado quando o estado dos sinais recebidos muda (para atualizar badge/indicadores). */
export const PROFILE_SIGNALS_CHANGED = "woody:profile-signals-changed";

export function dispatchProfileSignalsChanged(): void {
  window.dispatchEvent(new CustomEvent(PROFILE_SIGNALS_CHANGED));
}

export function subscribeProfileSignalsChanged(listener: () => void): () => void {
  window.addEventListener(PROFILE_SIGNALS_CHANGED, listener);
  return () => window.removeEventListener(PROFILE_SIGNALS_CHANGED, listener);
}
