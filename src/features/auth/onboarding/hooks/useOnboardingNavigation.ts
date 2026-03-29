import { useNavigate } from "react-router-dom";
import { ONBOARDING_TOTAL_STEPS } from "../constants";
import { onboardingStepPath } from "../onboardingPaths";
import { useOnboardingStepFromLocation } from "./useOnboardingStepFromLocation";

export function useOnboardingNavigation() {
  const navigate = useNavigate();
  const step = useOnboardingStepFromLocation();

  const goToStep = (next: number) => {
    navigate(onboardingStepPath(next));
  };

  const goNext = () => {
    if (step == null || step >= ONBOARDING_TOTAL_STEPS) return;
    goToStep(step + 1);
  };

  const goBack = () => {
    if (step == null || step <= 1) {
      navigate("/auth");
      return;
    }
    goToStep(step - 1);
  };

  return { step, goNext, goBack, goToStep, navigate };
}
