/**
 * Gera ícones PWA a partir do mascote oficial (src/assets/new-cat.png).
 * Executar: node scripts/generate-pwa-icons.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const source = path.join(root, "src/assets/new-cat.png");
const outDir = path.join(root, "public/icons");

/** Fundo da marca — alinhado ao manifest e à landing */
const background = { r: 244, g: 242, b: 236, alpha: 1 };

const variants = [
  { file: "woody-icon-180.png", size: 180, paddingRatio: 0.1 },
  { file: "woody-icon-192.png", size: 192, paddingRatio: 0.1 },
  { file: "woody-icon-512.png", size: 512, paddingRatio: 0.1 },
  /** Safe zone ~20% para ícones maskable (Android) */
  { file: "woody-maskable-512.png", size: 512, paddingRatio: 0.2 },
];

async function renderIcon({ file, size, paddingRatio }) {
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
