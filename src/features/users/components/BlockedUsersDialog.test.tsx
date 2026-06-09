import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BlockedUsersDialog } from "./BlockedUsersDialog";
import * as userBlockService from "../services/userBlock.service";
import * as woodyToast from "@/lib/toast/woodyToast";
import * as socialGraphEvents from "@/lib/socialGraphEvents";

vi.mock("../services/userBlock.service");
vi.mock("@/lib/toast/woodyToast", () => ({
  showSuccessToast: vi.fn(),
  showActionErrorToast: vi.fn(),
}));
vi.mock("@/lib/socialGraphEvents", () => ({
  dispatchBlockRelationshipChanged: vi.fn(),
  dispatchSocialGraphChanged: vi.fn(),
}));

describe("BlockedUsersDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra estado vazio quando não há bloqueados", async () => {
    vi.mocked(userBlockService.fetchBlockedUsersPage).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    render(<BlockedUsersDialog open onOpenChange={vi.fn()} />);

    expect(await screen.findByText("Nenhuma usuária bloqueada.")).toBeInTheDocument();
  });

  it("busca com debounce chama backend com search", async () => {
    vi.mocked(userBlockService.fetchBlockedUsersPage).mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 20,
      totalCount: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

    const user = userEvent.setup();
    render(<BlockedUsersDialog open onOpenChange={vi.fn()} />);

    await screen.findByText("Nenhuma usuária bloqueada.");

    await user.type(screen.getByPlaceholderText("Buscar por nome ou @"), "maria");

    await waitFor(
      () => {
        expect(userBlockService.fetchBlockedUsersPage).toHaveBeenCalledWith(1, 20, "maria");
      },
      { timeout: 800 }
    );
  });

  it("desbloquear chama DELETE e mostra toast", async () => {
    vi.mocked(userBlockService.fetchBlockedUsersPage).mockResolvedValue({
      items: [
        {
          id: "5",
          name: "Beatriz",
          username: "bea",
          avatarUrl: null,
        },
      ],
      page: 1,
      pageSize: 20,
      totalCount: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
    vi.mocked(userBlockService.unblockUser).mockResolvedValue();

    const user = userEvent.setup();
    render(<BlockedUsersDialog open onOpenChange={vi.fn()} />);

    await screen.findByText("Beatriz");
    await user.click(screen.getByRole("button", { name: "Desbloquear" }));

    await waitFor(() => {
      expect(userBlockService.unblockUser).toHaveBeenCalledWith("5");
      expect(woodyToast.showSuccessToast).toHaveBeenCalledWith("Usuária desbloqueada.");
      expect(socialGraphEvents.dispatchBlockRelationshipChanged).toHaveBeenCalledWith("5");
    });
  });

  it("mostra mensagem quando busca não encontra resultados", async () => {
    vi.mocked(userBlockService.fetchBlockedUsersPage)
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 20,
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      })
      .mockResolvedValueOnce({
        items: [],
        page: 1,
        pageSize: 20,
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });

    const user = userEvent.setup();
    render(<BlockedUsersDialog open onOpenChange={vi.fn()} />);

    await screen.findByText("Nenhuma usuária bloqueada.");
    await user.type(screen.getByPlaceholderText("Buscar por nome ou @"), "xyz");

    expect(await screen.findByText("Nenhum perfil bloqueado encontrado.")).toBeInTheDocument();
  });
});
