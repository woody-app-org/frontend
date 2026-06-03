import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SupportTicketForm } from "./SupportTicketForm";

describe("SupportTicketForm", () => {
  it("mostra aviso de segurança e opção pública desabilitada", () => {
    render(<SupportTicketForm onSubmit={vi.fn()} />);

    expect(
      screen.getByText(/não compartilhe senhas, documentos, cpf/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/em breve/i)).toBeInTheDocument();
    expect(screen.getByText(/^Público$/)).toBeInTheDocument();
  });

  it("valida título curto", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SupportTicketForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/título/i), "abc");
    await user.type(
      screen.getByLabelText(/descrição/i),
      "Descrição com mais de vinte caracteres para validar."
    );
    await user.click(screen.getByRole("button", { name: /enviar solicitação/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/pelo menos 5 caracteres/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("chama onSubmit com payload válido", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<SupportTicketForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/título/i), "Problema no feed");
    await user.type(
      screen.getByLabelText(/descrição/i),
      "Quando publico uma foto o upload falha sempre no celular."
    );
    await user.click(screen.getByRole("button", { name: /enviar solicitação/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "TechnicalBug",
        title: "Problema no feed",
        visibility: "Private",
      })
    );
  });
});
