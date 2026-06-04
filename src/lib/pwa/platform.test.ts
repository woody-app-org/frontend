import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  isAndroid,
  isIOS,
  isIOSSafari,
  isSamsungInternet,
  isDisplayModeStandalone,
  isPwaInstalled,
  readInstalledFromStorage,
  markInstalledInStorage,
} from "./platform";
import { PWA_INSTALLED_STORAGE_KEY } from "./types";

describe("pwa platform", () => {
  const originalNavigator = global.navigator;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.stubGlobal("navigator", originalNavigator);
    window.matchMedia = originalMatchMedia;
  });

  it("detecta iOS pelo user agent", () => {
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      platform: "iPhone",
      maxTouchPoints: 5,
      standalone: false,
    });
    expect(isIOS()).toBe(true);
    expect(isAndroid()).toBe(false);
  });

  it("detecta Android", () => {
    vi.stubGlobal("navigator", {
      userAgent: "Mozilla/5.0 (Linux; Android 14)",
      platform: "Linux",
      maxTouchPoints: 5,
      standalone: false,
    });
    expect(isAndroid()).toBe(true);
    expect(isIOS()).toBe(false);
  });

  it("detecta Samsung Internet", () => {
    vi.stubGlobal("navigator", {
      userAgent:
        "Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36",
      platform: "Linux",
      maxTouchPoints: 5,
      standalone: false,
    });
    expect(isSamsungInternet()).toBe(true);
    expect(isAndroid()).toBe(true);
  });

  it("identifica Safari no iOS", () => {
    vi.stubGlobal("navigator", {
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      platform: "iPhone",
      maxTouchPoints: 5,
      standalone: false,
    });
    expect(isIOSSafari()).toBe(true);
  });

  it("detecta modo standalone via matchMedia", () => {
    window.matchMedia = vi.fn((query: string) => ({
      matches: query.includes("display-mode: standalone"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    vi.stubGlobal("navigator", {
      userAgent: "test",
      platform: "test",
      maxTouchPoints: 0,
      standalone: false,
    });

    expect(isDisplayModeStandalone()).toBe(true);
    expect(isPwaInstalled()).toBe(true);
  });

  it("persiste instalação em localStorage", () => {
    expect(readInstalledFromStorage()).toBe(false);
    markInstalledInStorage();
    expect(localStorage.getItem(PWA_INSTALLED_STORAGE_KEY)).toBe("1");
    expect(readInstalledFromStorage()).toBe(true);
  });
});
