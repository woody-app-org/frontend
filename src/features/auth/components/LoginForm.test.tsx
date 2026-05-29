import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  it("link Esqueci minha senha navega para /auth/forgot-password", () => {
    render(
      <MemoryRouter>
        <LoginForm onSubmit={vi.fn()} isSubmitting={false} errorMessage={null} />
      </MemoryRouter>
    );

    const link = screen.getByRole("link", { name: /esqueci minha senha/i });
    expect(link).toHaveAttribute("href", "/auth/forgot-password");
  });
});
