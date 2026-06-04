import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetInstallPromptStoreForTests,
  hasDeferredInstallPrompt,
  initInstallPromptCapture,
  subscribeInstallPrompt,
  triggerInstallPrompt,
} from "./installPromptStore";
import { PWA_INSTALLED_STORAGE_KEY } from "./types";

describe("installPromptStore", () => {
  beforeEach(() => {
    __resetInstallPromptStoreForTests();
    localStorage.clear();
  });

  it("captura beforeinstallprompt e expõe estado", () => {
    initInstallPromptCapture();
    const listener = vi.fn();
    subscribeInstallPrompt(listener);

    const event = new Event("beforeinstallprompt") as Event & {
      preventDefault: () => void;
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "accepted"; platform: string }>;
    };
    event.preventDefault = vi.fn();
    event.prompt = vi.fn().mockResolvedValue(undefined);
    event.userChoice = Promise.resolve({ outcome: "accepted", platform: "web" });

    window.dispatchEvent(event);

    expect(hasDeferredInstallPrompt()).toBe(true);
    expect(listener).toHaveBeenCalled();
  });

  it("triggerInstallPrompt chama prompt() após gesto simulado", async () => {
    initInstallPromptCapture();

    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = new Event("beforeinstallprompt") as Event & {
      preventDefault: () => void;
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "accepted"; platform: string }>;
    };
    event.preventDefault = vi.fn();
    event.prompt = prompt;
    event.userChoice = Promise.resolve({ outcome: "accepted", platform: "web" });
    window.dispatchEvent(event);

    const outcome = await triggerInstallPrompt();
    expect(prompt).toHaveBeenCalled();
    expect(outcome).toBe("accepted");
    expect(hasDeferredInstallPrompt()).toBe(false);
    expect(localStorage.getItem(PWA_INSTALLED_STORAGE_KEY)).toBe("1");
  });

  it("retorna unavailable sem deferredPrompt", async () => {
    initInstallPromptCapture();
    await expect(triggerInstallPrompt()).resolves.toBe("unavailable");
  });
});
