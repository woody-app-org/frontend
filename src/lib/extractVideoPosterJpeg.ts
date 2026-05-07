/**
 * Extrai um frame JPEG de um ficheiro de vídeo (para poster/thumbnail de posts).
 * O instante é `Math.min(0.5, duration/3)` (com clamp ao intervalo do vídeo) para evitar frame preto no início.
 */
const DEFAULT_MAX_WIDTH = 960;
const JPEG_QUALITY = 0.85;

function seekTimeForPoster(durationSec: number): number {
  if (!Number.isFinite(durationSec) || durationSec <= 0) return 0.1;
  const epsilon = Math.min(0.05, durationSec / 10);
  const t = Math.min(0.5, durationSec / 3);
  const upper = Math.max(durationSec - epsilon, 0);
  return Math.min(t, upper);
}

export async function extractVideoPosterJpegBlob(
  videoFile: File,
  maxWidth: number = DEFAULT_MAX_WIDTH
): Promise<Blob | null> {
  const objectUrl = URL.createObjectURL(videoFile);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  try {
    video.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("metadata"));
    });

    const seek = seekTimeForPoster(video.duration);
    video.currentTime = seek;

    await new Promise<void>((resolve, reject) => {
      video.onseeked = () => resolve();
      video.onerror = () => reject(new Error("seek"));
    });

    // Alguns codecs só decodam o frame após um repouso curto
    await new Promise((r) => {
      requestAnimationFrame(() => r(undefined));
    });

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return null;

    const scale = Math.min(1, maxWidth / vw);
    const cw = Math.max(1, Math.round(vw * scale));
    const ch = Math.max(1, Math.round(vh * scale));

    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, cw, ch);

    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", JPEG_QUALITY);
    });
  } catch {
    return null;
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}
