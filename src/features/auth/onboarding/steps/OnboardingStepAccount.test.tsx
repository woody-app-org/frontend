import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OnboardingStepAccount } from "./OnboardingStepAccount";
import { OnboardingProvider } from "../OnboardingContext";
import { MemoryRouter } from "react-router-dom";
import { USERNAME_PERMANENT_EMPHASIS, USERNAME_PERMANENT_LEAD } from "@/features/auth/lib/usernamePolicy";

vi.mock("../hooks/useOnboardingNavigation", () => ({
  useOnboardingNavigation: () => ({ goNext: vi.fn(), goBack: vi.fn() }),
}));

vi.mock("../services/onboardingAccountStep.service", () => ({
  persistAccountStep: vi.fn(),
  RegistrationAvailabilityConflictError: class extends Error {},
}));

function renderStep() {
  return render(
    <MemoryRouter>
      <OnboardingProvider>
        <OnboardingStepAccount />
      </OnboardingProvider>
    </MemoryRouter>
  );
}

describe("OnboardingStepAccount — username permanente", () => {
  it("mostra aviso de que username não poderá ser alterado", () => {
    renderStep();
    expect(screen.getByText(USERNAME_PERMANENT_LEAD, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(USERNAME_PERMANENT_EMPHASIS)).toBeInTheDocument();
  });

  it("marca username como obrigatório via label", () => {
    renderStep();
    expect(screen.getByText("Nome de usuário")).toBeInTheDocument();
  });
});
