import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { LoginPage } from "./LoginPage";
import { AccountBannedLoginError } from "../errors/accountBannedLogin";
import { AUTH_STORAGE_KEY } from "../constants";

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

vi.mock("@/features/verification/services/verification.service", () => ({
  resolveVerificationRoute: () => "/feed",
}));

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={["/auth/login"]}>
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/feed" element={<div>Feed</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("credenciais inválidas mostram erro normal", async () => {
    mockLogin.mockRejectedValue(new Error("Credenciais inválidas."));
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/usuário/i), "user");
    await user.type(screen.getByLabelText(/^senha$/i), "wrong1!");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText("Credenciais inválidas.")).toBeInTheDocument();
    });
    expect(screen.queryByText("Conta desativada")).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("ACCOUNT_BANNED mostra aviso persistente sem redirecionar", async () => {
    mockLogin.mockRejectedValue(
      new AccountBannedLoginError({
        message: "Sua conta foi desativada por violação das regras da Woody.",
        reason: "Motivo público de teste",
        bannedAt: "2026-06-02T10:30:00.000Z",
      })
    );
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/usuário/i), "banned");
    await user.type(screen.getByLabelText(/^senha$/i), "secret1!");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText("Conta desativada")).toBeInTheDocument();
    });
    expect(screen.getByText(/Motivo público de teste/)).toBeInTheDocument();
    expect(screen.getByText(/Data da decisão:/)).toBeInTheDocument();
    expect(screen.queryByText(/nota interna/i)).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it("permite nova tentativa após aviso de banimento", async () => {
    mockLogin
      .mockRejectedValueOnce(
        new AccountBannedLoginError({
          message: "Sua conta foi desativada por violação das regras da Woody.",
          reason: "Motivo",
        })
      )
      .mockResolvedValueOnce({
        id: "1",
        username: "other",
        verificationStatus: "Approved",
      });

    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/usuário/i), "banned");
    await user.type(screen.getByLabelText(/^senha$/i), "secret1!");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText("Conta desativada")).toBeInTheDocument();
    });

    await user.clear(screen.getByLabelText(/usuário/i));
    await user.type(screen.getByLabelText(/usuário/i), "other");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/feed", { replace: true });
    });
    expect(screen.queryByText("Conta desativada")).not.toBeInTheDocument();
  });

  it("login bem-sucedido não exibe aviso de banimento", async () => {
    mockLogin.mockResolvedValue({
      id: "1",
      username: "active",
      verificationStatus: "Approved",
    });
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/usuário/i), "active");
    await user.type(screen.getByLabelText(/^senha$/i), "secret1!");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
    expect(screen.queryByText("Conta desativada")).not.toBeInTheDocument();
  });
});
