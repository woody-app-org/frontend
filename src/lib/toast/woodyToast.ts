import { createElement, useMemo } from "react";
import { CircleCheck } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { router } from "@/app/router";
import { postPathForPost } from "@/features/feed/lib/postPaths";
import { getApiErrorMessage } from "@/lib/api";

const DEFAULT_DURATION = 4500;
const ERROR_DURATION = 6500;
const POST_CREATED_TOAST_ID = "woody-post-created";
/** Alinhado ao breakpoint `md` do Tailwind (mobile = até 767px). */
const MOBILE_MAX_WIDTH_MEDIA = "(max-width: 767px)";
/** Acima da `MobileBottomNav` (~4.5rem) + safe area. */
const MOBILE_POST_CREATED_BOTTOM_OFFSET =
  "calc(4.5rem + env(safe-area-inset-bottom, 0px) + 0.75rem)";

export type PostCreatedToastTarget = { publicId?: string | null; id: string };

function isMobileViewport(): boolean {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_MAX_WIDTH_MEDIA).matches;
}

function navigateToCreatedPost(post: PostCreatedToastTarget): void {
  const path = postPathForPost(post);
  try {
    void router.navigate(path).catch(() => {
      if (typeof window !== "undefined") window.location.assign(path);
    });
  } catch {
    if (typeof window !== "undefined") window.location.assign(path);
  }
}

/** Mensagem curta quando o backend não devolve texto útil. */
export const WOODY_TOAST_FALLBACK =
  "Não foi possível concluir a ação. Tente novamente.";

export function showSuccessToast(message: string, options?: { id?: string; duration?: number }) {
  sonnerToast.success(message, {
    id: options?.id,
    duration: options?.duration ?? DEFAULT_DURATION,
  });
}

/**
 * Feedback após criar publicação: título, descrição e CTA opcional para o detalhe do post.
 * No mobile o toast fica em baixo, acima da bottom nav.
 */
export function showPostCreatedToast(post: PostCreatedToastTarget) {
  const mobile = isMobileViewport();

  sonnerToast.success("Publicado", {
    id: POST_CREATED_TOAST_ID,
    description: "Seu post já está no ar.",
    duration: DEFAULT_DURATION,
    position: mobile ? "bottom-center" : "top-center",
    style: mobile ? { marginBottom: MOBILE_POST_CREATED_BOTTOM_OFFSET } : undefined,
    icon: createElement(CircleCheck, {
      className: "size-4 shrink-0 text-[var(--woody-nav)]",
      "aria-hidden": true,
    }),
    action: {
      label: "Ver post",
      onClick: () => {
        sonnerToast.dismiss(POST_CREATED_TOAST_ID);
        navigateToCreatedPost(post);
      },
    },
    classNames: {
      toast: "!gap-3",
      actionButton:
        "!min-h-10 !rounded-xl !px-3 !text-sm !font-semibold !text-[var(--woody-nav)] !bg-[var(--woody-nav)]/10 hover:!bg-[var(--woody-nav)]/16 focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[var(--woody-nav)]/25",
    },
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
      postCreated: showPostCreatedToast,
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
