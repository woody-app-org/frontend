import { cn } from "@/lib/utils";

const feed =
  "min-h-[120px] w-full max-h-[min(22rem,72vw)] rounded-lg bg-black object-contain md:max-h-[24rem]";
const detail =
  "min-h-[140px] w-full max-h-[min(32rem,85vw)] rounded-2xl bg-black object-contain md:max-h-[32rem]";

export interface VideoPostPlayerProps {
  src: string;
  poster?: string;
  variant: "feed" | "detail";
  className?: string;
}

export function VideoPostPlayer({ src, poster, variant, className }: VideoPostPlayerProps) {
  return (
    <video
      src={src}
      poster={poster}
      className={cn(variant === "detail" ? detail : feed, className)}
      controls
      playsInline
      preload="metadata"
      aria-label="Vídeo da publicação"
    />
  );
}
