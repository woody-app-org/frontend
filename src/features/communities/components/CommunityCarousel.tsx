import { cn } from "@/lib/utils";

export interface CommunityCarouselProps {
  children: React.ReactNode;
  className?: string;
  /** Rótulo acessível para a região rolável (ex.: nome da seção). */
  ariaLabel: string;
}

/**
 * Em mobile: carrossel horizontal com snap; em md+: grade fluida sem overflow forçado.
 * Os filhos devem definir largura mínima no breakpoint mobile (ex.: wrapper com min-w-*).
 */
export function CommunityCarousel({ children, className, ariaLabel }: CommunityCarouselProps) {
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={cn(
        "-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none]",
        "snap-x snap-mandatory scroll-pl-3 scroll-pr-3 md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 md:snap-none xl:grid-cols-3",
        "[&::-webkit-scrollbar]:hidden md:[&::-webkit-scrollbar]:auto",
        className
      )}
    >
      {children}
    </div>
  );
}
