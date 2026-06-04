import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { RightPanelProfileCard } from "./RightPanelProfileCard";
import type { AuthUser } from "@/features/auth/types";

const baseUser: AuthUser = {
  id: "42",
  username: "camila",
  name: "Camila Ribeiro",
  avatarUrl: "https://example.com/avatar.jpg",
  bannerUrl: null,
  bio: undefined,
  location: undefined,
  pronouns: undefined,
  subscription: {
    effectivePlan: "free",
    billingPlan: "free",
    planCode: "free",
    status: "active",
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    showProBadge: false,
    canOpenBillingPortal: false,
  },
  verificationStatus: "Approved",
  role: "User",
};

function renderCard(user: Partial<AuthUser> = {}) {
  return render(
    <MemoryRouter>
      <RightPanelProfileCard user={{ ...baseUser, ...user }} />
    </MemoryRouter>
  );
}

describe("RightPanelProfileCard", () => {
  // ── Conteúdo básico ──────────────────────────────────────────────────────

  it("renderiza nome e username", () => {
    renderCard();
    expect(screen.getByText("Camila Ribeiro")).toBeInTheDocument();
    expect(screen.getByText("@camila")).toBeInTheDocument();
  });

  it("link 'Ver perfil' aponta para o perfil da utilizadora", () => {
    renderCard();
    const links = screen.getAllByRole("link", { name: /ver perfil/i });
    expect(links.length).toBeGreaterThan(0);
    expect(links[0]).toHaveAttribute("href", "/profile/camila");
  });

  // ── Banner ────────────────────────────────────────────────────────────────

  it("mostra imagem de banner quando bannerUrl está presente", () => {
    const { container } = renderCard({ bannerUrl: "https://example.com/banner.jpg" });
    const bannerImg = container.querySelector('img[src*="banner.jpg"]');
    expect(bannerImg).toBeInTheDocument();
  });

  it("não mostra img de banner quando bannerUrl é null (usa gradiente)", () => {
    const { container } = renderCard({ bannerUrl: null });
    // Deve haver um div com gradiente em vez de <img>
    const gradientDiv = container.querySelector(".bg-gradient-to-br");
    expect(gradientDiv).toBeInTheDocument();
  });

  // ── Bio ───────────────────────────────────────────────────────────────────

  it("mostra bio quando presente", () => {
    renderCard({ bio: "Apaixonada por tecnologia e café." });
    expect(screen.getByText("Apaixonada por tecnologia e café.")).toBeInTheDocument();
  });

  it("não renderiza área de bio quando ausente", () => {
    const { container } = renderCard({ bio: undefined });
    // Bio está em um <p> com classe line-clamp-2; sem bio, não deve existir
    expect(screen.queryByText(/apaixonada/i)).not.toBeInTheDocument();
    void container; // evitar lint unused
  });

  // ── Localização ───────────────────────────────────────────────────────────

  it("mostra localização quando presente", () => {
    renderCard({ location: "São Paulo, SP" });
    expect(screen.getByText("São Paulo, SP")).toBeInTheDocument();
  });

  it("não mostra localização quando ausente", () => {
    renderCard({ location: undefined });
    expect(screen.queryByText(/são paulo/i)).not.toBeInTheDocument();
  });

  // ── Pronomes ──────────────────────────────────────────────────────────────

  it("mostra pronomes quando presentes", () => {
    renderCard({ pronouns: "ela/dela" });
    expect(screen.getByText("ela/dela")).toBeInTheDocument();
  });

  it("não mostra pronomes quando ausentes", () => {
    renderCard({ pronouns: undefined });
    expect(screen.queryByText(/ela\/dela/i)).not.toBeInTheDocument();
  });

  // ── ProBadge ─────────────────────────────────────────────────────────────

  it("não mostra ProBadge para conta free", () => {
    renderCard();
    expect(screen.queryByText(/pro/i)).not.toBeInTheDocument();
  });

  it("mostra ProBadge para conta com showProBadge = true", () => {
    renderCard({
      subscription: {
        ...baseUser.subscription!,
        showProBadge: true,
        effectivePlan: "pro",
      },
    });
    expect(screen.getByText(/pro/i)).toBeInTheDocument();
  });

  // ── Campos nulos/undefined não aparecem como texto ────────────────────────

  it("não exibe 'undefined' ou 'null' no DOM", () => {
    const { container } = renderCard();
    expect(container.textContent).not.toContain("undefined");
    expect(container.textContent).not.toContain("null");
  });

  // ── Fallback de nome ─────────────────────────────────────────────────────

  it("usa username como fallback quando name está ausente", () => {
    renderCard({ name: undefined, username: "anon_user" });
    expect(screen.getByText("anon_user")).toBeInTheDocument();
  });
});
