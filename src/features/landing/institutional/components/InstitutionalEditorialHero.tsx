import { useState } from "react";
import { cn } from "@/lib/utils";

export interface InstitutionalEditorialHeroProps {
  /** Caminho público (ex.: /institutional/what-is-woody.jpg) */
  imageSrc: string;
  imageAlt: string;
  /** Conteúdo sobreposto (tipicamente título + texto). */
  children: React.ReactNode;
  /** Intensidade do véu escuro para legibilidade. */
  overlay?: "strong" | "medium" | "soft";
  /** Alinhamento do conteúdo na grelha. */
  contentClassName?: string;
  className?: string;
}

const overlayCls = {
  strong: "bg-gradient-to-r from-black/78 via-black/55 to-black/25",
  medium: "bg-gradient-to-r from-black/65 via-black/45 to-black/20",
  soft: "bg-gradient-to-br from-black/50 via-black/35 to-transparent",
} as const;

export function InstitutionalEditorialHero({
  imageSrc,
  imageAlt,
  children,
  overlay = "medium",
  contentClassName,
  className,
}: InstitutionalEditorialHeroProps) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <section
      className={cn(
        "relative isolate min-h-[min(72svh,640px)] overflow-hidden rounded-[2rem] border border-black/[0.06] shadow-[0_24px_80px_-32px_rgba(10,10,10,0.35)]",
        className
      )}
    >
      <div className="absolute inset-0 bg-[#1a1814]" aria-hidden>
        {imgOk ? (
          <img
            src={imageSrc}
            alt={imageAlt}
            className="h-full w-full object-cover object-[center_22%] opacity-95 transition-opacity duration-700"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div
            className="h-full w-full bg-[radial-gradient(120%_80%_at_70%_30%,rgba(139,195,74,0.2),transparent),linear-gradient(135deg,#2a2420,#0f0e0c)]"
            aria-hidden
          />
        )}
        <div className={cn("absolute inset-0", overlayCls[overlay])} aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay [background-image:linear-gradient(120deg,rgba(255,255,255,0.06)_0%,transparent_40%,transparent_60%,rgba(139,195,74,0.08)_100%)]"
          aria-hidden
        />
      </div>

      <div
        className={cn(
          "relative z-10 mx-auto flex min-h-[min(72svh,640px)] max-w-[var(--layout-max-width)] flex-col items-center justify-center gap-10 px-[var(--layout-gutter)] py-14 text-center md:py-20 lg:flex-row lg:items-center lg:gap-16 lg:text-left",
          contentClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
