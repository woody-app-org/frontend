import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { BetaClosedGate } from "./BetaClosedGate";

vi.mock("@/config/beta", () => ({
  isBetaClosed: vi.fn(() => true),
}));

vi.mock("@/features/beta/betaInvite.storage", () => ({
  hasValidatedBetaInvite: vi.fn(() => false),
}));

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: vi.fn(() => ({
    isAuthenticated: false,
    isLoading: false,
  })),
}));

describe("BetaClosedGate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("permite /support/ban-appeal sem convite com beta fechado", () => {
    render(
      <MemoryRouter initialEntries={["/support/ban-appeal"]}>
        <Routes>
          <Route
            path="/support/ban-appeal"
            element={
              <BetaClosedGate>
                <div data-testid="ban-appeal-page">Apelo</div>
              </BetaClosedGate>
            }
          />
          <Route path="/invite" element={<div data-testid="invite">Convite</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId("ban-appeal-page")).toBeInTheDocument();
    expect(screen.queryByTestId("invite")).not.toBeInTheDocument();
  });
});
