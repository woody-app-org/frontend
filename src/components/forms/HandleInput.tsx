import { forwardRef, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { handleInputProps } from "./technicalInputProps";

export type HandleInputProps = ComponentProps<typeof Input>;

/**
 * @ de rede social, handles externos, rascunho de hashtag.
 */
export const HandleInput = forwardRef<HTMLInputElement, HandleInputProps>(function HandleInput(
  props,
  ref
) {
  return <Input ref={ref} {...handleInputProps} {...props} />;
});
