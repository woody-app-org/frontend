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

export interface Post {
  id: string;
  communityId: string;
  author: User;
  title: string;
  content: string;
  imageUrl: string | null;
  /** Tags opcionais no nível do post (além do contexto da comunidade). */
  tags?: string[];
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  /** Preenchido ao montar dados para a UI; opcional em payloads “cru”. */
  community?: PostCommunityPreview;
}
