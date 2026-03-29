import type { Post, User } from "@/domain/types";

/** Link de rede social / conexão do perfil */
export interface SocialLink {
  id: string;
  platform: "instagram" | "facebook" | "twitter" | "tiktok" | "linkedin" | "other";
  label: string;
  url: string;
  handle?: string;
}

/** Tag de interesse do usuário */
export interface InterestTag {
  id: string;
  label: string;
}

/** Sugestão de usuário (talvez você conheça) */
export interface ProfileSuggestion {
  id: string;
  name: string;
  avatarUrl: string | null;
}

/** Dados completos do perfil do usuário (para futura API) */
export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  avatarUrl: string | null;
  pronouns?: string;
  bannerUrl: string | null;
  bio: string;
  location?: string;
  role?: string;
  socialLinks: SocialLink[];
  interests: InterestTag[];
  suggestions: ProfileSuggestion[];
  isFollowing?: boolean;
}

/** Payload para `updateProfile` / futura API REST. */
export interface ProfileUpdatePayload {
  name: string;
  username: string;
  bio: string;
  pronouns?: string;
  location?: string;
  role?: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  interests?: InterestTag[];
}

/** Resposta paginada de posts do perfil */
export interface ProfilePostsResponse {
  items: Post[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Retorno do hook useUserProfile – preparado para troca por API */
export interface UseUserProfileReturn {
  profile: UserProfile | null;
  posts: Post[];
  isLoading: boolean;
  error: Error | null;
  page: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: () => void;
  previousPage: () => void;
  refetch: () => void;
}

export type { Post, User };
