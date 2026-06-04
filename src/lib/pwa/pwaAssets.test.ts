import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../../..");

describe("PWA assets estáticos", () => {
  it("index.html referencia manifest e preserva apple-touch-icon iOS", () => {
    const html = readFileSync(path.join(root, "index.html"), "utf8");
    expect(html).toContain('href="/manifest.webmanifest"');
    expect(html).toContain('href="/icons/woody-icon-180.png"');
    expect(html).not.toContain("site.webmanifest");
    expect(html).toContain('name="apple-mobile-web-app-title" content="Woody"');
  });

  it("manifest.webmanifest define ícones Android e id estável", () => {
    const raw = readFileSync(path.join(root, "public/manifest.webmanifest"), "utf8");
    const manifest = JSON.parse(raw) as {
      id: string;
      name: string;
      icons: { src: string; purpose?: string }[];
    };
    expect(manifest.id).toBe("/");
    expect(manifest.name).toBe("Woody");
    const srcs = manifest.icons.map((i) => i.src);
    expect(srcs).toContain("/icons/woody-android-192.png");
    expect(srcs).toContain("/icons/woody-android-512.png");
    expect(srcs).toContain("/icons/woody-android-maskable-512.png");
  });

  it("ícones Android e fallbacks Woody existem", () => {
    for (const file of [
      "icons/woody-icon-180.png",
      "icons/woody-android-192.png",
      "icons/woody-android-512.png",
      "icons/woody-android-maskable-512.png",
      "icon-192.png",
      "icon-512.png",
      "favicon-16x16.png",
      "favicon-32x32.png",
      "favicon.ico",
    ]) {
      expect(existsSync(path.join(root, "public", file))).toBe(true);
    }
    const legacySize = readFileSync(path.join(root, "public/icon-192.png")).length;
    expect(legacySize).toBeGreaterThan(5000);
    expect(legacySize).toBeLessThan(20000);
  });

  it("site.webmanifest duplicado foi removido", () => {
    expect(existsSync(path.join(root, "public/site.webmanifest"))).toBe(false);
  });
});
