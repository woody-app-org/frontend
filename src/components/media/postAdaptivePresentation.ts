import { cn } from "@/lib/utils";
import type { PostMediaIntrinsicKind } from "./postMediaIntrinsicKind";

type Placement = "feed" | "detail";
type Surface = "still" | "video";

function baseRounding(placement: Placement): string {
  return placement === "detail"
    ? "rounded-2xl sm:rounded-[1.375rem]"
    : "rounded-2xl sm:rounded-[1.25rem]";
}

function tint(surface: Surface): string {
  return surface === "video"
    ? "bg-black"
    : "bg-gradient-to-b from-black/[0.07] to-black/[0.04] dark:from-black/40 dark:to-black/35";
}

/**
 * Molduras por tipo — feed mais compacto mas com alturas generosas para não “achatar”.
 * Detalhe: mais espaço; retratos/quadrados com contain para menos corte facial.
 */
export function adaptiveMediaShellClass(
  kind: PostMediaIntrinsicKind | null,
  placement: Placement,
  surface: Surface,
): string {
  const rounded = baseRounding(placement);
  const fill = tint(surface);
  const k = kind ?? "portrait";

  if (placement === "feed") {
    switch (k) {
      case "portrait":
        return cn(
          "relative mx-auto w-full overflow-hidden",
          fill,
          rounded,
          "aspect-[4/5] max-h-[min(42rem,84dvh)] min-h-[min(280px,78vw)]"
        );
      case "square":
        return cn(
          "relative mx-auto w-full overflow-hidden",
          fill,
          rounded,
          "aspect-square max-h-[min(38rem,78dvh)] min-h-[min(260px,72vw)]"
        );
      case "landscape":
        return cn(
          "relative mx-auto w-full overflow-hidden",
          fill,
          rounded,
          "aspect-[4/3] max-h-[min(34rem,58dvh)] min-h-[min(200px,48vw)]"
        );
      default:
        return cn(
          "relative mx-auto w-full overflow-hidden",
          fill,
          rounded,
          "aspect-[4/5] max-h-[min(42rem,84dvh)] min-h-[min(280px,78vw)]"
        );
    }
  }

  switch (k) {
    case "portrait":
      return cn(
        "relative mx-auto w-full overflow-hidden",
        fill,
        rounded,
        "aspect-[4/5] max-h-[min(min(560px,96vw),88dvh)] min-h-[min(300px,82vw)] sm:max-h-[min(min(620px,96vw),90dvh)]"
      );
    case "square":
      return cn(
        "relative mx-auto w-full overflow-hidden",
        fill,
        rounded,
        "aspect-square max-h-[min(min(520px,96vw),82dvh)] min-h-[min(280px,78vw)]"
      );
    case "landscape":
      return cn(
        "relative mx-auto w-full overflow-hidden",
        fill,
        rounded,
        "aspect-[16/10] max-h-[min(min(440px,96vw),62dvh)] min-h-[min(220px,52vw)]"
      );
    default:
      return cn(
        "relative mx-auto w-full overflow-hidden",
        fill,
        rounded,
        "aspect-[4/5] max-h-[min(min(560px,96vw),88dvh)] min-h-[min(300px,82vw)]"
      );
  }
}

export function adaptiveStillImageClass(
  kind: PostMediaIntrinsicKind | null,
  placement: Placement,
): string {
  const base = "absolute inset-0 size-full transition-opacity duration-150";
  if (placement === "detail") {
    if (kind === "portrait" || kind === null) return cn(base, "object-contain object-center");
    if (kind === "square") return cn(base, "object-contain object-center");
    return cn(base, "object-cover object-center");
  }
  return cn(base, "object-cover object-center");
}

export function adaptiveVideoClass(kind: PostMediaIntrinsicKind | null, placement: Placement): string {
  const base = "absolute inset-0 size-full bg-black";
  if (placement === "detail" && kind === "portrait") {
    return cn(base, "object-contain object-center");
  }
  return cn(base, "object-cover object-center");
}

/** Viewport estável para carrosséis com imagens mistas */
export function carouselViewportShellClass(variant: "feed" | "detail"): string {
  if (variant === "detail") {
    return cn(
      "relative mx-auto w-full overflow-hidden bg-black/[0.06] dark:bg-black/35",
      "rounded-2xl sm:rounded-[1.375rem]",
      "aspect-[4/5] max-h-[min(min(620px,98vw),88dvh)] min-h-[min(300px,78vw)]"
    );
  }
  return cn(
    "relative mx-auto w-full overflow-hidden bg-black/[0.06] dark:bg-black/35",
    "rounded-2xl sm:rounded-[1.25rem]",
    "aspect-[4/5] max-h-[min(42rem,84dvh)] min-h-[min(285px,78vw)]"
  );
}
