import Link from 'next/link';

const TELEFONE_CONECTA = '31984949887';
const TELEFONE_CONECTA_EXIBICAO = '(31) 98494-9887';
const INSTAGRAM_CONECTA = 'https://instagram.com/conecta.novauniao';

export default function Footer() {
  const anoAtual = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200">
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">

          {/* CONECTA CIDADE */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
              aria-label="Ir para a página inicial"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-lg shadow-md">
                CN
              </div>

              <div>
                <p className="text-xl font-extrabold text-slate-900 leading-tight">
                  Conecta Cidade
                </p>

                <p className="text-sm text-slate-500">
                  Nova União • MG
                </p>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-slate-600 mt-5 max-w-sm">
              Portal comercial e informativo que conecta moradores, empresas,
              profissionais, produtores e oportunidades locais.
            </p>

            <div className="flex items-center gap-3 mt-6">
              <a
                href={INSTAGRAM_CONECTA}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram do Conecta Cidade"
                className="w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600 flex items-center justify-center transition"
              >
                <InstagramIcon />
              </a>

              <a
                href={`https://wa.me/55${TELEFONE_CONECTA}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp do Conecta Cidade"
                className="w-10 h-10 rounded-xl border border-slate-200 text-slate-600 hover:border-green-300 hover:bg-green-50 hover:text-green-600 flex items-center justify-center transition"
              >
                <WhatsAppIcon />
              </a>
            </div>
          </div>

          {/* NAVEGAÇÃO */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-slate-900 mb-5">
              Navegação
            </h3>

            <nav className="flex flex-col items-start gap-3 text-sm text-slate-600">
              <FooterLink href="/">Início</FooterLink>

              <FooterLink href="/morar-construir">
                Morar &amp; Construir
              </FooterLink>

              <FooterLink href="/motores-rodas">
                Motores &amp; Rodas
              </FooterLink>

              <FooterLink href="/promocoes">
                Promoções
              </FooterLink>

              <FooterLink href="/direto-do-produtor">
                Direto do Produtor
              </FooterLink>

              <FooterLink href="/onde-role">
                Onde é o Rolê?
              </FooterLink>

              <FooterLink href="/nova-uniao-informa">
                Nova União Informa
              </FooterLink>

              <FooterLink href="/agenda-local">
                Agenda Local
              </FooterLink>
            </nav>
          </div>

          {/* ANUNCIE */}
          <div className="lg:col-span-3">
            <h3 className="font-bold text-slate-900 mb-5">
              Anuncie
            </h3>

            <div className="flex flex-col items-start gap-3 text-sm text-slate-600">
              <FooterLink href="/anunciar">
                Publicar anúncio
              </FooterLink>

              <FooterLink href="/planos">
                Planos e preços
              </FooterLink>

              <FooterLink href="/agenda-local/cadastro">
                Cadastrar serviço
              </FooterLink>

              <FooterLink href="/minha-conta">
                Minha Conta
              </FooterLink>

              <p className="leading-relaxed mt-2 max-w-xs">
                Divulgue sua empresa e alcance mais clientes em Nova União.
              </p>

              <Link
                href="/anunciar"
                className="inline-flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl font-semibold transition shadow-sm mt-2"
              >
                Anunciar agora
              </Link>
            </div>
          </div>

          {/* CONTATO */}
          <div className="lg:col-span-3">
            <h3 className="font-bold text-slate-900 mb-5">
              Contato
            </h3>

            <p className="text-sm text-slate-500">
              Atendimento comercial
            </p>

            <a
              href={`https://wa.me/55${TELEFONE_CONECTA}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-lg font-extrabold text-slate-900 hover:text-green-600 transition mt-2"
            >
              <WhatsAppIcon className="w-5 h-5" />
              {TELEFONE_CONECTA_EXIBICAO}
            </a>

            <p className="text-sm text-slate-500 mt-5 max-w-xs">
              Precisa de ajuda para anunciar? Fale diretamente com nossa equipe.
            </p>

            <a
              href={INSTAGRAM_CONECTA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-pink-600 transition mt-4"
            >
              <InstagramIcon className="w-4 h-4" />
              @conecta.novauniao
            </a>
          </div>
        </div>
      </section>

      {/* RODAPÉ INFERIOR */}
      <section className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">

          <p className="text-center md:text-left">
            © {anoAtual} Conecta Cidade — Nova União • MG.
            Todos os direitos reservados.
          </p>
<div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-medium">
  <Link href="/termos" className="hover:text-orange-600 transition">
    Termos de uso
  </Link>

  <Link href="/privacidade" className="hover:text-orange-600 transition">
    Privacidade
  </Link>

  <Link href="/contato" className="hover:text-orange-600 transition">
    Contato
  </Link>

  <Link href="/planos" className="hover:text-orange-600 transition">
    Planos
  </Link>
</div>
        </div>
      </section>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="hover:text-orange-600 hover:translate-x-1 transition-all"
    >
      {children}
    </Link>
  );
}

function InstagramIcon({
  className = 'w-5 h-5',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`${className} fill-none stroke-current stroke-2`}
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

function WhatsAppIcon({
  className = 'w-5 h-5',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`${className} fill-current`}
    >
      <path d="M12.04 2a9.84 9.84 0 0 0-8.43 14.91L2 22l5.22-1.57A9.99 9.99 0 1 0 12.04 2Zm0 17.98a8.05 8.05 0 0 1-4.1-1.12l-.29-.17-3.1.93.94-3.02-.19-.31A7.94 7.94 0 1 1 12.04 20Zm4.4-5.95c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.43-.59 1.63-1.15.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}