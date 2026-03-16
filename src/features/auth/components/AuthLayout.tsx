import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const styles = {
  root:
    "min-h-screen w-full flex flex-col items-center md:justify-center pt-6 pb-8 px-3 md:py-6 md:px-6 bg-[var(--auth-panel-beige)] md:bg-[var(--auth-bg)] relative overflow-x-hidden",
  logo:
    "shrink-0 text-2xl font-bold text-[var(--auth-text-on-beige)] select-none mb-2 md:mb-0 md:absolute md:opacity-0 md:pointer-events-none",
  ornament:
    "absolute w-16 h-16 md:w-24 md:h-24 border-2 border-[var(--auth-ornament)] rounded-lg opacity-60 pointer-events-none hidden md:block",
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
      <div className={cn(styles.ornament, styles.ornamentTopLeft)} aria-hidden />
      <div className={cn(styles.ornament, styles.ornamentTopRight)} aria-hidden />
      <div className={cn(styles.ornament, styles.ornamentBottomLeft)} aria-hidden />
      <div className={cn(styles.ornament, styles.ornamentBottomRight)} aria-hidden />
      <span className={styles.logo} aria-hidden>
        W
      </span>
      {children}
    </div>
  );
}
