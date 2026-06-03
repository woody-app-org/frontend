import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { BanReportAuthorDialog } from "./BanReportAuthorDialog";

vi.mock("@/lib/api", () => ({
  resolvePublicMediaUrl: (url: string) => url,
}));

const author = {
  id: "20",
  name: "Maria Souza",
  username: "maria",
  avatarUrl: null,
};

describe("BanReportAuthorDialog", () => {
  const onConfirm = vi.fn().mockResolvedValue(undefined);
  const onOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exibe nome e username da autora", () => {
    render(
      <BanReportAuthorDialog
        open
        onOpenChange={onOpenChange}
        author={author}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText("Maria Souza")).toBeInTheDocument();
    expect(screen.getByText("@maria")).toBeInTheDocument();
  });

  it("desabilita confirmar sem motivo suficiente", () => {
    render(
      <BanReportAuthorDialog
        open
        onOpenChange={onOpenChange}
        author={author}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByRole("button", { name: /confirmar banimento/i })).toBeDisabled();
  });

  it("cancelar fecha sem chamar onConfirm", () => {
    render(
      <BanReportAuthorDialog
        open
        onOpenChange={onOpenChange}
        author={author}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("confirmar envia reason e internalNote", async () => {
    render(
      <BanReportAuthorDialog
        open
        onOpenChange={onOpenChange}
        author={author}
        onConfirm={onConfirm}
      />
    );

    fireEvent.change(screen.getByLabelText(/motivo do banimento/i), {
      target: { value: "Violação das regras da plataforma" },
    });
    fireEvent.change(screen.getByLabelText(/nota interna/i), {
      target: { value: "Procedente após revisão" },
    });

    fireEvent.click(screen.getByRole("button", { name: /confirmar banimento/i }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith({
        reason: "Violação das regras da plataforma",
        internalNote: "Procedente após revisão",
      });
    });
  });

  it("mantém modal aberto e exibe erro em falha", async () => {
    onConfirm.mockRejectedValueOnce(new Error("Você não tem permissão para realizar esta ação."));

    render(
      <BanReportAuthorDialog
        open
        onOpenChange={onOpenChange}
        author={author}
        onConfirm={onConfirm}
      />
    );

    fireEvent.change(screen.getByLabelText(/motivo do banimento/i), {
      target: { value: "Violação grave das regras" },
    });
    fireEvent.click(screen.getByRole("button", { name: /confirmar banimento/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Você não tem permissão para realizar esta ação.")
      ).toBeInTheDocument();
    });
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
