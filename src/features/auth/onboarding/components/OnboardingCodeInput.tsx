import { useRef, useCallback, type KeyboardEvent, type ClipboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface OnboardingCodeInputProps {
  value: string;
  onChange: (digits: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  idPrefix?: string;
}

const LENGTH = 6;

/**
 * Entrada de código em 6 células — preparada para OTP real (paste, foco, a11y).
 */
export function OnboardingCodeInput({
  value,
  onChange,
  disabled,
  hasError,
  idPrefix = "otp",
}: OnboardingCodeInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.replace(/\D/g, "").slice(0, LENGTH);
  const chars = Array.from({ length: LENGTH }, (_, i) => digits[i] ?? "");

  const focusAt = useCallback((i: number) => {
    const el = refs.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  const commitDigits = useCallback(
    (next: string) => {
      onChange(next.replace(/\D/g, "").slice(0, LENGTH));
    },
    [onChange]
  );

  const handleChange = (index: number, raw: string) => {
    const d = raw.replace(/\D/g, "").slice(-1);
    const arr = [...chars];
    arr[index] = d;
    const joined = arr.join("").replace(/\s/g, "");
    commitDigits(joined);
    if (d && index < LENGTH - 1) {
      focusAt(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!chars[index] && index > 0) {
        e.preventDefault();
        focusAt(index - 1);
      } else if (chars[index]) {
        const arr = [...chars];
        arr[index] = "";
        commitDigits(arr.join(""));
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusAt(index - 1);
    }
    if (e.key === "ArrowRight" && index < LENGTH - 1) {
      e.preventDefault();
      focusAt(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    commitDigits(text);
    const nextIdx = Math.min(text.length, LENGTH - 1);
    focusAt(nextIdx);
  };

  return (
    <div
      className="flex flex-wrap gap-2 sm:gap-2.5 justify-center sm:justify-start"
      role="group"
      aria-label="Código de verificação de 6 dígitos"
    >
      {chars.map((ch, i) => (
        <input
          key={i}
          id={`${idPrefix}-${i}`}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={ch}
          aria-invalid={hasError}
          className={cn(
            "size-11 sm:size-12 rounded-xl border bg-[var(--auth-panel-beige)]/90 text-center text-lg font-semibold tabular-nums",
            "text-[var(--auth-text-on-beige)] shadow-inner transition-[border-color,box-shadow,transform] duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/55 focus-visible:border-[var(--auth-button)]",
            "disabled:opacity-45 disabled:cursor-not-allowed",
            hasError
              ? "border-red-400/80 ring-1 ring-red-400/30"
              : "border-[var(--woody-accent)]/20"
          )}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
