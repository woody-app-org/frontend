import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import logoBlack from "@/assets/new-logo.png";

/** Mesmo wordmark raster do feed (`AppTopNav`). */
export type WoodyLogoTone = "default" | "onDark";

export interface WoodyLogoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  tone?: WoodyLogoTone;
}

const toneClass: Record<WoodyLogoTone, string> = {
  default: "",
  /** Contraste em barras escuras (raster escuro → claro via filtro). */
  onDark: "brightness-0 invert",
};

/**
 * O PNG tem padding vertical (~261px de conteúdo num canvas de 910px).
 * Proporção do viewport = largura total do arquivo / altura útil do wordmark,
 * para o traço da direita não ser cortado.
 */
const LOGO_CONTENT_ZOOM = 910 / 261;

export function WoodyLogo({
  tone = "default",
  className,
  alt = "Woody",
  decoding = "async",
  draggable = false,
  ...props
}: WoodyLogoProps) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden aspect-[1280/261]",
        className,
      )}
    >
      <img
        src={logoBlack}
        alt={alt}
        decoding={decoding}
        draggable={draggable}
        className={cn(
          "absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 select-none",
          toneClass[tone],
        )}
        style={{
          height: `${LOGO_CONTENT_ZOOM * 100}%`,
          width: "auto",
        }}
        {...props}
      />
    </span>
  );
}
