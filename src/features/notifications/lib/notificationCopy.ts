import type { NotificationItem } from "../services/notifications.service";
import { notificationNavigationContext } from "../services/notifications.service";

function stubItem(type: string, actorName: string): NotificationItem {
  return {
    id: "0",
    type,
    targetType: "none",
    metadata: {},
    createdAt: new Date(0).toISOString(),
    actor: { id: "0", displayName: actorName, username: "" },
  };
}

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

/** Rótulo curto + emoji para o tipo de sinal vindo da API (snake_case). */
function profileSignalSnippet(ctx: Record<string, unknown>): string | null {
  const api = str(ctx.profileSignalType);
  switch (api) {
    case "te_notei":
      return "Te notei 👀";
    case "olhadinha":
      return "Olhadinha 😉";
    case "conhecer_mais":
      return "Conhecer mais 🍷";
    case "quero_conversar":
      return "Quero conversar ✨";
    case "crush_fofo":
      return "Crush fofo 🐻";
    case "atracao":
      return "Atração 🔥";
    case "sinal_verde":
      return "Sinal verde ✅";
    case "cheguei":
      return "Cheguei 😏";
    default:
      return null;
  }
}

/**
 * Texto da linha principal (PT), alinhado ao tom da Woody.
 * Usa `metadata` / `payload` para enriquecer sinais (tipo).
 */
export function notificationSummaryFromItem(item: NotificationItem): string {
  const name = item.actor?.displayName?.trim() || "Alguém";
  const ctx = notificationNavigationContext(item);

  switch (item.type) {
    case "post_like":
      return `${name} gostou da tua publicação`;
    case "post_comment":
      return `${name} comentou no teu post`;
    case "comment_reply":
      return `${name} respondeu ao teu comentário`;
    case "new_follower":
      return `${name} começou a seguir-te`;
    case "profile_signal": {
      const bit = profileSignalSnippet(ctx);
      return bit ? `${name} enviou-te um sinal: ${bit}.` : `${name} enviou-te um sinal.`;
    }
    case "message_request":
      return `${name} pediu para conversar contigo`;
    case "community_request":
      return `${name} pediu para entrar numa comunidade que moderas`;
    case "community_request_approved":
      return name && name !== "Alguém"
        ? `${name} aceitou o teu pedido para entrares na comunidade`
        : "O teu pedido para entrar na comunidade foi aceite";
    default:
      return `${name} — nova atividade`;
  }
}

/** @deprecated usar `notificationSummaryFromItem` */
export function notificationSummary(type: string, actorName: string): string {
  return notificationSummaryFromItem(stubItem(type, actorName));
}
