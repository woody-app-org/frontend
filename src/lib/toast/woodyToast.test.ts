import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast as sonnerToast, type Action } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
  },
}));

vi.mock("@/app/router", () => ({
  router: { navigate: vi.fn(() => Promise.resolve()) },
}));

import { router } from "@/app/router";
import { showPostCreatedToast } from "./woodyToast";

function toastOptionsFromCall(index = 0) {
  return mockSuccess.mock.calls[index]?.[1];
}

function actionFromCall(index = 0): Action | undefined {
  const action = toastOptionsFromCall(index)?.action;
  if (action && typeof action === "object" && "onClick" in action) return action as Action;
  return undefined;
}

const mockSuccess = vi.mocked(sonnerToast.success);
const mockDismiss = vi.mocked(sonnerToast.dismiss);
const mockNavigate = vi.mocked(router.navigate);

describe("showPostCreatedToast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: query.includes("max-width: 767px"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("mostra título, descrição e ação Ver post", () => {
    showPostCreatedToast({ id: "42", publicId: "pst_test00000001" });

    expect(mockSuccess).toHaveBeenCalledOnce();
    expect(mockSuccess.mock.calls[0]?.[0]).toBe("Publicado");
    const options = toastOptionsFromCall();
    expect(options?.description).toBe("Seu post já está no ar.");
    expect(options?.id).toBe("woody-post-created");
    expect(actionFromCall()?.label).toBe("Ver post");
  });

  it("no mobile posiciona em baixo com margem acima da bottom nav", () => {
    showPostCreatedToast({ id: "42", publicId: "pst_test00000001" });

    const options = toastOptionsFromCall();
    expect(options?.position).toBe("bottom-center");
    expect(options?.style).toEqual({
      marginBottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px) + 0.75rem)",
    });
  });

  it("no desktop usa top-center", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );

    showPostCreatedToast({ id: "42", publicId: "pst_test00000001" });

    const options = toastOptionsFromCall();
    expect(options?.position).toBe("top-center");
    expect(options?.style).toBeUndefined();
  });

  it("Ver post navega para /posts/{publicId} e fecha o toast", () => {
    showPostCreatedToast({ id: "42", publicId: "pst_test00000001" });

    const onClick = actionFromCall()?.onClick;
    expect(onClick).toBeTypeOf("function");
    onClick?.({} as React.MouseEvent<HTMLButtonElement>);

    expect(mockDismiss).toHaveBeenCalledWith("woody-post-created");
    expect(mockNavigate).toHaveBeenCalledWith("/posts/pst_test00000001");
  });

  it("usa id interno quando publicId ausente", () => {
    showPostCreatedToast({ id: "99", publicId: null });

    actionFromCall()?.onClick?.({} as React.MouseEvent<HTMLButtonElement>);

    expect(mockNavigate).toHaveBeenCalledWith("/posts/99");
  });
});
