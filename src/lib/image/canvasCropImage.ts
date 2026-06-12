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

/** Maior dimensão (px) aceita pelo preview de recorte; acima disso a imagem é reduzida. */
const MAX_CROP_PREVIEW_DIMENSION = 2048;

/**
 * Prepara o ficheiro escolhido para entrar no `ImageCropDialog`.
 *
 * Fotos de câmeras Android costumam vir em resoluções muito altas (4000px+) e/ou
 * com orientação EXIF. Em alguns navegadores mobile, passar o `blob:` original
 * direto pro `react-easy-crop` faz o `<img>` interno falhar a decodificação
 * silenciosamente — o diálogo abre, mas a área de recorte fica em branco.
 *
 * Usa `createImageBitmap` (com `imageOrientation: "from-image"`, que já corrige
 * a rotação EXIF) para redesenhar a imagem num canvas menor quando necessário.
 * Em navegadores sem suporte, cai de volta no `URL.createObjectURL(file)` original
 * (comportamento anterior).
 *
 * @returns object URL pronto para `imageSrc`; quem chama deve `URL.revokeObjectURL` depois.
 */
export async function prepareImageForCrop(file: File): Promise<string> {
  if (typeof createImageBitmap !== "function") {
    return URL.createObjectURL(file);
  }

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

    const { width, height } = bitmap;
    if (width <= MAX_CROP_PREVIEW_DIMENSION && height <= MAX_CROP_PREVIEW_DIMENSION) {
      return URL.createObjectURL(file);
    }

    const scale = MAX_CROP_PREVIEW_DIMENSION / Math.max(width, height);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return URL.createObjectURL(file);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92)
    );
    return blob ? URL.createObjectURL(blob) : URL.createObjectURL(file);
  } catch {
    return URL.createObjectURL(file);
  } finally {
    bitmap?.close();
  }
}

function detectWebpCanvasSupport(): boolean {
  try {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    return c.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

/** Detecta suporte a WebP no canvas; caso contrário usa JPEG. */
export function getPreferredAvatarOutput(): { mimeType: string; fileName: string; quality: number } {
  if (detectWebpCanvasSupport()) {
    return { mimeType: "image/webp", fileName: "avatar.webp", quality: 0.9 };
  }
  return { mimeType: "image/jpeg", fileName: "avatar.jpg", quality: 0.88 };
}

/** Saída para capa/banner (mesma lógica WebP/JPEG, nome de ficheiro distinto). */
export function getPreferredCoverOutput(): { mimeType: string; fileName: string; quality: number } {
  if (detectWebpCanvasSupport()) {
    return { mimeType: "image/webp", fileName: "cover.webp", quality: 0.9 };
  }
  return { mimeType: "image/jpeg", fileName: "cover.jpg", quality: 0.88 };
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

/**
 * Extrai `pixelCrop` para um canvas retangular `outputWidth` × `outputHeight` (ex.: capa de perfil).
 */
export async function cropImageToRectBlob(
  imageSrc: string,
  pixelCrop: Area,
  options: { outputWidth: number; outputHeight: number; mimeType?: string; quality?: number }
): Promise<Blob> {
  const { outputWidth, outputHeight } = options;
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível preparar a exportação da imagem.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const { x, y, width, height } = pixelCrop;
  ctx.drawImage(image, x, y, width, height, 0, 0, outputWidth, outputHeight);

  const preferred = getPreferredCoverOutput();
  const mimeType = options.mimeType ?? preferred.mimeType;
  const quality = options.quality ?? preferred.quality;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Falha ao gerar o arquivo da capa."))),
      mimeType,
      quality
    );
  });
}

export function blobToImageFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type || "image/jpeg" });
}

/** @deprecated Use `blobToImageFile` */
export const blobToAvatarFile = blobToImageFile;
