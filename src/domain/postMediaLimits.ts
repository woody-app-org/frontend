/** Espelho dos limites do backend (UX); o servidor é a fonte de verdade. */
export const POST_COMPOSER_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const POST_COMPOSER_VIDEO_MAX_BYTES = 100 * 1024 * 1024;
export const POST_COMPOSER_VIDEO_MAX_DURATION_SEC = 120;
/** Máximo de imagens por publicação (imagem e vídeo são mutuamente exclusivos). */
export const POST_COMPOSER_IMAGES_MAX_COUNT = 6;

const units = ["B", "KB", "MB", "GB"];

export function formatFileSize(bytes: number): string {
  let v = Math.max(0, bytes);
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  return `${u === 0 ? Math.round(v) : v < 10 ? v.toFixed(1) : Math.round(v)} ${units[u]}`;
}
