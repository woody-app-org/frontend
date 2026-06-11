import { resolvePublicMediaUrl } from "@/lib/api";
import catWhiteUrl from "@/assets/cat-white.svg";
import type { Story, StoryLayer } from "../types";
import { resolveStoryTextBackground, STORY_STATIC_DURATION_MS } from "./storyUtils";

/**
 * Exporta o story como vídeo local (WebM) com marca d'água da Woody (logo + nome).
 * Imagem/texto → vídeo estático com a duração de exibição do story; vídeo → recodificado
 * via captureStream + MediaRecorder, mantendo a duração original. Em ambos os casos,
 * o áudio (música do story e/ou áudio do próprio vídeo) é incluído mesmo que o player
 * esteja mudo. Stories de post compartilhado não são suportados (preview dinâmico de
 * outro conteúdo).
 */

const CANVAS_W = 1080;
const CANVAS_H = 1920;

const LAYER_FONT_PX: Record<NonNullable<StoryLayer["fontSize"]>, number> = {
  sm: 44,
  md: 56,
  lg: 84,
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Não foi possível carregar a mídia do story."));
    img.src = url;
  });
}

/** Desenha a mídia em "object-contain" centralizado, com escala opcional do story. */
function drawContain(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  scale: number
) {
  if (srcW <= 0 || srcH <= 0) return;
  const ratio = Math.min(CANVAS_W / srcW, CANVAS_H / srcH) * scale;
  const w = srcW * ratio;
  const h = srcH * ratio;
  ctx.drawImage(source, (CANVAS_W - w) / 2, (CANVAS_H - h) / 2, w, h);
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let current = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth || !current) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }
    lines.push(current);
  }
  return lines;
}

function drawCenteredText(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  fontPx: number,
  color: string,
  maxWidth: number
) {
  ctx.save();
  ctx.font = `600 ${fontPx}px system-ui, -apple-system, 'Segoe UI', sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 6;
  const lines = wrapLines(ctx, text, maxWidth);
  const lineHeight = fontPx * 1.3;
  const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => ctx.fillText(line, centerX, startY + i * lineHeight));
  ctx.restore();
}

async function drawLayers(ctx: CanvasRenderingContext2D, layers: StoryLayer[]) {
  for (const layer of layers) {
    const cx = layer.x * CANVAS_W;
    const cy = layer.y * CANVAS_H;
    const w = layer.width * CANVAS_W;
    const h = layer.height * CANVAS_H;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((layer.rotation * Math.PI) / 180);

    if (layer.type === "mention" && layer.text) {
      const fontPx = 40;
      ctx.font = `600 ${fontPx}px system-ui, -apple-system, 'Segoe UI', sans-serif`;
      const textW = ctx.measureText(layer.text.toUpperCase()).width;
      const padX = 28;
      const pillW = textW + padX * 2;
      const pillH = fontPx * 1.8;
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath();
      ctx.roundRect(-pillW / 2, -pillH / 2, pillW, pillH, pillH / 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(layer.text.toUpperCase(), 0, 0);
    } else if (layer.type === "text" && layer.text) {
      drawCenteredText(
        ctx,
        layer.text,
        0,
        0,
        LAYER_FONT_PX[layer.fontSize ?? "md"],
        layer.color ?? "#ffffff",
        Math.max(w, CANVAS_W * 0.4)
      );
    } else if (layer.type === "image" && layer.mediaUrl) {
      try {
        const img = await loadImage(resolvePublicMediaUrl(layer.mediaUrl));
        const ratio = Math.min(w / img.naturalWidth, h / img.naturalHeight);
        const dw = img.naturalWidth * ratio;
        const dh = img.naturalHeight * ratio;
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      } catch {
        // Layer de imagem indisponível — segue sem ela em vez de falhar o download inteiro.
      }
    }
    // Layers de vídeo não são compostos no export estático.

    ctx.restore();
  }
}

function drawOverlayText(ctx: CanvasRenderingContext2D, story: Story) {
  if ((story.layers?.length ?? 0) > 0 || !story.overlayText) return;
  drawCenteredText(
    ctx,
    story.overlayText,
    (story.overlayTextX ?? 0.5) * CANVAS_W,
    (story.overlayTextY ?? 0.5) * CANVAS_H,
    56,
    story.overlayTextColor ?? "#ffffff",
    CANVAS_W * 0.85
  );
}

/** Logo do gato + wordmark "Woody" no canto inferior direito, discretos mas legíveis. */
async function drawWatermark(ctx: CanvasRenderingContext2D) {
  const margin = 36;
  const logoH = 72;
  let logoW = 0;

  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 10;

  ctx.font = `700 52px system-ui, -apple-system, 'Segoe UI', sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const textY = CANVAS_H - margin - logoH / 2;
  ctx.fillText("Woody", CANVAS_W - margin, textY);
  const textW = ctx.measureText("Woody").width;

  try {
    const logo = await loadImage(catWhiteUrl);
    logoW = (logo.naturalWidth / logo.naturalHeight) * logoH;
    ctx.drawImage(
      logo,
      CANVAS_W - margin - textW - 18 - logoW,
      CANVAS_H - margin - logoH,
      logoW,
      logoH
    );
  } catch {
    // Sem o logo, a marca d'água textual já cumpre o papel.
  }

  ctx.restore();
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoga depois de o clique ter sido processado pelo browser.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

function makeCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas não suportado neste navegador.");
  return { canvas, ctx };
}

