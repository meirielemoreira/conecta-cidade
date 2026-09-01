import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';

type AnuncioFinanceiro = {
  id: string;
  titulo: string;
  nome_loja: string | null;
  plano_usado: string | null;
  payment_status: string | null;
  status: string | null;
  aprovado: boolean | null;
  ativo: boolean | null;
  created_at: string;
  data_expiracao: string | null;
};

type StatusVisual = {
  texto: string;
  classe: string;
};

const INFORMACOES_PLANOS: Record<
  string,
  {
    valor: string;
    periodo: string;
    duracaoDias: number;
  }
> = {
  gratuito: {
    valor: 'R$ 0,00',
    periodo: '7 dias',
    duracaoDias: 7,
  },

  impulso: {
    valor: 'R$ 9,90',
    periodo: '15 dias',
    duracaoDias: 15,
  },

  vitrine: {
    valor: 'R$ 19,90',
    periodo: '30 dias',
    duracaoDias: 30,
  },

  exclusivo: {
    valor: 'R$ 29,90',
    periodo: '30 dias',
    duracaoDias: 30,
  },
};

function normalizarTexto(valor?: string | null) {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatarData(valor?: string | null) {
  if (!valor) {
    return 'Ainda não definida';
  }

  const data = new Date(
    `${valor.slice(0, 10)}T12:00:00`
  );

  if (Number.isNaN(data.getTime())) {
    return 'Data inválida';
  }

  return data.toLocaleDateString('pt-BR');
}

function calcularDiasRestantes(
  dataExpiracao?: string | null
) {
  if (!dataExpiracao) {
    return null;
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const vencimento = new Date(
    `${dataExpiracao.slice(0, 10)}T12:00:00`
  );

  vencimento.setHours(0, 0, 0, 0);

  if (Number.isNaN(vencimento.getTime())) {
    return null;
  }

  const diferenca =
    vencimento.getTime() - hoje.getTime();

  return Math.ceil(
    diferenca / (1000 * 60 * 60 * 24)
  );
}

function obterInformacoesPlano(
  plano?: string | null
) {
  const planoNormalizado =
    normalizarTexto(plano);

  return (
    INFORMACOES_PLANOS[planoNormalizado] || {
      valor: 'Valor não informado',
      periodo: 'Período não informado',
      duracaoDias: 0,
    }
  );
}

function obterStatusPagamento(
  plano?: string | null,
  paymentStatus?: string | null
): StatusVisual {
  const planoNormalizado =
    normalizarTexto(plano);

  const pagamento =
    normalizarTexto(paymentStatus);

  if (planoNormalizado === 'gratuito') {
    return {
      texto: 'Não se aplica — plano gratuito',
      classe:
        'border-sky-200 bg-sky-50 text-sky-700',
    };
  }

  if (
    pagamento === 'aprovado' ||
    pagamento === 'approved' ||
    pagamento === 'pago' ||
    pagamento === 'paid'
  ) {
    return {
      texto: 'Pagamento aprovado',
      classe:
        'border-emerald-200 bg-emerald-50 text-emerald-700',
    };
  }

  if (
    pagamento === 'recusado' ||
    pagamento === 'rejected' ||
    pagamento === 'erro' ||
    pagamento === 'failed'
  ) {
    return {
      texto: 'Pagamento não aprovado',
      classe:
        'border-red-200 bg-red-50 text-red-700',
    };
  }

  if (
    pagamento === 'cancelado' ||
    pagamento === 'cancelled'
  ) {
    return {
      texto: 'Pagamento cancelado',
      classe:
        'border-slate-300 bg-slate-100 text-slate-700',
    };
  }

  return {
    texto: 'Pagamento pendente',
    classe:
      'border-amber-200 bg-amber-50 text-amber-800',
  };
}

function obterSituacaoVencimento(
  diasRestantes: number | null,
  ativo?: boolean | null
): StatusVisual {
  if (ativo === false) {
    return {
      texto: 'Anúncio inativo',
      classe:
        'border-slate-300 bg-slate-100 text-slate-700',
    };
  }

  if (diasRestantes === null) {
    return {
      texto: 'Vencimento ainda não definido',
      classe:
        'border-slate-300 bg-slate-50 text-slate-700',
    };
  }

  if (diasRestantes < 0) {
    return {
      texto: `Expirado há ${Math.abs(
        diasRestantes
      )} dia(s)`,
      classe:
        'border-red-200 bg-red-50 text-red-700',
    };
  }

  if (diasRestantes === 0) {
    return {
      texto: 'Expira hoje',
      classe:
        'border-red-200 bg-red-50 text-red-700',
    };
  }

  if (diasRestantes <= 3) {
    return {
      texto: `Expira em ${diasRestantes} dia(s)`,
      classe:
        'border-orange-200 bg-orange-50 text-orange-700',
    };
  }

  if (diasRestantes <= 7) {
    return {
      texto: `Restam ${diasRestantes} dias`,
      classe:
        'border-amber-200 bg-amber-50 text-amber-800',
    };
  }

  return {
    texto: `Restam ${diasRestantes} dias`,
    classe:
      'border-emerald-200 bg-emerald-50 text-emerald-700',
  };
}

export default async function PagamentosPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      '/login?redirect=/minha-conta/pagamentos'
    );
  }

  const { data, error } = await supabase
    .from('anuncios')
    .select(`
      id,
      titulo,
      nome_loja,
      plano_usado,
      payment_status,
      status,
      aprovado,
      ativo,
      created_at,
      data_expiracao
    `)
    .eq('profile_id', user.id)
    .order('created_at', {
      ascending: false,
    });

  const anuncios =
    (data || []) as AnuncioFinanceiro[];

  const anunciosAtivos = anuncios.filter(
    (anuncio) => anuncio.ativo !== false
  ).length;

  const anunciosExpirados = anuncios.filter(
    (anuncio) => {
      const dias = calcularDiasRestantes(
        anuncio.data_expiracao
      );

      return dias !== null && dias < 0;
    }
  ).length;

  const pagamentosPendentes = anuncios.filter(
    (anuncio) => {
      const plano =
        normalizarTexto(anuncio.plano_usado);

      const pagamento =
        normalizarTexto(
          anuncio.payment_status
        );

      return (
        plano !== 'gratuito' &&
        ![
          'aprovado',
          'approved',
          'pago',
          'paid',
        ].includes(pagamento)
      );
    }
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-orange-600">
              Minha conta
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
              Planos e renovações
            </h1>

            <p className="mt-2 text-slate-600">
              Consulte seus planos, vencimentos e
              situações de pagamento.
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
              href="/planos"
              className="inline-flex justify-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
            >
              Conhecer todos os planos
            </Link>
          </div>
        </header>

        {error && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-bold">
              Não foi possível carregar as informações.
            </p>

            <p className="mt-2 text-sm">
              {error.message}
            </p>
          </section>
        )}

        {!error && (
          <>
            <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Resumo
                titulo="Total de anúncios"
                valor={String(anuncios.length)}
                descricao="Vinculados à sua conta"
                classe="border-sky-200 bg-sky-50 text-sky-700"
              />

              <Resumo
                titulo="Anúncios ativos"
                valor={String(anunciosAtivos)}
                descricao="Ativos no sistema"
                classe="border-emerald-200 bg-emerald-50 text-emerald-700"
              />

              <Resumo
                titulo="Expirados"
                valor={String(anunciosExpirados)}
                descricao="Precisam de renovação"
                classe="border-red-200 bg-red-50 text-red-700"
              />

              <Resumo
                titulo="Pagamentos pendentes"
                valor={String(pagamentosPendentes)}
                descricao="Planos pagos não confirmados"
                classe="border-amber-200 bg-amber-50 text-amber-800"
              />
            </section>

            {anuncios.length === 0 ? (
              <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl">
                  📢
                </div>

                <h2 className="mt-5 text-2xl font-bold text-slate-900">
                  Você ainda não possui planos
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-slate-600">
                  Os planos aparecem aqui depois que você
                  cadastra um anúncio.
                </p>

                <Link
                  href="/planos"
                  className="mt-6 inline-flex rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
                >
                  Conhecer os planos
                </Link>
              </section>
            ) : (
              <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {anuncios.map((anuncio) => {
                  const plano =
                    anuncio.plano_usado ||
                    'Gratuito';

                  const informacoesPlano =
                    obterInformacoesPlano(plano);

                  const pagamento =
                    obterStatusPagamento(
                      plano,
                      anuncio.payment_status
                    );

                  const diasRestantes =
                    calcularDiasRestantes(
                      anuncio.data_expiracao
                    );

                  const vencimento =
                    obterSituacaoVencimento(
                      diasRestantes,
                      anuncio.ativo
                    );

                  return (
                    <article
                      key={anuncio.id}
                      className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase text-orange-700">
                          Plano {plano}
                        </span>

                        <span className="text-sm font-bold text-slate-600">
                          {informacoesPlano.valor}
                        </span>
                      </div>

                      <p className="mt-5 text-xs font-bold uppercase tracking-wide text-orange-600">
                        {anuncio.nome_loja ||
                          'Conecta Cidade'}
                      </p>

                      <h2 className="mt-2 min-h-[56px] text-xl font-bold text-slate-900">
                        {anuncio.titulo}
                      </h2>

                      <div
                        className={`mt-5 rounded-xl border px-4 py-3 text-sm font-bold ${pagamento.classe}`}
                      >
                        {pagamento.texto}
                      </div>

                      <div
                        className={`mt-3 rounded-xl border px-4 py-3 text-sm font-bold ${vencimento.classe}`}
                      >
                        {vencimento.texto}
                      </div>

                      <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm">
                        <Linha
                          titulo="Período do plano"
                          valor={
                            informacoesPlano.periodo
                          }
                        />

                        <Linha
                          titulo="Cadastrado em"
                          valor={formatarData(
                            anuncio.created_at
                          )}
                        />

                        <Linha
                          titulo="Vencimento"
                          valor={formatarData(
                            anuncio.data_expiracao
                          )}
                        />

                        <Linha
                          titulo="Publicação"
                          valor={
                            anuncio.aprovado
                              ? 'Aprovada'
                              : 'Em análise'
                          }
                        />
                      </div>

                      <div className="mt-auto space-y-3 pt-6">
                        {anuncio.aprovado &&
                          anuncio.ativo !== false && (
                            <Link
                              href={`/anuncio/${anuncio.id}`}
                              className="flex w-full justify-center rounded-xl border border-orange-300 bg-orange-50 px-5 py-3 font-semibold text-orange-700 transition hover:bg-orange-100"
                            >
                              Ver anúncio
                            </Link>
                          )}

                        <Link
                          href="/planos"
                          className="flex w-full justify-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
                        >
                          Renovar ou trocar plano
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}

            <section className="mt-8 rounded-3xl border border-sky-200 bg-sky-50 p-6 text-sky-900">
              <h2 className="text-xl font-bold">
                Como funciona a renovação?
              </h2>

              <p className="mt-2 leading-relaxed">
                Nesta primeira versão, o botão direciona
                para a página de planos. Depois criaremos
                a renovação direta do anúncio, mantendo
                as fotos e os dados já cadastrados.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Resumo({
  titulo,
  valor,
  descricao,
  classe,
}: {
  titulo: string;
  valor: string;
  descricao: string;
  classe: string;
}) {
  return (
    <article
      className={`rounded-2xl border p-5 ${classe}`}
    >
      <p className="text-sm font-bold">
        {titulo}
      </p>

      <p className="mt-2 text-3xl font-black">
        {valor}
      </p>

      <p className="mt-1 text-xs">
        {descricao}
      </p>
    </article>
  );
}

function Linha({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">
        {titulo}
      </span>

      <strong className="text-right text-slate-800">
        {valor}
      </strong>
    </div>
  );
}