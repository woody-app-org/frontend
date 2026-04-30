import type { ChangeEvent, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MessageMediaPickerProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  accept: string;
  multiple?: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  buttonDisabled?: boolean;
  children: React.ReactNode;
  buttonClassName?: string;
  "aria-label"?: string;
}

export function MessageMediaPicker({
  fileInputRef,
  accept,
  multiple = false,
  onChange,
  disabled,
  buttonDisabled,
  children,
  buttonClassName,
  "aria-label": ariaLabel,
}: MessageMediaPickerProps) {
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        aria-hidden
        onChange={onChange}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          "size-11 shrink-0 border-[var(--woody-divider)] bg-[var(--woody-card)]",
          buttonClassName
        )}
        disabled={disabled || buttonDisabled}
        onClick={() => fileInputRef.current?.click()}
        aria-label={ariaLabel}
      >
        {children}
      </Button>
    </>
  );
}
