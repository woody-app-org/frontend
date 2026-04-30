import type { PostMediaAttachment } from "./mediaAttachment";

/** Domínio compartilhado (comunidades, posts, usuárias) — preparado para troca por API. */

export type CommunityCategory = "bemestar" | "carreira" | "cultura" | "seguranca" | "outro";

/** Quem pode ver entradas públicas vs aprovação para participar. */
export type CommunityVisibility = "public" | "private";

/** Plano de comunidade no catálogo / efetivo após regras de período (API `billing.*`). */
export type CommunityBillingPlan = "free" | "premium";

/**
 * Estado de cobrança **desta comunidade** (Stripe / `billing.*` na API).
 * Independente do papel da utilizadora na membership e do plano Woody Pro pessoal.
 */
export interface CommunityBillingState {
  billingPlan: CommunityBillingPlan;
  effectivePlan: CommunityBillingPlan;
  status: string;
  planCode?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
}

/**
 * Capacidades premium **ao nível do espaço** para a utilizadora actual (API `members/me` ou payload da comunidade).
 * `isStaffForPremiumTools` = papel; `communityPremiumActive` = plano do espaço; `can*` = ambos.
 * Não reflecte assinatura Woody Pro da utilizadora.
 */
export interface CommunityPremiumCapabilities {
  /** Owner ou admin com filiação activa nesta comunidade. */
  isStaffForPremiumTools: boolean;
  /** Benefícios premium do espaço activos (subscrição da comunidade). */
  communityPremiumActive: boolean;
  /** Staff + espaço premium (painel / métricas). */
  canAccessCommunityAnalytics: boolean;
  /** Staff + espaço premium (impulsionamento). */
  canBoostCommunityPosts: boolean;
}

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
  /** Benefício Pro visível em posts/comentários (API `showProBadge`). */
  showProBadge?: boolean;
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
  /** Plano/assinatura da comunidade quando a API expande `billing`. */
  billing?: CommunityBillingState;
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
  /** Plano efetivo da comunidade (`free` | `premium`) para gates no feed. */
  communityPlan?: CommunityBillingPlan;
}

/** Onde o post foi publicado (alinhado à API: `publicationContext`). */
export type PostPublicationContext = "profile" | "community";

/**
 * Quando a autora do post oculta um comentário de terceiros, outras leitoras veem máscara;
 * autora do post e autora do comentário continuam vendo o texto (regra típica de moderação leve).
 */
export type CommentContentModerationMask = "hidden_by_post_author";

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
  /** Soft-delete: comentário some do thread após exclusão pela autora. */
  deletedAt?: string | null;
  /** Autora do post ocultou este comentário de terceiras (ISO 8601). */
  hiddenByPostAuthorAt?: string | null;
  /** Destaque no post (autora do post); ISO da API ou formatado pelo mapper. */
  pinnedOnPostAt?: string | null;
  /**
   * Preenchido em `enrichComment` quando há `viewerId` + contexto do post.
   * UI usa `getCommentContentForViewer` para texto seguro a exibir.
   */
  contentModerationMask?: CommentContentModerationMask | null;
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
  publicationContext: PostPublicationContext;
  /** Comunidade quando o post é de comunidade; `null` no perfil. */
  communityId: string | null;
  /** Alinhado ao autor expandido; em DTOs crus costuma vir só `authorId`. */
  authorId: string;
  author: User;
  title: string;
  content: string;
  imageUrl: string | null;
  /** Galeria quando a API devolve várias URLs (ex.: `post_images`). */
  imageUrls?: string[];
  /** Anexos tipados (imagem, vídeo, GIF, sticker) quando a API devolve `mediaAttachments`. */
  mediaAttachments?: PostMediaAttachment[];
  /** Tags opcionais no nível do post (além do contexto da comunidade). */
  tags?: string[];
  createdAt: string;
  /** Preenchido após edição (ISO 8601); omitido se nunca editado. */
  updatedAt?: string | null;
  /** Soft-delete: post tratado como removido nas leituras do mock/API. */
  deletedAt?: string | null;
  likesCount: number;
  commentsCount: number;
  /**
   * Se a usuária atual curtiu o post (requer contexto de `viewerId`).
   * Mock: vindo de `postInteractionMockStore`; produção: campo da API ou derivado.
   */
  likedByCurrentUser: boolean;
  /** Preenchido ao montar dados para a UI; opcional em payloads “cru”. */
  community?: PostCommunityPreview;
  /** Destaque no perfil da autora (ISO da API). */
  pinnedOnProfileAt?: string | null;
  /** Impulsionamento premium da comunidade (API `communityBoostActive`). */
  communityBoostActive?: boolean;
  /** Fim do impulsionamento em ISO UTC quando activo. */
  communityBoostEndsAt?: string | null;
}
