/**
 * Gera ícones PWA a partir do mascote oficial (src/assets/new-cat.png).
 * - iOS: woody-icon-180 (apple-touch-icon) — fundo creme, não alterar uso no index.html
 * - Android/manifest: woody-android-* — fundo branco + maskable com safe area ampla
 * Executar: npm run pwa:icons
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const source = path.join(root, "src/assets/new-cat.png");
const outDir = path.join(root, "public/icons");

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
];

async function renderIcon({ file, size, paddingRatio, background }) {
  const pad = Math.round(size * paddingRatio);
  const inner = size - pad * 2;
  const mascot = await sharp(source)
    .resize(inner, inner, { fit: "contain", background })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background },
  })
    .composite([{ input: mascot, gravity: "center" }])
    .png()
    .toFile(path.join(outDir, file));

  console.log(`✓ ${file} (${size}×${size})`);
}

await mkdir(outDir, { recursive: true });
for (const variant of variants) {
  await renderIcon(variant);
}

console.log("Ícones PWA gerados em public/icons/");
