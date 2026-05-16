import { CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus } from "@/lib/woody-ui";

export interface ReportSuccessStateProps {
  isComment: boolean;
  onClose: () => void;
}

export function ReportSuccessState({ isComment, onClose }: ReportSuccessStateProps) {
  return (
    <div className="flex flex-col items-center px-4 py-8 text-center sm:px-6">
      <div
        className="mb-4 flex size-14 items-center justify-center rounded-full bg-[var(--woody-nav)]/12 text-[var(--woody-nav)]"
        aria-hidden
      >
        <CircleCheck className="size-8 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--woody-text)]">Recebemos sua denúncia</h3>
      <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-[var(--woody-muted)]">
        Obrigada por ajudar a manter a Woody acolhedora. Nossa equipe vai analisar com cuidado
        {isComment ? " este comentário" : " esta publicação"}.
      </p>
      <Button
        type="button"
        className={cn(
          woodyFocus.ring,
          "mt-8 w-full max-w-xs bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90 sm:w-auto"
        )}
        onClick={onClose}
      >
        Fechar
      </Button>
    </div>
  );
}
