import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PostLikeIconProps {
  liked: boolean;
  tapPhase: "in" | "out" | null;
  strokeWidth?: number;
  /** Classes de tamanho no SVG (ex.: `size-[1em]`, `size-4`). */
  sizeClassName?: string;
}

/**
 * Ícone de coração com micro-animação (keyframes globais em `index.css`).
 * O estado `liked` vem do post; `tapPhase` vem de `usePostLikeTapAnimation` no clique.
 */
export function PostLikeIcon({
  liked,
  tapPhase,
  strokeWidth = 1.75,
  sizeClassName = "size-[1em]",
}: PostLikeIconProps) {
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center [vertical-align:middle]">
      {tapPhase === "in" ? (
        <span
          className="pointer-events-none absolute z-0 size-[1.65em] rounded-full bg-[var(--woody-nav)]/16 motion-safe:animate-[woodyLikeBurst_280ms_ease-out_forwards] motion-reduce:hidden"
          aria-hidden
        />
      ) : null}
      <Heart
        aria-hidden
        className={cn(
          "relative z-[1] shrink-0 stroke-current motion-reduce:transition-none",
          sizeClassName,
          liked && "fill-current",
          tapPhase === "in" &&
            "motion-safe:animate-[woodyLikePopIn_260ms_cubic-bezier(0.34,1.45,0.64,1)_both] motion-reduce:animate-none",
          tapPhase === "out" &&
            "motion-safe:animate-[woodyLikePopOut_220ms_ease-out_both] motion-reduce:animate-none",
          tapPhase === null &&
            "motion-safe:transition-[fill,transform] motion-safe:duration-200 motion-safe:ease-out"
        )}
        strokeWidth={strokeWidth}
      />
    </span>
  );
}
