import { api, getApiErrorMessage } from "@/lib/api";
import { DM_MESSAGES_MAX_PAGE_SIZE } from "../lib/dmLimits";
import type {
  ConversationMessagesPageDto,
  ConversationResponseDto,
  MessageResponseDto,
} from "../types";

export async function startOrGetConversation(otherUserId: number): Promise<ConversationResponseDto> {
  try {
    const { data } = await api.post<ConversationResponseDto>("/conversations", { otherUserId });
    return data;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível iniciar a conversa."));
  }
}

export async function fetchMyConversations(): Promise<ConversationResponseDto[]> {
  try {
    const { data } = await api.get<ConversationResponseDto[]>("/conversations");
    return Array.isArray(data) ? data : [];
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível carregar as conversas."));
  }
}

export async function fetchPendingReceived(): Promise<ConversationResponseDto[]> {
  try {
    const { data } = await api.get<ConversationResponseDto[]>("/conversations/pending-received");
    return Array.isArray(data) ? data : [];
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível carregar os pedidos."));
  }
}

export async function fetchConversationMessages(
  conversationId: number,
  page = 1,
  pageSize = DM_MESSAGES_MAX_PAGE_SIZE
): Promise<ConversationMessagesPageDto> {
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const safeSize = Number.isFinite(pageSize)
    ? Math.min(DM_MESSAGES_MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize)))
    : DM_MESSAGES_MAX_PAGE_SIZE;
  try {
    const { data } = await api.get<ConversationMessagesPageDto>(
      `/conversations/${conversationId}/messages`,
      { params: { page: safePage, pageSize: safeSize } }
    );
    return data;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível carregar as mensagens."));
  }
}

export async function sendConversationMessage(
  conversationId: number,
  body: { body?: string | null; attachmentUrls?: string[] | null }
): Promise<MessageResponseDto> {
  try {
    const { data } = await api.post<MessageResponseDto>(`/conversations/${conversationId}/messages`, body);
    return data;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível enviar a mensagem."));
  }
}

export async function editConversationMessage(
  conversationId: number,
  messageId: number,
  body: string
): Promise<MessageResponseDto> {
  try {
    const { data } = await api.patch<MessageResponseDto>(
      `/conversations/${conversationId}/messages/${messageId}`,
      { body }
    );
    return data;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível editar a mensagem."));
  }
}

export async function deleteConversationMessage(conversationId: number, messageId: number): Promise<void> {
  try {
    await api.delete(`/conversations/${conversationId}/messages/${messageId}`);
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível apagar a mensagem."));
  }
}

export async function acceptConversationRequest(conversationId: number): Promise<void> {
  try {
    await api.post(`/conversations/${conversationId}/accept`);
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível aceitar o pedido."));
  }
}

export async function rejectConversationRequest(conversationId: number): Promise<void> {
  try {
    await api.post(`/conversations/${conversationId}/reject`);
  } catch (e) {
    throw new Error(getApiErrorMessage(e, "Não foi possível recusar o pedido."));
  }
}
