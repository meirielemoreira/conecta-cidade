import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Planos para Anunciar na Sua Cidade | Portal Conecta Cidade',
  description:
    'Conheça os planos do Portal Conecta Cidade para divulgar negócios, serviços, produtos e anúncios locais na sua cidade.',
  keywords: [
    'anunciar na minha cidade',
    'divulgar meu negócio local',
    'anunciar minha empresa',
    'divulgar meus serviços',
    'publicidade para comércio local',
    'anúncios para empresas',
    'divulgação de negócios locais',
    'planos Portal Conecta Cidade',
    'Agenda Local',
    'Direto do Produtor',
  ],
  alternates: {
    canonical: '/planos',
  },
  openGraph: {
    title: 'Planos para Anunciar na Sua Cidade | Portal Conecta Cidade',
    description:
      'Escolha uma opção para divulgar seu negócio, serviço, produto ou anúncio local no Portal Conecta Cidade.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default async function PlanosPage() {
  const { data: configuracoes, error } = await supabase
    .from('configuracoes_planos')
    .select('codigo, valor, duracao_dias')
    .eq('ativo', true);

  if (error) {
    console.error('Erro ao carregar os planos:', error.message);
  }

  const planosPorCodigo = Object.fromEntries(
    (configuracoes ?? []).map((plano) => [plano.codigo, plano])
  );

  const obterPlano = (codigo: string) => {
    return planosPorCodigo[codigo];
  };

  const formatarPreco = (valor: number) => {
    return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 md:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Título Principal */}
        <section className="mb-10 text-center md:mb-14">
          <span className="mb-3 inline-flex rounded-full bg-orange-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-600">
            Planos Conecta Cidade
          </span>
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Divulgue seu negócio na sua cidade
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-600 md:text-lg">
            Compare os benefícios e escolha a melhor forma de aparecer para os moradores.
          </p>
        </section>

        {/* Primeira linha */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Plano Gratuito */}
          <article className="relative flex h-full flex-col rounded-2xl border border-orange-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="absolute top-4 right-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
  Comece aqui
</div>
            
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl">
                📢
              </div>
              <h3 className="text-lg font-bold text-slate-900">Plano Gratuito</h3>
            </div>

            <div className="mb-1">
              <span className="text-3xl font-extrabold text-orange-600">
                {obterPlano('gratuito') ? formatarPreco(obterPlano('gratuito').valor) : 'R$ 0,00'}
              </span>
            </div>
            <p className="mb-6 text-sm text-slate-500">Ideal para testar a plataforma</p>

            <ul className="mb-8 flex-1 space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                {obterPlano('gratuito')?.duracao_dias ?? 30} dias de divulgação
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                5 fotos
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                WhatsApp
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                Novidades da Home
              </li>
            </ul>

            <Link
              href="/anunciar?plano=Gratuito"
              className="block w-full rounded-xl bg-orange-500 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Anunciar grátis
            </Link>
          </article>

          {/* Impulso */}
          <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-xl">
                🚀
              </div>
              <h3 className="text-lg font-bold text-slate-900">Impulso</h3>
            </div>

            <div className="mb-1">
              <span className="text-3xl font-extrabold text-slate-900">
                {obterPlano('impulso') ? formatarPreco(obterPlano('impulso').valor) : 'R$ 9,90'}
              </span>
            </div>
            <p className="mb-6 text-sm text-slate-500">Mais tempo de divulgação</p>

            <ul className="mb-8 flex-1 space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                {obterPlano('impulso')?.duracao_dias ?? 40} dias de divulgação
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                5 fotos
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                WhatsApp + Instagram
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                Novidades da Home
              </li>
            </ul>

            <Link
              href="/anunciar?plano=Impulso"
              className="block w-full rounded-xl bg-sky-600 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Escolher Impulso
            </Link>
          </article>

          {/* Vitrine */}
          <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-xl">
                ⭐
              </div>
              <h3 className="text-lg font-bold text-slate-900">Vitrine</h3>
            </div>

            <div className="mb-1">
              <span className="text-3xl font-extrabold text-slate-900">
                {obterPlano('vitrine') ? formatarPreco(obterPlano('vitrine').valor) : 'R$ 19,90'}
              </span>
            </div>
            <p className="mb-6 text-sm text-slate-500">Aparece nos Destaques</p>

            <ul className="mb-8 flex-1 space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                {obterPlano('vitrine')?.duracao_dias ?? 45} dias de divulgação
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                Até 8 fotos
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                WhatsApp + Instagram
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                Destaques da Home
              </li>
            </ul>

            <Link
              href="/anunciar?plano=Vitrine"
              className="block w-full rounded-xl bg-sky-600 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Escolher Vitrine
            </Link>
          </article>
        </div>

        {/* Segunda linha - centralizada */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:max-w-3xl md:mx-auto">
          
          {/* Exclusivo */}
          <article className="relative flex h-full flex-col rounded-2xl border border-violet-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
           <div className="absolute top-4 right-4 rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
  Mais completo
</div>
            
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl">
                👑
              </div>
              <h3 className="text-lg font-bold text-slate-900">Exclusivo</h3>
            </div>

            <div className="mb-1">
              <span className="text-3xl font-extrabold text-violet-700">
                {obterPlano('exclusivo') ? formatarPreco(obterPlano('exclusivo').valor) : 'R$ 29,90'}
              </span>
            </div>
            <p className="mb-6 text-sm text-slate-500">Máxima visibilidade + Repost</p>

            <ul className="mb-8 flex-1 space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                {obterPlano('exclusivo')?.duracao_dias ?? 60} dias de divulgação
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                Até 8 fotos
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                WhatsApp + Instagram
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                Destaque na Home
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                Repost no Instagram e Facebook
              </li>
            </ul>

            <Link
              href="/anunciar?plano=Exclusivo"
              className="block w-full rounded-xl bg-violet-600 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-violet-700"
            >
              Escolher Exclusivo
            </Link>
          </article>

          {/* Agenda Local */}
          <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-xl">
                📍
              </div>
              <h3 className="text-lg font-bold text-slate-900">Agenda Local</h3>
            </div>

            <div className="mb-1">
              <span className="text-3xl font-extrabold text-slate-900">
                {obterPlano('agenda_local') ? formatarPreco(obterPlano('agenda_local').valor) : 'R$ 19,90'}
              </span>
            </div>
            <p className="mb-6 text-sm text-slate-500">Seja encontrado pelos moradores</p>

            <ul className="mb-8 flex-1 space-y-3 text-sm text-slate-700">
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                {obterPlano('agenda_local')?.duracao_dias ?? 60} dias de divulgação
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                1 foto
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                WhatsApp + Instagram
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-emerald-500 font-bold">✓</span>
                Carrossel da Home
              </li>
            </ul>

            <Link
              href="/agenda-local/cadastro"
              className="block w-full rounded-xl bg-sky-600 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              Escolher Agenda Local
            </Link>
          </article>
        </div>

 {/* Direto do Produtor */}
<div className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 md:p-8">
  
  {/* Título */}
  <div className="mb-8 text-center">
    <div className="mb-2 text-3xl">🌱</div>
    <h3 className="text-xl font-bold text-emerald-900 md:text-2xl">
      Direto do Produtor
    </h3>
  </div>

  {/* Textos lado a lado */}
  <div className="mx-auto mb-8 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-0">
    
    {/* Texto da esquerda */}
    <div className="flex flex-col items-center px-6 text-center md:items-start md:border-r md:border-emerald-200 md:px-10 md:text-left">
      <div className="mb-3 text-2xl">🏡</div>
      <p className="text-sm leading-relaxed text-slate-700 md:text-base">
        Uma iniciativa de valorização local que oferece divulgação <strong>100% gratuita</strong>, 
        incentivando o empreendedorismo, a produção artesanal e o desenvolvimento das pequenas cidades.
      </p>
    </div>

    {/* Texto da direita */}
    <div className="flex flex-col items-center px-6 text-center md:items-start md:px-10 md:text-left">
      <div className="mb-3 text-2xl">💪</div>
      <p className="text-sm leading-relaxed text-slate-700 md:text-base">
        Nosso propósito vai além da divulgação. Queremos valorizar o trabalho de quem vive da própria atividade 
        e contribuir para uma economia regional mais forte.
      </p>
    </div>
  </div>

  {/* Mensagem central + botão */}
  <div className="text-center">
    <p className="mb-5 text-sm font-medium text-emerald-800 md:text-base">
      💚 Nosso objetivo não é cobrar de quem produz, mas ajudar quem trabalha.
    </p>
    
    <Link
      href="/direto-do-produtor"
      className="inline-block rounded-xl bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
    >
      Quero participar
    </Link>
  </div>
</div>

        {/* Mensagem final */}
        <p className="mt-10 text-center text-sm text-slate-500">
          🛡️ Escolha com tranquilidade. Você acompanha seus anúncios pela Minha Conta.
        </p>
      </div>
    </main>
  );
}