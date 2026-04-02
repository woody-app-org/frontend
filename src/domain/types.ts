/** Domínio compartilhado (comunidades, posts, usuárias) — preparado para troca por API. */

export type CommunityCategory = "bemestar" | "carreira" | "cultura" | "seguranca" | "outro";

/** Quem pode ver entradas públicas vs aprovação para participar. */
export type CommunityVisibility = "public" | "private";

/** Papéis dentro da comunidade (criadora = owner). */
export type CommunityMemberRole = "owner" | "admin" | "member";

/**
 * Estado da filiação à comunidade (linha `membership` no backend).
 * Pedidos feitos pela usuária podem existir só em `JoinRequest`; aqui cobrimos ambos os fluxos.
 */
export type MembershipStatus = "active" | "pending" | "rejected" | "banned";

/** @deprecated Use `CommunityMemberRole`. Mantido para imports legados. */
export type MembershipRole = CommunityMemberRole;

/** Usuária na plataforma (perfil / autoria de posts). */
export interface User {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio?: string;
  pronouns?: string;
}

export interface Community {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: CommunityCategory;
  tags: string[];
  /** Texto multilinha exibido como regras do espaço (futuro: markdown ou blocos). */
  rules: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  /** Dona da comunidade (criadora); alinhado a `owner` na membership dessa usuária. */
  ownerUserId: string;
  visibility: CommunityVisibility;
  /** Valor denormalizado para UI; em produção pode vir calculado da API. */
  memberCount: number;
}

export interface Membership {
  id: string;
  userId: string;
  communityId: string;
  role: CommunityMemberRole;
  status: MembershipStatus;
  joinedAt?: string;
}

/** Participante ativa com papel resolvido (lista “quem participa”, futuros DTOs da API). */
export interface CommunityMemberListItem {
  user: User;
  role: CommunityMemberRole;
}

/** Status de pedido de entrada (fila moderada por owner/admin). */
export type JoinRequestStatus = "pending" | "approved" | "rejected";

export interface JoinRequest {
  id: string;
  communityId: string;
  userId: string;
  status: JoinRequestStatus;
  requestedAt?: string;
}

/** Resumo da comunidade embutido no post para exibição (ex.: feed, busca). */
export interface PostCommunityPreview {
  id: string;
  slug: string;
  name: string;
  avatarUrl: string | null;
  category: CommunityCategory;
}

/**
 * Comentário no thread de um post (forma enriquecida para UI).
 * Payload de API típico: ids + texto + timestamps; `author` costuma vir expandido ou via join.
 */
export interface Comment {
  id: string;
  postId: string;
  /** Comentário raiz: `null`. Resposta: id do comentário pai. */
  parentCommentId: string | null;
  authorId: string;
  author: User;
  /** Corpo do comentário (nome alinhado a DTOs típicos `content`). */
  content: string;
  /** ISO 8601 recomendado para integração com backend. */
  createdAt: string;
}

/**
 * Fatia de engajamento do post para a usuária atual (útil em hooks e otimistic UI).
 * Mantém paralelo aos campos homônimos em `Post`.
 */
export interface PostInteractionState {
  likesCount: number;
  commentsCount: number;
  likedByCurrentUser: boolean;
}

export interface Post {
  id: string;
  communityId: string;
  /** Alinhado ao autor expandido; em DTOs crus costuma vir só `authorId`. */
  authorId: string;
  author: User;
  title: string;
  content: string;
  imageUrl: string | null;
  /** Tags opcionais no nível do post (além do contexto da comunidade). */
  tags?: string[];
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  /**
   * Se a usuária atual curtiu o post (requer contexto de `viewerId`).
   * Mock: vindo de `postInteractionMockStore`; produção: campo da API ou derivado.
   */
  likedByCurrentUser: boolean;
  /** Preenchido ao montar dados para a UI; opcional em payloads “cru”. */
  community?: PostCommunityPreview;
}
