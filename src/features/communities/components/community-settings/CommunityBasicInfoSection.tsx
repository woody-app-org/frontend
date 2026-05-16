import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CommunityCategory } from "@/domain/types";
import { COMMUNITY_CATEGORY_OPTIONS } from "../../lib/communityCategoryOptions";

export interface CommunityBasicInfoSectionProps {
  formId: string;
  fieldClass: string;
  name: string;
  description: string;
  category: CommunityCategory;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onCategoryChange: (v: CommunityCategory) => void;
}

export function CommunityBasicInfoSection({
  formId,
  fieldClass,
  name,
  description,
  category,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
}: CommunityBasicInfoSectionProps) {
  return (
    <section className="space-y-4" aria-labelledby={`${formId}-basics`}>
      <h3 id={`${formId}-basics`} className="text-sm font-semibold text-[var(--woody-text)]">
        Informações principais
      </h3>

      <div className="space-y-1.5">
        <label htmlFor={`${formId}-name`} className="text-sm font-medium text-[var(--woody-text)]">
          Nome da comunidade
        </label>
        <Input
          id={`${formId}-name`}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className={cn(fieldClass)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${formId}-cat`} className="text-sm font-medium text-[var(--woody-text)]">
          Categoria
        </label>
        <select
          id={`${formId}-cat`}
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as CommunityCategory)}
          className={cn(fieldClass, "h-10 w-full cursor-pointer py-2")}
        >
          {COMMUNITY_CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={`${formId}-desc`} className="text-sm font-medium text-[var(--woody-text)]">
          Descrição
        </label>
        <Textarea
          id={`${formId}-desc`}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className={cn(fieldClass, "min-h-[6.5rem] resize-y")}
          placeholder="Do que se trata este espaço? Quem é bem-vinda?"
        />
        <p className="text-xs text-[var(--woody-muted)] text-right tabular-nums">{description.length}/2000</p>
      </div>
    </section>
  );
}
