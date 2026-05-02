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
  /** Permite selecionar vários ficheiros de uma vez. */
  multiple?: boolean;
}

export function MediaPicker({
  fileInputRef,
  accept,
  onChange,
  disabled,
  buttonDisabled,
  children,
  buttonClassName,
  multiple = false,
}: MediaPickerProps) {
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        aria-hidden
        multiple={multiple}
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
