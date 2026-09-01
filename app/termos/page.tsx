import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termos de Uso',

  description:
    'Conheça os Termos de Uso do Conecta Cidade, incluindo as regras para utilização do portal, publicação de anúncios, planos, serviços e cadastros.',

  alternates: {
    canonical: '/termos',
  },

  openGraph: {
    title: 'Termos de Uso | Conecta Cidade',
    description:
      'Conheça as regras e condições para utilização do portal Conecta Cidade de Nova União/MG.',
    type: 'website',
    locale: 'pt_BR',
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* CABEÇALHO DA PÁGINA */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-10 md:py-14">
          <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
            Conecta Cidade
          </span>

          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-900">
            Termos de Uso
          </h1>

          <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
            Estes Termos estabelecem as condições para utilização do portal
            Conecta Cidade, incluindo acesso às informações, publicação de
            anúncios, cadastro de serviços e utilização dos demais recursos
            disponibilizados pela plataforma.
          </p>

          <p className="mt-3 text-sm text-slate-500">
            Última atualização: agosto de 2026
          </p>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="max-w-5xl mx-auto px-5 sm:px-6 py-10 md:py-14">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-10 space-y-10">

          {/* 1 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              1. Sobre o Conecta Cidade
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                O Conecta Cidade é um portal comercial e informativo voltado
                à divulgação de anúncios, empresas, profissionais, serviços,
                produtores, eventos, promoções, informações e oportunidades
                locais.
              </p>

              <p>
                A plataforma funciona como meio de divulgação e conexão entre
                usuários, anunciantes, profissionais, empresas e demais
                participantes.
              </p>

              <p>
                Ao acessar ou utilizar os serviços do portal, o usuário declara
                estar de acordo com estes Termos de Uso e com a Política de
                Privacidade vigente.
              </p>
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              2. Cadastro e conta do usuário
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Algumas funcionalidades do Conecta Cidade poderão exigir
                cadastro e autenticação do usuário.
              </p>

              <p>
                O usuário deverá fornecer informações verdadeiras, completas e
                atualizadas e será responsável pela utilização de sua conta e
                pela proteção de suas credenciais de acesso.
              </p>

              <p>
                Não é permitido utilizar dados de terceiros sem autorização,
                criar contas com informações falsas ou utilizar uma conta para
                praticar fraude, enganar outros usuários ou violar a legislação.
              </p>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              3. Publicação de anúncios
            </h2>

            <p className="text-slate-600 leading-relaxed mb-4">
              Ao publicar um anúncio, o anunciante é responsável pelas
              informações fornecidas, incluindo:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>título e descrição;</li>
              <li>preço informado;</li>
              <li>fotografias e imagens;</li>
              <li>telefone ou WhatsApp;</li>
              <li>informações comerciais;</li>
              <li>características do produto ou serviço;</li>
              <li>disponibilidade do item anunciado;</li>
              <li>
                demais informações inseridas voluntariamente no anúncio.
              </li>
            </ul>

            <p className="text-slate-600 leading-relaxed mt-4">
              O anunciante declara possuir autorização para divulgar as
              informações, imagens, produtos e serviços inseridos na
              plataforma.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              4. Análise e aprovação de anúncios
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Os anúncios e cadastros poderão passar por análise antes ou
                depois de sua publicação.
              </p>

              <p>
                O Conecta Cidade poderá rejeitar, suspender, desativar ou
                remover conteúdo que apresente irregularidades, informações
                enganosas, conteúdo incompatível com a proposta do portal,
                violação destes Termos ou possível violação da legislação.
              </p>

              <p>
                A aprovação de um anúncio significa apenas que sua publicação
                foi permitida na plataforma. Ela não representa certificação,
                garantia, recomendação ou confirmação da qualidade, origem,
                segurança ou legitimidade do produto, serviço ou anunciante.
              </p>
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              5. Conteúdos proibidos
            </h2>

            <p className="text-slate-600 leading-relaxed mb-4">
              Não poderão ser publicados conteúdos que:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>violem a legislação brasileira;</li>
              <li>envolvam produtos ou serviços cuja comercialização seja ilegal;</li>
              <li>tenham finalidade fraudulenta ou enganosa;</li>
              <li>utilizem informações falsas para induzir usuários a erro;</li>
              <li>violem direitos autorais, marcas ou direitos de terceiros;</li>
              <li>
                contenham material discriminatório, ameaçador ou que incentive
                violência ou prática ilícita;
              </li>
              <li>
                divulguem dados pessoais de terceiros sem autorização ou
                fundamento adequado;
              </li>
              <li>contenham arquivos ou links maliciosos;</li>
              <li>
                sejam incompatíveis com as categorias e finalidades do portal.
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              6. Produtos, serviços e negociações
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Salvo quando expressamente informado de forma diferente, o
                Conecta Cidade não é vendedor, comprador, fabricante ou
                prestador dos produtos e serviços divulgados pelos anunciantes.
              </p>

              <p>
                A negociação poderá ocorrer diretamente entre as partes,
                inclusive por telefone, WhatsApp, Instagram ou outros meios
                externos ao portal.
              </p>

              <p>
                Cabe aos usuários avaliar as condições da negociação, identidade
                da outra parte, estado do produto, qualidade do serviço,
                pagamento, entrega e demais condições antes da contratação.
              </p>
            </div>

            <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900">
              <strong>Importante:</strong> nunca envie dinheiro ou informações
              financeiras apenas com base em um anúncio. Confirme a identidade
              da outra parte e as condições da negociação antes de realizar
              qualquer pagamento.
            </div>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              7. Planos de anúncios
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                O Conecta Cidade poderá disponibilizar modalidades gratuitas e
                pagas de divulgação.
              </p>

              <p>
                Cada plano poderá possuir características próprias, incluindo
                quantidade de anúncios, número de fotos, período de exibição,
                posição de destaque, renovação e outros benefícios apresentados
                na página de planos no momento da contratação.
              </p>

              <p>
                Os valores, benefícios e condições aplicáveis serão aqueles
                informados ao usuário no momento da contratação.
              </p>
            </div>

            <Link
              href="/planos"
              className="inline-flex mt-5 items-center justify-center px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition"
            >
              Consultar planos
            </Link>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              8. Prazo e expiração dos anúncios
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Os anúncios poderão permanecer disponíveis durante o período
                correspondente ao plano utilizado ou enquanto atenderem às
                condições aplicáveis à modalidade escolhida.
              </p>

              <p>
                Ao término do período contratado, o anúncio poderá expirar,
                perder benefícios de destaque ou deixar de ser exibido,
                conforme as características do plano.
              </p>

              <p>
                Quando disponível, o anunciante poderá realizar uma nova
                contratação ou renovação para continuar utilizando os
                respectivos benefícios.
              </p>
            </div>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              9. Pagamentos
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Os serviços pagos poderão utilizar uma plataforma externa para
                processamento do pagamento.
              </p>

              <p>
                A ativação de recursos pagos poderá depender da confirmação da
                transação pelo prestador responsável pelo processamento do
                pagamento.
              </p>

              <p>
                Eventuais condições de cancelamento, estorno ou reembolso serão
                analisadas conforme o serviço contratado, sua efetiva
                utilização e a legislação aplicável.
              </p>
            </div>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              10. Agenda Local
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                A Agenda Local permite a divulgação de profissionais, empresas
                e prestadores de serviços.
              </p>

              <p>
                As informações apresentadas são fornecidas pelos próprios
                cadastrados ou responsáveis pela divulgação.
              </p>

              <p>
                A presença de um profissional ou empresa na Agenda Local não
                representa garantia, certificação ou recomendação do Conecta
                Cidade quanto à qualidade ou execução dos serviços oferecidos.
              </p>
            </div>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              11. Informações públicas e conteúdo informativo
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                O portal poderá disponibilizar informações de interesse local,
                contatos úteis, informações públicas, eventos, notícias,
                comunicados e outros conteúdos informativos.
              </p>

              <p>
                Embora haja esforço para manter essas informações atualizadas,
                alterações poderão ocorrer sem aviso ao portal. Informações
                oficiais relevantes devem ser confirmadas diretamente com o
                órgão, empresa ou responsável correspondente quando necessário.
              </p>
            </div>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              12. Fotografias e outros conteúdos enviados
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                O usuário permanece responsável pelos conteúdos que envia para
                publicação e declara possuir os direitos ou autorizações
                necessários para utilizá-los.
              </p>

              <p>
                Ao enviar fotografias, textos e demais materiais destinados à
                publicação, o usuário autoriza sua exibição no Conecta Cidade
                durante o período em que o anúncio ou cadastro estiver ativo,
                exclusivamente para as finalidades relacionadas à divulgação
                contratada ou solicitada.
              </p>
            </div>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              13. Propriedade intelectual do portal
            </h2>

            <p className="text-slate-600 leading-relaxed">
              A identidade visual, marca, elementos gráficos, organização,
              textos institucionais e demais conteúdos próprios do Conecta
              Cidade não poderão ser reproduzidos ou utilizados indevidamente
              por terceiros, ressalvados os conteúdos pertencentes aos próprios
              anunciantes ou a terceiros.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              14. Segurança e prevenção a fraudes
            </h2>

            <p className="text-slate-600 leading-relaxed">
              O Conecta Cidade poderá adotar medidas destinadas à proteção da
              plataforma e de seus usuários, incluindo análise, bloqueio,
              suspensão ou remoção de contas e conteúdos quando houver indícios
              de fraude, abuso, tentativa de manipulação ou utilização
              incompatível com estes Termos.
            </p>
          </section>

          {/* 15 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              15. Disponibilidade da plataforma
            </h2>

            <p className="text-slate-600 leading-relaxed">
              O portal poderá passar por atualizações, manutenção ou
              indisponibilidades temporárias decorrentes de serviços de
              internet, hospedagem, banco de dados, integrações externas ou
              outros fatores técnicos.
            </p>
          </section>

          {/* 16 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              16. Uso indevido da plataforma
            </h2>

            <p className="text-slate-600 leading-relaxed">
              O usuário que utilizar a plataforma de forma fraudulenta,
              abusiva, ilegal ou contrária a estes Termos poderá ter anúncios
              removidos, recursos suspensos ou sua conta bloqueada, sem
              prejuízo de outras medidas cabíveis.
            </p>
          </section>

          {/* 17 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              17. Privacidade e dados pessoais
            </h2>

            <p className="text-slate-600 leading-relaxed">
              O tratamento de dados pessoais relacionado à utilização do portal
              é explicado na Política de Privacidade do Conecta Cidade.
            </p>

            <Link
              href="/privacidade"
              className="inline-flex mt-5 items-center justify-center px-5 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Política de Privacidade
            </Link>
          </section>

          {/* 18 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              18. Alterações dos Termos
            </h2>

            <p className="text-slate-600 leading-relaxed">
              Estes Termos poderão ser atualizados para acompanhar alterações
              nos serviços, funcionalidades, planos ou legislação aplicável.
              A versão vigente ficará disponível nesta página com a indicação
              da data da última atualização.
            </p>
          </section>

          {/* 19 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              19. Legislação aplicável
            </h2>

            <p className="text-slate-600 leading-relaxed">
              Estes Termos serão interpretados de acordo com a legislação
              brasileira, respeitados os direitos e garantias previstos na
              legislação aplicável.
            </p>
          </section>

          {/* 20 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              20. Contato
            </h2>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6">
              <p className="text-slate-600 leading-relaxed">
                Para dúvidas, solicitações ou comunicação relacionada ao
                funcionamento do portal, utilize os canais oficiais do Conecta
                Cidade.
              </p>

              <p className="mt-4 font-semibold text-slate-900">
                Conecta Cidade — Nova União • MG
              </p>

              <a
                href="https://wa.me/5531984949887"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex mt-4 items-center justify-center bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold transition"
              >
                Falar pelo WhatsApp
              </a>
            </div>
          </section>

          {/* LINKS FINAIS */}
          <section className="border-t border-slate-200 pt-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/privacidade"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Política de Privacidade
              </Link>

              <Link
                href="/contato"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition"
              >
                Fale Conosco
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}