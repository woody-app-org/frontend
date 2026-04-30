import { cn } from "@/lib/utils";

const feed =
  "min-h-[120px] w-full max-h-[min(22rem,72vw)] rounded-lg bg-black object-contain md:max-h-[24rem]";
const detail =
  "min-h-[140px] w-full max-h-[min(32rem,85vw)] rounded-2xl bg-black object-contain md:max-h-[32rem]";
/** Bolha DM: compacto, bom alvo de toque em mobile. */
const message =
  "min-h-[88px] w-full max-w-[min(100%,min(18rem,85vw))] max-h-36 rounded-lg bg-black object-contain touch-manipulation sm:max-h-40";

export type VideoPostPlayerVariant = "feed" | "detail" | "message";

export interface VideoPostPlayerProps {
  src: string;
  poster?: string;
  variant: VideoPostPlayerVariant;
  className?: string;
  /** Quando omitido, depende do <code>variant</code>. */
  ariaLabel?: string;
}

export function VideoPostPlayer({ src, poster, variant, className, ariaLabel }: VideoPostPlayerProps) {
  const label =
    ariaLabel ??
    (variant === "message" ? "Vídeo anexado à mensagem" : "Vídeo da publicação");
  const sizeClass =
    variant === "detail" ? detail : variant === "message" ? message : feed;
  return (
    <video
      src={src}
      poster={poster}
      className={cn(sizeClass, className)}
      controls
      playsInline
      preload="metadata"
      aria-label={label}
    />
  );
}
