import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface AuthInputFieldProps
  extends Omit<React.ComponentProps<typeof Input>, "className"> {
  label: string;
  error?: string;
  /** Texto de apoio abaixo do label (opcional). */
  hint?: string;
  /** Destaque sutil quando o campo está válido (ex.: após toque, sem erro). */
  valid?: boolean;
  /** true = estilos para painel marrom (fundo bege, texto escuro) */
  variant?: "maroon" | "beige";
  className?: string;
  inputClassName?: string;
}

const styles = {
  label: "block text-sm font-medium mb-1.5",
  /** Sobre fundo bege / inputs claros (ex.: painel login). */
  hintOnBeige: "text-xs text-[var(--auth-text-on-beige)]/80 md:text-[var(--auth-text-on-beige)]/75 mb-1.5 leading-snug font-medium",
  /** Sobre fundo bordô / painel marrom — mesma hierarquia dos títulos de bloco (ex.: “Como vamos te chamar”). */
  hintOnMaroon:
    "text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--auth-text-on-maroon)]/80 mb-2 leading-relaxed",
  inputMaroon:
    "h-11 rounded-xl bg-white text-[var(--auth-text-on-beige)] border border-black/15 placeholder:text-[var(--auth-text-on-beige)]/55 focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/40 transition-[border-color,box-shadow] duration-200",
  inputMaroonValid:
    "border-[var(--auth-button)]/40 md:border-[var(--auth-button)]/35 shadow-[0_0_0_1px_rgba(95,133,123,0.12)]",
  inputBeige:
    "h-11 rounded-xl bg-white/90 text-[var(--auth-text-on-beige)] border-white/50 placeholder:text-[var(--auth-text-on-beige)]/60 focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50 transition-[border-color,box-shadow] duration-200",
  error: "text-sm mt-1.5 text-red-600",
} as const;

export const AuthInputField = forwardRef<HTMLInputElement, AuthInputFieldProps>(
  (
    {
      label,
      error,
      hint,
      valid = false,
      variant = "maroon",
      className,
      inputClassName,
      id: idProp,
      ...inputProps
    },
    ref
  ) => {
    const id = idProp ?? `auth-${label.replace(/\s/g, "-").toLowerCase()}`;
    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
    const showValid = valid && !error && variant === "maroon";

    return (
      <div className={cn("w-full", className)}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {hint ? (
          <p id={hintId} className={variant === "maroon" ? styles.hintOnMaroon : styles.hintOnBeige}>
            {hint}
          </p>
        ) : null}
        <Input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={cn(
            variant === "maroon" ? styles.inputMaroon : styles.inputBeige,
            showValid && styles.inputMaroonValid,
            inputClassName
          )}
          {...inputProps}
        />
        {error && (
          <p id={errorId} className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInputField.displayName = "AuthInputField";
