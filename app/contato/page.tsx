import type { Metadata } from 'next';
import Link from 'next/link';

const TELEFONE_CONECTA = '31984949887';
const TELEFONE_EXIBICAO = '(31) 98494-9887';
const INSTAGRAM_URL = 'https://instagram.com/conecta.novauniao';
const INSTAGRAM_USUARIO = '@conecta.novauniao';

export const metadata: Metadata = {
  title: 'Contato',

  description:
    'Entre em contato com o Conecta Cidade de Nova União/MG para dúvidas, suporte, anúncios, planos, Agenda Local e atendimento comercial.',

  keywords: [
    'contato Conecta Cidade',
    'Conecta Cidade Nova União',
    'contato Nova União MG',
    'anunciar Nova União MG',
    'suporte Conecta Cidade',
    'Agenda Local Nova União',
  ],

  alternates: {
    canonical: '/contato',
  },

  openGraph: {
    title: 'Contato | Conecta Cidade',
    description:
      'Fale com o Conecta Cidade para dúvidas, suporte, anúncios, planos e atendimento em Nova União/MG.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function ContatoPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* CABEÇALHO */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-10 md:py-14">
          <span className="inline-flex items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
            Conecta Cidade
          </span>

          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-slate-900">
            Contato
          </h1>

          <p className="mt-3 text-slate-600 leading-relaxed max-w-3xl">
            Precisa de ajuda para anunciar, acessar sua conta, cadastrar um
            serviço ou tirar alguma dúvida sobre o portal? Fale diretamente
            com o Conecta Cidade.
          </p>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="max-w-5xl mx-auto px-5 sm:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WHATSAPP */}
          <article className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mb-5">
              <WhatsAppIcon />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              WhatsApp
            </h2>

            <p className="text-slate-600 mt-3 leading-relaxed">
              Atendimento para dúvidas sobre anúncios, planos, Agenda Local,
              cadastro, acesso à conta e funcionamento do portal.
            </p>

            <p className="mt-5 text-lg font-bold text-slate-900">
              {TELEFONE_EXIBICAO}
            </p>

            <a
              href={`https://wa.me/55${TELEFONE_CONECTA}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mt-5 items-center justify-center bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold transition"
            >
              Falar pelo WhatsApp
            </a>
          </article>

          {/* INSTAGRAM */}
          <article className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center mb-5">
              <InstagramIcon />
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Instagram
            </h2>

            <p className="text-slate-600 mt-3 leading-relaxed">
              Acompanhe novidades, informações, anúncios e atualizações do
              Conecta Cidade.
            </p>

            <p className="mt-5 text-lg font-bold text-slate-900">
              {INSTAGRAM_USUARIO}
            </p>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mt-5 items-center justify-center bg-pink-600 hover:bg-pink-700 text-white px-5 py-3 rounded-xl font-semibold transition"
            >
              Abrir Instagram
            </a>
          </article>
        </div>

        {/* INFORMAÇÕES */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm mt-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Como podemos ajudar?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="font-semibold text-slate-900">
                Anúncios e planos
              </p>

              <p className="text-sm text-slate-600 mt-1">
                Dúvidas sobre cadastro, publicação, renovação e planos.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="font-semibold text-slate-900">
                Agenda Local
              </p>

              <p className="text-sm text-slate-600 mt-1">
                Cadastro ou atualização de profissionais e empresas.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="font-semibold text-slate-900">
                Minha Conta
              </p>

              <p className="text-sm text-slate-600 mt-1">
                Ajuda com acesso, login ou informações da conta.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="font-semibold text-slate-900">
                Privacidade e dados
              </p>

              <p className="text-sm text-slate-600 mt-1">
                Solicitações relacionadas a dados pessoais e privacidade.
              </p>
            </div>
          </div>
        </div>

        {/* LINKS ÚTEIS */}
        <div className="border-t border-slate-200 mt-10 pt-8">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Link
              href="/privacidade"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-white transition"
            >
              Política de Privacidade
            </Link>

            <Link
              href="/termos"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-white transition"
            >
              Termos de Uso
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold transition"
            >
              Voltar ao início
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="w-6 h-6 fill-current"
    >
      <path d="M12.04 2a9.84 9.84 0 0 0-8.43 14.91L2 22l5.22-1.57A9.99 9.99 0 1 0 12.04 2Zm0 17.98a8.05 8.05 0 0 1-4.1-1.12l-.29-.17-3.1.93.94-3.02-.19-.31A7.94 7.94 0 1 1 12.04 20Zm4.4-5.95c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.43-.59 1.63-1.15.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="w-6 h-6 fill-none stroke-current stroke-2"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle
        cx="17.5"
        cy="6.5"
        r="1"
        className="fill-current stroke-none"
      />
    </svg>
  );
}