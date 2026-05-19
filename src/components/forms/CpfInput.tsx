import { forwardRef, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cpfInputProps } from "./technicalInputProps";

export type CpfInputProps = ComponentProps<typeof Input>;

/** CPF — defaults anti-autocorrect; formatação permanece no caller. */
export const CpfInput = forwardRef<HTMLInputElement, CpfInputProps>(function CpfInput(props, ref) {
  return <Input ref={ref} {...cpfInputProps} {...props} />;
});
