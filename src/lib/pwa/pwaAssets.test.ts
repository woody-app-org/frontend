import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../../..");

describe("PWA assets estáticos", () => {
  it("index.html referencia manifest e ícones Woody", () => {
    const html = readFileSync(path.join(root, "index.html"), "utf8");
    expect(html).toContain('href="/manifest.webmanifest"');
    expect(html).toContain('href="/icons/woody-icon-180.png"');
    expect(html).toContain('name="apple-mobile-web-app-title" content="Woody"');
    expect(html).toContain('name="application-name" content="Woody"');
  });

  it("manifest.webmanifest define ícones oficiais", () => {
    const raw = readFileSync(path.join(root, "public/manifest.webmanifest"), "utf8");
    const manifest = JSON.parse(raw) as {
      name: string;
      short_name: string;
      icons: { src: string; purpose?: string }[];
    };
    expect(manifest.name).toBe("Woody");
    expect(manifest.short_name).toBe("Woody");
    const srcs = manifest.icons.map((i) => i.src);
    expect(srcs).toContain("/icons/woody-icon-192.png");
    expect(srcs).toContain("/icons/woody-icon-512.png");
    expect(srcs).toContain("/icons/woody-maskable-512.png");
  });

  it("arquivos PNG dos ícones existem em public/icons", () => {
    for (const file of [
      "woody-icon-180.png",
      "woody-icon-192.png",
      "woody-icon-512.png",
      "woody-maskable-512.png",
    ]) {
      expect(existsSync(path.join(root, "public/icons", file))).toBe(true);
    }
  });
});
