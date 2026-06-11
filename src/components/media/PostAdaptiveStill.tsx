"use client";

import { useCallback, useState } from "react";
import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { classifyPostMediaIntrinsic, type PostMediaIntrinsicKind } from "./postMediaIntrinsicKind";
import { adaptiveMediaShellClass, adaptiveStillImageClass } from "./postAdaptivePresentation";
import { preventMediaContextMenu } from "./mediaProtection";

export function PostAdaptiveStill({
  src,
  variant,
  className,
  width,
  height,
}: {
  src: string;
  variant: "feed" | "detail";
  className?: string;
  /** Dimensões reais do servidor; classificam o formato antes de a imagem carregar. */
  width?: number | null;
  height?: number | null;
}) {
  const resolved = resolvePublicMediaUrl(src);
  // Semeia o formato a partir das dimensões do backend (sem layout shift); onLoad confirma/ajusta.
  const seeded =
    typeof width === "number" && typeof height === "number" && width > 0 && height > 0
      ? classifyPostMediaIntrinsic(width, height)
      : null;
  const [kind, setKind] = useState<PostMediaIntrinsicKind | null>(seeded);

  const onLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setKind(classifyPostMediaIntrinsic(img.naturalWidth, img.naturalHeight));
  }, []);

  const shell = adaptiveMediaShellClass(kind, variant, "still");
  const imgFit = adaptiveStillImageClass(kind, variant);

  return (
    <div className={cn(shell, className)}>
      <img
        src={resolved}
        alt=""
        draggable={false}
        onContextMenu={preventMediaContextMenu}
        onLoad={onLoad}
        className={cn(imgFit, "protected-media")}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
