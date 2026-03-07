import type { Post, User } from "@/features/feed/types";

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

/** Resposta paginada de posts do perfil (reutiliza Post do feed) */
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

// Re-export para uso no perfil (evita acoplamento direto ao feed)
export type { Post, User };
