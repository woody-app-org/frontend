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
  contentType: string | null;
  displayOrder: number;
  createdAt: string;
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

export interface DirectMessageInboxEventDto {
  kind: string;
  conversationId: number;
}
