import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../../..");

describe("PWA assets estáticos", () => {
  it("index.html referencia manifest e preserva apple-touch-icon iOS", () => {
    const html = readFileSync(path.join(root, "index.html"), "utf8");
    expect(html).toContain('href="/manifest.webmanifest"');
    expect(html).toContain('href="/icons/woody-icon-180.png"');
    expect(html).not.toContain("woody-android-180");
    expect(html).toContain('name="apple-mobile-web-app-title" content="Woody"');
    expect(html).toContain('name="application-name" content="Woody"');
  });

  it("manifest.webmanifest define ícones Android para Chromium", () => {
    const raw = readFileSync(path.join(root, "public/manifest.webmanifest"), "utf8");
    const manifest = JSON.parse(raw) as {
      name: string;
      short_name: string;
      background_color: string;
      icons: { src: string; purpose?: string; sizes: string }[];
    };
    expect(manifest.name).toBe("Woody");
    expect(manifest.short_name).toBe("Woody");
    expect(manifest.background_color).toBe("#ffffff");
    const srcs = manifest.icons.map((i) => i.src);
    expect(srcs).toContain("/icons/woody-android-192.png");
    expect(srcs).toContain("/icons/woody-android-512.png");
    expect(srcs).toContain("/icons/woody-android-maskable-512.png");
    const maskable = manifest.icons.find((i) => i.purpose === "maskable");
    expect(maskable?.sizes).toBe("512x512");
  });

  it("arquivos PNG Android existem em public/icons", () => {
    for (const file of [
      "woody-icon-180.png",
      "woody-android-192.png",
      "woody-android-512.png",
      "woody-android-maskable-512.png",
    ]) {
      expect(existsSync(path.join(root, "public/icons", file))).toBe(true);
    }
  });
});
