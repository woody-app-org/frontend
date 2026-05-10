import { forwardRef, useCallback, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";

export type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type">;

/**
 * Campo de senha com alternância password/text e botão Woody sempre presente
 * (independente do valor e do autofill Safari).
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, disabled, ...props }, ref) {
    const [visible, setVisible] = useState(false);

    const toggle = useCallback(() => {
      setVisible((v) => !v);
    }, []);

    return (
      <div className="relative isolate">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          disabled={disabled}
          data-woody-auth-password=""
          className={cn("min-h-11 pr-12", "woody-auth-input", className)}
          {...props}
        />
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "absolute right-1 top-1/2 z-20 flex h-10 min-h-10 min-w-10 items-center justify-center rounded-lg",
            "text-[var(--auth-text-on-beige)]/75 hover:bg-black/[0.06] hover:text-[var(--auth-text-on-beige)]",
            "transition-colors touch-manipulation active:bg-black/[0.08]",
            "disabled:pointer-events-none disabled:opacity-40",
            woodyFocus.ring
          )}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          onClick={toggle}
        >
          {visible ? (
            <EyeOff className="size-[1.15rem] shrink-0" aria-hidden />
          ) : (
            <Eye className="size-[1.15rem] shrink-0" aria-hidden />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
