/** Alinhado aos DTOs da API Woody (mensagens diretas). */

export interface ConversationPeerPreviewDto {
  id: number;
  username: string;
  displayName: string | null;
  profilePic: string | null;
}

export interface ConversationResponseDto {
  id: number;
  status: "pending" | "accepted" | "rejected";
  userLowId: number;
  userHighId: number;
  initiatorUserId: number | null;
  createdAt: string;
  updatedAt: string | null;
  respondedAt: string | null;
  otherUser: ConversationPeerPreviewDto;
  lastMessagePreview?: string | null;
  lastMessageAt?: string | null;
}

export interface ConversationRealtimeDto {
  id: number;
  status: "pending" | "accepted" | "rejected";
  userLowId: number;
  userHighId: number;
  initiatorUserId: number | null;
  createdAt: string;
  updatedAt: string | null;
  respondedAt: string | null;
}

export interface MessageAuthorResponseDto {
  id: number;
  username: string;
  displayName: string | null;
  profilePic: string | null;
}

export interface MessageAttachmentResponseDto {
  id: number;
  url: string;
  /** `image` | `video` | `gif` | `sticker` — omissão trata-se como imagem (legado). */
  mediaType?: string;
  contentType: string | null;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  provider?: string | null;
  externalId?: string | null;
  /** Chave de armazenamento Woody quando existir. */
  storageKey?: string | null;
  displayOrder: number;
  createdAt: string;
}

/** Item do picker (resposta do endpoint de pesquisa plugável). */
export interface StickerGifSearchItemDto {
  title: string;
  url: string;
  thumbnailUrl: string | null;
  mediaType: string;
  provider: string;
  externalId: string;
}

export interface StickerGifSearchResponseDto {
  items: StickerGifSearchItemDto[];
  providerKey: string;
}

/** Anexo na mensagem a enviar (alinhado a <c>MessageAttachmentItemRequestDto</c>). */
export interface OutgoingMessageAttachment {
  url: string;
  mediaType: string;
  durationSeconds?: number;
  thumbnailUrl?: string | null;
  provider?: string | null;
  externalId?: string | null;
  storageKey?: string;
  mimeType?: string;
  fileSize?: number;
}

export interface MessageResponseDto {
  id: number;
  conversationId: number;
  sender: MessageAuthorResponseDto;
  body: string | null;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  attachments: MessageAttachmentResponseDto[];
}

export interface ConversationMessagesPageDto {
  items: MessageResponseDto[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Evento leve da inbox via SignalR (`inboxChanged`).
 * `kind`: `"message"` | `"conversation"` — novos valores podem surgir com evoluções (ex.: leitura, arquivo).
 */
export interface DirectMessageInboxEventDto {
  kind: string;
  conversationId: number;
}
