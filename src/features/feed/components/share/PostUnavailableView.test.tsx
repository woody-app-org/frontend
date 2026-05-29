import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PostUnavailableView } from "./PostUnavailableView";

describe("PostUnavailableView", () => {
  it("mostra mensagem genérica sem revelar motivo", () => {
    render(
      <MemoryRouter>
        <PostUnavailableView />
      </MemoryRouter>
    );

    expect(screen.getByText("Este conteúdo não está disponível.")).toBeInTheDocument();
    expect(screen.queryByText(/comunidade privada/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/bloquead/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/deletad/i)).not.toBeInTheDocument();
  });
});
