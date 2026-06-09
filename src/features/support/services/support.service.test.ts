import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createSupportTicket,
  listMySupportTickets,
} from "./support.service";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
  getApiErrorMessage: (_: unknown, fb: string) => fb,
}));

import { api } from "@/lib/api";

describe("support.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listMySupportTickets chama GET /support/tickets", async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        items: [],
        totalCount: 0,
        page: 1,
        pageSize: 20,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    await listMySupportTickets({ status: "Open", page: 1 });

    expect(api.get).toHaveBeenCalledWith("/support/tickets", {
      params: { page: 1, pageSize: 20, status: "Open" },
    });
  });

  it("createSupportTicket envia visibility Private", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { publicId: "guid", title: "T", status: "Open" },
    });

    await createSupportTicket({
      category: "Other",
      title: "Título válido",
      description: "Descrição longa o suficiente para o teste.",
    });

    expect(api.post).toHaveBeenCalledWith("/support/tickets", {
      category: "Other",
      title: "Título válido",
      description: "Descrição longa o suficiente para o teste.",
      visibility: "Private",
    });
  });
});
