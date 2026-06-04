import { describe, expect, it } from "vitest";
import { shouldShowFloatingCreatePost } from "./createPostPublicationContext";

const viewer = { id: "42", username: "admin" };

describe("shouldShowFloatingCreatePost", () => {
  it("mostra FAB no próprio perfil por username", () => {
    expect(shouldShowFloatingCreatePost("/profile/admin", { viewer })).toBe(true);
  });

  it("mostra FAB no próprio perfil por id legado", () => {
    expect(shouldShowFloatingCreatePost("/profile/42", { viewer })).toBe(true);
  });

  it("esconde FAB no perfil de outra pessoa", () => {
    expect(shouldShowFloatingCreatePost("/profile/camila", { viewer })).toBe(false);
  });

  it("mostra FAB no feed", () => {
    expect(shouldShowFloatingCreatePost("/feed", { viewer })).toBe(true);
  });
});
