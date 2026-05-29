import { afterEach, describe, expect, it } from "vitest";
import { absolutePostUrl, buildPostShareUrl, postPath } from "./postPaths";

describe("postPaths share URLs", () => {
  afterEach(() => {
    // vitest jsdom default origin
  });

  it("postPath usa publicId opaco", () => {
    expect(postPath("pst_abc123xyz456")).toBe("/posts/pst_abc123xyz456");
  });

  it("absolutePostUrl inclui origin e publicId", () => {
    expect(absolutePostUrl("pst_abc123xyz456")).toBe(
      `${window.location.origin}/posts/pst_abc123xyz456`
    );
  });

  it("buildPostShareUrl é alias de absolutePostUrl", () => {
    expect(buildPostShareUrl("pst_xyz")).toBe(absolutePostUrl("pst_xyz"));
  });
});
