import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { SuperAdminRoute } from "@/app/SuperAdminRoute";
import type { AuthUser } from "@/features/auth/types";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/features/verification/services/verification.service", () => ({
  resolveVerificationRoute: vi.fn(() => "/feed"),
}));

vi.mock("@/features/auth/components/SessionBootstrapSplash", () => ({
  SessionBootstrapSplash: () => <div data-testid="splash" />,
}));

import { useAuth } from "@/features/auth/context/AuthContext";

const mockUseAuth = vi.mocked(useAuth);

function makeAuth(role: string, verified = true) {
  return {
    isAuthenticated: true,
    isLoading: false,
    user: {
      id: "1",
      username: "adminuser",
      role,
      verificationStatus: verified ? "Approved" : "PendingDocument",
    } as AuthUser,
  } as ReturnType<typeof useAuth>;
}

function renderWithRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/admin/reports"
          element={
            <SuperAdminRoute>
              <div data-testid="reports-list-page">Lista de Denúncias</div>
            </SuperAdminRoute>
          }
        />
        <Route
          path="/admin/reports/:id"
          element={
            <SuperAdminRoute>
              <div data-testid="reports-detail-page">Detalhe da Denúncia</div>
            </SuperAdminRoute>
          }
        />
        <Route path="/feed" element={<div data-testid="feed-page" />} />
        <Route path="/auth/login" element={<div data-testid="login-page" />} />
      </Routes>
    </MemoryRouter>
  );
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("Rotas admin/reports — controle de acesso", () => {
  // ── SuperAdmin acessa ───────────────────────────────────────────────────────

  it("SuperAdmin acessa /admin/reports", () => {
    mockUseAuth.mockReturnValue(makeAuth("SuperAdmin"));

    renderWithRoute("/admin/reports");

    expect(screen.getByTestId("reports-list-page")).toBeInTheDocument();
  });

  it("SuperAdmin acessa /admin/reports/:id", () => {
    mockUseAuth.mockReturnValue(makeAuth("SuperAdmin"));

    renderWithRoute("/admin/reports/1");

    expect(screen.getByTestId("reports-detail-page")).toBeInTheDocument();
  });

  // ── Usuário comum não acessa ────────────────────────────────────────────────

  it("usuário comum é redirecionado ao acessar /admin/reports", () => {
    mockUseAuth.mockReturnValue(makeAuth("User"));

    renderWithRoute("/admin/reports");

    expect(screen.queryByTestId("reports-list-page")).not.toBeInTheDocument();
    expect(screen.getByTestId("feed-page")).toBeInTheDocument();
  });

  // ── Admin de comunidade não acessa ──────────────────────────────────────────

  it("Admin de comunidade é redirecionado ao acessar /admin/reports", () => {
    mockUseAuth.mockReturnValue(makeAuth("Admin"));

    renderWithRoute("/admin/reports");

    expect(screen.queryByTestId("reports-list-page")).not.toBeInTheDocument();
    expect(screen.getByTestId("feed-page")).toBeInTheDocument();
  });

  // ── Não autenticado é redirecionado para login ───────────────────────────────

  it("usuário não autenticado é redirecionado para /auth/login", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    } as ReturnType<typeof useAuth>);

    renderWithRoute("/admin/reports");

    expect(screen.queryByTestId("reports-list-page")).not.toBeInTheDocument();
    expect(screen.getByTestId("login-page")).toBeInTheDocument();
  });

  // ── Rota de detalhe também exige SuperAdmin ─────────────────────────────────

  it("usuário comum é redirecionado ao acessar /admin/reports/:id", () => {
    mockUseAuth.mockReturnValue(makeAuth("User"));

    renderWithRoute("/admin/reports/42");

    expect(screen.queryByTestId("reports-detail-page")).not.toBeInTheDocument();
    expect(screen.getByTestId("feed-page")).toBeInTheDocument();
  });
});
