import { useEffect, useState } from "react";

/** Respeita `prefers-reduced-motion: reduce` (sincronizado com media query). */
export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduce;
}
