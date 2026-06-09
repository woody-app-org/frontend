/**
 * Formatos oficiais de mídia da Woody — fonte única de verdade.
 *
 * Evita "magic numbers" espalhados pela aplicação. Cada formato tem um rácio
 * canónico (largura ÷ altura) e uma tolerância para classificar mídia real,
 * que raramente tem o rácio exato.
 *
 * Usado por upload (orientação/crop), feed, perfil/grid, stories e vídeos.
 */

/** Chave estável de formato, alinhada ao `displayFormat` persistido no anexo. */
export type WoodyMediaFormat =
  | "feed_4_5"
  | "phone_3_4"
  | "square_1_1"
  | "story_9_16"
  | "original";

/** Rótulos amigáveis dos formatos oficiais (proporção). */
export const WOODY_MEDIA_FORMATS = {
  FEED_VERTICAL: "4:5",
  PHONE_VERTICAL: "3:4",
  SQUARE: "1:1",
  STORY_VERTICAL: "9:16",
} as const;

export interface WoodyFormatSpec {
  /** Chave estável. */
  readonly key: WoodyMediaFormat;
  /** Rótulo de proporção (ex.: "4:5"). */
  readonly label: string;
  /** Rácio canónico largura ÷ altura. */
  readonly ratio: number;
  /** Limite inferior aceite (inclusive). */
  readonly min: number;
  /** Limite superior aceite (inclusive). */
  readonly max: number;
  /** Valor para a propriedade CSS `aspect-ratio` (ex.: "4 / 5"). */
  readonly cssAspectRatio: string;
}

/**
 * Especificações canónicas, ordenadas do mais "alto" (story) ao quadrado.
 * Tolerâncias conforme GSD; ajustáveis num só lugar.
 */
export const WOODY_FORMAT_SPECS: readonly WoodyFormatSpec[] = [
  {
    key: "story_9_16",
    label: WOODY_MEDIA_FORMATS.STORY_VERTICAL,
    ratio: 0.5625,
    min: 0.55,
    max: 0.58,
    cssAspectRatio: "9 / 16",
  },
  {
    key: "phone_3_4",
    label: WOODY_MEDIA_FORMATS.PHONE_VERTICAL,
    ratio: 0.75,
    min: 0.73,
    max: 0.77,
    cssAspectRatio: "3 / 4",
  },
  {
    key: "feed_4_5",
    label: WOODY_MEDIA_FORMATS.FEED_VERTICAL,
    ratio: 0.8,
    min: 0.78,
    max: 0.82,
    cssAspectRatio: "4 / 5",
  },
  {
    key: "square_1_1",
    label: WOODY_MEDIA_FORMATS.SQUARE,
    ratio: 1.0,
    min: 0.98,
    max: 1.02,
    cssAspectRatio: "1 / 1",
  },
];

/** Formatos preferenciais para publicações do feed (imagem ou vídeo). */
export const WOODY_FEED_FORMATS: readonly WoodyMediaFormat[] = [
  "feed_4_5",
  "phone_3_4",
  "square_1_1",
];

/** Formato preferencial de fallback para mídia antiga sem dimensões. */
export const WOODY_FEED_FALLBACK_FORMAT: WoodyMediaFormat = "feed_4_5";

/**
 * Rácio largura ÷ altura a partir de dimensões naturais.
 * Retorna `null` quando as dimensões não são utilizáveis.
 */
export function getMediaAspectRatio(
  width?: number | null,
  height?: number | null,
): number | null {
  if (typeof width !== "number" || typeof height !== "number") return null;
  if (!(width > 0) || !(height > 0)) return null;
  return width / height;
}

/**
 * Classifica um rácio num formato oficial Woody (com tolerância) ou `original`.
 * Aceita um rácio já calculado.
 */
export function classifyMediaFormat(ratio: number | null | undefined): WoodyMediaFormat {
  if (typeof ratio !== "number" || !(ratio > 0)) return "original";
  for (const spec of WOODY_FORMAT_SPECS) {
    if (ratio >= spec.min && ratio <= spec.max) return spec.key;
  }
  return "original";
}

/** Conveniência: classifica diretamente a partir de dimensões. */
export function classifyMediaFormatFromDimensions(
  width?: number | null,
  height?: number | null,
): WoodyMediaFormat {
  return classifyMediaFormat(getMediaAspectRatio(width, height));
}

/** Um formato é oficialmente suportado quando não é `original`. */
export function isWoodySupportedMediaFormat(format: WoodyMediaFormat): boolean {
  return format !== "original";
}

/** Verdadeiro quando o formato é aceitável como mídia preferencial do feed. */
export function isWoodyFeedFormat(format: WoodyMediaFormat): boolean {
  return WOODY_FEED_FORMATS.includes(format);
}

export function getFormatSpec(format: WoodyMediaFormat): WoodyFormatSpec | null {
  return WOODY_FORMAT_SPECS.find((s) => s.key === format) ?? null;
}

/** Valor de `aspect-ratio` CSS para o formato (fallback 4:5 para `original`). */
export function getFormatCssAspectRatio(format: WoodyMediaFormat): string {
  return getFormatSpec(format)?.cssAspectRatio ?? "4 / 5";
}

/**
 * Classe CSS-module-friendly do contentor do formato.
 * Mapeada para `.mediaFrame--4x5`, `--3x4`, `--1x1`, `--9x16`.
 * `original` cai no contentor seguro do feed (4:5).
 */
export function getMediaContainerClass(format: WoodyMediaFormat): string {
  switch (format) {
    case "feed_4_5":
      return "mediaFrame--4x5";
    case "phone_3_4":
      return "mediaFrame--3x4";
    case "square_1_1":
      return "mediaFrame--1x1";
    case "story_9_16":
      return "mediaFrame--9x16";
    default:
      return "mediaFrame--4x5";
  }
}
