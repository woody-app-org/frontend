import { afterEach, describe, expect, it, vi } from "vitest";
import {
  absolutePostUrl,
  buildPostExternalShareUrl,
  buildPostInternalUrl,
  buildPostShareUrl,
  getPublicShareBaseUrl,
  postPath,
} from "./postPaths";

describe("postPaths share URLs", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("postPath usa publicId opaco (rota interna SPA)", () => {
    expect(postPath("pst_abc123xyz456")).toBe("/posts/pst_abc123xyz456");
  });

  it("buildPostInternalUrl usa origin do frontend", () => {
    expect(buildPostInternalUrl("pst_abc123xyz456")).toBe(
      `${window.location.origin}/posts/pst_abc123xyz456`
    );
  });

  it("buildPostExternalShareUrl usa base da API em dev", () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:5000/api");
    expect(buildPostExternalShareUrl("pst_xyz")).toBe(
      "http://localhost:5000/share/posts/pst_xyz"
    );
  });

  it("getPublicShareBaseUrl respeita VITE_PUBLIC_SHARE_BASE_URL", () => {
    vi.stubEnv("VITE_PUBLIC_SHARE_BASE_URL", "https://share.woody.test/");
    expect(getPublicShareBaseUrl()).toBe("https://share.woody.test");
  });

  it("absolutePostUrl e buildPostShareUrl apontam para share OG externo", () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:5000/api");
    const expected = "http://localhost:5000/share/posts/pst_xyz";
    expect(absolutePostUrl("pst_xyz")).toBe(expected);
    expect(buildPostShareUrl("pst_xyz")).toBe(expected);
  });
});