function pickVideoMimeType(): string | undefined {
  const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  return candidates.find((t) => MediaRecorder.isTypeSupported(t));
}

function getAudioContextCtor(): typeof AudioContext | undefined {
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}

/**
 * Cria um `<audio>` oculto com a música do story, posicionado no `startTime`, e
 * conecta a sua saída ao destino de gravação (mesmo que o player esteja mudo).
 */
function setupMusicTrack(
  audioCtx: AudioContext,
  dest: MediaStreamAudioDestinationNode,
  music: NonNullable<Story["music"]>
): { element: HTMLAudioElement; ready: Promise<void> } {
  const audio = document.createElement("audio");
  audio.crossOrigin = "anonymous";
  audio.preload = "auto";
  audio.src = music.previewUrl;
  audio.style.display = "none";
  document.body.appendChild(audio);

  const ready = new Promise<void>((resolve) => {
    audio.onloadedmetadata = () => {
      audio.currentTime = music.startTime ?? 0;
      resolve();
    };
    audio.onerror = () => resolve();
  });

  try {
    const source = audioCtx.createMediaElementSource(audio);
    source.connect(dest);
  } catch {
    // Sem o nó de áudio, segue a exportação só com o vídeo/imagem.
  }

  return { element: audio, ready };
}

/** Combina (em até) duas streams de áudio num único MediaStreamAudioDestinationNode. */
function buildAudioDestination(audioCtx: AudioContext): MediaStreamAudioDestinationNode {
  return audioCtx.createMediaStreamDestination();
}

async function downloadImageOrTextStory(story: Story, onProgress?: (p: number) => void) {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("Seu navegador não suporta exportar vídeos.");
  }

  // Pré-renderiza o frame estático (mídia/fundo + layers + marca d'água) uma única vez.
  const { canvas: frameCanvas, ctx: frameCtx } = makeCanvas();
  if (story.mediaType === "text") {
    frameCtx.fillStyle = resolveStoryTextBackground(story.backgroundColor);
    frameCtx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    if (story.text) {
      drawCenteredText(frameCtx, story.text, CANVAS_W / 2, CANVAS_H / 2, 64, "#ffffff", CANVAS_W * 0.8);
    }
  } else {
    frameCtx.fillStyle = "#000000";
    frameCtx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    if (story.mediaUrl) {
      const img = await loadImage(resolvePublicMediaUrl(story.mediaUrl));
      drawContain(frameCtx, img, img.naturalWidth, img.naturalHeight, story.contentScale ?? 1);
    }
  }
  drawOverlayText(frameCtx, story);
  await drawLayers(frameCtx, story.layers ?? []);
  await drawWatermark(frameCtx);

  const { canvas, ctx } = makeCanvas();
  const stream = canvas.captureStream(30);

  const music = story.music;
  const durationMs = music
    ? Math.max(STORY_STATIC_DURATION_MS, (30 - (music.startTime ?? 0)) * 1000)
    : STORY_STATIC_DURATION_MS;

  const AudioContextCtor = getAudioContextCtor();
  let audioCtx: AudioContext | null = null;
  let musicEl: HTMLAudioElement | null = null;
  if (AudioContextCtor && music) {
    try {
      audioCtx = new AudioContextCtor();
      const dest = buildAudioDestination(audioCtx);
      const track = setupMusicTrack(audioCtx, dest, music);
      musicEl = track.element;
      await track.ready;
      dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
    } catch {
      audioCtx = null;
      musicEl = null;
    }
  }

  const mimeType = pickVideoMimeType();
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  let rafId = 0;
  const drawFrame = () => ctx.drawImage(frameCanvas, 0, 0);

  const finished = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      cancelAnimationFrame(rafId);
      resolve(new Blob(chunks, { type: recorder.mimeType || "video/webm" }));
    };
    recorder.onerror = () => {
      cancelAnimationFrame(rafId);
      reject(new Error("Falha ao gravar o vídeo."));
    };
  });

  const startedAt = performance.now();
  const tick = () => {
    drawFrame();
    const elapsed = performance.now() - startedAt;
    onProgress?.(Math.min(1, elapsed / durationMs));
    if (elapsed >= durationMs) {
      if (recorder.state !== "inactive") recorder.stop();
      return;
    }
    rafId = requestAnimationFrame(tick);
  };

  recorder.start(250);
  if (musicEl) {
    try {
      await musicEl.play();
    } catch {
      // Sem reprodução automática do áudio, a exportação segue só com a imagem.
    }
  }
  tick();

  try {
    const blob = await finished;
    triggerDownload(blob, `woody-story-${story.id}.webm`);
  } finally {
    if (musicEl) {
      musicEl.pause();
      musicEl.remove();
    }
    if (audioCtx) void audioCtx.close().catch(() => undefined);
  }
}

