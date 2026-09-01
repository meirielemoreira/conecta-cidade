import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';

type AgendaLocal = {
  id: string;
  nome_completo: string | null;
  profissao: string | null;
  whatsapp: string | null;
  instagram: string | null;
  endereco: string | null;
  descricao: string | null;
  foto_url: string | null;

  plano: string | null;
  categoria: string | null;
  pagamento_status: string | null;

  aprovado: boolean | null;
  ativo: boolean | null;

  data_inicio: string | null;
  data_expiracao: string | null;
  data_cadastro: string | null;

  profile_id: string | null;
};

/* ======================================================
   FORMATAR DATA
====================================================== */

function formatarData(data?: string | null) {
  if (!data) {
    return 'Não definida';
  }

  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return 'Não definida';
  }

  return dataConvertida.toLocaleDateString('pt-BR');
}

/* ======================================================
   CALCULAR DIAS RESTANTES
====================================================== */

function calcularDiasRestantes(
  dataExpiracao?: string | null
) {
  if (!dataExpiracao) {
    return null;
  }

  const hoje = new Date();

  hoje.setHours(0, 0, 0, 0);

  const vencimento = new Date(dataExpiracao);

  vencimento.setHours(0, 0, 0, 0);

  if (Number.isNaN(vencimento.getTime())) {
    return null;
  }

  const diferenca =
    vencimento.getTime() -
    hoje.getTime();

  return Math.ceil(
    diferenca /
      (1000 * 60 * 60 * 24)
  );
}

/* ======================================================
   STATUS
====================================================== */

function definirStatus(
  cadastro: AgendaLocal
) {
  const diasRestantes =
    calcularDiasRestantes(
      cadastro.data_expiracao
    );

  if (
    diasRestantes !== null &&
    diasRestantes < 0
  ) {
    return {
      titulo: 'Expirado',
      descricao:
        'O período de divulgação deste cadastro terminou.',
      classe:
        'bg-red-50 border-red-200 text-red-700',
    };
  }

  if (
    cadastro.aprovado !== true
  ) {
    return {
      titulo: 'Em análise',
      descricao:
        'Seu cadastro foi recebido e aguarda análise da administração.',
      classe:
        'bg-amber-50 border-amber-200 text-amber-800',
    };
  }

  if (
    cadastro.aprovado === true &&
    cadastro.ativo === true
  ) {
    return {
      titulo: 'Publicado',
      descricao:
        'Seu cadastro está aprovado e disponível na Agenda Local.',
      classe:
        'bg-emerald-50 border-emerald-200 text-emerald-700',
    };
  }

  return {
    titulo: 'Inativo',
    descricao:
      'Seu cadastro está registrado, mas não está disponível publicamente neste momento.',
    classe:
      'bg-slate-50 border-slate-200 text-slate-700',
  };
}

/* ======================================================
   PAGAMENTO
====================================================== */

function definirPagamento(
  pagamento?: string | null
) {
  const status =
    pagamento
      ?.trim()
      .toLowerCase() || '';

  if (
    status === 'pago' ||
    status === 'aprovado'
  ) {
    return {
      texto: 'Pago',
      classe:
        'bg-emerald-100 text-emerald-700',
    };
  }

  if (
    status === 'cortesia'
  ) {
    return {
      texto: 'Cortesia',
      classe:
        'bg-violet-100 text-violet-700',
    };
  }

  if (
    status === 'pendente'
  ) {
    return {
      texto: 'Pendente',
      classe:
        'bg-amber-100 text-amber-800',
    };
  }

  return {
    texto:
      pagamento ||
      'Não informado',

    classe:
      'bg-slate-100 text-slate-600',
  };
}

/* ======================================================
   PÁGINA
====================================================== */

