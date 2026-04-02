import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface CommunityTagsAndRulesSectionProps {
  formId: string;
  fieldClass: string;
  tagsRaw: string;
  rules: string;
  onTagsChange: (v: string) => void;
  onRulesChange: (v: string) => void;
}

export function CommunityTagsAndRulesSection({
  formId,
  fieldClass,
  tagsRaw,
  rules,
  onTagsChange,
  onRulesChange,
}: CommunityTagsAndRulesSectionProps) {
  return (
    <section className="space-y-5" aria-labelledby={`${formId}-tags-rules`}>
      <h3 id={`${formId}-tags-rules`} className="text-sm font-semibold text-[var(--woody-text)]">
        Tags e regras
      </h3>

      <div className="space-y-1.5">
        <label htmlFor={`${formId}-tags`} className="text-sm font-medium text-[var(--woody-text)]">
          Temas / tags
        </label>
        <Textarea
          id={`${formId}-tags`}
          value={tagsRaw}
          onChange={(e) => onTagsChange(e.target.value)}
          className={cn(fieldClass, "min-h-[4rem] resize-y")}
          placeholder="Ex.: carreira, networking, tech (separados por vírgula)"
        />
        <p className="text-xs text-[var(--woody-muted)]">Até 12 tags. Duplicatas são ignoradas.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${formId}-rules`} className="text-sm font-medium text-[var(--woody-text)]">
          Regras da comunidade
        </label>
        <Textarea
          id={`${formId}-rules`}
          value={rules}
          onChange={(e) => onRulesChange(e.target.value)}
          className={cn(fieldClass, "min-h-[7rem] resize-y")}
          placeholder={"Uma regra por linha ou parágrafos curtos.\nEx.: Respeite privacidade; sem spam."}
        />
        <p className="text-xs text-[var(--woody-muted)] text-right tabular-nums">{rules.length}/4000</p>
      </div>
    </section>
  );
}
