import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccountBannedNotice } from "./AccountBannedNotice";

vi.mock("../lib/supportContact", () => ({
  getSupportContactAction: () => ({
    kind: "disabled" as const,
    label: "Falar com suporte — Em breve",
  }),
}));

describe("AccountBannedNotice", () => {
  const details = {
    message: "Sua conta foi desativada por violação das regras da Woody.",
    reason: "Violação das regras da plataforma.",
    bannedAt: "2026-06-02T10:30:00.000Z",
  };

  it("exibe título, motivo e data", () => {
    render(<AccountBannedNotice details={details} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Conta desativada")).toBeInTheDocument();
    expect(screen.getByText(/Motivo:/)).toBeInTheDocument();
    expect(screen.getByText(/Violação das regras da plataforma/)).toBeInTheDocument();
    expect(screen.getByText(/Data da decisão:/)).toBeInTheDocument();
  });

  it("não exibe campos internos", () => {
    render(<AccountBannedNotice details={details} />);

    expect(screen.queryByText(/nota interna/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ban_source/i)).not.toBeInTheDocument();
  });

  it("mostra botão de suporte desabilitado e texto em breve", () => {
    render(<AccountBannedNotice details={details} />);

    const btn = screen.getByRole("button", { name: /falar com suporte/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent("Em breve");
    expect(screen.getByText("Canal de suporte em breve.")).toBeInTheDocument();
  });
});
