import {
  classifyMediaFormat,
  getMediaAspectRatio,
  type WoodyMediaFormat,
} from "@/lib/media/woodyMediaFormats";

/**
 * Tipo de moldura usado pela apresentação adaptativa do feed/detalhe.
 * Distingue os formatos verticais oficiais (4:5 vs 3:4) em vez de os
 * colapsar num único "portrait", garantindo que cada um é exibido no seu
 * contentor sem deformar.
 */
export type PostMediaIntrinsicKind = "feed_4_5" | "phone_3_4" | "square" | "landscape";

/**
 * Classifica pelas dimensões naturais da mídia, mapeando o formato oficial
 * Woody para a moldura adequada. Mídia fora das tolerâncias usa um fallback
 * seguro: vertical → 4:5, quadrada-ish → square, larga → landscape.
 *
 * `nw nh` zero → assume 4:5 (retrato do feed) até carregar.
 */
export function classifyPostMediaIntrinsic(nw: number, nh: number): PostMediaIntrinsicKind {
  const ratio = getMediaAspectRatio(nw, nh);
  if (ratio === null) return "feed_4_5";

  const format: WoodyMediaFormat = classifyMediaFormat(ratio);
  switch (format) {
    case "feed_4_5":
      return "feed_4_5";
    case "phone_3_4":
      return "phone_3_4";
    case "square_1_1":
      return "square";
    case "story_9_16":
      // 9:16 não é formato de feed; cai no vertical mais próximo (3:4) com corte seguro.
      return "phone_3_4";
    default:
      // `original`: decide pela proporção bruta com fallback seguro.
      if (ratio < 0.9) return "feed_4_5";
      if (ratio <= 1.08) return "square";
      return "landscape";
  }
}
