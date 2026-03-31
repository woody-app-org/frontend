import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Loader2, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyContext, woodyDialogScroll, woodyFocus } from "@/lib/woody-ui";
import type { Community, CommunityCategory, CommunityVisibility } from "@/domain/types";
import { updateCommunity, validateCommunityUpdatePayload } from "../../services/community.service";
import { CommunityAppearanceSection } from "./CommunityAppearanceSection";
import { CommunityBasicInfoSection } from "./CommunityBasicInfoSection";
import { CommunityTagsAndRulesSection } from "./CommunityTagsAndRulesSection";
import { CommunityAccessSection } from "./CommunityAccessSection";

const fieldClass =
  "rounded-xl border-[var(--woody-accent)]/25 bg-[var(--woody-bg)] text-[var(--woody-text)] placeholder:text-[var(--woody-muted)] " +
  "focus-visible:border-[var(--woody-accent)]/35 focus-visible:ring-[var(--woody-accent)]/20 shadow-none";

function tagsToRaw(tags: string[]): string {
  return tags.join(", ");
}

function parseTagsRaw(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface CommunityEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: Community;
  viewerId: string;
  /** Para texto de apoio: dona ou administradora convidada. */
  adminRoleLabel: "dona" | "administradora";
  onSaved: (community: Community) => void;
}

export function CommunityEditDialog({
  open,
  onOpenChange,
  community,
  viewerId,
  adminRoleLabel,
  onSaved,
}: CommunityEditDialogProps) {
  const formId = useId();
  const [name, setName] = useState(community.name);
  const [description, setDescription] = useState(community.description);
  const [category, setCategory] = useState<CommunityCategory>(community.category);
  const [tagsRaw, setTagsRaw] = useState(tagsToRaw(community.tags));
  const [rules, setRules] = useState(community.rules);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(community.avatarUrl);
  const [coverUrl, setCoverUrl] = useState<string | null>(community.coverUrl);
  const [visibility, setVisibility] = useState<CommunityVisibility>(community.visibility);

  const [fileError, setFileError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const communityRef = useRef(community);
  communityRef.current = community;

  useEffect(() => {
    if (!open) {
      setSubmitError(null);
      setFileError(null);
      setSuccess(false);
      setIsSubmitting(false);
      return;
    }
    const c = communityRef.current;
    setName(c.name);
    setDescription(c.description);
    setCategory(c.category);
    setTagsRaw(tagsToRaw(c.tags));
    setRules(c.rules);
    setAvatarUrl(c.avatarUrl);
    setCoverUrl(c.coverUrl);
    setVisibility(c.visibility);
    setSubmitError(null);
    setFileError(null);
    setSuccess(false);
  }, [open]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        tags: parseTagsRaw(tagsRaw),
        rules: rules.trim(),
        avatarUrl,
        coverUrl,
        visibility,
      };

      const v = validateCommunityUpdatePayload(payload);
      if (!v.ok) {
        setSubmitError(v.error);
        return;
      }

      setIsSubmitting(true);
      try {
        const result = await updateCommunity(viewerId, community.id, payload);
        if (!result.ok) {
          setSubmitError(result.error);
          return;
        }
        setSuccess(true);
        onSaved(result.community);
        window.setTimeout(() => {
          onOpenChange(false);
          setSuccess(false);
        }, 900);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      name,
      description,
      category,
      tagsRaw,
      rules,
      avatarUrl,
      coverUrl,
      visibility,
      community.id,
      viewerId,
      onOpenChange,
      onSaved,
    ]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          woodyDialogScroll,
          "top-[4%] translate-y-0 sm:top-1/2 sm:-translate-y-1/2",
          "border-[var(--woody-accent)]/15"
        )}
      >
        <DialogHeader className="space-y-2 pr-8 text-left">
          <div className={cn(woodyContext.adminBadge)}>
            <Shield className="size-3.5 shrink-0" aria-hidden />
            Administrativo · comunidade
          </div>
          <DialogTitle className="text-[var(--woody-text)]">Editar dados da comunidade</DialogTitle>
          <DialogDescription>
            Como <strong>{adminRoleLabel}</strong>, você altera nome, aparência, regras e visibilidade do espaço — não o
            perfil pessoal. Mock local até integrar community.service com a API (ver lib/backendIntegrationHints).
          </DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={handleSubmit}
          className="mt-3 space-y-8 border-t border-[var(--woody-accent)]/10 pt-6"
          aria-busy={isSubmitting}
        >
          <CommunityAppearanceSection
            formId={formId}
            communityName={name || community.name}
            avatarUrl={avatarUrl}
            coverUrl={coverUrl}
            onAvatarChange={setAvatarUrl}
            onCoverChange={setCoverUrl}
            onFileError={setFileError}
          />

          <CommunityBasicInfoSection
            formId={formId}
            fieldClass={fieldClass}
            name={name}
            description={description}
            category={category}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onCategoryChange={setCategory}
          />

          <CommunityTagsAndRulesSection
            formId={formId}
            fieldClass={fieldClass}
            tagsRaw={tagsRaw}
            rules={rules}
            onTagsChange={setTagsRaw}
            onRulesChange={setRules}
          />

          <CommunityAccessSection formId={formId} visibility={visibility} onVisibilityChange={setVisibility} />

          {fileError ? (
            <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
              {fileError}
            </p>
          ) : null}
          {submitError ? (
            <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
              {submitError}
            </p>
          ) : null}
          {success ? (
            <p
              role="status"
              className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-800 dark:text-emerald-200"
            >
              Comunidade atualizada.
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "min-h-11 w-full rounded-xl border-[var(--woody-accent)]/25 sm:w-auto",
                woodyFocus.ring
              )}
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || success}
              className={cn(
                "min-h-11 w-full rounded-xl bg-[var(--woody-nav)] text-white hover:bg-[var(--woody-nav)]/90 active:scale-[0.98] sm:w-auto",
                woodyFocus.ring
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
