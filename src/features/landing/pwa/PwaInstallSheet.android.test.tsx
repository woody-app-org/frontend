import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { PwaInstallSheet } from "./PwaInstallSheet";

const usePwaInstallMock = vi.fn();
const installFn = vi.fn();

const { isChromeAndroid, isSamsungInternet, isEdgeAndroid, isFirefoxAndroid } = vi.hoisted(() => ({
  isChromeAndroid: vi.fn(() => true),
  isSamsungInternet: vi.fn(() => false),
  isEdgeAndroid: vi.fn(() => false),
  isFirefoxAndroid: vi.fn(() => false),
}));

vi.mock("@/lib/pwa/usePwaInstall", () => ({
  usePwaInstall: () => usePwaInstallMock(),
}));

vi.mock("@/lib/pwa/platform", () => ({
  isIOS: vi.fn(() => false),
  isAndroid: vi.fn(() => true),
  isIOSSafari: vi.fn(() => false),
  isIOSNonSafari: vi.fn(() => false),
  isSamsungInternet,
  isChromeAndroid,
  isEdgeAndroid,
  isFirefoxAndroid,
  isMobileViewport: vi.fn(() => true),
}));

vi.mock("@/lib/toast", () => ({
  showSuccessToast: vi.fn(),
  showInfoToast: vi.fn(),
}));

describe("PwaInstallSheet Android", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isChromeAndroid.mockReturnValue(true);
    isSamsungInternet.mockReturnValue(false);
    isEdgeAndroid.mockReturnValue(false);
    isFirefoxAndroid.mockReturnValue(false);
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
  });

  it("com deferredPrompt mostra botão Instalar Woody", async () => {
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

    await user.click(screen.getByRole("button", { name: /instalar woody/i }));
    expect(installFn).toHaveBeenCalled();
  });

  it("Chrome Android sem prompt mostra passos numerados do Chrome", () => {
    render(
      <MemoryRouter>
        <PwaInstallSheet open onOpenChange={vi.fn()} />
      </MemoryRouter>
    );
    expect(screen.getByText(/adicionar woody à tela inicial/i)).toBeInTheDocument();
    expect(screen.getByText(/três pontinhos/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /instalar woody/i })).not.toBeInTheDocument();
  });

  it("Samsung Internet sem prompt mostra passos Samsung", () => {
    isChromeAndroid.mockReturnValue(false);
    isSamsungInternet.mockReturnValue(true);

    render(
      <MemoryRouter>
        <PwaInstallSheet open onOpenChange={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText(/adicionar página a/i)).toBeInTheDocument();
  });
});
