import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface NarrativeScrollSectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
}

/** Capítulo da landing: âncora + offset para o header fixo; scroll nativo (sem snap/reveal). */
export function NarrativeScrollSection({ id, className, children }: NarrativeScrollSectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-[4.75rem]", className)}>
      {children}
    </section>
  );
}
