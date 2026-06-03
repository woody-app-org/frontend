export type SupportContactAction =
  | { kind: "route"; href: string; label: string }
  | { kind: "link"; href: string; label: string };

const BAN_APPEAL_PATH = "/support/ban-appeal";

/**
 * Canal de revisão de banimento no login.
 * Prioriza rota interna de apelo; mailto só como fallback opcional via env.
 */
export function getSupportContactAction(): SupportContactAction {
  return {
    kind: "route",
    href: BAN_APPEAL_PATH,
    label: "Solicitar revisão",
  };
}
