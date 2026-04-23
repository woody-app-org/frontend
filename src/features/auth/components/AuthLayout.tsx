import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const styles = {
  root:
    "min-h-screen w-full flex flex-col items-center md:justify-center pt-6 pb-8 px-3 md:py-8 md:px-6 bg-[var(--auth-bg)] relative overflow-x-hidden",
  logo:
    "shrink-0 text-2xl font-bold text-[var(--woody-brand)] select-none mb-2 md:mb-0 md:absolute md:top-5 md:left-8",
  ornament:
    "hidden",
  ornamentTopLeft: "top-4 left-4 md:top-6 md:left-6",
  ornamentTopRight: "top-4 right-4 md:top-6 md:right-6",
  ornamentBottomLeft: "bottom-4 left-4 md:bottom-6 md:left-6",
  ornamentBottomRight: "bottom-4 right-4 md:bottom-6 md:right-6",
} as const;

export interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className={cn(styles.root, className)}>
      <span className={styles.logo} aria-hidden>
        Woody.
      </span>
      {children}
    </div>
  );
}
