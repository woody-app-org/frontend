import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { BanAppealPage } from "./BanAppealPage";
import { BAN_APPEAL_SUCCESS_MESSAGE } from "../services/banAppeal.service";

vi.mock("../services/banAppeal.service", () => ({
  submitBanAppeal: vi.fn(),
  BAN_APPEAL_SUCCESS_MESSAGE:
    "Recebemos sua solicitação. Se for necessário, a equipe da Woody entrará em contato.",
}));

import { submitBanAppeal } from "../services/banAppeal.service";

const mockSubmit = vi.mocked(submitBanAppeal);

describe("BanAppealPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmit.mockResolvedValue({
      message: BAN_APPEAL_SUCCESS_MESSAGE,
    });
  });

  it("renderiza título e aviso de segurança", () => {
    render(
      <MemoryRouter>
        <BanAppealPage />
      </MemoryRouter>
    );

    expect(screen.getByText("Solicitar revisão de conta")).toBeInTheDocument();
    expect(screen.getByText(/não envie senhas, documentos/i)).toBeInTheDocument();
  });

  it("exige e-mail e descrição", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <BanAppealPage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: /enviar solicitação/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/e-mail/i);
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("sucesso mostra mensagem genérica sem indicar existência de conta", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <BanAppealPage />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/e-mail da conta/i), "user@example.com");
    await user.type(
      screen.getByLabelText(/^descrição$/i),
      "Acredito que minha conta foi desativada por engano e peço revisão."
    );
    await user.click(screen.getByRole("button", { name: /enviar solicitação/i }));

    await waitFor(() => {
      expect(screen.getByText("Recebemos sua solicitação")).toBeInTheDocument();
    });

    expect(screen.getByText(BAN_APPEAL_SUCCESS_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText(/conta não encontrada/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/banida/i)).not.toBeInTheDocument();
  });
});
