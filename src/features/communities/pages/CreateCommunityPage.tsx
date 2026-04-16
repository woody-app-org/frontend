import { useCallback, useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { woodyFocus, woodyLayout, woodySurface } from "@/lib/woody-ui";
import { FeedLayout } from "@/features/feed/components/FeedLayout";
import { ProBadge } from "@/features/subscription/components/ProBadge";
import { useSubscriptionCapabilities } from "@/features/subscription/useSubscriptionCapabilities";
import {
  createCommunity,
  ProSubscriptionRequiredError,
  validateCommunityUpdatePayload,
} from "../services/community.service";
import type { CommunityCategory, CommunityVisibility } from "@/domain/types";
import { CommunityBasicInfoSection } from "../components/community-settings/CommunityBasicInfoSection";
import { CommunityTagsAndRulesSection } from "../components/community-settings/CommunityTagsAndRulesSection";
import { CommunityAccessSection } from "../components/community-settings/CommunityAccessSection";

const fieldClass =
  "rounded-xl border-[var(--woody-accent)]/25 bg-[var(--woody-bg)] text-[var(--woody-text)] placeholder:text-[var(--woody-muted)] " +
  "focus-visible:border-[var(--woody-accent)]/35 focus-visible:ring-[var(--woody-accent)]/20 shadow-none";

function parseTagsRaw(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function CreateCommunityPage() {
  const navigate = useNavigate();
  const formId = useId();
  const { canCreateCommunity } = useSubscriptionCapabilities();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CommunityCategory>("outro");
  const [tagsRaw, setTagsRaw] = useState("");
  const [rules, setRules] = useState("");
  const [visibility, setVisibility] = useState<CommunityVisibility>("public");

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      const tags = parseTagsRaw(tagsRaw);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        tags,
        rules: rules.trim(),
        avatarUrl: null as string | null,
        coverUrl: null as string | null,
        visibility,
      };
      const v = validateCommunityUpdatePayload(payload);
      if (!v.ok) {
        setSubmitError(v.error);
        return;
      }
      setIsSubmitting(true);
      try {
        const created = await createCommunity(payload);
        navigate(`/communities/${encodeURIComponent(created.slug)}`, { replace: true });
      } catch (err) {
        if (err instanceof ProSubscriptionRequiredError) {
          setSubmitError(err.message);
        } else if (err instanceof Error) {
          setSubmitError(err.message);
        } else {
          setSubmitError("Não foi possível criar a comunidade.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, description, category, tagsRaw, rules, visibility, navigate],
  );

  return (
    <FeedLayout>
      <div className={cn("mx-auto w-full max-w-2xl pb-20 md:pb-8", woodyLayout.pagePadWide, woodyLayout.stackGapTight)}>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/communities"
            className={cn(
              woodyFocus.ring,
              "inline-flex items-center gap-1.5 text-sm font-medium text-[var(--woody-nav)] hover:underline"
            )}
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            Comunidades
          </Link>
        </div>

        {!canCreateCommunity ? (
          <section
            className={cn(
              woodySurface.cardHero,
              "space-y-4 rounded-2xl border border-[var(--woody-accent)]/16 px-5 py-8 sm:px-8"
            )}
          >
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--woody-nav)]/10 px-3 py-1 ring-1 ring-[var(--woody-accent)]/15">
              <Sparkles className="size-3.5 shrink-0 text-[var(--woody-nav)]" aria-hidden />
              <ProBadge variant="inline" />
            </div>
            <h1 className="text-xl font-bold text-[var(--woody-text)] sm:text-2xl">Criar comunidade</h1>
            <p className="text-sm leading-relaxed text-[var(--woody-muted)]">
              Abrir um grupo próprio na Woody é uma funcionalidade{" "}
              <span className="font-medium text-[var(--woody-text)]">Pro</span> — a moderação da comunidade continua a
              depender do teu papel (dona ou administradora) dentro do espaço, não do plano em cada ação.
            </p>
            <p className="text-sm text-[var(--woody-muted)]">
              Compra e renovação de plano chegam em breve; até lá, explora e participa nas comunidades existentes.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild variant="outline" className={cn(woodyFocus.ring, "touch-manipulation")}>
                <Link to="/communities">Explorar comunidades</Link>
              </Button>
            </div>
          </section>
        ) : (
          <>
            <header className="space-y-1">
              <h1 className="text-xl font-bold text-[var(--woody-text)] sm:text-2xl">Criar comunidade</h1>
              <p className="text-sm text-[var(--woody-muted)]">
                Define o propósito do grupo. Depois de criar, podes ajustar imagens e detalhes nas definições.
              </p>
            </header>

            <form
              onSubmit={handleSubmit}
              className={cn(
                "space-y-8 rounded-2xl border border-[var(--woody-accent)]/16 bg-[var(--woody-card)]/95 p-4 sm:p-6 shadow-[0_1px_3px_rgba(58,45,36,0.05)]"
              )}
            >
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

              {submitError ? (
                <p className="rounded-lg border border-[var(--woody-accent)]/20 bg-[var(--woody-nav)]/5 px-3 py-2 text-sm text-[var(--woody-text)]">
                  {submitError}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--woody-accent)]/12 pt-4">
                <Button type="button" variant="ghost" asChild className={woodyFocus.ring}>
                  <Link to="/communities">Cancelar</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(woodyFocus.ring, "min-w-[10rem] touch-manipulation")}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                      A criar…
                    </>
                  ) : (
                    "Criar comunidade"
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </FeedLayout>
  );
}
