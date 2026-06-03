import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SupportTicketThread } from "./SupportTicketThread";

const messages = [
  {
    id: 1,
    authorRole: "Staff",
    body: "Olá, estamos analisando.",
    createdAt: "2026-06-03T12:00:00Z",
    author: null,
  },
  {
    id: 2,
    authorRole: "Staff",
    body: "Nota interna não deve aparecer",
    createdAt: "2026-06-03T12:01:00Z",
    author: null,
  },
];

describe("SupportTicketThread", () => {
  it("não exibe mensagens com corpo de nota interna quando filtradas pelo pai", () => {
    render(
      <SupportTicketThread
        messages={[messages[0]]}
        canReply
        onReply={vi.fn()}
      />
    );

    expect(screen.getByText(/estamos analisando/i)).toBeInTheDocument();
    expect(screen.queryByText(/nota interna/i)).not.toBeInTheDocument();
  });

  it("ticket fechado não mostra formulário de resposta", () => {
    render(
      <SupportTicketThread messages={[]} canReply={false} onReply={vi.fn()} />
    );

    expect(screen.getByText(/foi encerrada/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /enviar resposta/i })).not.toBeInTheDocument();
  });

  it("envia resposta quando aberto", async () => {
    const user = userEvent.setup();
    const onReply = vi.fn().mockResolvedValue(undefined);
    render(<SupportTicketThread messages={[]} canReply onReply={onReply} />);

    await user.type(screen.getByPlaceholderText(/escreva sua resposta/i), "Mais detalhes aqui.");
    await user.click(screen.getByRole("button", { name: /enviar resposta/i }));

    expect(onReply).toHaveBeenCalledWith("Mais detalhes aqui.");
  });
});
