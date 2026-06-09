import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import {
  WOODY_POLICIES_SECTIONS,
  WOODY_POLICIES_UPDATED_AT,
  WOODY_COOKIES_SECTIONS,
  WOODY_COOKIES_UPDATED_AT,
  type PolicyContentSection,
} from "../policiesContent";
import { cn } from "@/lib/utils";

function PolicySectionBlock({ section }: { section: PolicyContentSection }) {
  return (
    <section className="space-y-2.5">
      <h3 className="font-heading text-[0.95rem] font-bold text-[var(--auth-text-on-maroon)]">
        {section.heading}
      </h3>
      <div className="space-y-2 text-[0.8125rem] leading-relaxed text-[var(--auth-text-on-maroon)]/82 sm:text-sm">
        {section.paragraphs.map((p, i) =>
          p.startsWith("• ") ? (
            <p key={i} className="pl-3.5 -indent-3.5">
              {p}
            </p>
          ) : (
            <p key={i}>{p}</p>
          )
        )}
      </div>
    </section>
  );
}

export interface WoodyPoliciesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Exibe o texto corrido das Políticas da Woody (Termos, Privacidade, Segurança,
 * Diretrizes da Comunidade, Moderação etc.) e da Política de Cookies, na íntegra,
 * para leitura antes da confirmação no onboarding.
 */
export function WoodyPoliciesDialog({ open, onOpenChange }: WoodyPoliciesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="space-y-1">
            <DialogTitle className="font-heading text-[1.1rem] text-[var(--auth-text-on-maroon)]">
              Políticas da Woody
            </DialogTitle>
            <DialogDescription>
              Termos de Uso, Política de Privacidade, Política de Segurança da Informação,
              Diretrizes da Comunidade, Política de Moderação e Canal de Denúncias e demais
              regras da plataforma — texto completo, na íntegra.
            </DialogDescription>
          </div>
          <DialogClose
            className={cn(
              "shrink-0 rounded-lg p-1.5 text-[var(--auth-text-on-maroon)]/60 hover:bg-black/5 hover:text-[var(--auth-text-on-maroon)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--auth-button)]/50"
            )}
            aria-label="Fechar"
          >
            <X className="size-4" />
          </DialogClose>
        </DialogHeader>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1 sm:pr-2">
          <div className="space-y-8 pb-2">
            <div>
              <p className="mb-5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--auth-text-on-maroon)]/50">
                WOODY — Políticas de Segurança, Privacidade e Comunidade · {WOODY_POLICIES_UPDATED_AT}
              </p>
              <div className="space-y-6">
                {WOODY_POLICIES_SECTIONS.map((section) => (
                  <PolicySectionBlock key={section.heading} section={section} />
                ))}
              </div>
            </div>

            <div className="border-t border-black/10 pt-6">
              <p className="mb-5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-[var(--auth-text-on-maroon)]/50">
                WOODY — Política de Cookies e Tecnologias Locais · {WOODY_COOKIES_UPDATED_AT}
              </p>
              <div className="space-y-6">
                {WOODY_COOKIES_SECTIONS.map((section) => (
                  <PolicySectionBlock key={section.heading} section={section} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
