import { afterEach, describe, expect, it, vi } from "vitest";
import {
  canSharePostExternally,
  copyPostLinkToClipboard,
  sharePostNatively,
} from "./postShare";
import { makePost } from "@/test/fixtures/post";

describe("canSharePostExternally", () => {
  it("permite perfil", () => {
    expect(canSharePostExternally(makePost())).toBe(true);
  });

  it("permite comunidade pública", () => {
    expect(
      canSharePostExternally(
        makePost({
          publicationContext: "community",
          communityId: "2",
          community: {
            id: "2",
            slug: "c",
            name: "C",
            avatarUrl: null,
            category: "outro",
            visibility: "public",
          },
        })
      )
    ).toBe(true);
  });

  it("bloqueia comunidade privada", () => {
    expect(
      canSharePostExternally(
        makePost({
          publicationContext: "community",
          communityId: "2",
          community: {
            id: "2",
            slug: "c",
            name: "C",
            avatarUrl: null,
            category: "outro",
            visibility: "private",
          },
        })
      )
    ).toBe(false);
  });
});

describe("copyPostLinkToClipboard", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("copia URL com publicId", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: { writeText },
    });

    await copyPostLinkToClipboard(makePost({ publicId: "pst_abc123xyz456" }));

    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/posts/pst_abc123xyz456`
    );
  });
});

describe("sharePostNatively", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("chama navigator.share quando disponível", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { ...navigator, share, clipboard: navigator.clipboard });

    const result = await sharePostNatively(makePost({ publicId: "pst_share000001" }));

    expect(result).toBe("shared");
    expect(share).toHaveBeenCalledWith({
      title: "Publicação na Woody",
      text: "Olha esta publicação na Woody",
      url: `${window.location.origin}/posts/pst_share000001`,
    });
  });

  it("retorna unsupported sem navigator.share", async () => {
    vi.stubGlobal("navigator", { ...navigator, share: undefined, clipboard: navigator.clipboard });

    const result = await sharePostNatively(makePost());

    expect(result).toBe("unsupported");
  });
});
