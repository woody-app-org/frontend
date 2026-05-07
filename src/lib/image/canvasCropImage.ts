import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", () => reject(new Error("Falha ao carregar a imagem para recorte.")));
    img.decoding = "async";
    img.src = src;
  });
}

/** Detecta suporte a WebP no canvas; caso contrário usa JPEG. */
export function getPreferredAvatarOutput(): { mimeType: string; fileName: string; quality: number } {
  try {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    const u = c.toDataURL("image/webp");
    if (u.startsWith("data:image/webp")) {
      return { mimeType: "image/webp", fileName: "avatar.webp", quality: 0.9 };
    }
  } catch {
    /* ignore */
  }
  return { mimeType: "image/jpeg", fileName: "avatar.jpg", quality: 0.88 };
}

/**
 * Extrai a região `pixelCrop` da imagem referenciada por `imageSrc` (URL object, https, data)
 * e redesenha num canvas quadrático `outputSize` × `outputSize`.
 */
export async function cropImageToSquareBlob(
  imageSrc: string,
  pixelCrop: Area,
  options?: { outputSize?: number; mimeType?: string; quality?: number }
): Promise<Blob> {
  const outputSize = options?.outputSize ?? 512;
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível preparar a exportação da imagem.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const { x, y, width, height } = pixelCrop;
  ctx.drawImage(image, x, y, width, height, 0, 0, outputSize, outputSize);

  const preferred = getPreferredAvatarOutput();
  const mimeType = options?.mimeType ?? preferred.mimeType;
  const quality = options?.quality ?? preferred.quality;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar o arquivo da foto."))),
      mimeType,
      quality
    );
  });
}

export function blobToAvatarFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type || "image/jpeg" });
}
