import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AccountBannedNotice } from "./AccountBannedNotice";

vi.mock("../lib/supportContact", () => ({
  getSupportContactAction: () => ({
    kind: "route" as const,
    href: "/support/ban-appeal",
    label: "Solicitar revisão",
  }),
}));

describe("AccountBannedNotice", () => {
  const details = {
    message: "Sua conta foi desativada por violação das regras da Woody.",
    reason: "Violação das regras da plataforma.",
    bannedAt: "2026-06-02T10:30:00.000Z",
  };

  it("exibe título, motivo e data", () => {
    render(
      <MemoryRouter>
        <AccountBannedNotice details={details} />
      </MemoryRouter>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Conta desativada")).toBeInTheDocument();
    expect(screen.getByText(/Motivo:/)).toBeInTheDocument();
  });

  it("link de revisão aponta para /support/ban-appeal", () => {
    render(
      <MemoryRouter>
        <AccountBannedNotice details={details} />
      </MemoryRouter>
    );

    const link = screen.getByRole("link", { name: /solicitar revisão/i });
    expect(link).toHaveAttribute("href", "/support/ban-appeal");
  });
});
