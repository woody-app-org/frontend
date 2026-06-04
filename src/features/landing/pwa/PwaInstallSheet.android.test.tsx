import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { PwaInstallSheet } from "./PwaInstallSheet";

const usePwaInstallMock = vi.fn();
const installFn = vi.fn();

vi.mock("@/lib/pwa/usePwaInstall", () => ({
  usePwaInstall: () => usePwaInstallMock(),
}));

vi.mock("@/lib/pwa/platform", () => ({
  isIOS: vi.fn(() => false),
  isAndroid: vi.fn(() => true),
  isIOSSafari: vi.fn(() => false),
  isIOSNonSafari: vi.fn(() => false),
  isSamsungInternet: vi.fn(() => false),
  isMobileViewport: vi.fn(() => true),
}));

vi.mock("@/lib/toast", () => ({
  showSuccessToast: vi.fn(),
  showInfoToast: vi.fn(),
}));

describe("PwaInstallSheet Android", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePwaInstallMock.mockReturnValue({
      canPromptInstall: false,
      isInstalled: false,
      install: installFn,
    });
  });

  it("não mostra instruções iOS", () => {
    render(
      <MemoryRouter>
        <PwaInstallSheet open onOpenChange={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.queryByText(/compartilhar do safari/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/não há instalação automática no iphone/i)).not.toBeInTheDocument();
  });

  it("com deferredPrompt mostra botão Instalar Woody e chama install", async () => {
    usePwaInstallMock.mockReturnValue({
      canPromptInstall: true,
      isInstalled: false,
      install: installFn.mockResolvedValue("accepted"),
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PwaInstallSheet open onOpenChange={vi.fn()} />
      </MemoryRouter>
    );

    const btn = screen.getByRole("button", { name: /instalar woody/i });
    expect(btn).toBeInTheDocument();
    await user.click(btn);
    expect(installFn).toHaveBeenCalled();
  });

  it("sem deferredPrompt mostra fallback Android", () => {
    render(
      <MemoryRouter>
        <PwaInstallSheet open onOpenChange={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByText(/adicionar woody ao celular/i)).toBeInTheDocument();
    expect(screen.getByText(/instalação automática/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /instalar woody/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copiar link/i })).toBeInTheDocument();
  });
});
