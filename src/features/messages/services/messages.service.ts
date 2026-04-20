import { api, getApiErrorMessage } from "@/lib/api";
import type {
  ConversationMessagesPageDto,
  ConversationResponseDto,
  MessageResponseDto,
} from "../types";

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
  pageSize = 100
): Promise<ConversationMessagesPageDto> {
  try {
    const { data } = await api.get<ConversationMessagesPageDto>(
      `/conversations/${conversationId}/messages`,
      { params: { page, pageSize } }
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
