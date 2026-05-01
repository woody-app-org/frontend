import type { ChangeEvent, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MediaPickerProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  accept: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  buttonDisabled?: boolean;
  children: React.ReactNode;
  buttonClassName?: string;
}

export function MediaPicker({
  fileInputRef,
  accept,
  onChange,
  disabled,
  buttonDisabled,
  children,
  buttonClassName,
}: MediaPickerProps) {
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        aria-hidden
        onChange={onChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn("rounded-xl border-[var(--woody-accent)]/25", buttonClassName)}
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || buttonDisabled}
      >
        {children}
      </Button>
    </>
  );
}
