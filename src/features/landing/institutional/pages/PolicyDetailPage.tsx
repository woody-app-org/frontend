import { Navigate, useParams } from "react-router-dom";
import {
  policyAccess,
  policyBan,
  policyConfidentiality,
} from "../content";
import { InstitutionalBackLink } from "../components/InstitutionalBackLink";
import { InstitutionalPrimaryCta } from "../components/InstitutionalPrimaryCta";
import { InstitutionalProse } from "../components/InstitutionalProse";
import { INSTITUTIONAL_PATHS } from "../routes";

const bySlug: Record<string, typeof policyConfidentiality> = {
  confidencialidade: policyConfidentiality,
  "acesso-restritivo": policyAccess,
  "evitar-banimento": policyBan,
};

export function PolicyDetailPage() {
  const { slug } = useParams();
  const doc = slug ? bySlug[slug] : undefined;
  if (!doc) {
    return <Navigate to={INSTITUTIONAL_PATHS.politicas} replace />;
  }

  return (
    <main className="bg-[#e5e7eb] px-[var(--layout-gutter)] pb-24 pt-10 md:pt-14">
      <div className="mx-auto max-w-[var(--layout-max-width)]">
        <InstitutionalBackLink />

        <article className="mx-auto max-w-3xl rounded-[2rem] bg-white px-8 py-12 md:px-12 md:py-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6f4a]">{doc.badge}</p>
          <h1 className="mt-3 font-sans text-[clamp(1.35rem,3vw,2rem)] font-extrabold uppercase leading-snug tracking-[0.04em] text-[var(--woody-ink)]">
            {doc.title}
          </h1>
          <p className="mt-6 font-serif text-base leading-[1.75] text-[var(--woody-ink)] md:text-[1.05rem]">{doc.excerpt}</p>

          <div className="mt-12 space-y-10 border-t border-black/[0.06] pt-12">
            {doc.sections.map((s) => (
              <section key={s.heading}>
                <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">{s.heading}</h2>
                <InstitutionalProse className="mt-3 !max-w-none">
                  <p>{s.body}</p>
                </InstitutionalProse>
              </section>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap gap-3 border-t border-black/[0.06] pt-10">
            <InstitutionalPrimaryCta to={INSTITUTIONAL_PATHS.politicas} variant="dark">
              Todas as políticas
            </InstitutionalPrimaryCta>
            <InstitutionalPrimaryCta to={INSTITUTIONAL_PATHS.hub} variant="ghost">
              Índice institucional
            </InstitutionalPrimaryCta>
          </div>
        </article>
      </div>
    </main>
  );
}
