import { useContext } from "react";
import { PasswordResetContext } from "./PasswordResetContext";

export function usePasswordResetFlow() {
  const ctx = useContext(PasswordResetContext);
  if (!ctx) {
    throw new Error("usePasswordResetFlow must be used within PasswordResetProvider");
  }
  return ctx;
}
