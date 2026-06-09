import { describe, expect, it } from "vitest";
import {
  USERNAME_PERMANENT_EMPHASIS,
  USERNAME_PERMANENT_LEAD,
  USERNAME_RESERVED_MESSAGE,
  normalizeUsername,
  validateUsername,
} from "./usernamePolicy";

describe("usernamePolicy", () => {
  it("normaliza trim e lowercase", () => {
    expect(normalizeUsername("  Maria_Silva ")).toBe("maria_silva");
  });

  it("rejeita username reservado", () => {
    const result = validateUsername("woody");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(USERNAME_RESERVED_MESSAGE);
    }
  });

  it("rejeita pontos inválidos", () => {
    expect(validateUsername(".maria").ok).toBe(false);
    expect(validateUsername("maria.").ok).toBe(false);
    expect(validateUsername("mar..ia").ok).toBe(false);
  });

  it("aceita username válido", () => {
    const result = validateUsername("maria_silva");
    expect(result).toEqual({ ok: true, value: "maria_silva" });
  });

  it("expõe texto de permanência para onboarding", () => {
    expect(USERNAME_PERMANENT_EMPHASIS).toMatch(/não poderá ser alterado/i);
    expect(USERNAME_PERMANENT_LEAD).toMatch(/@ na Woody/i);
  });
});
