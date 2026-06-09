import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { PostCard } from "./PostCard";
import { makePost } from "@/test/fixtures/post";

vi.mock("@/features/auth/hooks/useViewerId", () => ({
  useViewerId: () => "viewer-1",
}));

vi.mock("../../hooks/usePostShare", () => ({
  usePostShare: () => ({
    dialogOpen: false,
    setDialogOpen: vi.fn(),
    shareStep: "menu" as const,
    setShareStep: vi.fn(),
    shareUrl: "https://woody.test/posts/pst_test00000001",
    canShareExternally: true,
    nativeShareAvailable: false,
    isCopying: false,
    isSharing: false,
    isSendingToWoody: false,
    copyLink: vi.fn(),
    shareOutside: vi.fn(),
    sendToWoody: vi.fn(),
  }),
}));

describe("PostCard share", () => {
  it("mostra botão de compartilhar no footer", () => {
    render(
      <MemoryRouter>
        <PostCard post={makePost()} />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: /compartilhar publicação/i })).toBeInTheDocument();
  });
});
