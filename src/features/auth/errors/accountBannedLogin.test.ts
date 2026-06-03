import { describe, expect, it } from "vitest";
import {
  AccountBannedLoginError,
  parseAccountBannedLoginError,
  parseAccountBannedLoginResponse,
} from "./accountBannedLogin";
import { AxiosError, AxiosHeaders } from "axios";

describe("accountBannedLogin", () => {
  it("parseAccountBannedLoginResponse reconhece ACCOUNT_BANNED", () => {
    const details = parseAccountBannedLoginResponse({
      code: "ACCOUNT_BANNED",
      message: "Conta off",
      reason: "Spam",
      bannedAt: "2026-06-02T10:30:00Z",
    });
    expect(details).toEqual({
      message: "Conta off",
      reason: "Spam",
      bannedAt: "2026-06-02T10:30:00Z",
    });
  });

  it("parseAccountBannedLoginError cria AccountBannedLoginError", () => {
    const err = new AxiosError("Forbidden", "403", undefined, undefined, {
      status: 403,
      statusText: "Forbidden",
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: {
        code: "ACCOUNT_BANNED",
        message: "Desativada",
        reason: "Regras",
      },
    });
    const parsed = parseAccountBannedLoginError(err);
    expect(parsed).toBeInstanceOf(AccountBannedLoginError);
    expect(parsed?.reason).toBe("Regras");
  });
});
