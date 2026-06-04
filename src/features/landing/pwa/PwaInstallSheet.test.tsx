import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { PwaInstallSheet } from "./PwaInstallSheet";

const usePwaInstallMock = vi.fn();

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

function renderSheet(open = true) {
  const onOpenChange = vi.fn();
  render(
    <MemoryRouter>
      <PwaInstallSheet open={open} onOpenChange={onOpenChange} />
    </MemoryRouter>
  );
  return { onOpenChange };
}

describe("PwaInstallSheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePwaInstallMock.mockReturnValue({
      canPromptInstall: false,
      isInstalled: false,
      install: vi.fn(),
    });
  });

  it("mostra botão Instalar Woody quando beforeinstallprompt está disponível", () => {
    usePwaInstallMock.mockReturnValue({
      canPromptInstall: true,
      isInstalled: false,
      install: vi.fn().mockResolvedValue("accepted"),
    });

    renderSheet();
    expect(screen.getByRole("button", { name: /instalar woody/i })).toBeInTheDocument();
  });

  it("mostra estado já instalada", () => {
    usePwaInstallMock.mockReturnValue({
      canPromptInstall: false,
      isInstalled: true,
      install: vi.fn(),
    });

    renderSheet();
    expect(screen.getByText(/já está instalada/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /abrir woody/i })).toBeInTheDocument();
  });

  it("fecha ao clicar em Fechar", async () => {
    const user = userEvent.setup();
    const { onOpenChange } = renderSheet();

    await user.click(screen.getByRole("button", { name: /fechar/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
