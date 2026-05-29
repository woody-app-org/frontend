import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { PublicPostPage } from "./PublicPostPage";
import { makePost } from "@/test/fixtures/post";

vi.mock("@/domain/services/postMock.service", () => ({
  getPostByPublicId: vi.fn(),
}));

import { getPostByPublicId } from "@/domain/services/postMock.service";

const mockGetPost = vi.mocked(getPostByPublicId);

function renderAt(publicId: string) {
  return render(
    <MemoryRouter initialEntries={[`/posts/${publicId}`]}>
      <Routes>
        <Route path="/posts/:publicId" element={<PublicPostPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("PublicPostPage", () => {
  it("renderiza post público", async () => {
    mockGetPost.mockResolvedValue(makePost({ content: "Texto público" }));

    renderAt("pst_test00000001");

    await waitFor(() => {
      expect(screen.getByText("Texto público")).toBeInTheDocument();
    });
    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
  });

  it("404 mostra tela genérica indisponível", async () => {
    mockGetPost.mockResolvedValue(null);

    renderAt("pst_missing00001");

    await waitFor(() => {
      expect(screen.getByText("Este conteúdo não está disponível.")).toBeInTheDocument();
    });
    expect(screen.queryByText(/comunidade privada/i)).not.toBeInTheDocument();
  });
});
