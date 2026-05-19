import { forwardRef, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { codeInputProps } from "./technicalInputProps";

export type CodeInputProps = ComponentProps<typeof Input>;

/** Código de convite beta ou token alfanumérico (campo único). */
export const CodeInput = forwardRef<HTMLInputElement, CodeInputProps>(function CodeInput(props, ref) {
  return <Input ref={ref} {...codeInputProps} {...props} />;
});
