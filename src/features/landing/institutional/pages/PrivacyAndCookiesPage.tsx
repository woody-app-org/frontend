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
          <h1 className="font-heading mt-3 text-balance text-[clamp(1.35rem,3vw,2rem)] font-bold uppercase leading-snug tracking-[0.02em] text-[var(--woody-ink)]">
            Política de Cookies e Tecnologias Locais
          </h1>
          <p className="mt-2 text-[13px] font-normal leading-snug text-[var(--woody-ink)]/65">
            Woody | Versão 1.0 | Última atualização: 13 de maio de 2026
          </p>
          <p className="mt-6 text-base leading-[1.75] text-[var(--woody-ink)] md:text-[1.05rem]">
            Um resumo simples de como a Woody trata dados no seu navegador neste momento — sem juridiquês
            excessivo, mas com honestidade. Esta política explica o uso de cookies, armazenamento local, sessão,
            recursos técnicos e terceiros necessários para a aplicação funcionar de forma segura e transparente.
          </p>

          <div className="mt-12 space-y-10 border-t border-black/[0.06] pt-12">
            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Escopo desta política</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  Esta política trata especificamente de cookies e tecnologias parecidas usadas no navegador, como{" "}
                  <strong>localStorage</strong> e <strong>sessionStorage</strong>. Ela não substitui a Política de Privacidade
                  completa da Woody, que deve explicar, de forma mais ampla, como dados de conta, perfil, publicações,
                  comunidades, mensagens, denúncias, pagamentos, logs e suporte são tratados.
                </p>
                <p>
                  Quando falamos em &quot;tecnologias locais&quot;, estamos falando de recursos do próprio navegador que ajudam a
                  manter a sessão ativa, preservar etapas de uso e permitir que a interface funcione corretamente no
                  dispositivo da usuária.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Cookies de rastreamento</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  No estado atual da aplicação, a Woody <strong>não utiliza cookies próprios de rastreamento</strong>, cookies de
                  marketing, pixels de anúncios ou cookies destinados a seguir a usuária entre sites diferentes.
                </p>
                <p>
                  Também não usamos, neste desenho atual, um &quot;cookie Woody&quot; de analytics ou de login no sentido clássico de
                  cookies HTTP próprios para sessão.
                </p>
                <p>
                  Por isso, no cenário técnico atual, <strong>não exigimos um banner de consentimento para cookies de marketing</strong> no
                  carregamento normal da aplicação. Se a Woody passar a usar cookies de analytics, anúncios, pixels ou
                  tecnologias semelhantes, esta política será atualizada e, quando aplicável, serão oferecidas escolhas claras
                  às usuárias.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Armazenamento local da sessão</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  Para manter a usuária autenticada depois do login, a aplicação pode guardar no navegador um{" "}
                  <strong>token de autenticação</strong>, como um JWT, e <strong>dados mínimos de perfil</strong> necessários para a interface
                  funcionar corretamente.
                </p>
                <p>
                  Esses dados podem incluir chaves como{" "}
                  <code className="rounded bg-black/[0.06] px-1 py-0.5 text-[0.92em]">woody_auth_token</code> e{" "}
                  <code className="rounded bg-black/[0.06] px-1 py-0.5 text-[0.92em]">woody_auth_user</code> no{" "}
                  <strong>localStorage</strong> do navegador. Isso não é um cookie, mas cumpre uma função parecida: lembrar, naquele
                  dispositivo, que a usuária já está autenticada.
                </p>
                <p>
                  A Woody deve usar essas informações apenas para viabilizar funcionalidades essenciais da aplicação, como
                  manter a sessão ativa, identificar permissões de acesso, carregar dados básicos da conta e proteger áreas
                  restritas.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Dados temporários durante o onboarding</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  Durante o onboarding, a Woody pode usar <strong>sessionStorage</strong> para guardar o progresso da usuária enquanto a
                  aba do navegador estiver aberta.
                </p>
                <p>
                  Essa prática ajuda a evitar que a usuária perca etapas no meio do fluxo, como criação de conta, validações,
                  escolhas iniciais ou preferências temporárias.
                </p>
                <p>
                  O sessionStorage costuma ser apagado quando a aba ou janela do navegador é fechada, embora o comportamento
                  final possa variar conforme navegador, sistema operacional e configurações do dispositivo.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">API, autenticação e recursos em tempo real</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  A aplicação se comunica com a <strong>API da Woody</strong> usando o token de autenticação da usuária, normalmente
                  enviado no cabeçalho <strong>Authorization Bearer</strong>.
                </p>
                <p>
                  Isso significa que, no desenho atual, a autenticação principal da aplicação{" "}
                  <strong>não depende de cookies de sessão tradicionais</strong>.
                </p>
                <p>
                  Para recursos em tempo real, como mensagens, avisos, notificações ou atualizações instantâneas, a Woody pode
                  usar tecnologias como <strong>SignalR</strong> com a mesma lógica de autenticação por token.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Pagamentos e fornecedores externos</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  Quando houver pagamento, ele poderá ser processado por fornecedor externo especializado, como o{" "}
                  <strong>Stripe</strong> ou outro provedor de pagamento adotado pela Woody.
                </p>
                <p>
                  No desenho atual, a tendência é usar <strong>redirecionamento seguro</strong> para a página do fornecedor de pagamento, em
                  vez de carregar diretamente campos sensíveis de pagamento dentro da página da Woody.
                </p>
                <p>
                  Essa escolha reduz a quantidade de dados financeiros tratados diretamente pela Woody. Ainda assim, o
                  fornecedor de pagamento poderá tratar dados próprios da transação conforme seus termos, políticas de
                  privacidade e obrigações legais.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Fontes, scripts e outros terceiros</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  No carregamento normal da aplicação, a Woody usa as famílias <strong>Public Sans</strong>, <strong>Raleway</strong>,{" "}
                  <strong>Space Grotesk</strong> e <strong>Instrument Serif</strong>, com licença aberta OFL, incluídas no pacote da própria
                  aplicação e servidas pelo mesmo site.
                </p>
                <p>
                  Isso significa que, no cenário atual, a aplicação <strong>não precisa fazer pedidos ao Google Fonts</strong> nem a outros
                  CDNs de tipografia para carregar essas fontes.
                </p>
                <p>
                  Se, no futuro, a Woody passar a carregar fontes, scripts, mapas, vídeos, analytics, pixels, chatbots ou outros
                  recursos de terceiros em domínios externos, esta página será atualizada. Quando fizer sentido legal e técnico,
                  também serão oferecidas opções de consentimento ou configuração.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Finalidades do uso dessas tecnologias</h2>
              <InstitutionalProse className="mt-3 !max-w-none [&_ul]:mt-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
                <p>
                  As tecnologias descritas nesta política são usadas, no cenário atual, para finalidades essenciais ou
                  funcionais da plataforma, como:
                </p>
                <ul>
                  <li>manter a sessão da usuária ativa de forma segura;</li>
                  <li>permitir acesso a áreas autenticadas da plataforma;</li>
                  <li>preservar temporariamente etapas do onboarding;</li>
                  <li>carregar dados mínimos necessários para a interface;</li>
                  <li>apoiar recursos em tempo real, como mensagens e avisos;</li>
                  <li>reduzir fricção no uso da aplicação sem recorrer a rastreamento de marketing.</li>
                </ul>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Base legal e natureza do tratamento</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  O uso de tecnologias essenciais para autenticação, segurança, funcionamento da conta e execução da
                  plataforma pode estar relacionado à execução do serviço solicitado pela usuária, ao cumprimento de
                  obrigações legais ou regulatórias e ao legítimo interesse da Woody em manter a aplicação segura e funcional,
                  conforme o caso concreto.
                </p>
                <p>
                  Quando uma tecnologia depender de consentimento específico, como cookies de marketing, pixels de publicidade
                  ou rastreamento não essencial, a Woody deverá informar isso de forma clara e disponibilizar mecanismos
                  adequados de escolha, quando aplicável.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Por quanto tempo esses dados ficam no navegador</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  Os dados guardados no localStorage podem permanecer no dispositivo até que a usuária saia da conta, limpe os
                  dados do site no navegador, use uma função de remoção disponibilizada pela Woody ou até que a aplicação
                  substitua esses dados por uma nova sessão.
                </p>
                <p>
                  Os dados guardados no sessionStorage tendem a permanecer apenas enquanto a aba ou janela estiver aberta.
                </p>
                <p>
                  Limpar dados do navegador ou sair da conta remove ou invalida dados locais daquele dispositivo, mas isso não
                  significa, por si só, apagar a conta da usuária nem eliminar todos os dados mantidos nos servidores da Woody.
                  Pedidos de exclusão, acesso ou correção de dados devem seguir os canais indicados na Política de Privacidade da
                  Woody.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Como a usuária pode controlar ou apagar esses dados</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  A usuária pode encerrar a sessão usando a opção de <strong>sair da conta</strong>, quando disponível.
                </p>
                <p>
                  Também pode limpar os dados do site nas configurações do navegador, incluindo armazenamento local, sessão e
                  outros dados associados ao domínio da Woody.
                </p>
                <p>
                  Ao limpar esses dados, algumas funcionalidades podem deixar de funcionar corretamente até que a usuária faça
                  login novamente ou reinicie determinadas etapas.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Segurança</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  A Woody deve adotar medidas técnicas e organizacionais proporcionais para proteger tokens, sessões e dados
                  tratados pela aplicação, incluindo controles de autenticação, autorização, expiração de sessão, validações no
                  backend e práticas de desenvolvimento seguro.
                </p>
                <p>
                  A Woody cuida da segurança da plataforma com responsabilidade, mas proteção também é um cuidado compartilhado.
                  Nenhum mecanismo técnico é absoluto. Por isso, recomendamos que cada usuária proteja seu dispositivo, não
                  compartilhe conta ou senha, mantenha o navegador atualizado e saia da conta ao usar aparelhos compartilhados.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">O que a Woody não faz no cenário atual</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  No carregamento normal da aplicação, conforme o desenho técnico atual, a Woody{" "}
                  <strong>não usa cookies de marketing, pixels de anúncios ou rastreadores</strong> destinados a acompanhar a usuária entre
                  diferentes sites.
                </p>
                <p>
                  Também <strong>não vende dados pessoais de usuárias para anunciantes</strong>.
                </p>
                <p>
                  Se algum desses pontos mudar, a política será atualizada antes ou junto da mudança relevante, com comunicação
                  compatível com o impacto da alteração.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Direitos das usuárias</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  As usuárias podem exercer direitos previstos na legislação aplicável de proteção de dados, incluindo confirmação
                  da existência de tratamento, acesso, correção, eliminação, informação sobre compartilhamento, revisão de
                  decisões automatizadas quando aplicável e outros direitos previstos em lei.
                </p>
                <p>
                  Pedidos relacionados a dados pessoais devem ser enviados pelos canais oficiais indicados pela Woody na
                  Política de Privacidade ou em seus meios de contato institucionais.
                </p>
                <p>
                  Esta política explica tecnologias locais do navegador; pedidos sobre dados de conta, publicações, comunidades,
                  mensagens, pagamentos ou denúncias devem ser tratados pela Política de Privacidade completa.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Alterações nesta política</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  A Woody pode atualizar esta política para refletir mudanças técnicas, legais, operacionais ou de produto.
                </p>
                <p>
                  Se forem adicionadas tecnologias não essenciais, como analytics, anúncios, pixels ou fornecedores de
                  rastreamento, a Woody deverá atualizar as informações desta página e, quando necessário, disponibilizar escolhas
                  adequadas às usuárias.
                </p>
                <p>
                  A versão mais recente desta política deve ficar disponível em local acessível dentro da aplicação ou do site
                  da Woody.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Contato</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  Para dúvidas sobre esta política, privacidade ou tratamento de dados pessoais, a usuária pode entrar em contato
                  com a Woody pelo canal oficial informado na aplicação.
                </p>
                <p>
                  <strong>Contato para privacidade:</strong> [inserir e-mail oficial da Woody].
                </p>
                <p>
                  <strong>Controladora:</strong> [inserir razão social ou nome da responsável pela Woody, quando definido].
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">Mais leitura</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  As{" "}
                  <Link to={INSTITUTIONAL_PATHS.politicas} className="font-semibold text-[#3d4a28] underline-offset-2 hover:underline">
                    políticas da comunidade
                  </Link>{" "}
                  (confidencialidade, acesso, convívio) complementam este texto. Para regras de comportamento, vê também{" "}
                  <Link to={INSTITUTIONAL_PATHS.regras} className="font-semibold text-[#3d4a28] underline-offset-2 hover:underline">
                    regras e comportamento
                  </Link>
                  .
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
