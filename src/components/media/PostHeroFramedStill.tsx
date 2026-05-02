import { resolvePublicMediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Moldura 4:5 com teto de altura — sempre preenchimento total (cover), sem faixas laterais. */
const shellFeed =
  "relative mx-auto aspect-[4/5] w-full max-h-[min(24rem,50dvh)] overflow-hidden rounded-lg bg-black/5 sm:max-h-[min(26rem,52dvh)]";
const shellDetail =
  "relative mx-auto aspect-[4/5] w-full max-h-[min(26rem,52dvh)] overflow-hidden rounded-xl bg-black/5 sm:max-h-[min(28rem,54dvh)]";

export function PostHeroFramedStill({
  src,
  variant,
  className,
}: {
  src: string;
  variant: "feed" | "detail";
  className?: string;
}) {
  const resolved = resolvePublicMediaUrl(src);
  const shell = variant === "detail" ? shellDetail : shellFeed;

  return (
    <div className={cn(shell, className)}>
      <img
        src={resolved}
        alt=""
        draggable={false}
        className="absolute inset-0 size-full object-cover object-center"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
