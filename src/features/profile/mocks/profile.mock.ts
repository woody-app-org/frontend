import type { UserProfile, SocialLink, InterestTag, ProfileSuggestion } from "../types";
import { getUserById } from "@/domain/selectors";

const MOCK_SOCIAL_LINKS: SocialLink[] = [
  { id: "1", platform: "instagram", label: "Instagram", url: "#", handle: "@woody.comunidade" },
  { id: "2", platform: "linkedin", label: "LinkedIn", url: "#", handle: "/in/seunome" },
  { id: "3", platform: "twitter", label: "X", url: "#", handle: "@seunome" },
];

const MOCK_INTERESTS: InterestTag[] = [
  { id: "1", label: "Educação digital" },
  { id: "2", label: "Clubes de leitura" },
  { id: "3", label: "Maternidade consciente" },
  { id: "4", label: "Comunidades seguras" },
  { id: "5", label: "Voluntariado" },
];

function suggestionFromSeed(id: string): ProfileSuggestion {
  const u = getUserById(id);
  return {
    id,
    name: u?.name ?? `Usuária ${id}`,
    avatarUrl: u?.avatarUrl ?? null,
  };
}

const MOCK_SUGGESTIONS: ProfileSuggestion[] = [
  suggestionFromSeed("2"),
  suggestionFromSeed("5"),
  suggestionFromSeed("8"),
];

/** Alinhado ao seed em `@/domain/mocks/seed` (user id "1"). Posts vêm de `getPostsByAuthorId`. */
export const MOCK_USER_PROFILE: UserProfile = {
  id: "1",
  name: "Seu nome",
  username: "seunome",
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  pronouns: "ela/dela",
  bannerUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&h=400&fit=crop",
  bio: "Professora, facilitadora de grupos e entusiasta de espaços online onde mulheres possam falar com segurança. Na Woody, aprendo tanto quanto compartilho — especialmente sobre trabalho, leitura e cuidado coletivo.",
  location: "Porto Alegre, RS",
  role: "Educadora",
  socialLinks: MOCK_SOCIAL_LINKS,
  interests: MOCK_INTERESTS,
  suggestions: MOCK_SUGGESTIONS,
  isFollowing: false,
  /** Valores ilustrativos quando o perfil mock é usado fora da API. */
  followersCount: 42,
  followingCount: 18,
  showProBadge: false,
};
