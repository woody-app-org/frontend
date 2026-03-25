import type { UserProfile, SocialLink, InterestTag, ProfileSuggestion } from "../types";

const MOCK_SOCIAL_LINKS: SocialLink[] = [
  { id: "1", platform: "instagram", label: "Instagram", url: "#", handle: "@loremipsum" },
  { id: "2", platform: "facebook", label: "Facebook", url: "#", handle: "@loremipsum" },
  { id: "3", platform: "twitter", label: "Twitter", url: "#", handle: "@loremipsum" },
  { id: "4", platform: "tiktok", label: "TikTok", url: "#", handle: "@loremipsum" },
];

const MOCK_INTERESTS: InterestTag[] = [
  { id: "1", label: "tag" },
  { id: "2", label: "tag" },
  { id: "3", label: "tag" },
  { id: "4", label: "tag" },
  { id: "5", label: "tag" },
  { id: "6", label: "tag" },
  { id: "7", label: "tag" },
];

const MOCK_SUGGESTIONS: ProfileSuggestion[] = [
  { id: "2", name: "Loren ipsum da Silva", avatarUrl: null },
  { id: "3", name: "Loren ipsum da Silva", avatarUrl: null },
  { id: "4", name: "Loren ipsum da Silva", avatarUrl: null },
];

/** Alinhado ao seed em `@/domain/mocks/seed` (user id "1"). Posts vêm de `getPostsByAuthorId`. */
export const MOCK_USER_PROFILE: UserProfile = {
  id: "1",
  name: "Seu nome",
  username: "seunome",
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  pronouns: "ela/dela",
  bannerUrl: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&h=400&fit=crop",
  bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  location: "Porto Alegre, RS",
  role: "Professora",
  socialLinks: MOCK_SOCIAL_LINKS,
  interests: MOCK_INTERESTS,
  suggestions: MOCK_SUGGESTIONS,
  isFollowing: false,
};
