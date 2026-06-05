import { describe, expect, it, vi, beforeEach } from "vitest";
import { updateProfile, validateProfileUpdatePayload } from "./profile.service";
import { api } from "@/lib/api";
import { getAuthUser } from "@/features/auth/services/auth.service";

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    api: {
      patch: vi.fn(),
      get: vi.fn(),
    },
  };
});

vi.mock("@/features/auth/services/auth.service", () => ({
  getAuthUser: vi.fn(),
}));

const mockPatch = vi.mocked(api.patch);
const mockGetAuthUser = vi.mocked(getAuthUser);

describe("validateProfileUpdatePayload", () => {
  it("não exige username no payload", () => {
    const result = validateProfileUpdatePayload({
      name: "Maria",
      bio: "",
    });
    expect(result.ok).toBe(true);
  });
});

describe("updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthUser.mockReturnValue({
      id: "10",
      username: "maria",
      name: "Maria",
      email: "maria@example.com",
      role: "User",
      avatarUrl: null,
    });
  });

  it("não envia username no PATCH /users/me", async () => {
    mockPatch.mockResolvedValue({
      data: {
        id: "10",
        name: "Maria Nova",
        username: "maria",
        bio: "Bio",
        avatarUrl: null,
        bannerUrl: null,
        interests: [],
        socialLinks: [],
        suggestions: [],
        badges: [],
      },
    });

    const result = await updateProfile("10", {
      name: "Maria Nova",
      bio: "Bio",
    });

    expect(result.ok).toBe(true);
    expect(mockPatch).toHaveBeenCalledWith("/users/me", expect.not.objectContaining({ username: expect.anything() }));
  });
});