async function downloadVideoStory(story: Story, onProgress?: (p: number) => void) {
  if (!story.mediaUrl) throw new Error("Vídeo indisponível.");
  if (typeof MediaRecorder === "undefined") {
    throw new Error("Seu navegador não suporta exportar vídeos.");
  }

  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.playsInline = true;
  video.muted = true;
  video.preload = "auto";
  video.src = resolvePublicMediaUrl(story.mediaUrl);

  // Alguns navegadores pausam a decodificação de <video> fora do DOM, o que faz
  // drawImage capturar sempre o mesmo frame (resultando num "vídeo" estático).
  // Mantemos o elemento no documento, fora da tela, durante a exportação.
  video.style.position = "fixed";
  video.style.left = "-9999px";
  video.style.top = "0";
  video.style.width = "1px";
  video.style.height = "1px";
  document.body.appendChild(video);

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Não foi possível carregar o vídeo do story."));
  });

  const { canvas, ctx } = makeCanvas();
  const stream = canvas.captureStream(30);

  // Reencaminha o áudio do vídeo (e da música, se houver) para a gravação —
  // createMediaElementSource desvia o áudio do altifalante, então a exportação
  // tem som mesmo que o player esteja mudo.
  const AudioContextCtor = getAudioContextCtor();
  let audioCtx: AudioContext | null = null;
  let musicEl: HTMLAudioElement | null = null;
  if (AudioContextCtor) {
    try {
      audioCtx = new AudioContextCtor();
      const dest = buildAudioDestination(audioCtx);
      const source = audioCtx.createMediaElementSource(video);
      source.connect(dest);
      if (story.music) {
        const track = setupMusicTrack(audioCtx, dest, story.music);
        musicEl = track.element;
        await track.ready;
      }
      dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
    } catch {
      audioCtx = null;
      musicEl = null;
    }
  }

  const mimeType = pickVideoMimeType();
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  // Pré-renderiza a marca d'água num canvas próprio para não recarregar o logo a cada frame.
  const wmCanvas = document.createElement("canvas");
  wmCanvas.width = CANVAS_W;
  wmCanvas.height = CANVAS_H;
  const wmCtx = wmCanvas.getContext("2d");
  if (wmCtx) {
    drawOverlayText(wmCtx, story);
    await drawLayers(wmCtx, story.layers ?? []);
    await drawWatermark(wmCtx);
  }

  const scale = story.contentScale ?? 1;
  let rafId = 0;
  const drawFrame = () => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    drawContain(ctx, video, video.videoWidth, video.videoHeight, scale);
    if (wmCtx) ctx.drawImage(wmCanvas, 0, 0);
    onProgress?.(video.duration > 0 ? Math.min(1, video.currentTime / video.duration) : 0);
    rafId = requestAnimationFrame(drawFrame);
  };

  const finished = new Promise<Blob>((resolve, reject) => {
    recorder.onstop = () => {
      cancelAnimationFrame(rafId);
      resolve(new Blob(chunks, { type: recorder.mimeType || "video/webm" }));
    };
    recorder.onerror = () => {
      cancelAnimationFrame(rafId);
      reject(new Error("Falha ao gravar o vídeo."));
    };
  });

  video.onended = () => {
    if (recorder.state !== "inactive") recorder.stop();
  };

  recorder.start(250);
  drawFrame();
  try {
    await video.play();
  } catch {
    recorder.stop();
    throw new Error("Não foi possível reproduzir o vídeo para exportação.");
  }
  if (musicEl) {
    try {
      await musicEl.play();
    } catch {
      // Sem a música, a exportação segue com o áudio do próprio vídeo.
    }
  }

  try {
    const blob = await finished;
    triggerDownload(blob, `woody-story-${story.id}.webm`);
  } finally {
    video.pause();
    video.src = "";
    video.remove();
    if (musicEl) {
      musicEl.pause();
      musicEl.remove();
    }
    if (audioCtx) void audioCtx.close().catch(() => undefined);
  }
}

export async function downloadStoryWithWatermark(
  story: Story,
  onProgress?: (p: number) => void
): Promise<void> {
  if (story.mediaType === "shared_post") {
    throw new Error("Stories de publicação compartilhada não podem ser baixados.");
  }
  if (story.mediaType === "video") {
    await downloadVideoStory(story, onProgress);
    return;
  }
  await downloadImageOrTextStory(story, onProgress);
}
