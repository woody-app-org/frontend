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
            Woody | Versão 1.1 | Última atualização: 09 de junho de 2026
          </p>
          <p className="mt-6 text-base leading-[1.75] text-[var(--woody-ink)] md:text-[1.05rem]">
            Sabemos que políticas nem sempre são a leitura mais animada do dia. Por isso, a Woody organizou este
            documento de forma direta para explicar quais tecnologias locais podem ser usadas no navegador, por que
            elas existem e como a usuária pode controlar essas informações.
          </p>

          <div className="mt-12 space-y-10 border-t border-black/[0.06] pt-12">
            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">1. Escopo desta política</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  Esta política trata especificamente de cookies, armazenamento local, armazenamento de sessão,
                  tokens de autenticação e tecnologias semelhantes utilizadas no navegador ou no dispositivo da
                  usuária. Ela complementa, mas não substitui, a Política de Privacidade da Woody, que explica o
                  tratamento mais amplo de dados de conta, perfil, publicações, comunidades, mensagens, denúncias,
                  pagamentos, logs e suporte.
                </p>
                <p>
                  Quando usamos a expressão &quot;tecnologias locais&quot;, estamos falando de recursos técnicos que ajudam a
                  plataforma a manter a sessão ativa, preservar etapas temporárias de uso, proteger áreas restritas e
                  permitir que a interface funcione corretamente.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">2. Resumo objetivo</h2>
              <InstitutionalProse className="mt-3 !max-w-none [&_ul]:mt-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
                <ul>
                  <li>
                    No cenário técnico atual, a Woody <strong>não utiliza cookies próprios de rastreamento</strong>, cookies de
                    marketing, pixels de anúncios ou cookies destinados a acompanhar usuárias entre sites diferentes.
                  </li>
                  <li>
                    A autenticação principal da plataforma pode ocorrer por token, como JWT, armazenado no navegador e
                    enviado à API por cabeçalho <strong>Authorization Bearer</strong>.
                  </li>
                  <li>
                    A Woody pode usar <strong>localStorage</strong> para manter a sessão e dados mínimos da interface, e{" "}
                    <strong>sessionStorage</strong> para preservar etapas temporárias do onboarding.
                  </li>
                  <li>
                    Pagamentos podem ser processados por fornecedor externo especializado, como <strong>Stripe</strong> ou
                    equivalente, conforme as políticas e padrões de segurança do próprio fornecedor.
                  </li>
                  <li>
                    Caso a Woody passe a utilizar tecnologias não essenciais, como analytics, pixels, anúncios ou
                    rastreadores, esta política será atualizada e, quando aplicável, serão disponibilizadas escolhas
                    adequadas às usuárias.
                  </li>
                </ul>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">3. O que a Woody usa no cenário atual</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  As tecnologias abaixo são descritas com base no desenho técnico atualmente informado. A lista deve
                  ser revisada sempre que houver mudança de implementação, fornecedor, autenticação, analytics,
                  pagamentos ou recursos de terceiros.
                </p>
              </InstitutionalProse>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-black/[0.06]">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm leading-relaxed text-[var(--woody-ink)]">
                  <thead>
                    <tr className="bg-black/[0.04]">
                      <th className="px-4 py-3 font-bold">Tecnologia</th>
                      <th className="px-4 py-3 font-bold">Tipo</th>
                      <th className="px-4 py-3 font-bold">Finalidade</th>
                      <th className="px-4 py-3 font-bold">Duração estimada</th>
                      <th className="px-4 py-3 font-bold">Obrigatória?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-black/[0.06] align-top">
                      <td className="px-4 py-3">
                        <code className="rounded bg-black/[0.06] px-1 py-0.5 text-[0.92em]">woody_auth_token</code>
                      </td>
                      <td className="px-4 py-3">localStorage</td>
                      <td className="px-4 py-3">
                        Manter a sessão autenticada, autenticar chamadas à API e proteger áreas restritas.
                      </td>
                      <td className="px-4 py-3">
                        Até logout, limpeza dos dados do navegador, expiração técnica ou substituição da sessão.
                      </td>
                      <td className="px-4 py-3">Sim, para uso autenticado.</td>
                    </tr>
                    <tr className="border-t border-black/[0.06] align-top">
                      <td className="px-4 py-3">
                        <code className="rounded bg-black/[0.06] px-1 py-0.5 text-[0.92em]">woody_auth_user</code>
                      </td>
                      <td className="px-4 py-3">localStorage</td>
                      <td className="px-4 py-3">
                        Guardar dados mínimos de perfil necessários para a interface funcionar corretamente.
                      </td>
                      <td className="px-4 py-3">
                        Até logout, limpeza dos dados do navegador ou substituição dos dados.
                      </td>
                      <td className="px-4 py-3">Sim, para experiência autenticada.</td>
                    </tr>
                    <tr className="border-t border-black/[0.06] align-top">
                      <td className="px-4 py-3">Dados temporários de onboarding</td>
                      <td className="px-4 py-3">sessionStorage</td>
                      <td className="px-4 py-3">
                        Preservar temporariamente etapas de cadastro, validação, escolhas iniciais ou preferências
                        enquanto a aba estiver aberta.
                      </td>
                      <td className="px-4 py-3">Normalmente até fechar a aba ou janela do navegador.</td>
                      <td className="px-4 py-3">Funcional.</td>
                    </tr>
                    <tr className="border-t border-black/[0.06] align-top">
                      <td className="px-4 py-3">Authorization Bearer</td>
                      <td className="px-4 py-3">Cabeçalho de API</td>
                      <td className="px-4 py-3">
                        Enviar o token de autenticação para comunicação segura com a API da Woody.
                      </td>
                      <td className="px-4 py-3">Durante a validade da sessão/token.</td>
                      <td className="px-4 py-3">Sim, para áreas autenticadas.</td>
                    </tr>
                    <tr className="border-t border-black/[0.06] align-top">
                      <td className="px-4 py-3">SignalR/WebSocket, se utilizado</td>
                      <td className="px-4 py-3">Tecnologia em tempo real</td>
                      <td className="px-4 py-3">
                        Viabilizar mensagens, avisos, notificações ou atualizações instantâneas.
                      </td>
                      <td className="px-4 py-3">Durante a sessão ou conexão ativa.</td>
                      <td className="px-4 py-3">Funcional.</td>
                    </tr>
                    <tr className="border-t border-black/[0.06] align-top">
                      <td className="px-4 py-3">Stripe ou provedor equivalente</td>
                      <td className="px-4 py-3">Fornecedor externo</td>
                      <td className="px-4 py-3">
                        Processar pagamentos, assinaturas, transações, cancelamentos ou reembolsos.
                      </td>
                      <td className="px-4 py-3">Conforme política do fornecedor e exigências legais aplicáveis.</td>
                      <td className="px-4 py-3">Necessário apenas para pagamento.</td>
                    </tr>
                    <tr className="border-t border-black/[0.06] align-top">
                      <td className="px-4 py-3">Analytics, pixels e anúncios</td>
                      <td className="px-4 py-3">Não utilizado atualmente</td>
                      <td className="px-4 py-3">Não aplicável no cenário atual informado.</td>
                      <td className="px-4 py-3">Não aplicável.</td>
                      <td className="px-4 py-3">Não aplicável.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">4. Cookies de rastreamento e marketing</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  No cenário técnico atual, a Woody <strong>não utiliza cookies próprios de rastreamento</strong>, cookies de
                  marketing, pixels de anúncios ou rastreadores destinados a acompanhar a usuária entre sites
                  diferentes.
                </p>
                <p>
                  Por isso, a Woody <strong>não exibe, neste momento, um banner de consentimento para cookies de marketing</strong> no
                  carregamento normal da aplicação. Caso tecnologias não essenciais sejam adotadas no futuro, esta
                  política será atualizada e serão oferecidos mecanismos adequados de informação, escolha e gestão,
                  quando aplicável.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">5. Armazenamento local da sessão</h2>
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
                  <strong>localStorage</strong> do navegador. Embora <strong>localStorage</strong> e <strong>sessionStorage</strong> não sejam cookies
                  HTTP, eles podem armazenar identificadores, tokens ou informações vinculadas à conta da usuária. Por
                  isso, são tratados nesta política com o mesmo cuidado de transparência.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">6. Dados temporários durante o onboarding</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  Durante o onboarding, a Woody pode usar <strong>sessionStorage</strong> para guardar o progresso da usuária enquanto a
                  aba do navegador estiver aberta. Essa prática ajuda a evitar perda de etapas no meio do fluxo, como
                  criação de conta, validações, escolhas iniciais ou preferências temporárias.
                </p>
                <p>
                  O sessionStorage costuma ser apagado quando a aba ou janela do navegador é fechada, embora o
                  comportamento final possa variar conforme navegador, sistema operacional e configurações do
                  dispositivo.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">7. API, autenticação e recursos em tempo real</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  A aplicação pode se comunicar com a <strong>API da Woody</strong> usando o token de autenticação da usuária,
                  normalmente enviado no cabeçalho <strong>Authorization Bearer</strong>. Isso significa que, no desenho atual, a
                  autenticação principal da aplicação <strong>não depende de cookies de sessão tradicionais</strong>.
                </p>
                <p>
                  Para recursos em tempo real, como mensagens, avisos, notificações ou atualizações instantâneas, a
                  Woody pode usar tecnologias como <strong>SignalR ou WebSocket</strong> com lógica de autenticação por token.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">8. Pagamentos e fornecedores externos</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  Quando houver pagamento, ele poderá ser processado por fornecedor externo especializado, como{" "}
                  <strong>Stripe</strong> ou outro provedor adotado pela Woody. O modelo preferencial é usar ambiente seguro do
                  fornecedor, reduzindo a quantidade de dados financeiros tratados diretamente pela Woody.
                </p>
                <p>
                  O fornecedor de pagamento poderá tratar dados próprios da transação conforme seus termos, políticas
                  de privacidade, padrões de segurança e obrigações legais. A Woody não deve armazenar dados completos
                  de cartão em seus próprios servidores.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">9. Fontes, scripts e terceiros</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  No carregamento normal informado, a Woody utiliza fontes incluídas no pacote da própria aplicação e
                  servidas pelo mesmo site, sem depender de pedidos externos ao Google Fonts ou a outros CDNs de
                  tipografia.
                </p>
                <p>
                  Se a Woody passar a carregar fontes, scripts, mapas, vídeos, analytics, pixels, chatbots ou outros
                  recursos de terceiros em domínios externos, esta política deverá ser atualizada. Quando fizer
                  sentido legal e técnico, também serão oferecidas opções de consentimento ou configuração.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">10. Finalidades do uso dessas tecnologias</h2>
              <InstitutionalProse className="mt-3 !max-w-none [&_ul]:mt-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
                <ul>
                  <li>manter a sessão da usuária ativa de forma segura;</li>
                  <li>permitir acesso a áreas autenticadas da plataforma;</li>
                  <li>preservar temporariamente etapas do onboarding;</li>
                  <li>carregar dados mínimos necessários para a interface;</li>
                  <li>apoiar recursos em tempo real, como mensagens, avisos e notificações;</li>
                  <li>reduzir fricção no uso da aplicação sem recorrer a rastreamento de marketing;</li>
                  <li>proteger a plataforma contra acessos indevidos, abusos e fraudes.</li>
                </ul>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">11. Base legal e natureza do tratamento</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  O uso de tecnologias essenciais para autenticação, segurança, funcionamento da conta e execução da
                  plataforma pode estar relacionado à execução do serviço solicitado pela usuária, ao cumprimento de
                  obrigações legais ou regulatórias e ao legítimo interesse da Woody em manter a aplicação segura e
                  funcional, conforme o caso concreto.
                </p>
                <p>
                  Quando uma tecnologia depender de consentimento específico, como cookies de marketing, pixels de
                  publicidade ou rastreamento não essencial, a Woody informará isso de forma clara e disponibilizará
                  mecanismos adequados de escolha, quando aplicável.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">12. Por quanto tempo esses dados ficam no navegador</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  Os dados guardados no localStorage podem permanecer no dispositivo até que a usuária saia da conta,
                  limpe os dados do site no navegador, use uma função de remoção disponibilizada pela Woody ou até que
                  a aplicação substitua esses dados por uma nova sessão.
                </p>
                <p>
                  Os dados guardados no sessionStorage tendem a permanecer apenas enquanto a aba ou janela estiver
                  aberta. Limpar dados do navegador ou sair da conta remove ou invalida dados locais daquele
                  dispositivo, mas isso não significa, por si só, apagar a conta da usuária nem eliminar todos os
                  dados mantidos nos servidores da Woody.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">13. Como controlar ou apagar esses dados</h2>
              <InstitutionalProse className="mt-3 !max-w-none [&_ul]:mt-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
                <ul>
                  <li>A usuária pode encerrar a sessão usando a opção de sair da conta, quando disponível.</li>
                  <li>
                    A usuária pode limpar os dados do site nas configurações do navegador, incluindo armazenamento
                    local, sessão e outros dados associados ao domínio da Woody.
                  </li>
                  <li>
                    Ao limpar esses dados, a usuária poderá ser deslogada e algumas funcionalidades podem deixar de
                    funcionar até novo login ou reinício de determinadas etapas.
                  </li>
                  <li>
                    Bloquear armazenamento local no navegador pode impedir login, onboarding ou funcionamento de áreas
                    autenticadas.
                  </li>
                  <li>
                    Pedidos de exclusão, acesso ou correção de dados mantidos nos servidores devem seguir os canais
                    indicados na Política de Privacidade da Woody.
                  </li>
                </ul>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">14. Segurança</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  A Woody deve adotar medidas técnicas e organizacionais proporcionais para proteger tokens, sessões e
                  dados tratados pela aplicação, incluindo controles de autenticação, autorização, expiração de
                  sessão, validações no backend e práticas de desenvolvimento seguro.
                </p>
                <p>
                  A segurança também é um cuidado compartilhado. Nenhum mecanismo técnico é absoluto. Por isso,
                  recomendamos que cada usuária proteja seu dispositivo, não compartilhe conta ou senha, mantenha o
                  navegador atualizado e saia da conta ao usar aparelhos compartilhados.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">15. O que a Woody não faz no cenário atual</h2>
              <InstitutionalProse className="mt-3 !max-w-none [&_ul]:mt-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
                <ul>
                  <li>não usa cookies de marketing no carregamento normal da aplicação;</li>
                  <li>não usa pixels de anúncios no cenário técnico atual informado;</li>
                  <li>não utiliza rastreadores destinados a acompanhar a usuária entre diferentes sites;</li>
                  <li>não vende dados pessoais de usuárias para anunciantes;</li>
                  <li>
                    não armazena dados completos de cartão em servidores próprios da Woody, quando o pagamento é
                    processado por provedor externo.
                  </li>
                </ul>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">16. Direitos das usuárias</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  As usuárias podem exercer direitos previstos na legislação aplicável de proteção de dados, incluindo
                  confirmação da existência de tratamento, acesso, correção, eliminação, informação sobre
                  compartilhamento, revisão de decisões automatizadas quando aplicável e outros direitos previstos em
                  lei.
                </p>
                <p>
                  Esta política explica tecnologias locais do navegador. Pedidos sobre dados de conta, publicações,
                  comunidades, mensagens, pagamentos, denúncias ou logs devem ser tratados conforme a Política de
                  Privacidade completa da Woody.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">17. Alterações nesta política</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  A Woody pode atualizar esta política para refletir mudanças técnicas, legais, operacionais ou de
                  produto. Se forem adicionadas tecnologias não essenciais, como analytics, anúncios, pixels ou
                  fornecedores de rastreamento, a Woody deverá atualizar esta página e, quando necessário,
                  disponibilizar escolhas adequadas às usuárias.
                </p>
                <p>
                  A versão mais recente desta política deve ficar disponível em local acessível dentro da aplicação e
                  do site da Woody.
                </p>
              </InstitutionalProse>
            </section>

            <section>
              <h2 className="font-sans text-base font-bold text-[var(--woody-ink)]">18. Contato</h2>
              <InstitutionalProse className="mt-3 !max-w-none">
                <p>
                  <strong>Controladora:</strong> Woody Corp. Full LTDA
                </p>
                <p>
                  <strong>Base de operação:</strong> Brasil
                </p>
                <p>
                  <strong>Endereço:</strong> Avenida Praia de Belas, 1212, sala 424, CXP: 14720, Praia de Belas, Porto
                  Alegre/RS, CEP: 90110-000
                </p>
                <p>
                  <strong>Site oficial:</strong> www.thewoody.co
                </p>
                <p>
                  <strong>Canal de contato para usuárias:</strong> contato@thewoody.co
                </p>
                <p>
                  <strong>Canal de privacidade / DPO:</strong> lgpd@dponicholas.astor.com
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
