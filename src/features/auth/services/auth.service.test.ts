import { describe, expect, it, vi, beforeEach } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { AccountBannedLoginError, loginMock } from "./auth.service";
import { api } from "@/lib/api";
import { AUTH_STORAGE_KEY } from "../constants";
import { getStoredRefreshToken, getStoredToken } from "@/lib/api";

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    api: {
      post: vi.fn(),
      get: vi.fn(),
    },
  };
});

const mockPost = vi.mocked(api.post);

describe("loginMock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("lança AccountBannedLoginError em 403 ACCOUNT_BANNED sem persistir sessão", async () => {
    mockPost.mockRejectedValue(
      new AxiosError("Forbidden", "403", undefined, undefined, {
        status: 403,
        statusText: "Forbidden",
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {
          code: "ACCOUNT_BANNED",
          message: "Sua conta foi desativada por violação das regras da Woody.",
          reason: "Violação das regras da plataforma.",
          bannedAt: "2026-06-02T10:30:00Z",
          banInternalNote: "nota interna",
          bannedByUserId: 1,
        },
      })
    );

    await expect(
      loginMock({ username: "banned", password: "CorrectHorse!" })
    ).rejects.toBeInstanceOf(AccountBannedLoginError);

    expect(getStoredToken()).toBeNull();
    expect(getStoredRefreshToken()).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("429 retorna mensagem de muitas tentativas", async () => {
    mockPost.mockRejectedValue(
      new AxiosError("Too Many Requests", "429", undefined, undefined, {
        status: 429,
        statusText: "Too Many Requests",
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {},
      })
    );

    await expect(loginMock({ username: "x", password: "secret1!" })).rejects.toThrow(
      /muitas tentativas/i
    );
  });

  it("erro de rede retorna mensagem genérica de conexão", async () => {
    mockPost.mockRejectedValue(
      new AxiosError("Network Error", "ERR_NETWORK", undefined, undefined, undefined)
    );

    await expect(loginMock({ username: "x", password: "secret1!" })).rejects.toThrow(
      /conectar/i
    );
  });

  it("mantém erro genérico para credenciais inválidas", async () => {
    mockPost.mockRejectedValue(
      new AxiosError("Unauthorized", "401", undefined, undefined, {
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: { error: "Credenciais inválidas." },
      })
    );

    await expect(loginMock({ username: "x", password: "y" })).rejects.toThrow(
      "Credenciais inválidas."
    );
  });
});
