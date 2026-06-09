import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { MobileQrNarrativeSection } from "./MobileQrNarrativeSection";

vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue("data:image/png;base64,test"),
  },
}));

vi.mock("../motion/ScrollReveal", () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("../pwa/PwaInstallSheet", () => ({
  PwaInstallSheet: ({ open }: { open: boolean }) =>
    open ? <div data-testid="install-sheet">Instalar</div> : null,
}));

describe("MobileQrNarrativeSection", () => {
  it("abre o modal ao clicar no QR", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MobileQrNarrativeSection embedInLanding />
      </MemoryRouter>
    );

    expect(screen.queryByTestId("install-sheet")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("pwa-qr-install-trigger"));

    expect(screen.getByTestId("install-sheet")).toBeInTheDocument();
  });
});
