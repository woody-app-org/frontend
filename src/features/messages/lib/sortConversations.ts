import type { ConversationResponseDto } from "../types";

function activityTs(c: ConversationResponseDto): number {
  const raw = c.lastMessageAt ?? c.updatedAt ?? c.createdAt;
  return new Date(raw).getTime();
}

/** Mais recente primeiro (última mensagem ou atualização da conversa). */
export function sortConversationsByActivity(a: ConversationResponseDto, b: ConversationResponseDto): number {
  return activityTs(b) - activityTs(a);
}
