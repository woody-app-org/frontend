export type SupportContactAction =
  | { kind: "disabled"; label: string }
  | { kind: "link"; href: string; label: string };

/**
 * Canal de suporte para revisão de banimento.
 * Sem rota nem e-mail oficial configurados nesta fase → botão desabilitado.
 */
export function getSupportContactAction(): SupportContactAction {
  const email = import.meta.env.VITE_SUPPORT_EMAIL?.trim();
  if (email) {
    return { kind: "link", href: `mailto:${email}`, label: "Falar com suporte" };
  }

  return { kind: "disabled", label: "Falar com suporte — Em breve" };
}
