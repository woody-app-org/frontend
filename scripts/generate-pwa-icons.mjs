/**
 * Gera ícones PWA a partir do mascote oficial (src/assets/new-cat.png).
 * - iOS: woody-icon-180 (apple-touch-icon no index.html) — fundo creme
 * - Android/manifest: woody-android-*
 * - Raiz public/: fallbacks Woody (substitui ícones template Vite)
 * Executar: npm run pwa:icons
 */
import sharp from "sharp";
import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const source = path.join(root, "src/assets/new-cat.png");
const outDir = path.join(root, "public/icons");
const publicDir = path.join(root, "public");

const iosBackground = { r: 244, g: 242, b: 236, alpha: 1 };
const androidBackground = { r: 255, g: 255, b: 255, alpha: 1 };

const variants = [
  { file: "woody-icon-180.png", size: 180, paddingRatio: 0.1, background: iosBackground },
  { file: "woody-android-192.png", size: 192, paddingRatio: 0.12, background: androidBackground },
  { file: "woody-android-512.png", size: 512, paddingRatio: 0.12, background: androidBackground },
  {
    file: "woody-android-maskable-512.png",
    size: 512,
    paddingRatio: 0.28,
    background: androidBackground,
  },
  { file: "favicon-16x16.png", size: 16, paddingRatio: 0.08, background: androidBackground },
  { file: "favicon-32x32.png", size: 32, paddingRatio: 0.1, background: androidBackground },
];

async function renderIcon({ file, size, paddingRatio, background }, targetDir = outDir) {
  const pad = Math.round(size * paddingRatio);
  const inner = size - pad * 2;
  const mascot = await sharp(source)
    .resize(inner, inner, { fit: "contain", background })
    .png()
    .toBuffer();

  const outPath = path.join(targetDir, file);
  await sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: mascot, gravity: "center" }])
    .png()
    .toFile(outPath);

  console.log(`✓ ${path.relative(root, outPath)} (${size}×${size})`);
}

async function writeFaviconIco() {
  const pad = 4;
  const inner = 48 - pad * 2;
  const mascot = await sharp(source)
    .resize(inner, inner, { fit: "contain", background: androidBackground })
    .png()
    .toBuffer();

  const outPath = path.join(publicDir, "favicon.ico");
  await sharp({
    create: { width: 48, height: 48, channels: 4, background: androidBackground },
  })
    .composite([{ input: mascot, gravity: "center" }])
    .png()
    .toFile(outPath);

  console.log(`✓ ${path.relative(root, outPath)} (48×48 PNG-as-ICO fallback)`);
}

await mkdir(outDir, { recursive: true });

for (const variant of variants) {
  const dir = variant.file.startsWith("favicon-") ? publicDir : outDir;
  await renderIcon(variant, dir);
}

await writeFaviconIco();

await copyFile(path.join(outDir, "woody-android-192.png"), path.join(publicDir, "icon-192.png"));
await copyFile(path.join(outDir, "woody-android-512.png"), path.join(publicDir, "icon-512.png"));
await copyFile(path.join(outDir, "woody-icon-180.png"), path.join(publicDir, "apple-touch-icon.png"));

console.log("✓ public/icon-192.png (cópia woody-android-192)");
console.log("✓ public/icon-512.png (cópia woody-android-512)");
console.log("✓ public/apple-touch-icon.png (cópia woody-icon-180, fallback raiz)");
console.log("Ícones PWA gerados.");
