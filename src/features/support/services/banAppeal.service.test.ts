import { describe, expect, it, vi, beforeEach } from "vitest";
import { submitBanAppeal } from "./banAppeal.service";

vi.mock("@/lib/api", () => ({
  api: { post: vi.fn() },
}));

import { api } from "@/lib/api";

describe("banAppeal.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /support/ban-appeals com corpo esperado", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { message: "Recebemos sua solicitação. Se for necessário, a equipe da Woody entrará em contato." },
    });

    await submitBanAppeal({
      email: "user@example.com",
      description: "Descrição longa o suficiente para o envio.",
    });

    expect(api.post).toHaveBeenCalledWith("/support/ban-appeals", {
      email: "user@example.com",
      description: "Descrição longa o suficiente para o envio.",
    });
  });
});
