import woodyCat from "@/assets/new-cat.png";
import { cn } from "@/lib/utils";

type WoodyCatLogoProps = {
  className?: string;
  alt?: string;
};

export function WoodyCatLogo({
  className,
  alt = "Logo da Woody",
}: WoodyCatLogoProps) {
  return (
    <img
      src={woodyCat}
      alt={alt}
      className={cn(
        "h-[6rem] w-auto max-w-[min(94vw,20rem)] object-contain object-center select-none sm:h-[7rem] md:h-[7.5rem]",
        className
      )}
      width={1598}
      height={1443}
      decoding="async"
      draggable={false}
    />
  );
}
