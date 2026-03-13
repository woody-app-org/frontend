import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

const styles = {
  root: "min-h-screen w-full flex items-center justify-center p-4 md:p-6 bg-[var(--auth-bg)] relative overflow-hidden",
  ornament:
    "absolute w-16 h-16 md:w-24 md:h-24 border-2 border-[var(--auth-ornament)] rounded-lg opacity-60 pointer-events-none",
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
      {children}
    </div>
  );
}
