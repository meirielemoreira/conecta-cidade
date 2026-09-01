import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';

type Anuncio = {
  id: string;
  titulo: string;
  nome_loja: string | null;
  descricao: string | null;
  preco: number | null;
  imagens: unknown;
  categoria: string | null;
  plano_usado: string | null;
  status: string | null;
  payment_status: string | null;
  aprovado: boolean | null;
  ativo: boolean | null;
  created_at: string;
};

function normalizarImagens(imagens: unknown): string[] {
  if (Array.isArray(imagens)) {
    return imagens.filter(
      (imagem): imagem is string =>
        typeof imagem === 'string' && imagem.trim().length > 0
    );
  }

  if (typeof imagens === 'string') {
    const valor = imagens.trim();

    if (!valor) return [];

    if (
      valor.startsWith('http://') ||
      valor.startsWith('https://') ||
      valor.startsWith('/')
    ) {
      return [valor];
    }

    try {
      const convertido = JSON.parse(valor);

      if (Array.isArray(convertido)) {
        return convertido.filter(
          (imagem): imagem is string =>
            typeof imagem === 'string' && imagem.trim().length > 0
        );
      }
    } catch {
      return [];
    }
  }

  return [];
}

function formatarPreco(preco: number | null) {
  if (preco === null || preco === undefined) {
    return 'Preço não informado';
  }

  return preco.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarData(data: string) {
  const valor = new Date(data);

  if (Number.isNaN(valor.getTime())) {
    return 'Data não informada';
  }

  return valor.toLocaleDateString('pt-BR');
}

function obterStatus(anuncio: Anuncio) {
  if (anuncio.ativo === false) {
    return {
      texto: 'Inativo',
      classe: 'bg-slate-100 text-slate-700',
    };
  }

  if (anuncio.aprovado === true) {
    return {
      texto: 'Aprovado',
      classe: 'bg-emerald-100 text-emerald-700',
    };
  }

  if (anuncio.status?.toLowerCase() === 'rejeitado') {
    return {
      texto: 'Rejeitado',
      classe: 'bg-red-100 text-red-700',
    };
  }

  return {
    texto: 'Em análise',
    classe: 'bg-amber-100 text-amber-800',
  };
}

function obterPagamento(status: string | null) {
  switch (status?.toLowerCase()) {
    case 'pago':
    case 'aprovado':
      return { texto: 'Pago', classe: 'text-emerald-700' };

    case 'recusado':
    case 'cancelado':
    case 'erro':
      return { texto: 'Não aprovado', classe: 'text-red-700' };

    case 'pendente':
      return { texto: 'Pendente', classe: 'text-amber-700' };

    default:
      return { texto: 'Não informado', classe: 'text-slate-600' };
  }
}

export default async function MeusAnunciosPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login?redirect=/minha-conta/anuncios');
  }

  const { data, error } = await supabase
    .from('anuncios')
    .select(`
      id,
      titulo,
      nome_loja,
      descricao,
      preco,
      imagens,
      categoria,
      plano_usado,
      status,
      payment_status,
      aprovado,
      ativo,
      created_at
    `)
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  const anuncios = (data || []) as Anuncio[];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-orange-600">
              Minha conta
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
              Meus anúncios
            </h1>

            <p className="mt-2 text-slate-600">
              Acompanhe somente os anúncios vinculados à sua conta.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/minha-conta"
              className="inline-flex justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              ← Voltar para minha conta
            </Link>

            <Link
              href="/anunciar"
              className="inline-flex justify-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              Criar novo anúncio
            </Link>
          </div>
        </div>

        {error && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-bold">Não foi possível carregar seus anúncios.</p>
            <p className="mt-2 text-sm">{error.message}</p>
          </section>
        )}

        {!error && anuncios.length === 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl">
              📢
            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              Você ainda não possui anúncios
            </h2>

            <p className="mt-2 text-slate-600">
              Cadastre seu primeiro anúncio para divulgar seu produto,
              imóvel, veículo, promoção ou evento.
            </p>

            <Link
              href="/anunciar"
              className="mt-6 inline-flex rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              Criar meu primeiro anúncio
            </Link>
          </section>
        )}

        {!error && anuncios.length > 0 && (
          <>
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
              Total encontrado:{' '}
              <strong className="text-slate-900">{anuncios.length}</strong>
            </div>

            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {anuncios.map((anuncio) => {
                const imagens = normalizarImagens(anuncio.imagens);
                const imagemPrincipal = imagens[0] || null;
                const status = obterStatus(anuncio);
                const pagamento = obterPagamento(anuncio.payment_status);

                return (
                  <article
                    key={anuncio.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="h-52 bg-slate-100">
                      {imagemPrincipal ? (
                        <img
                          src={imagemPrincipal}
                          alt={anuncio.titulo}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
                          <span className="text-4xl">🖼️</span>
                          <span className="mt-2 text-sm font-semibold">
                            Anúncio sem foto
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${status.classe}`}
                        >
                          {status.texto}
                        </span>

                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                          {anuncio.plano_usado || 'Plano não informado'}
                        </span>
                      </div>

                      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-orange-600">
                        {anuncio.nome_loja ||
                          anuncio.categoria ||
                          'Conecta Cidade'}
                      </p>

                      <h2 className="mt-2 line-clamp-2 min-h-[56px] text-xl font-bold text-slate-900">
                        {anuncio.titulo}
                      </h2>

                      <p className="mt-3 text-2xl font-black text-orange-600">
                        {formatarPreco(anuncio.preco)}
                      </p>

                      <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Categoria</span>
                          <strong className="text-right text-slate-800">
                            {anuncio.categoria || 'Não informada'}
                          </strong>
                        </div>

                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Pagamento</span>
                          <strong
                            className={`text-right ${pagamento.classe}`}
                          >
                            {pagamento.texto}
                          </strong>
                        </div>

                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Cadastrado em</span>
                          <strong className="text-right text-slate-800">
                            {formatarData(anuncio.created_at)}
                          </strong>
                        </div>

                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Fotos</span>
                          <strong className="text-right text-slate-800">
                            {imagens.length}
                          </strong>
                        </div>
                      </div>

                      {anuncio.aprovado && anuncio.ativo !== false ? (
                        <Link
                          href={`/anuncio/${anuncio.id}`}
                          className="mt-5 flex w-full justify-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
                        >
                          Ver anúncio publicado
                        </Link>
                      ) : (
                        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-amber-800">
                          O anúncio ficará disponível publicamente após a aprovação.
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
