import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de Privacidade',

  description:
    'Conheça a Política de Privacidade do Conecta Cidade e saiba como os dados pessoais dos usuários são coletados, utilizados, armazenados e protegidos.',

  alternates: {
    canonical: '/privacidade',
  },

  openGraph: {
    title: 'Política de Privacidade | Conecta Cidade',
    description:
      'Saiba como o Conecta Cidade trata e protege os dados pessoais dos usuários do portal.',
    type: 'website',
    locale: 'pt_BR',
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* CABEÇALHO DA PÁGINA */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-10 md:py-14">
          <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
            Conecta Cidade
          </span>

          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-900">
            Política de Privacidade
          </h1>

          <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
            Esta Política de Privacidade explica como os dados pessoais podem
            ser coletados, utilizados, armazenados e protegidos durante a
            utilização do portal Conecta Cidade.
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
              1. Sobre esta Política de Privacidade
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                O Conecta Cidade é um portal comercial e informativo destinado
                a conectar moradores, anunciantes, empresas, profissionais,
                produtores e serviços locais.
              </p>

              <p>
                Ao utilizar o portal, determinadas informações poderão ser
                fornecidas pelo próprio usuário ou geradas durante a utilização
                dos serviços.
              </p>

              <p>
                O tratamento de dados pessoais será realizado de acordo com a
                legislação brasileira aplicável, especialmente a Lei nº
                13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD).
              </p>
            </div>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              2. Quais dados podem ser coletados
            </h2>

            <p className="text-slate-600 leading-relaxed mb-4">
              Dependendo da funcionalidade utilizada, o Conecta Cidade poderá
              tratar informações fornecidas pelo próprio usuário, tais como:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>nome;</li>
              <li>endereço de e-mail;</li>
              <li>número de telefone e WhatsApp;</li>
              <li>informações de cadastro e autenticação;</li>
              <li>nome da empresa, negócio ou atividade profissional;</li>
              <li>informações fornecidas na criação de anúncios;</li>
              <li>fotos e imagens enviadas para publicação;</li>
              <li>descrições de produtos, serviços ou atividades;</li>
              <li>links de redes sociais informados pelo usuário;</li>
              <li>
                informações relacionadas ao plano ou serviço contratado;
              </li>
              <li>
                outras informações fornecidas voluntariamente pelo usuário
                durante a utilização do portal.
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              3. Dados de navegação
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Durante a utilização do site, determinadas informações técnicas
                poderão ser processadas automaticamente pelos sistemas
                utilizados pelo portal e por seus fornecedores tecnológicos.
              </p>

              <p>
                Essas informações podem incluir, conforme os recursos
                efetivamente utilizados, endereço IP, tipo de dispositivo,
                navegador, páginas acessadas, data e horário de acesso e
                informações técnicas necessárias ao funcionamento e à
                segurança do serviço.
              </p>
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              4. Para que utilizamos os dados
            </h2>

            <p className="text-slate-600 leading-relaxed mb-4">
              Os dados poderão ser utilizados, conforme necessário, para:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>criar e administrar contas de usuários;</li>
              <li>permitir login e autenticação;</li>
              <li>receber, analisar, aprovar e publicar anúncios;</li>
              <li>administrar anúncios e serviços publicados;</li>
              <li>
                permitir o cadastro de profissionais e empresas na Agenda
                Local;
              </li>
              <li>administrar planos e contratações;</li>
              <li>processar solicitações realizadas pelo usuário;</li>
              <li>prestar atendimento e suporte;</li>
              <li>prevenir fraudes, abusos e uso indevido da plataforma;</li>
              <li>manter a segurança e o funcionamento do portal;</li>
              <li>cumprir obrigações legais ou regulatórias;</li>
              <li>
                exercer direitos em processos administrativos, judiciais ou
                extrajudiciais, quando necessário;
              </li>
              <li>melhorar os serviços e a experiência dos usuários.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              5. Dados publicados nos anúncios
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                O usuário deve estar ciente de que determinadas informações
                fornecidas para a criação de anúncios ou cadastros profissionais
                são destinadas à divulgação pública.
              </p>

              <p>
                Dependendo do anúncio ou serviço cadastrado, poderão ficar
                visíveis aos visitantes do portal informações como nome do
                anunciante ou negócio, telefone ou WhatsApp, descrição,
                fotografias, redes sociais e demais informações escolhidas para
                divulgação.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900">
                <strong>Atenção:</strong> não publique senhas, documentos
                pessoais, dados bancários ou outras informações confidenciais
                dentro da descrição ou das imagens de um anúncio.
              </div>
            </div>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              6. Compartilhamento de dados
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                O Conecta Cidade não comercializa dados pessoais de usuários
                como produto.
              </p>

              <p>
                Entretanto, determinadas informações poderão ser tratadas ou
                compartilhadas com fornecedores necessários ao funcionamento
                do portal, tais como serviços de hospedagem, banco de dados,
                autenticação, armazenamento, processamento de pagamentos e
                outros fornecedores tecnológicos utilizados na operação.
              </p>

              <p>
                Informações também poderão ser fornecidas quando houver
                obrigação legal, determinação judicial ou solicitação válida
                de autoridade competente.
              </p>
            </div>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              7. Pagamentos
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                Quando houver contratação de serviços pagos, o processamento
                financeiro poderá ser realizado por uma plataforma de pagamento
                externa integrada ao Conecta Cidade.
              </p>

              <p>
                Informações financeiras solicitadas diretamente pela
                plataforma de pagamento estarão sujeitas também às políticas e
                aos procedimentos de segurança do respectivo prestador.
              </p>

              <p>
                O Conecta Cidade poderá receber informações necessárias para
                identificar a situação da transação, como confirmação,
                pendência, aprovação ou cancelamento do pagamento.
              </p>
            </div>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              8. Cookies e tecnologias semelhantes
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                O portal e os serviços tecnológicos utilizados em sua operação
                poderão utilizar cookies ou tecnologias semelhantes quando
                necessários para autenticação, segurança, funcionamento,
                preferências e melhoria da experiência de navegação.
              </p>

              <p>
                Caso futuramente sejam utilizados cookies não essenciais para
                publicidade, medição ou outras finalidades que exijam
                gerenciamento específico, o portal poderá disponibilizar
                mecanismos adicionais de informação e escolha ao usuário,
                conforme aplicável.
              </p>
            </div>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              9. Armazenamento e segurança
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                O Conecta Cidade busca adotar medidas técnicas e administrativas
                adequadas para proteger os dados pessoais contra acessos não
                autorizados e situações acidentais ou ilícitas de destruição,
                perda, alteração, comunicação ou divulgação.
              </p>

              <p>
                Nenhum sistema conectado à internet pode garantir segurança
                absoluta. Por isso, também é responsabilidade do usuário
                proteger suas credenciais de acesso e não compartilhar sua
                senha com terceiros.
              </p>
            </div>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              10. Por quanto tempo os dados são mantidos
            </h2>

            <p className="text-slate-600 leading-relaxed">
              Os dados pessoais serão mantidos pelo período necessário para
              cumprir as finalidades para as quais foram tratados, permitir o
              funcionamento dos serviços e atender obrigações legais,
              regulatórias, contratuais ou relacionadas ao exercício regular de
              direitos. Quando aplicável e possível, os dados poderão ser
              eliminados ou anonimizados após o término do tratamento.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              11. Direitos do titular
            </h2>

            <p className="text-slate-600 leading-relaxed mb-4">
              Nos termos da legislação aplicável, o titular poderá solicitar,
              quando cabível:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>confirmação da existência de tratamento;</li>
              <li>acesso aos seus dados pessoais;</li>
              <li>
                correção de dados incompletos, inexatos ou desatualizados;
              </li>
              <li>
                anonimização, bloqueio ou eliminação de dados nas hipóteses
                previstas em lei;
              </li>
              <li>
                informações sobre o compartilhamento de dados, quando
                aplicável;
              </li>
              <li>revogação do consentimento, quando essa for a base legal;</li>
              <li>
                eliminação dos dados tratados com consentimento, ressalvadas as
                hipóteses legais de conservação;
              </li>
              <li>outros direitos previstos na legislação aplicável.</li>
            </ul>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              12. Exclusão da conta e dos dados
            </h2>

            <div className="space-y-4 text-slate-600 leading-relaxed">
              <p>
                O usuário poderá solicitar a exclusão de sua conta e, quando
                juridicamente aplicável, de seus dados pessoais.
              </p>

              <p>
                Determinadas informações poderão precisar ser conservadas mesmo
                após a solicitação de exclusão quando houver obrigação legal,
                necessidade de prevenção a fraudes, exercício regular de
                direitos ou outra hipótese autorizada pela legislação.
              </p>
            </div>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              13. Sites e serviços de terceiros
            </h2>

            <p className="text-slate-600 leading-relaxed">
              O Conecta Cidade poderá apresentar links para WhatsApp,
              Instagram, plataformas de pagamento e outros sites ou serviços
              externos. Ao acessar esses serviços, o usuário também estará
              sujeito às políticas e aos termos definidos pelos respectivos
              terceiros.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              14. Responsabilidade pelas informações fornecidas
            </h2>

            <p className="text-slate-600 leading-relaxed">
              O usuário é responsável pela veracidade e atualização das
              informações fornecidas ao portal e deve evitar inserir dados
              pessoais de terceiros sem possuir autorização ou fundamento
              adequado para fazê-lo.
            </p>
          </section>

          {/* 15 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              15. Alterações nesta Política
            </h2>

            <p className="text-slate-600 leading-relaxed">
              Esta Política de Privacidade poderá ser atualizada para refletir
              alterações no funcionamento do portal, nos serviços oferecidos ou
              na legislação aplicável. A versão vigente permanecerá disponível
              nesta página, acompanhada da respectiva data de atualização.
            </p>
          </section>

          {/* 16 */}
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">
              16. Contato e solicitações sobre dados pessoais
            </h2>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6">
              <p className="text-slate-600 leading-relaxed">
                Para dúvidas relacionadas à privacidade ou para solicitar o
                exercício de direitos relativos aos seus dados pessoais, entre
                em contato com o Conecta Cidade pelos canais oficiais de
                atendimento.
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

          {/* NAVEGAÇÃO */}
          <section className="border-t border-slate-200 pt-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/termos"
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Termos de Uso
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