import type { UserProfile } from "@/features/profile/types";

export function makeUserProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: "42",
    name: "Ana Silva",
    username: "ana",
    avatarUrl: null,
    bannerUrl: null,
    bio: "Bio de teste",
    socialLinks: [],
    interests: [],
    suggestions: [],
    badges: [],
    ...overrides,
  };
}
