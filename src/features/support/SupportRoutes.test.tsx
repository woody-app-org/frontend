import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "@/app/ProtectedRoute";
import type { AuthUser } from "@/features/auth/types";

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/features/verification/services/verification.service", () => ({
  resolveVerificationRoute: vi.fn(() => "/verification/pending"),
}));

vi.mock("@/config/beta", () => ({
  isBetaClosed: () => false,
}));

import { useAuth } from "@/features/auth/context/AuthContext";

const mockUseAuth = vi.mocked(useAuth);

function makeAuth(verificationStatus: AuthUser["verificationStatus"]) {
  return {
    isAuthenticated: true,
    isLoading: false,
    user: {
      id: "1",
      username: "pending",
      role: "User",
      verificationStatus,
    } as AuthUser,
  } as ReturnType<typeof useAuth>;
}

describe("Rotas /support — requireVerified=false", () => {
  it("usuária pendente acessa /support", () => {
    mockUseAuth.mockReturnValue(makeAuth("PendingDocument"));

    render(
      <MemoryRouter initialEntries={["/support"]}>
        <Routes>
          <Route
            path="/support"
            element={
              <ProtectedRoute requireVerified={false}>
                <div data-testid="support-page">Suporte</div>
              </ProtectedRoute>
            }
          />
          <Route path="/verification/pending" element={<div data-testid="verification" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("support-page")).toBeInTheDocument();
  });

  it("usuária não autenticada é redirecionada", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    } as ReturnType<typeof useAuth>);

    render(
      <MemoryRouter initialEntries={["/support"]}>
        <Routes>
          <Route
            path="/support"
            element={
              <ProtectedRoute requireVerified={false}>
                <div data-testid="support-page">Suporte</div>
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<div data-testid="auth-page" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId("support-page")).not.toBeInTheDocument();
    expect(screen.getByTestId("auth-page")).toBeInTheDocument();
  });
});
