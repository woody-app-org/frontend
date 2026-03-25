/** Domínio compartilhado (comunidades, posts, usuárias) — preparado para troca por API. */

export type CommunityCategory = "bemestar" | "carreira" | "cultura" | "seguranca" | "outro";

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
  /** Valor denormalizado para UI; em produção pode vir calculado da API. */
  memberCount: number;
}

export type MembershipRole = "member" | "moderator" | "admin";

export interface Membership {
  id: string;
  userId: string;
  communityId: string;
  role: MembershipRole;
  joinedAt?: string;
}

/** Resumo da comunidade embutido no post para exibição (ex.: feed, busca). */
export interface PostCommunityPreview {
  id: string;
  slug: string;
  name: string;
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
