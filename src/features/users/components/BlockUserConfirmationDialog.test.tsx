import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BlockUserConfirmationDialog } from "./BlockUserConfirmationDialog";

describe("BlockUserConfirmationDialog", () => {
  it("mostra título e descrição quando aberto", () => {
    render(
      <BlockUserConfirmationDialog
        open
        onOpenChange={vi.fn()}
        displayName="Maria"
        isPending={false}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Bloquear esta usuária?")).toBeInTheDocument();
    expect(screen.getByText(/Maria/)).toBeInTheDocument();
    expect(screen.getByText(/não será notificada/i)).toBeInTheDocument();
  });

  it("cancelar não chama onConfirm", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <BlockUserConfirmationDialog
        open
        onOpenChange={onOpenChange}
        isPending={false}
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("confirmar chama onConfirm", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <BlockUserConfirmationDialog
        open
        onOpenChange={vi.fn()}
        isPending={false}
        onConfirm={onConfirm}
      />
    );

    await user.click(screen.getByRole("button", { name: "Bloquear" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("desabilita ações enquanto pendente", () => {
    render(
      <BlockUserConfirmationDialog
        open
        onOpenChange={vi.fn()}
        isPending
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /Bloqueando/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });
});
