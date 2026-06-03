import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { UserAccountMenu } from "./UserAccountMenu";

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "1",
      username: "maria",
      name: "Maria",
      email: "maria@example.com",
      role: "User",
      verificationStatus: "Approved",
    },
    logoutAsync: vi.fn(),
  }),
}));

vi.mock("@/features/auth/components/LogoutConfirmationDialog", () => ({
  LogoutConfirmationDialog: () => null,
}));

describe("UserAccountMenu", () => {
  it("mostra item Suporte com link para /support", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <UserAccountMenu />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: /menu da conta/i }));
    const item = screen.getByRole("menuitem", { name: /suporte/i });
    expect(item).toHaveAttribute("href", "/support");
  });
});
