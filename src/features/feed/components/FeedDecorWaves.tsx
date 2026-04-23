import { cn } from "@/lib/utils";

export type FeedDecorWavesVariant = "default" | "sidebar" | "promo";

export interface FeedDecorWavesProps {
  className?: string;
  variant?: FeedDecorWavesVariant;
}

/** Padrão orgânico discreto (linhas / ondas) — referência visual feed desktop. */
export function FeedDecorWaves({ className, variant = "default" }: FeedDecorWavesProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]", className)}
      aria-hidden
    >
      <svg
        className="absolute -right-2 bottom-0 h-[85%] w-[140%] text-[var(--woody-nav)] opacity-[0.24]"
        viewBox="0 0 400 120"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 90 C 60 40, 120 110, 180 70 S 300 20, 400 55"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M0 105 C 80 55, 140 120, 220 80 S 320 35, 400 72"
          stroke="currentColor"
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.65"
        />
        <path
          d="M40 118 C 100 75, 160 118, 240 88 S 340 48, 400 95"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeLinecap="round"
          opacity="0.45"
        />
        {variant === "sidebar" ? (
          <path
            d="M-20 40 C 40 20, 90 65, 160 35 S 260 8, 340 25"
            stroke="currentColor"
            strokeWidth="0.7"
            strokeLinecap="round"
            opacity="0.35"
          />
        ) : null}
      </svg>
      {variant === "sidebar" ? (
        <svg
          className="absolute -left-8 bottom-[-5%] h-[55%] w-[75%] text-[var(--woody-nav)] opacity-[0.18]"
          viewBox="0 0 200 100"
          fill="none"
          preserveAspectRatio="none"
        >
          <path d="M0 75 Q 50 40 100 60 T 200 50" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <path
            d="M10 92 Q 70 55 120 78 T 200 68"
            stroke="currentColor"
            strokeWidth="0.65"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      ) : null}
      {variant === "promo" ? (
        <svg
          className="absolute -right-4 bottom-0 h-[70%] w-[90%] text-[var(--woody-nav)] opacity-[0.2]"
          viewBox="0 0 320 140"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M40 120 C 100 80, 160 130, 220 90 S 300 50, 360 70"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <path
            d="M80 132 C 140 95, 200 128, 280 100"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      ) : null}
    </div>
  );
}
