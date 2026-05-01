import { resolvePublicMediaUrl } from "@/lib/api";
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

function preloadForVariant(variant: VideoPostPlayerVariant): "none" | "metadata" {
  /** No feed evita descarregar faixas de vídeo até o utilizador interagir; detalhe/DM podem mostrar metadados/duração. */
  return variant === "feed" ? "none" : "metadata";
}

export function VideoPostPlayer({ src, poster, variant, className, ariaLabel }: VideoPostPlayerProps) {
  const label =
    ariaLabel ??
    (variant === "message" ? "Vídeo anexado à mensagem" : "Vídeo da publicação");
  const sizeClass =
    variant === "detail" ? detail : variant === "message" ? message : feed;
  const resolvedSrc = resolvePublicMediaUrl(src);
  const resolvedPoster = poster ? resolvePublicMediaUrl(poster) : undefined;
  return (
    <video
      src={resolvedSrc}
      poster={resolvedPoster}
      className={cn(sizeClass, className)}
      controls
      controlsList="nodownload"
      playsInline
      preload={preloadForVariant(variant)}
      aria-label={label}
    />
  );
}
