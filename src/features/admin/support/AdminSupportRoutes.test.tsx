import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { SuperAdminRoute } from "@/app/SuperAdminRoute";
import { AdminNav } from "@/features/admin/components/AdminNav";
import type { AuthUser } from "@/features/auth/types";

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/features/verification/services/verification.service", () => ({
  resolveVerificationRoute: vi.fn(() => "/feed"),
}));

import { useAuth } from "@/features/auth/context/AuthContext";

const mockUseAuth = vi.mocked(useAuth);

function makeAuth(role: string) {
  return {
    isAuthenticated: true,
    isLoading: false,
    user: {
      id: "1",
      username: "admin",
      role,
      verificationStatus: "Approved",
    } as AuthUser,
  } as ReturnType<typeof useAuth>;
}

describe("Rotas admin/support", () => {
  it("SuperAdmin acessa /admin/support", () => {
    mockUseAuth.mockReturnValue(makeAuth("SuperAdmin"));

    render(
      <MemoryRouter initialEntries={["/admin/support"]}>
        <Routes>
          <Route
            path="/admin/support"
            element={
              <SuperAdminRoute>
                <div data-testid="admin-support-list">Lista</div>
              </SuperAdminRoute>
            }
          />
          <Route path="/feed" element={<div data-testid="feed" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("admin-support-list")).toBeInTheDocument();
  });

  it("usuária comum não acessa /admin/support", () => {
    mockUseAuth.mockReturnValue(makeAuth("User"));

    render(
      <MemoryRouter initialEntries={["/admin/support"]}>
        <Routes>
          <Route
            path="/admin/support"
            element={
              <SuperAdminRoute>
                <div data-testid="admin-support-list">Lista</div>
              </SuperAdminRoute>
            }
          />
          <Route path="/feed" element={<div data-testid="feed" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId("admin-support-list")).not.toBeInTheDocument();
    expect(screen.getByTestId("feed")).toBeInTheDocument();
  });

  it("AdminNav mostra link Suporte", () => {
    render(
      <MemoryRouter>
        <AdminNav />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /suporte/i })).toHaveAttribute(
      "href",
      "/admin/support"
    );
  });
});
