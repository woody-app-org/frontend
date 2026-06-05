import { Toaster } from "sonner";

/**
 * Toaster global estilizado para o tema Woody (cores em CSS vars).
 * Montar uma vez no layout raiz autenticado.
 */
export function WoodyToaster() {
  return (
    <Toaster
      position="top-center"
      closeButton
      duration={4500}
      visibleToasts={4}
      toastOptions={{
        classNames: {
          toast:
            "group !rounded-2xl !border !border-[var(--woody-divider)] !bg-[var(--woody-card)] !text-[var(--woody-text)] !shadow-[0_10px_40px_rgba(10,10,10,0.14)]",
          title: "!text-sm !font-semibold !text-[var(--woody-text)]",
          description: "!text-sm !text-[var(--woody-muted)]",
          closeButton:
            "!border-[var(--woody-divider)] !bg-[var(--woody-card)] !text-[var(--woody-muted)] hover:!bg-[var(--woody-nav)]/10",
          actionButton:
            "!min-h-10 !rounded-xl !font-semibold focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-[var(--woody-nav)]/25",
          success: "!border-l-[3px] !border-l-[var(--woody-nav)]",
          error: "!border-l-[3px] !border-l-red-500",
          warning: "!border-l-[3px] !border-l-amber-500",
          info: "!border-l-[3px] !border-l-[var(--woody-nav)]/80",
        },
      }}
    />
  );
}
