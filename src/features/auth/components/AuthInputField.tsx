import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface AuthInputFieldProps
  extends Omit<React.ComponentProps<typeof Input>, "className"> {
  label: string;
  error?: string;
  /** true = estilos para painel marrom (fundo bege, texto escuro) */
  variant?: "maroon" | "beige";
  className?: string;
  inputClassName?: string;
}

const styles = {
  label: "block text-sm font-medium mb-1.5",
  inputMaroon:
    "h-11 rounded-xl bg-white md:bg-[var(--auth-panel-beige)] text-[var(--auth-text-on-beige)] border border-[var(--woody-accent)]/15 md:border-[var(--auth-panel-beige)] placeholder:text-[var(--auth-text-on-beige)]/60 md:placeholder:text-[var(--auth-text-on-beige)]/70 focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/40 md:focus-visible:ring-[var(--auth-ornament)]/50",
  inputBeige:
    "h-11 rounded-xl bg-white/90 text-[var(--auth-text-on-beige)] border-white/50 placeholder:text-[var(--auth-text-on-beige)]/60 focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50",
  error: "text-sm mt-1.5 text-red-600 md:text-red-200",
} as const;

export const AuthInputField = forwardRef<HTMLInputElement, AuthInputFieldProps>(
  (
    {
      label,
      error,
      variant = "maroon",
      className,
      inputClassName,
      id: idProp,
      ...inputProps
    },
    ref
  ) => {
    const id = idProp ?? `auth-${label.replace(/\s/g, "-").toLowerCase()}`;
    return (
      <div className={cn("w-full", className)}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <Input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            variant === "maroon" ? styles.inputMaroon : styles.inputBeige,
            inputClassName
          )}
          {...inputProps}
        />
        {error && (
          <p id={`${id}-error`} className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInputField.displayName = "AuthInputField";