export default async function MinhaAgendaPage() {
  const supabase =
    await createClient();

  /* ====================================================
     USUÁRIO
  ==================================================== */

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    redirect(
      '/login?redirect=/minha-conta/agenda'
    );
  }

  /* ====================================================
     BUSCAR CADASTROS
  ==================================================== */

  const {
    data,
    error,
  } = await supabase
    .from('agenda_local')
    .select(`
      id,
      nome_completo,
      profissao,
      whatsapp,
      instagram,
      endereco,
      descricao,
      foto_url,
      plano,
      categoria,
      pagamento_status,
      aprovado,
      ativo,
      data_inicio,
      data_expiracao,
      data_cadastro,
      profile_id
    `)
    .eq(
      'profile_id',
      user.id
    )
    .order(
      'data_cadastro',
      {
        ascending: false,
      }
    );

  const cadastros =
    (data || []) as AgendaLocal[];

  if (error) {
    console.error(
      'Erro ao carregar Agenda Local:',
      error
    );
  }

  /* ====================================================
     SEM CADASTRO
  ==================================================== */

  if (
    !error &&
    cadastros.length === 0
  ) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <Link
              href="/minha-conta"
              className="text-sm font-semibold text-slate-600 transition hover:text-orange-600"
            >
              ← Voltar para Minha Conta
            </Link>
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-3xl">
              📍
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-wider text-sky-600">
              Agenda Local
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
              Você ainda não possui cadastro
            </h1>

            <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-600">
              A Agenda Local reúne empresas,
              profissionais e prestadores de
              serviços de Nova União em um
              catálogo fácil de consultar.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/agenda-local/cadastro"
                className="rounded-xl bg-sky-600 px-7 py-4 font-semibold text-white transition hover:bg-sky-700"
              >
                Cadastrar meu serviço
              </Link>

              <Link
                href="/agenda-local"
                className="rounded-xl border border-slate-300 bg-white px-7 py-4 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Conhecer a Agenda Local
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  /* ====================================================
     ERRO
  ==================================================== */

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/minha-conta"
            className="font-semibold text-slate-600 hover:text-orange-600"
          >
            ← Voltar para Minha Conta
          </Link>

          <section className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700">
            <h1 className="text-2xl font-bold">
              Não foi possível carregar sua Agenda Local
            </h1>

            <p className="mt-2">
              Tente novamente em alguns instantes.
            </p>
          </section>
        </div>
      </main>
    );
  }

  /* ====================================================
     COM CADASTRO
  ==================================================== */

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-7">

        {/* CABEÇALHO */}

        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-9">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-sky-600">
                Minha Conta
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
                Minha Agenda Local
              </h1>

              <p className="mt-2 text-slate-600">
                Acompanhe seus dados,
                publicação, pagamento e
                validade na Agenda Local.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/minha-conta"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                ← Minha Conta
              </Link>

              <Link
                href="/agenda-local"
                className="rounded-xl bg-sky-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-sky-700"
              >
                Ver Agenda Local
              </Link>
            </div>
          </div>
        </section>

        {/* QUANTIDADE */}

        <section className="rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-sky-800">
          {cadastros.length === 1
            ? 'Você possui 1 cadastro vinculado à sua conta.'
            : `Você possui ${cadastros.length} cadastros vinculados à sua conta.`}
        </section>

        {/* CADASTROS */}

        <section className="space-y-6">
          {cadastros.map(
            (cadastro) => {
              const status =
                definirStatus(
                  cadastro
                );

              const pagamento =
                definirPagamento(
                  cadastro.pagamento_status
                );

              const diasRestantes =
                calcularDiasRestantes(
                  cadastro.data_expiracao
                );

              const expirado =
                diasRestantes !== null &&
                diasRestantes < 0;

              return (
                <article
                  key={cadastro.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="grid lg:grid-cols-[300px_1fr]">

                    {/* FOTO */}

                    <div className="bg-slate-100">
                      {cadastro.foto_url ? (
                        <img
                          src={
                            cadastro.foto_url
                          }
                          alt={
                            cadastro.nome_completo ||
                            'Agenda Local'
                          }
                          className="h-full min-h-[280px] w-full object-cover"
                        />
                      ) : (
                        <div className="flex min-h-[280px] items-center justify-center text-6xl text-slate-300">
                          📍
                        </div>
                      )}
                    </div>

                    {/* INFORMAÇÕES */}

                    <div className="p-6 md:p-8">
                      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-sky-600">
                            {cadastro.plano ||
                              'Agenda Local'}
                          </p>

                          <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
                            {cadastro.nome_completo ||
                              'Cadastro Agenda Local'}
                          </h2>

                          <p className="mt-1 text-lg font-semibold text-slate-600">
                            {cadastro.profissao ||
                              'Serviço não informado'}
                          </p>
                        </div>

                        <span
                          className={`inline-flex self-start rounded-full border px-4 py-2 text-sm font-bold ${status.classe}`}
                        >
                          {status.titulo}
                        </span>
                      </div>

                      <p className="mt-5 text-sm leading-relaxed text-slate-600">
                        {status.descricao}
                      </p>

                      {/* RESUMO */}

                      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Info
                          titulo="Pagamento"
                          valor={
                            pagamento.texto
                          }
                        />

                        <Info
                          titulo="Plano"
                          valor={
                            cadastro.plano ||
                            'Agenda Local'
                          }
                        />

                        <Info
                          titulo="Início"
                          valor={formatarData(
                            cadastro.data_inicio ||
                              cadastro.data_cadastro
                          )}
                        />

                        <Info
                          titulo="Vencimento"
                          valor={formatarData(
                            cadastro.data_expiracao
                          )}
                        />
                      </div>

                      {/* VALIDADE */}

                      <div className="mt-5">
                        {diasRestantes ===
                        null ? (
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            A data de vencimento
                            ainda não foi definida.
                          </div>
                        ) : expirado ? (
                          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                            Este cadastro expirou há{' '}
                            {Math.abs(
                              diasRestantes
                            )}{' '}
                            dia(s).
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                            Restam{' '}
                            {diasRestantes}{' '}
                            dia(s) de divulgação.
                          </div>
                        )}
                      </div>

                      {/* CONTATO */}

                      <div className="mt-7 grid gap-4 sm:grid-cols-2">
                        <Info
                          titulo="WhatsApp"
                          valor={
                            cadastro.whatsapp ||
                            'Não informado'
                          }
                        />

                        <Info
                          titulo="Instagram"
                          valor={
                            cadastro.instagram ||
                            'Não informado'
                          }
                        />
                      </div>

                      {cadastro.endereco && (
                        <div className="mt-4">
                          <Info
                            titulo="Endereço"
                            valor={
                              cadastro.endereco
                            }
                          />
                        </div>
                      )}

                      {cadastro.descricao && (
                        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Descrição
                          </p>

                          <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-700">
                            {
                              cadastro.descricao
                            }
                          </p>
                        </div>
                      )}

                      {/* AÇÕES */}

                      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                        {cadastro.aprovado ===
                          true &&
                          cadastro.ativo ===
                            true &&
                          !expirado && (
                            <Link
                              href="/agenda-local"
                              className="rounded-xl bg-sky-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-sky-700"
                            >
                              Ver publicação
                            </Link>
                          )}

                        <Link
                          href="/planos"
                          className="rounded-xl bg-orange-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-orange-700"
                        >
                          {expirado
                            ? 'Renovar cadastro'
                            : 'Ver planos'}
                        </Link>

                        <Link
                          href="/minha-conta"
                          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Voltar
                        </Link>
                      </div>

                      {cadastro.aprovado !==
                        true && (
                        <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                          Seu cadastro ainda não
                          aparece publicamente
                          porque está aguardando
                          análise da administração.
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </section>

        {/* AJUDA */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Sobre sua Agenda Local
          </h2>

          <p className="mt-2 leading-relaxed text-slate-600">
            Os cadastros são analisados pela
            administração do Conecta Cidade.
            Pagamento, aprovação, período de
            divulgação e renovação podem ser
            acompanhados nesta área.
          </p>

          <Link
            href="/agenda-local"
            className="mt-5 inline-flex font-semibold text-sky-600 transition hover:text-sky-700"
          >
            Conhecer a Agenda Local →
          </Link>
        </section>
      </div>
    </main>
  );
}

/* ======================================================
   CARD DE INFORMAÇÃO
====================================================== */

function Info({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {titulo}
      </p>

      <p className="mt-2 break-words font-semibold text-slate-900">
        {valor}
      </p>
    </div>
  );
}