import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { makeUserProfile } from "@/test/fixtures/profile";

describe("ProfileHeader — bloqueio", () => {
  it("mostra menu de bloquear em perfil alheio", async () => {
    const user = userEvent.setup();
    const onBlockUser = vi.fn();

    render(
      <ProfileHeader
        profile={makeUserProfile()}
        isOwnProfile={false}
        onBlockUser={onBlockUser}
        followSlot={<button type="button">Seguir</button>}
      />
    );

    await user.click(screen.getByRole("button", { name: "Mais ações do perfil" }));
    await user.click(screen.getByRole("menuitem", { name: "Bloquear usuária" }));

    expect(onBlockUser).toHaveBeenCalledTimes(1);
  });

  it("não mostra opção de bloquear no próprio perfil", () => {
    render(
      <ProfileHeader
        profile={makeUserProfile()}
        isOwnProfile
        onEditProfile={vi.fn()}
      />
    );

    expect(screen.queryByText("Bloquear usuária")).not.toBeInTheDocument();
  });
});
