"use client";

import { useCallback, useState } from "react";
import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { classifyPostMediaIntrinsic, type PostMediaIntrinsicKind } from "./postMediaIntrinsicKind";
import { adaptiveMediaShellClass, adaptiveStillImageClass } from "./postAdaptivePresentation";

export function PostAdaptiveStill({
  src,
  variant,
  className,
}: {
  src: string;
  variant: "feed" | "detail";
  className?: string;
}) {
  const resolved = resolvePublicMediaUrl(src);
  const [kind, setKind] = useState<PostMediaIntrinsicKind | null>(null);

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
        onLoad={onLoad}
        className={imgFit}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
