import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PostShareButton } from "./PostShareButton";
import { makePost } from "@/test/fixtures/post";

const copyLink = vi.fn();
const shareOutside = vi.fn();
const setDialogOpen = vi.fn();

vi.mock("../../hooks/usePostShare", () => ({
  usePostShare: vi.fn(),
}));

import { usePostShare } from "../../hooks/usePostShare";

const mockUsePostShare = vi.mocked(usePostShare);

describe("PostShareButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsePostShare.mockReturnValue({
      dialogOpen: false,
      setDialogOpen,
      shareUrl: "https://woody.test/posts/pst_test00000001",
      canShareExternally: true,
      nativeShareAvailable: true,
      isCopying: false,
      isSharing: false,
      copyLink,
      shareOutside,
    });
  });

  it("abre modal ao clicar", async () => {
    const user = userEvent.setup();
    render(<PostShareButton post={makePost()} variant="detail" />);

    await user.click(screen.getByRole("button", { name: /compartilhar publicação/i }));

    expect(setDialogOpen).toHaveBeenCalledWith(true);
  });

  it("modal aberto mostra opções de partilha", () => {
    mockUsePostShare.mockReturnValue({
      dialogOpen: true,
      setDialogOpen,
      shareUrl: "https://woody.test/posts/pst_test00000001",
      canShareExternally: true,
      nativeShareAvailable: true,
      isCopying: false,
      isSharing: false,
      copyLink,
      shareOutside,
    });

    render(<PostShareButton post={makePost()} variant="detail" />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Compartilhar publicação")).toBeInTheDocument();
    expect(screen.getByText("Compartilhar fora da Woody")).toBeInTheDocument();
    expect(screen.getByText("Copiar link")).toBeInTheDocument();
  });
});
