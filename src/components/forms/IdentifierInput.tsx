import { forwardRef, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { identifierInputProps } from "./technicalInputProps";

export type IdentifierInputProps = ComponentProps<typeof Input>;

/**
 * Username Woody, identificador de login. Desliga autocorrect/capitalize em handles técnicos.
 */
export const IdentifierInput = forwardRef<HTMLInputElement, IdentifierInputProps>(
  function IdentifierInput(props, ref) {
    return <Input ref={ref} {...identifierInputProps} {...props} />;
  }
);
