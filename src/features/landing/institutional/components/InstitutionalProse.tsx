import { cn } from "@/lib/utils";

export interface InstitutionalProseProps {
  children: React.ReactNode;
  /** Largura máxima confortável para leitura longa. */
  size?: "md" | "lg";
  className?: string;
}

export function InstitutionalProse({ children, size = "md", className }: InstitutionalProseProps) {
  return (
    <div
      className={cn(
        "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700",
        size === "lg" ? "max-w-3xl" : "max-w-2xl",
        "space-y-5 text-[1.02rem] leading-[1.75] text-[var(--woody-text)]/90 md:text-[1.06rem] md:leading-[1.78]",
        "[&_strong]:font-semibold [&_strong]:text-[var(--woody-ink)]",
        className
      )}
    >
      {children}
    </div>
  );
}
