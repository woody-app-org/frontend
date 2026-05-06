import { useMemo } from "react";
import { toast as sonnerToast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";

const DEFAULT_DURATION = 4500;
const ERROR_DURATION = 6500;

/** Mensagem curta quando o backend não devolve texto útil. */
export const WOODY_TOAST_FALLBACK =
  "Não foi possível concluir a ação. Tente novamente.";

export function showSuccessToast(message: string, options?: { id?: string; duration?: number }) {
  sonnerToast.success(message, {
    id: options?.id,
    duration: options?.duration ?? DEFAULT_DURATION,
  });
}

export function showErrorToast(message: string, options?: { id?: string; duration?: number }) {
  sonnerToast.error(message, {
    id: options?.id,
    duration: options?.duration ?? ERROR_DURATION,
  });
}

export function showWarningToast(message: string, options?: { id?: string; duration?: number }) {
  sonnerToast.warning(message, {
    id: options?.id,
    duration: options?.duration ?? DEFAULT_DURATION,
  });
}

export function showInfoToast(message: string, options?: { id?: string; duration?: number }) {
  sonnerToast.info(message, {
    id: options?.id,
    duration: options?.duration ?? DEFAULT_DURATION,
  });
}

/**
 * Erros de API ou `Error` já com mensagem amigável (via `getApiErrorMessage` nos serviços).
 */
export function showActionErrorToast(
  error: unknown,
  fallback: string = WOODY_TOAST_FALLBACK,
  options?: { id?: string }
) {
  const message =
    error instanceof Error ? error.message : getApiErrorMessage(error, fallback);
  showErrorToast(message, { id: options?.id ?? "woody-action-error" });
}

export function useToast() {
  return useMemo(
    () => ({
      success: showSuccessToast,
      error: showErrorToast,
      warning: showWarningToast,
      info: showInfoToast,
      actionError: showActionErrorToast,
      dismiss: sonnerToast.dismiss,
    }),
    []
  );
}

export { toast as rawToast } from "sonner";
