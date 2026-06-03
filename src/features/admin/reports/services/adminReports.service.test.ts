import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import { getBanReportAuthorErrorMessage } from "./adminReports.service";

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    api: { post: vi.fn() },
  };
});

describe("getBanReportAuthorErrorMessage", () => {
  it("mapeia CANNOT_BAN_SUPERADMIN", () => {
    const err = new axios.AxiosError(
      "Forbidden",
      "403",
      undefined,
      undefined,
      {
        status: 403,
        data: { code: "CANNOT_BAN_SUPERADMIN", error: "Não é permitido" },
        statusText: "",
        headers: {},
        config: {} as never,
      }
    );
    expect(getBanReportAuthorErrorMessage(err)).toBe(
      "Esta conta não pode ser banida por esta ação."
    );
  });

  it("mapeia 403 genérico", () => {
    const err = new axios.AxiosError(
      "Forbidden",
      "403",
      undefined,
      undefined,
      {
        status: 403,
        data: {},
        statusText: "",
        headers: {},
        config: {} as never,
      }
    );
    expect(getBanReportAuthorErrorMessage(err)).toBe(
      "Você não tem permissão para realizar esta ação."
    );
  });
});
