import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PostDetailRoutePage } from "./PostDetailRoutePage";

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/app/ProtectedRoute", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => <div data-testid="protected">{children}</div>,
}));

vi.mock("./PostDetailPage", () => ({
  PostDetailPage: () => <div data-testid="post-detail-page">detalhe</div>,
}));

vi.mock("./PublicPostPage", () => ({
  PublicPostPage: () => <div data-testid="public-post-page">público</div>,
}));

import { useAuth } from "@/features/auth/context/AuthContext";

const mockUseAuth = vi.mocked(useAuth);

describe("PostDetailRoutePage", () => {
  it("mostra preview público sem autenticação", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    } as ReturnType<typeof useAuth>);

    render(<PostDetailRoutePage />);

    expect(screen.getByTestId("public-post-page")).toBeInTheDocument();
    expect(screen.queryByTestId("post-detail-page")).not.toBeInTheDocument();
  });

  it("mostra detalhe protegido quando autenticada", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    } as ReturnType<typeof useAuth>);

    render(<PostDetailRoutePage />);

    expect(screen.getByTestId("protected")).toBeInTheDocument();
    expect(screen.getByTestId("post-detail-page")).toBeInTheDocument();
    expect(screen.queryByTestId("public-post-page")).not.toBeInTheDocument();
  });
});
