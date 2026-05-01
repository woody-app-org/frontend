import { Link } from "react-router-dom";
import { LANDING_IDS } from "../constants";
import { INSTITUTIONAL_PATHS } from "../institutional/routes";

export function LandingFooter() {
  return (
    <footer className="border-t border-black/[0.08] bg-[#f0efe8] py-14">
      <div className="mx-auto max-w-[var(--layout-max-width)] px-[var(--layout-gutter)]">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-serif text-2xl font-semibold text-[var(--woody-ink)]">
              Woody<span className="text-[var(--woody-lime)]">.</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--woody-muted)]">
              Rede social orientada por comunidades, pensada para mulheres — com conversas mais contextualizadas e
              acolhimento real.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-10 sm:grid-cols-3 md:max-w-xl">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--woody-muted)]">Produto</p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a
                    href={`#${LANDING_IDS.comoFunciona}`}
                    className="text-sm text-[var(--woody-text)]/80 transition-colors hover:text-[var(--woody-ink)]"
                  >
                    Como funciona
                  </a>
                </li>
                <li>
                  <a
                    href={`#${LANDING_IDS.recursos}`}
                    className="text-sm text-[var(--woody-text)]/80 transition-colors hover:text-[var(--woody-ink)]"
                  >
                    Recursos
                  </a>
                </li>
                <li>
                  <a
                    href={`#${LANDING_IDS.comunidades}`}
                    className="text-sm text-[var(--woody-text)]/80 transition-colors hover:text-[var(--woody-ink)]"
                  >
                    Comunidades
                  </a>
                </li>
                <li>
                  <a
                    href={`#${LANDING_IDS.seguranca}`}
                    className="text-sm text-[var(--woody-text)]/80 transition-colors hover:text-[var(--woody-ink)]"
                  >
                    Segurança
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--woody-muted)]">Conta</p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <Link
                    to="/auth/onboarding/1"
                    className="text-sm text-[var(--woody-text)]/80 transition-colors hover:text-[var(--woody-ink)]"
                  >
                    Criar conta
                  </Link>
                </li>
                <li>
                  <Link
                    to="/auth/login"
                    className="text-sm text-[var(--woody-text)]/80 transition-colors hover:text-[var(--woody-ink)]"
                  >
                    Entrar
                  </Link>
                </li>
                <li>
                  <a
                    href={`#${LANDING_IDS.planos}`}
                    className="text-sm text-[var(--woody-text)]/80 transition-colors hover:text-[var(--woody-ink)]"
                  >
                    Planos
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--woody-muted)]">Legal</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link
                    to={INSTITUTIONAL_PATHS.hub}
                    className="text-[var(--woody-text)]/80 transition-colors hover:text-[var(--woody-ink)]"
                  >
                    Institucional
                  </Link>
                </li>
                <li>
                  <Link
                    to={INSTITUTIONAL_PATHS.politicaConfidencialidade}
                    className="text-[var(--woody-text)]/80 transition-colors hover:text-[var(--woody-ink)]"
                  >
                    Confidencialidade
                  </Link>
                </li>
                <li>
                  <Link
                    to={INSTITUTIONAL_PATHS.politicaAcesso}
                    className="text-[var(--woody-text)]/80 transition-colors hover:text-[var(--woody-ink)]"
                  >
                    Acesso restritivo
                  </Link>
                </li>
                <li>
                  <Link
                    to={INSTITUTIONAL_PATHS.evitarBanimento}
                    className="text-[var(--woody-text)]/80 transition-colors hover:text-[var(--woody-ink)]"
                  >
                    Evitar banimento
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-12 border-t border-black/[0.08] pt-8 text-center text-xs text-[var(--woody-muted)]">
          © {new Date().getFullYear()} Woody. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
