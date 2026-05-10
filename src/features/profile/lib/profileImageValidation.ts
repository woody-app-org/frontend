/**
 * Validação de imagens para avatar/banner (crop antes do upload).
 * Alinhado a formatos aceites pelo backend; bloqueia HEIC/HEIF e tipos incertos.
 */

/** Valor de `accept` nos inputs de ficheiro — evita `image/*` (Safari oferece HEIC). */
export const PROFILE_IMAGE_ACCEPT_ATTR =
  "image/jpeg,image/png,image/webp,image/gif";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const HEIC_LIKE = /^image\/hei[cf]$/i;

const EXT_OK = /\.(jpe?g|png|webp|gif)$/i;
const EXT_HEIC = /\.(heic|heif)$/i;

export const PROFILE_IMAGE_INCOMPATIBLE_MSG =
  "Este formato de imagem não é compatível. Envie uma imagem JPG, PNG ou WebP.";

function normalizedMime(file: File): string {
  const raw = file.type?.trim() ?? "";
  return raw.split(";")[0].trim().toLowerCase();
}

/**
 * @returns `ok` se o ficheiro pode entrar no crop; caso contrário mensagem para toast/UI.
 */
export function validateProfileImageForCrop(
  file: File
): { ok: true } | { ok: false; message: string } {
  const name = file.name ?? "";
  if (EXT_HEIC.test(name)) {
    return { ok: false, message: PROFILE_IMAGE_INCOMPATIBLE_MSG };
  }

  const mime = normalizedMime(file);
  if (mime && HEIC_LIKE.test(mime)) {
    return { ok: false, message: PROFILE_IMAGE_INCOMPATIBLE_MSG };
  }

  if (mime && ALLOWED_MIME.has(mime)) {
    return { ok: true };
  }

  // Tipo vazio ou genérico (comum em Safari/iOS): só confiar na extensão.
  if (!mime || mime === "application/octet-stream") {
    if (EXT_OK.test(name)) {
      return { ok: true };
    }
    return { ok: false, message: PROFILE_IMAGE_INCOMPATIBLE_MSG };
  }

  if (mime.startsWith("image/")) {
    return { ok: false, message: PROFILE_IMAGE_INCOMPATIBLE_MSG };
  }

  return { ok: false, message: PROFILE_IMAGE_INCOMPATIBLE_MSG };
}
