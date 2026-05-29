import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import {
  blockUser,
  fetchBlockedUsersPage,
  unblockUser,
} from "@/features/users/services/userBlock.service";

vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(),
    delete: vi.fn(),
    get: vi.fn(),
  },
  getApiErrorMessage: (_e: unknown, fallback: string) => fallback,
}));

vi.mock("@/lib/apiMappers", () => ({
  mapUserFromApi: (raw: Record<string, unknown>) => ({
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    username: String(raw.username ?? ""),
    avatarUrl: null,
  }),
}));

describe("userBlock.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blockUser chama POST /users/:id/block", async () => {
    vi.mocked(api.post).mockResolvedValue({ data: null });

    await blockUser(7);

    expect(api.post).toHaveBeenCalledWith("/users/7/block");
  });

  it("unblockUser chama DELETE /users/:id/block", async () => {
    vi.mocked(api.delete).mockResolvedValue({ data: null });

    await unblockUser("12");

    expect(api.delete).toHaveBeenCalledWith("/users/12/block");
  });

  it("fetchBlockedUsersPage envia page, pageSize e search", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        items: [{ id: 1, name: "Ana", username: "ana" }],
        page: 1,
        pageSize: 20,
        totalCount: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    const result = await fetchBlockedUsersPage(1, 20, " ana ");

    expect(api.get).toHaveBeenCalledWith("/users/me/blocked-users", {
      params: { page: 1, pageSize: 20, search: "ana" },
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.name).toBe("Ana");
  });
});
