import type { UserProfile, SocialLink, InterestTag, ProfileSuggestion } from "../types";
import type { Post } from "@/features/feed/types";

const MOCK_AUTHOR = {
  id: "1",
  name: "Seu nome",
  avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  pronouns: "ela/dela",
};

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

export const MOCK_USER_PROFILE: UserProfile = {
  id: "1",
  name: "Seu nome",
  username: "seunome",
  avatarUrl: MOCK_AUTHOR.avatarUrl,
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

/** Posts mockados do perfil (mesmo padrão do feed) */
export const MOCK_PROFILE_POSTS: Post[] = [
  {
    id: "p1",
    author: MOCK_AUTHOR,
    title: "Tópico",
    content: "A great book and a great coffee! What a way to begin the day :)",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    topic: "Tópico",
    createdAt: "2h atrás",
    likesCount: 3500,
    commentsCount: 3500,
  },
  {
    id: "p2",
    author: MOCK_AUTHOR,
    title: "Tópico",
    content: "A great book and a great coffee! What a way to begin the day :)",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    topic: "Tópico",
    createdAt: "5h atrás",
    likesCount: 1200,
    commentsCount: 89,
  },
];
