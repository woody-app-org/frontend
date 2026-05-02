import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface InfiniteScrollSentinelProps {
  onIntersect: () => void;
  /** Quando false, o observer não dispara (ex.: já não há próxima página ou erro pendente). */
  enabled?: boolean;
  /** Margem para antecipar o carregamento (ex.: "480px 0px"). */
  rootMargin?: string;
  className?: string;
}

/**
 * Gatilho de scroll infinito via IntersectionObserver (sem listener de scroll).
 * Em `md+` o feed usa coluna com overflow; o `root` do observer é `[data-feed-scroll-root]`.
 * No mobile o scroll é o documento, então `root` é a viewport (`null`).
 */
export function InfiniteScrollSentinel({
  onIntersect,
  enabled = true,
  rootMargin = "480px 0px 0px 0px",
  className,
}: InfiniteScrollSentinelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let observer: IntersectionObserver | null = null;

    const attach = () => {
      observer?.disconnect();
      observer = null;
      if (!enabled) return;

      const host = el.closest("[data-feed-scroll-root]");
      const root: Element | null =
        window.matchMedia("(min-width: 768px)").matches && host ? host : null;

      observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry?.isIntersecting) {
            onIntersectRef.current();
          }
        },
        { root, rootMargin, threshold: 0 }
      );
      observer.observe(el);
    };

    attach();
    const mq = window.matchMedia("(min-width: 768px)");
    mq.addEventListener("change", attach);
    return () => {
      mq.removeEventListener("change", attach);
      observer?.disconnect();
    };
  }, [enabled, rootMargin]);

  return <div ref={ref} className={cn("h-1 w-full shrink-0", className)} aria-hidden />;
}
