import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { ForgotPasswordFlow } from "./ForgotPasswordFlow";
import { ForgotPasswordRequestPage } from "./pages/ForgotPasswordRequestPage";
import { ForgotPasswordVerifyCodePage } from "./pages/ForgotPasswordVerifyCodePage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { PasswordResetRateLimitError } from "./passwordResetRateLimitError";

vi.mock("./services/passwordReset.service", () => ({
  requestPasswordReset: vi.fn(),
  verifyPasswordResetCode: vi.fn(),
  confirmPasswordReset: vi.fn(),
}));

vi.mock("@/lib/toast/woodyToast", () => ({
  showSuccessToast: vi.fn(),
}));

import {
  requestPasswordReset,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "./services/passwordReset.service";
import { showSuccessToast } from "@/lib/toast/woodyToast";

const mockRequest = vi.mocked(requestPasswordReset);
const mockVerify = vi.mocked(verifyPasswordResetCode);
const mockConfirm = vi.mocked(confirmPasswordReset);
const mockToast = vi.mocked(showSuccessToast);

function renderFlow(initialEntry = "/auth/forgot-password") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/auth/login" element={<div>Tela de login</div>} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordFlow />}>
          <Route index element={<ForgotPasswordRequestPage />} />
          <Route path="verify" element={<ForgotPasswordVerifyCodePage />} />
          <Route path="new-password" element={<ResetPasswordPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

async function submitEmail(user: ReturnType<typeof userEvent.setup>, email = "user@example.com") {
  await user.type(screen.getByLabelText(/^e-mail$/i), email);
  await user.click(screen.getByRole("button", { name: /^enviar código$/i }));
  await waitFor(() => {
    expect(screen.getByRole("heading", { name: /confira seu e-mail/i })).toBeInTheDocument();
  });
}

async function submitOtp(user: ReturnType<typeof userEvent.setup>, code = "123456") {
  const firstOtp = document.getElementById("password-reset-otp-0");
  expect(firstOtp).toBeTruthy();
  fireEvent.paste(firstOtp!, {
    clipboardData: { getData: () => code },
  });
  await waitFor(() => {
    expect(screen.getByRole("button", { name: /^confirmar código$/i })).not.toBeDisabled();
  });
  await user.click(screen.getByRole("button", { name: /^confirmar código$/i }));
  await waitFor(() => {
    expect(screen.getByRole("heading", { name: /crie uma nova senha/i })).toBeInTheDocument();
  });
}

describe("ForgotPasswordFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequest.mockResolvedValue({
      maskedEmail: "us*****@example.com",
      message: "Se este e-mail estiver cadastrado, enviaremos um código.",
    });
    mockVerify.mockResolvedValue({ resetToken: "opaque-token", expiresInSeconds: 600 });
  });

  it("renderiza tela de solicitação", () => {
    renderFlow();
    expect(screen.getByRole("heading", { name: /recuperar senha/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^e-mail$/i)).toBeInTheDocument();
  });

  it("request válido navega para verify e mostra maskedEmail", async () => {
    const user = userEvent.setup();
    renderFlow();
    await submitEmail(user);
    expect(screen.getByText(/us\*\*\*\*\*@example\.com/)).toBeInTheDocument();
  });

  it("código inválido mostra erro amigável", async () => {
    const user = userEvent.setup();
    mockVerify.mockRejectedValue(new Error("Código inválido ou expirado."));
    renderFlow();
    await submitEmail(user);

    const firstOtp = document.getElementById("password-reset-otp-0")!;
    fireEvent.paste(firstOtp, { clipboardData: { getData: () => "000000" } });
    await user.click(screen.getByRole("button", { name: /^confirmar código$/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/código inválido ou expirado/i);
    });
  });

  it("código válido navega para nova senha", async () => {
    const user = userEvent.setup();
    renderFlow();
    await submitEmail(user);
    await submitOtp(user);
  });

  it("senha fraca mostra validação", async () => {
    const user = userEvent.setup();
    renderFlow();
    await submitEmail(user);
    await submitOtp(user);

    await user.type(screen.getByLabelText(/^nova senha$/i), "abc");
    await user.type(screen.getByLabelText(/confirmar nova senha/i), "abc");
    await user.click(screen.getByRole("button", { name: /^salvar nova senha$/i }));

    await waitFor(() => {
      expect(screen.getByText(/senha deve ter no mínimo/i)).toBeInTheDocument();
    });
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it("senhas diferentes mostram erro de validação", async () => {
    const user = userEvent.setup();
    renderFlow();
    await submitEmail(user);
    await submitOtp(user);

    await user.type(screen.getByLabelText(/^nova senha$/i), "SenhaForte1!");
    await user.type(screen.getByLabelText(/confirmar nova senha/i), "OutraSenha1!");
    await user.click(screen.getByRole("button", { name: /^salvar nova senha$/i }));

    await waitFor(() => {
      expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument();
    });
  });

  it("sucesso redireciona para login com toast", async () => {
    const user = userEvent.setup();
    mockConfirm.mockResolvedValue({ message: "Senha alterada com sucesso." });
    renderFlow();
    await submitEmail(user);
    await submitOtp(user);

    await user.type(screen.getByLabelText(/^nova senha$/i), "SenhaForte1!");
    await user.type(screen.getByLabelText(/confirmar nova senha/i), "SenhaForte1!");
    await user.click(screen.getByRole("button", { name: /^salvar nova senha$/i }));

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalledWith("opaque-token", "SenhaForte1!", "SenhaForte1!");
    });
    await waitFor(() => {
      expect(screen.getByText("Tela de login")).toBeInTheDocument();
    });
    expect(mockToast).toHaveBeenCalledWith(
      "Senha alterada com sucesso. Entre novamente.",
      expect.objectContaining({ id: "password-reset-success" })
    );
  });

  it("429 na solicitação mostra mensagem amigável", async () => {
    const user = userEvent.setup();
    mockRequest.mockRejectedValue(
      new PasswordResetRateLimitError("Muitas tentativas.", 60, "EMAIL_RATE_LIMITED")
    );

    renderFlow();
    await user.type(screen.getByLabelText(/^e-mail$/i), "user@example.com");
    await user.click(screen.getByRole("button", { name: /^enviar código$/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/muitas tentativas/i);
    });
  });

  it("verify sem estado redireciona para início", async () => {
    renderFlow("/auth/forgot-password/verify");
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /recuperar senha/i })).toBeInTheDocument();
    });
  });

  it("botão mostrar/ocultar senha existe na tela de nova senha", async () => {
    const user = userEvent.setup();
    renderFlow();
    await submitEmail(user);
    await submitOtp(user);

    const toggles = screen.getAllByRole("button", { name: /mostrar senha/i });
    expect(toggles.length).toBeGreaterThanOrEqual(2);
  });
});
