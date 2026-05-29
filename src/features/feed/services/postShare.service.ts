import { api, getApiErrorMessage } from "@/lib/api";
import type { MessageResponseDto } from "@/features/messages/types";

export interface SharePostToConversationRequest {
  recipientUserId?: number;
  conversationId?: number;
  message?: string;
}

export interface SharePostToConversationResponse {
  conversationId: number;
  message: MessageResponseDto;
}

const GENERIC_SHARE_ERROR = "Não foi possível compartilhar esta publicação.";

export async function sharePostToConversation(
  postId: string,
  body: SharePostToConversationRequest
): Promise<SharePostToConversationResponse> {
  try {
    const { data } = await api.post<SharePostToConversationResponse>(
      `/posts/${encodeURIComponent(postId)}/share-to-conversation`,
      body
    );
    return data;
  } catch (e) {
    throw new Error(getApiErrorMessage(e, GENERIC_SHARE_ERROR));
  }
}
