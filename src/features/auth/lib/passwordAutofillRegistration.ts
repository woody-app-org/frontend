import type {
  ChangeHandler,
  FieldValues,
  Path,
  PathValue,
  UseFormRegisterReturn,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";

/**
 * Compõe o resultado de `register("password")` com `onInput` para Safari/Mac:
 * autofill pode atualizar o DOM sem disparar apenas `change` como o React Hook Form espera.
 *
 * @param trigger — opcional; em onboarding chama-se `form.trigger` para forçar `formState.isValid`
 *   após autofill (Safari pode atrasar a subscrição do resolver).
 */
export function withPasswordAutofillSync<T extends FieldValues>(
  registration: UseFormRegisterReturn<Path<T>>,
  setValue: UseFormSetValue<T>,
  name: Path<T>,
  trigger?: UseFormTrigger<T>
): UseFormRegisterReturn<Path<T>> & {
  onInput: (e: React.FormEvent<HTMLInputElement>) => void;
} {
  const { onChange: regOnChange, ...rest } = registration;

  const wrappedOnChange: ChangeHandler = async (event) => {
    await regOnChange(event);
    if (trigger) {
      await trigger(name);
    }
  };

  return {
    ...rest,
    onChange: wrappedOnChange,
    onInput: async (e: React.FormEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      setValue(name, value as PathValue<T, typeof name>, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      if (trigger) {
        await trigger(name);
      }
    },
  };
}