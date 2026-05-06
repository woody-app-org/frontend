import { Link } from "react-router-dom";
import { InstitutionalBackLink } from "../components/InstitutionalBackLink";
import { InstitutionalPrimaryCta } from "../components/InstitutionalPrimaryCta";
import { InstitutionalProse } from "../components/InstitutionalProse";
import { INSTITUTIONAL_PATHS } from "../routes";

/**
 * Transparência sobre armazenamento no navegador e terceiros no estado atual da aplicação.
 * Não substitui aconselhamento jurídico; texto pensado para clareza humana.
 */
export function PrivacyAndCookiesPage() {
  return (
    <main className="bg-[#e5e7eb] px-[var(--layout-gutter)] pb-24 pt-10 md:pt-14">
      <div className="mx-auto max-w-[var(--layout-max-width)]">
        <InstitutionalBackLink />

        <article className="mx-auto max-w-3xl rounded-[2rem] bg-white px-8 py-12 md:px-12 md:py-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a6f4a]">Transparência</p>
          <h1 className="mt-3 font-sans text-[clamp(1.35rem,3vw,2rem)] font-extrabold uppercase leading-snug tracking-[0.04em] text-[var(--woody-ink)]">
            Privacidade e cookies
          </h1>
          <p className="mt-6 font-serif text-base leading-[1.75] text-[var(--woody-ink)] md:text-[1.05rem]">
            Um resumo simples de como a Woody trata dados no teu navegador neste momento — sem juridiquês
            excessivo, mas com honestidade.
          </p>

          <div className="mt-12 space-y-10 border-t border-black/[0.06] pt-12">
            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Cookies de rastreamento</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  No estado atual da aplicação, <strong>não usamos cookies próprios</strong> para sessão ou para te
                  seguir entre sites. Ou seja, não há um &quot;cookie woody&quot; de analytics ou de login no sentido clássico de
                  HTTP cookies.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Armazenamento local (sessão)</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  Para te manteres autenticada após entrares, guardamos um <strong>token de autenticação (JWT)</strong> e{" "}
                  <strong>dados mínimos de perfil</strong> que a interface precisa para te mostrar — normalmente chaves como{" "}
                  <code className="rounded bg-black/[0.06] px-1 py-0.5 text-[0.92em]">woody_auth_token</code> e{" "}
                  <code className="rounded bg-black/[0.06] px-1 py-0.5 text-[0.92em]">woody_auth_user</code> no armazenamento
                  local do navegador (<strong>localStorage</strong>). Isto não é um cookie, mas cumpre a mesma ideia de
                  &quot;lembrar quem és neste dispositivo&quot;.
                </p>
                <p>
                  No <strong>onboarding</strong>, podemos usar <strong>sessionStorage</strong> para guardar o progresso só
                  enquanto a aba está aberta — ajuda a não perderes passos no meio do fluxo.
                </p>
                <p>
                  Se quiseres &quot;esquecer&quot; a sessão neste aparelho, podes usar sair da conta ou limpar os dados do site nas
                  definições do navegador.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">API e tempo real</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  A aplicação fala com a <strong>nossa API</strong> usando o teu token (normalmente no cabeçalho{" "}
                  <strong>Bearer</strong>), não através de cookies de sessão. Para recursos em tempo real (por exemplo{" "}
                  <strong>mensagens ou avisos</strong>), usamos <strong>SignalR</strong> com a mesma ideia de autenticação.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Pagamentos</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  Pagamentos são tratados por <strong>fornecedor externo</strong> (como o <strong>Stripe</strong>), em
                  princípio por <strong>redirecionamento seguro</strong> para a página deles — não carregamos elementos de
                  pagamento embutidos no nosso site neste desenho, o que reduz o que corre diretamente na nossa página.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Fontes e outros terceiros</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  Usamos as famílias <strong>Plus Jakarta Sans</strong> e <strong>Lora</strong> (licença aberta OFL),{" "}
                  <strong>incluídas no pacote da app</strong> e servidas pelo mesmo site — <strong>sem pedidos ao Google Fonts</strong>{" "}
                  nem a outros CDNs de tipografia no carregamento normal.
                </p>
                <p>
                  Se no futuro passarmos a carregar fontes ou scripts de terceiros noutros domínios, atualizamos esta página
                  e, quando fizer sentido legal e técnico, o fluxo de <strong>consentimento</strong>.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">O que pode mudar</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  Se um dia introduzirmos <strong>analytics, anúncios ou pixels</strong>, a política e as escolhas na app
                  serão atualizadas. O objetivo é que nada disso corra &quot;às escondidas&quot; — por agora, o diagnóstico técnico
                  atual é: <strong>sem esses fornecedores no carregamento normal da app</strong>.
                </p>
                <p>
                  <strong>Não tens de aceitar um banner pesado de cookies</strong> só para usar a Woody hoje, porque não há
                  essa camada de marketing no que analisámos — se isso mudar, tratamos disso de forma explícita.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Mais leitura</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  As <Link to={INSTITUTIONAL_PATHS.politicas} className="font-semibold text-[#3d4a28] underline-offset-2 hover:underline">políticas da comunidade</Link>{" "}
                  (confidencialidade, acesso, convívio) complementam este texto. Para regras de comportamento, vê também{" "}
                  <Link to={INSTITUTIONAL_PATHS.regras} className="font-semibold text-[#3d4a28] underline-offset-2 hover:underline">regras e comportamento</Link>.
                </p>
              </InstitutionalProse>
            </section>
          </div>

          <div className="mt-14 flex flex-wrap gap-3 border-t border-black/[0.06] pt-10">
            <InstitutionalPrimaryCta to={INSTITUTIONAL_PATHS.politicas} variant="dark">
              Políticas
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
