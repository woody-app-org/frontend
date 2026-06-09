import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

vi.mock("./AccountBannedNotice", () => ({
  AccountBannedNotice: () => <div role="alert">Conta desativada</div>,
}));

describe("LoginForm", () => {
  it("link Esqueci minha senha navega para /auth/forgot-password", () => {
    render(
      <MemoryRouter>
        <LoginForm onSubmit={vi.fn()} isSubmitting={false} errorMessage={null} />
      </MemoryRouter>
    );

    const link = screen.getByRole("link", { name: /esqueci minha senha/i });
    expect(link).toHaveAttribute("href", "/auth/forgot-password");
  });

  it("exibe aviso de conta banida em vez de erro genérico", () => {
    render(
      <MemoryRouter>
        <LoginForm
          onSubmit={vi.fn()}
          isSubmitting={false}
          errorMessage="Credenciais inválidas."
          accountBanned={{
            message: "Sua conta foi desativada por violação das regras da Woody.",
            reason: "Motivo público",
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Conta desativada")).toBeInTheDocument();
    expect(screen.queryByText("Credenciais inválidas.")).not.toBeInTheDocument();
  });

  it("mostra orientação sobre redefinição de senha", () => {
    render(
      <MemoryRouter>
        <LoginForm onSubmit={vi.fn()} isSubmitting={false} errorMessage={null} />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Redefinir a senha não reativa uma conta desativada/i)
    ).toBeInTheDocument();
  });
});
