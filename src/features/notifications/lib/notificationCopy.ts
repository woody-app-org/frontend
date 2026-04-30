/**
 * Texto curto para lista de notificações (PT).
 * Tipos desconhecidos do backend aparecem como mensagem genérica.
 */
export function notificationSummary(type: string, actorName: string): string {
  const name = actorName || "Alguém";
  switch (type) {
    case "post_like":
      return `${name} gostou da tua publicação`;
    case "post_comment":
      return `${name} comentou a tua publicação`;
    case "comment_reply":
      return `${name} respondeu ao teu comentário`;
    case "new_follower":
      return `${name} começou a seguir-te`;
    case "profile_signal":
      return `${name} enviou-te um sinal`;
    case "message_request":
      return `${name} pediu para conversar contigo`;
    case "community_request":
      return `${name} pediu para entrar numa comunidade que moderas`;
    case "community_request_approved":
      return actorName
        ? `${actorName} aceitou o teu pedido para entrares na comunidade`
        : "O teu pedido para entrar na comunidade foi aceite";
    default:
      return `${name} — nova atividade`;
  }
}
