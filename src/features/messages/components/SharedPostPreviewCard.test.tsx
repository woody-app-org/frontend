import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { SharedPostPreviewCard } from "./SharedPostPreviewCard";

describe("SharedPostPreviewCard", () => {
  it("mostra card indisponível", () => {
    render(
      <MemoryRouter>
        <SharedPostPreviewCard preview={{ isUnavailable: true }} />
      </MemoryRouter>
    );
    expect(screen.getByText("Publicação indisponível.")).toBeInTheDocument();
  });

  it("mostra preview e link para post", () => {
    render(
      <MemoryRouter>
        <SharedPostPreviewCard
          preview={{
            isUnavailable: false,
            publicId: "pst_abc123",
            authorDisplayName: "Ana",
            contentPreview: "Olá mundo",
          }}
        />
      </MemoryRouter>
    );
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Olá mundo")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/posts/pst_abc123");
  });
});
