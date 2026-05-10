import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import logoBlack from "@/assets/logo-black.svg";

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

export function WoodyLogo({
  tone = "default",
  className,
  alt = "Woody",
  width = 510,
  height = 112,
  decoding = "async",
  draggable = false,
  ...props
}: WoodyLogoProps) {
  return (
    <img
      src={logoBlack}
      alt={alt}
      width={width}
      height={height}
      decoding={decoding}
      draggable={draggable}
      className={cn("object-contain object-left select-none", toneClass[tone], className)}
      {...props}
    />
  );
}
