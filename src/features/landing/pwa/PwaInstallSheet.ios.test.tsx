import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { PwaInstallSheet } from "./PwaInstallSheet";

vi.mock("@/lib/pwa/usePwaInstall", () => ({
  usePwaInstall: () => ({
    canPromptInstall: false,
    isInstalled: false,
    install: vi.fn(),
  }),
}));

vi.mock("@/lib/pwa/platform", () => ({
  isIOS: vi.fn(() => true),
  isAndroid: vi.fn(() => false),
  isIOSSafari: vi.fn(() => true),
  isIOSNonSafari: vi.fn(() => false),
  isMobileViewport: vi.fn(() => true),
}));

vi.mock("@/lib/toast", () => ({
  showSuccessToast: vi.fn(),
  showInfoToast: vi.fn(),
}));

describe("PwaInstallSheet iOS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mostra instruções de Adicionar à Tela de Início sem botão Instalar agora", () => {
    render(
      <MemoryRouter>
        <PwaInstallSheet open onOpenChange={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText(/adicionar woody à tela de início/i)).toBeInTheDocument();
    expect(screen.getByText(/compartilhar do safari/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /instalar agora/i })).not.toBeInTheDocument();
    expect(screen.getByText(/não há instalação automática no iphone/i)).toBeInTheDocument();
  });
});
