import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Planos para Anunciar em Nova União MG',

  description:
    'Conheça os planos do Conecta Cidade para divulgar anúncios, empresas, profissionais, serviços e produtores em Nova União/MG.',

  keywords: [
    'anunciar em Nova União MG',
    'anúncios Nova União MG',
    'divulgar empresa Nova União',
    'divulgar serviço Nova União MG',
    'publicidade Nova União MG',
    'planos Conecta Cidade',
    'Agenda Local Nova União',
    'Direto do Produtor Nova União',
  ],

  alternates: {
    canonical: '/planos',
  },

  openGraph: {
    title: 'Planos para Anunciar em Nova União MG',
    description:
      'Escolha uma opção para divulgar seu negócio, serviço, produto ou anúncio no Conecta Cidade.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function PlanosPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="mx-auto max-w-5xl px-5 md:px-6">

        {/* Título Principal */}
        <section className="mb-12 text-center">
          <span className="mb-4 inline-flex rounded-full bg-orange-100 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-orange-700">
            Planos Conecta Cidade
          </span>

          <h1 className="mb-4 text-4xl font-extrabold leading-tight text-slate-900 md:text-5xl">
            Divulgue seu negócio em Nova União
          </h1>

          <p className="mx-auto max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
            O Plano Gratuito é ótimo para testar e divulgar seu trabalho.
            Mas, se você quer vender mais e ter visibilidade na cidade,
            nossos planos pagos fazem toda a diferença.
          </p>
        </section>

         {/* Primeira linha - 3 Cards */}
        <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">

          {/* Plano Gratuito */}
          <article className="h-full flex flex-col rounded-3xl border-2 border-yellow-400 bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-3xl">📢</div>
              <h3 className="text-2xl font-bold text-slate-900">Plano Gratuito</h3>
            </div>

            <div className="mb-4 flex items-end gap-2">
              <span className="text-3xl font-extrabold text-yellow-600">R$ 0,00</span>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-slate-600">Anuncie sem custo!</p>

            <ul className="mb-auto space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2"><span className="font-bold text-emerald-600">✓</span>1 anúncio</li>
              <li className="flex items-start gap-2"><span className="font-bold text-emerald-600">✓</span>5 fotos</li>
              <li className="flex items-start gap-2"><span className="font-bold text-emerald-600">✓</span>7 dias de divulgação</li>
              <li className="flex items-start gap-2"><span className="font-bold text-emerald-600">✓</span>Divulgação gratuita</li>
            </ul>

            <Link href="/anunciar?plano=Gratuito" className="mt-auto block w-full rounded-xl bg-yellow-400 py-4 text-center font-bold text-black transition hover:scale-[1.02] hover:bg-yellow-500 active:scale-95">
              Começar agora
            </Link>
          </article>

          {/* Direto do Produtor */}
          <article className="h-full relative flex flex-col rounded-3xl border-2 border-emerald-500 bg-emerald-50 p-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute -top-3 right-6 whitespace-nowrap rounded-full bg-emerald-600 px-4 py-1 text-xs font-bold text-white">ESPECIAL</div>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">🌱</div>
              <h3 className="text-2xl font-bold text-slate-900">Direto do Produtor</h3>
            </div>

            <div className="mb-4 flex items-end gap-2">
              <span className="text-3xl font-extrabold text-emerald-600">R$ 0,00</span>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-slate-600">Você é produtor rural ou artesão?</p>

            <ul className="mb-auto space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2"><span className="font-bold text-emerald-600">✓</span>Divulgação por 30 dias</li>
              <li className="flex items-start gap-2"><span className="font-bold text-emerald-600">✓</span>1 anúncio</li>
              <li className="flex items-start gap-2"><span className="font-bold text-emerald-600">✓</span>1 foto</li>
              <li className="flex items-start gap-2"><span className="font-bold text-emerald-600">✓</span>Destaque na Home</li>
            </ul>

            <Link href="/direto-do-produtor/participar" className="mt-auto block w-full rounded-xl bg-emerald-600 py-4 text-center font-bold text-white transition hover:scale-[1.02] hover:bg-emerald-700 active:scale-95">
              Quero participar
            </Link>
          </article>

          {/* Agenda Local */}
          <article className="h-full relative flex flex-col rounded-3xl border-2 border-sky-500 bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute -top-3 right-6 whitespace-nowrap rounded-full bg-sky-600 px-4 py-1 text-xs font-bold text-white">SERVIÇOS</div>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-3xl">📍</div>
              <h3 className="text-2xl font-bold text-slate-900">Agenda Local</h3>
            </div>

            <div className="mb-4 flex items-end gap-2">
              <span className="text-3xl font-extrabold text-sky-600">R$ 19,90</span>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-slate-600">Ideal para empresas e serviços.</p>

            <ul className="mb-auto space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2"><span className="font-bold text-emerald-600">✓</span>60 dias de divulgação</li>
              <li className="flex items-start gap-2"><span className="font-bold text-emerald-600">✓</span>1 foto da empresa ou serviço</li>
              <li className="flex items-start gap-2"><span className="font-bold text-emerald-600">✓</span>WhatsApp + Instagram</li>
              <li className="flex items-start gap-2"><span className="font-bold text-emerald-600">✓</span>Destaque na Home</li>
            </ul>

            <Link href="/agenda-local/cadastro" className="mt-auto block w-full rounded-xl bg-sky-600 py-4 text-center font-bold text-white transition hover:scale-[1.02] hover:bg-sky-700 active:scale-95">
              Escolher plano →
            </Link>
          </article>
        </div>

        {/* Segunda linha - Planos Pagos */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          {/* Impulso */}
          <article className="flex h-full flex-col rounded-3xl border-2 border-red-500 bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-3xl">
                🚀
              </div>

              <h3 className="text-2xl font-bold text-slate-900">
                Impulso
              </h3>
            </div>

            <div className="mb-4 flex items-end gap-2">
              <span className="text-3xl font-extrabold text-red-600">
                R$ 9,90
              </span>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              Mais visibilidade para vender rápido.
            </p>

            <ul className="mb-auto space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                1 anúncio
              </li>

              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                5 fotos
              </li>

              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                15 dias de anúncio
              </li>
            </ul>

            <Link
              href="/anunciar?plano=Impulso"
              className="mt-6 block w-full rounded-xl bg-red-600 py-4 text-center font-bold text-white transition hover:scale-[1.02] hover:bg-red-700 active:scale-95"
            >
              Escolher plano →
            </Link>
          </article>

          {/* Vitrine */}
          <article className="relative flex h-full scale-[1.02] flex-col rounded-3xl border-2 border-amber-500 bg-white p-7 shadow-xl ring-4 ring-amber-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
                ⭐
              </div>

              <h3 className="text-2xl font-bold text-slate-900">
                Vitrine
              </h3>
            </div>

            <div className="mb-4 flex items-end gap-2">
              <span className="text-3xl font-extrabold text-amber-600">
                R$ 19,90
              </span>

              <span className="pb-1 text-xs font-semibold text-slate-500">
                /mês
              </span>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              Maior visibilidade e vendas rápidas.
            </p>

            <ul className="mb-auto space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                WhatsApp + Instagram
              </li>

              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                Até 8 fotos
              </li>

              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                30 dias de anúncio
              </li>
            </ul>

            <Link
              href="/anunciar?plano=Vitrine"
              className="mt-6 block w-full rounded-xl bg-amber-600 py-4 text-center font-bold text-white transition hover:scale-[1.02] hover:bg-amber-700 active:scale-95"
            >
              Escolher plano →
            </Link>
          </article>

          {/* Exclusivo */}
          <article className="relative flex h-full flex-col rounded-3xl border-2 border-emerald-500 bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="absolute -top-3 right-6 whitespace-nowrap rounded-full bg-emerald-600 px-4 py-1 text-xs font-bold text-white">
              DESTAQUE
            </div>

            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
                👑
              </div>

              <h3 className="text-2xl font-bold text-slate-900">
                Exclusivo
              </h3>
            </div>

            <div className="mb-4 flex items-end gap-2">
              <span className="text-3xl font-extrabold text-emerald-600">
                R$ 29,90
              </span>

              <span className="pb-1 text-xs font-semibold text-slate-500">
                /mês
              </span>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              Máxima visibilidade com destaque fixo e repost no Instagram.
            </p>

            <ul className="mb-auto space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                Destaque fixo
              </li>

              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                Link para WhatsApp + Instagram
              </li>

              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                Até 10 fotos
              </li>

              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">✓</span>
                Repost social
              </li>
            </ul>

            <Link
              href="/anunciar?plano=Exclusivo"
              className="mt-6 block w-full rounded-xl bg-emerald-600 py-4 text-center font-bold text-white transition hover:scale-[1.02] hover:bg-emerald-700 active:scale-95"
            >
              Escolher plano →
            </Link>
          </article>
        </div>

        {/* Tabela Comparativa */}
        <section className="mb-16 mt-16">
          <h2 className="mb-3 text-center text-3xl font-bold text-slate-900">
            Compare os Planos
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-center text-slate-600">
            Compare os recursos, o período de divulgação e o nível de destaque
            de cada opção.
          </p>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="p-5 text-left font-semibold text-slate-700">Recurso</th>
                  <th className="p-5 text-center font-semibold">Gratuito</th>
                  <th className="p-5 text-center font-semibold text-emerald-700">Direto do Produtor</th>
                  <th className="p-5 text-center font-semibold">Agenda Local</th>
                  <th className="p-5 text-center font-semibold">Impulso</th>
                  <th className="p-5 text-center font-semibold text-amber-700">Vitrine</th>
                  <th className="p-5 text-center font-semibold text-emerald-700">Exclusivo</th>
                </tr>
              </thead>

              <tbody className="divide-y text-center">
                <tr className="bg-slate-50">
                  <td className="p-5 text-left font-medium">Valor</td>
                  <td className="p-5 font-bold">R$ 0,00</td>
                  <td className="p-5 font-bold">R$ 0,00</td>
                  <td className="p-5 font-bold">R$ 19,90</td>
                  <td className="p-5 font-bold">R$ 9,90</td>
                  <td className="p-5 font-bold text-amber-600">R$ 19,90/mês</td>
                  <td className="p-5 font-bold text-emerald-600">R$ 29,90/mês</td>
                </tr>

                <tr className="bg-white">
                  <td className="p-5 text-left font-medium">Período de divulgação</td>
                  <td className="p-5">7 dias</td>
                  <td className="p-5">30 dias</td>
                  <td className="p-5">60 dias</td>
                  <td className="p-5">15 dias</td>
                  <td className="p-5">30 dias</td>
                  <td className="p-5">30 dias</td>
                </tr>

                <tr className="bg-slate-50">
                  <td className="p-5 text-left font-medium">Anúncios</td>
                  <td className="p-5">1 anúncio</td>
                  <td className="p-5">1 anúncio</td>
                  <td className="p-5">Cadastro na Agenda</td>
                  <td className="p-5">1 anúncio</td>
                  <td className="p-5">1 anúncio</td>
                  <td className="p-5">1 anúncio</td>
                </tr>

                <tr className="bg-white">
                  <td className="p-5 text-left font-medium">Fotos</td>
                  <td className="p-5">5 fotos</td>
                  <td className="p-5">1 foto</td>
                  <td className="p-5">1 foto</td>
                  <td className="p-5">5 fotos</td>
                  <td className="p-5">Até 8 fotos</td>
                  <td className="p-5">Até 10 fotos</td>
                </tr>

                <tr className="bg-slate-50">
                  <td className="p-5 text-left font-medium">WhatsApp</td>
                  <td className="p-5 text-slate-400">—</td>
                  <td className="p-5 text-slate-400">—</td>
                  <td className="p-5 font-semibold text-emerald-600">✓ Incluso</td>
                  <td className="p-5 text-slate-400">—</td>
                  <td className="p-5 font-semibold text-emerald-600">✓ Incluso</td>
                  <td className="p-5 font-semibold text-emerald-600">✓ Link direto</td>
                </tr>

                <tr className="bg-white">
                  <td className="p-5 text-left font-medium">Instagram</td>
                  <td className="p-5 text-slate-400">—</td>
                  <td className="p-5 text-slate-400">—</td>
                  <td className="p-5 font-semibold text-emerald-600">✓ Incluso</td>
                  <td className="p-5 text-slate-400">—</td>
                  <td className="p-5 font-semibold text-emerald-600">✓ Incluso</td>
                  <td className="p-5 font-semibold text-emerald-600">✓ Incluso</td>
                </tr>

                <tr className="bg-slate-50">
                  <td className="p-5 text-left font-medium">Destaque na Home</td>
                  <td className="p-5 text-slate-400">—</td>
                  <td className="p-5 font-semibold text-emerald-600">✓ Incluso</td>
                  <td className="p-5 font-semibold text-emerald-600">✓ Incluso</td>
                  <td className="p-5 text-slate-400">—</td>
                  <td className="p-5">Maior visibilidade</td>
                  <td className="p-5 font-bold text-emerald-600">✓ Destaque fixo</td>
                </tr>

                <tr className="bg-white">
                  <td className="p-5 text-left font-medium">Repost no Instagram</td>
                  <td className="p-5 text-slate-400">—</td>
                  <td className="p-5 text-slate-400">—</td>
                  <td className="p-5 text-slate-400">—</td>
                  <td className="p-5 text-slate-400">—</td>
                  <td className="p-5 text-slate-400">—</td>
                  <td className="p-5 font-bold text-emerald-600">✓ Incluso</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}