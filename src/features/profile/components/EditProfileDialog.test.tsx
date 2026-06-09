import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EditProfileDialog } from "./EditProfileDialog";
import { makeUserProfile } from "@/test/fixtures/profile";
import * as profileService from "../services/profile.service";

vi.mock("../services/profile.service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../services/profile.service")>();
  return {
    ...actual,
    updateProfile: vi.fn(),
  };
});

const mockUpdateProfile = vi.mocked(profileService.updateProfile);

describe("EditProfileDialog — username imutável", () => {
  it("mostra username como read-only", () => {
    render(
      <EditProfileDialog
        open
        onOpenChange={vi.fn()}
        profile={makeUserProfile({ username: "maria_silva" })}
        onSaved={vi.fn()}
      />
    );

    expect(screen.getByText("Username permanente")).toBeInTheDocument();
    expect(screen.getByText("@maria_silva")).toBeInTheDocument();
    expect(screen.getByText(/Seu @ é permanente e não pode ser alterado/i)).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /nome de usuário/i })).not.toBeInTheDocument();
  });

  it("salva perfil sem enviar username", async () => {
    const user = userEvent.setup();
    const onSaved = vi.fn();

    mockUpdateProfile.mockResolvedValue({
      ok: true,
      profile: makeUserProfile({ name: "Maria Nova", username: "maria_silva" }),
    });

    render(
      <EditProfileDialog
        open
        onOpenChange={vi.fn()}
        profile={makeUserProfile({ username: "maria_silva", name: "Maria" })}
        onSaved={onSaved}
      />
    );

    await user.clear(screen.getByLabelText("Nome de exibição"));
    await user.type(screen.getByLabelText("Nome de exibição"), "Maria Nova");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

    expect(mockUpdateProfile).toHaveBeenCalledWith(
      expect.any(String),
      expect.not.objectContaining({ username: expect.anything() })
    );
  });
});
