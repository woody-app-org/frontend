import * as React from "react";
import { PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type PopoverContentProps = React.ComponentProps<typeof PopoverContent>;

/**
 * Conteúdo do popover no desktop: largura fixa, sombra e anel coerentes com o card Woody.
 */
export function NotificationsPopoverContent({ className, ...props }: PopoverContentProps) {
  return (
    <PopoverContent
      align="end"
      side="bottom"
      sideOffset={10}
      collisionPadding={12}
      className={cn(
        "w-[min(calc(100vw-1.5rem),400px)] overflow-hidden border-[var(--woody-divider)] bg-[var(--woody-card)] p-0",
        "shadow-[0_18px_50px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] dark:ring-white/[0.08]",
        className
      )}
      {...props}
    />
  );
}
