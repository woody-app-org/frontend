/** Classifica pelo rácio largura÷altura das dimensões naturais da mídia. */
export type PostMediaIntrinsicKind = "portrait" | "square" | "landscape";

/** `nw nh` zero → assume retrato até carregar */
export function classifyPostMediaIntrinsic(nw: number, nh: number): PostMediaIntrinsicKind {
  if (!(nw > 0 && nh > 0)) return "portrait";
  const r = nw / nh;
  if (r < 0.9) return "portrait";
  if (r <= 1.08) return "square";
  return "landscape";
}
