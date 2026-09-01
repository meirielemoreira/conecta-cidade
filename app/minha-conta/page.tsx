import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

type Profile = {
  id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  role: 'cliente' | 'admin' | 'superadmin';
  ativo: boolean;
};

type AgendaResumo = {
  id: string;
  nome_completo: string | null;
  profissao: string | null;
  plano: string | null;
  pagamento_status: string | null;
  aprovado: boolean | null;
  ativo: boolean | null;
  data_cadastro: string | null;
  data_expiracao: string | null;
};


type AnuncioResumo = {
  aprovado: boolean | null;
  ativo: boolean | null;
  status: string | null;
  data_expiracao: string | null;
};
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

function criarResumoAnuncios(
  anuncios: AnuncioResumo[]
) {
  const total = anuncios.length;

  const aprovados = anuncios.filter(
    (anuncio) =>
      anuncio.aprovado === true &&
      anuncio.ativo !== false
  ).length;

  const pendentes = anuncios.filter(
    (anuncio) =>
      anuncio.aprovado !== true &&
      anuncio.status?.toLowerCase() !==
        'rejeitado'
  ).length;

  const rejeitados = anuncios.filter(
    (anuncio) =>
      anuncio.status?.toLowerCase() ===
      'rejeitado'
  ).length;

  const expirados = anuncios.filter(
    (anuncio) => {
      const dias = calcularDiasRestantes(
        anuncio.data_expiracao
      );

      return dias !== null && dias < 0;
    }
  ).length;

  const expirando = anuncios.filter(
    (anuncio) => {
      const dias = calcularDiasRestantes(
        anuncio.data_expiracao
      );

      return (
        dias !== null &&
        dias >= 0 &&
        dias <= 7
      );
    }
  ).length;

  const ativos = anuncios.filter(
    (anuncio) => anuncio.ativo !== false
  ).length;

  return {
    total,
    aprovados,
    pendentes,
    rejeitados,
    expirados,
    expirando,
    ativos,
  };
}

export default async function MinhaContaPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login?redirect=/minha-conta');
  }

const [
  resultadoProfile,
  resultadoAnuncios,
  resultadoAgenda,
] = await Promise.all([
    supabase
      .from('profiles')
      .select(`
        id,
        nome,
        email,
        telefone,
        cidade,
        estado,
        role,
        ativo
      `)
      .eq('id', user.id)
      .maybeSingle<Profile>(),

    supabase
      .from('anuncios')
      .select(`
        id,
        aprovado,
        ativo,
        status,
        plano_usado,
        payment_status,
        data_expiracao
      `)
      .eq('profile_id', user.id)
      .order('created_at', {
        ascending: false,
      }),

    supabase
      .from('agenda_local')
      .select(`
        id,
        nome_completo,
        profissao,
        plano,
        pagamento_status,
        aprovado,
        ativo,
        data_cadastro,
        data_expiracao
      `)
      .eq('profile_id', user.id)
      .order('data_cadastro', {
        ascending: false,
      })
      .limit(1),
  ]);

  const profile = resultadoProfile.data;
  const profileError =
    resultadoProfile.error;

  const anuncios =
    (resultadoAnuncios.data ||
      []) as AnuncioResumo[];

  const anunciosError =
    resultadoAnuncios.error;
const agenda =
  resultadoAgenda.data &&
  resultadoAgenda.data.length > 0
    ? (resultadoAgenda.data[0] as AgendaResumo)
    : null;

const agendaError =
  resultadoAgenda.error;

  if (profileError) {
    console.error(
      'Erro ao carregar profile:',
      profileError
    );
  }

  if (anunciosError) {
    console.error(
      'Erro ao carregar resumo dos anúncios:',
      anunciosError
    );
  }
if (agendaError) {
  console.error(
    'Erro ao carregar cadastro da Agenda Local:',
    agendaError
  );
}
  const resumo =
    criarResumoAnuncios(anuncios);

  const nomeUsuario =
    profile?.nome ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Usuário';

  const emailUsuario =
    profile?.email ||
    user.email ||
    'E-mail não informado';

  const podeAcessarAdmin =
    profile?.role === 'admin' ||
    profile?.role === 'superadmin';

  const descricaoAnuncios =
    resumo.total === 0
      ? 'Você ainda não possui anúncios cadastrados.'
      : resumo.total === 1
        ? `Você possui 1 anúncio: ${resumo.aprovados} aprovado e ${resumo.pendentes} em análise.`
        : `Você possui ${resumo.total} anúncios: ${resumo.aprovados} aprovados e ${resumo.pendentes} em análise.`;

  const descricaoPlanos =
    resumo.total === 0
      ? 'Cadastre um anúncio para acompanhar planos, vencimentos e renovações.'
      : resumo.expirados > 0
        ? `${resumo.expirados} anúncio(s) expirado(s) precisam de renovação.`
        : resumo.expirando > 0
          ? `${resumo.expirando} anúncio(s) vencem nos próximos 7 dias.`
          : `${resumo.ativos} anúncio(s) ativo(s). Consulte planos e vencimentos.`;
const diasAgenda =
  calcularDiasRestantes(
    agenda?.data_expiracao
  );

const agendaExpirada =
  diasAgenda !== null &&
  diasAgenda < 0;

const agendaAtiva =
  Boolean(
    agenda &&
      agenda.aprovado === true &&
      agenda.ativo === true &&
      !agendaExpirada
  );

const agendaPendente =
  Boolean(
    agenda &&
      agenda.aprovado !== true
  );

const descricaoAgenda =
  !agenda
    ? 'Você ainda não possui cadastro vinculado à Agenda Local. Divulgue sua empresa ou profissão no catálogo de serviços da cidade.'
    : agendaExpirada
      ? `Seu cadastro de ${agenda.profissao || 'serviço'} está expirado e precisa ser renovado.`
      : agendaAtiva
        ? `Seu cadastro de ${agenda.profissao || 'serviço'} está ativo e publicado na Agenda Local.`
        : agendaPendente
          ? `Seu cadastro de ${agenda.profissao || 'serviço'} foi recebido e está aguardando análise.`
          : `Seu cadastro de ${agenda.profissao || 'serviço'} está registrado na Agenda Local.`;

const textoBotaoAgenda =
  !agenda
    ? 'Cadastrar meu serviço'
    : agendaExpirada
      ? 'Ver situação do cadastro'
      : agendaAtiva
        ? 'Ver minha publicação'
        : 'Acompanhar cadastro';

const linkAgenda =
  !agenda
    ? '/agenda-local/cadastro'
    : '/minha-conta/agenda';

return (
  <main className="min-h-screen bg-slate-50 px-4 py-10">
    <div className="mx-auto max-w-6xl space-y-7">
        {/* APRESENTAÇÃO */}
        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-9">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-orange-600">
                Minha conta
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
                Olá, {nomeUsuario}
              </h1>

              <p className="mt-2 text-slate-600">
                Acompanhe seus anúncios,
                cadastros, planos e oportunidades
                no Conecta Cidade.
              </p>
            </div>

            <div className="min-w-[260px] rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Conta conectada
              </p>

              <p className="mt-2 break-all font-semibold text-slate-900">
                {emailUsuario}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Perfil:{' '}
                {profile?.role ===
                'superadmin'
                  ? 'Superadministrador'
                  : profile?.role === 'admin'
                    ? 'Administrador'
                    : 'Cliente'}
              </p>
            </div>
          </div>
        </section>

        {!profile && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800">
            Sua conta foi autenticada, mas o
            perfil ainda não foi encontrado na
            tabela profiles. Entre em contato com
            o atendimento.
          </section>
        )}

        {profile &&
          profile.ativo === false && (
            <section className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
              Esta conta está desativada. Entre
              em contato com o atendimento do
              Conecta Cidade.
            </section>
          )}

        {anunciosError && (
          <section className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
            Não foi possível carregar o resumo
            dos seus anúncios.
          </section>
        )}
{agendaError && (
  <section className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
    Não foi possível carregar as informações
    da sua Agenda Local.
  </section>
)}
        {/* CARDS PRINCIPAIS */}
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <CardConta
            cor="orange"
            icone="📢"
            titulo="Meus anúncios"
            numero={resumo.total}
            descricao={descricaoAnuncios}
            href="/minha-conta/anuncios"
            textoBotao={
              resumo.total > 0
                ? 'Gerenciar anúncios'
                : 'Criar meu anúncio'
            }
          />

         <CardConta
  cor="sky"
  icone="📍"
  titulo="Agenda Local"
  numero={agenda ? 1 : 0}
  descricao={descricaoAgenda}
  href={linkAgenda}
  textoBotao={textoBotaoAgenda}
  hrefSecundario={
    !agenda
      ? '/agenda-local'
      : undefined
  }
  textoBotaoSecundario={
    !agenda
      ? 'Conhecer a Agenda'
      : undefined
  }
/>

          <CardConta
            cor="emerald"
            icone="🌱"
            titulo="Direto do Produtor"
            descricao="Programa direcionado a produtores rurais, agricultores familiares, artesãos e produtores de alimentos da região."
            href="/direto-do-produtor/participar"
            textoBotao="Quero participar"
            hrefSecundario="/direto-do-produtor"
            textoBotaoSecundario="Conhecer o programa"
          />

          <CardConta
            cor="violet"
            icone="📅"
            titulo="Planos e renovações"
            numero={resumo.ativos}
            descricao={descricaoPlanos}
            href="/minha-conta/pagamentos"
            textoBotao="Ver planos e vencimentos"
          />
        </section>

        {/* RESUMO DOS ANÚNCIOS */}
        {resumo.total > 0 && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Resumo
              titulo="Aprovados"
              valor={resumo.aprovados}
              descricao="Publicados ou liberados"
              classe="border-emerald-200 bg-emerald-50 text-emerald-700"
            />

            <Resumo
              titulo="Em análise"
              valor={resumo.pendentes}
              descricao="Aguardando aprovação"
              classe="border-amber-200 bg-amber-50 text-amber-800"
            />

            <Resumo
              titulo="Expirando"
              valor={resumo.expirando}
              descricao="Vencem em até 7 dias"
              classe="border-orange-200 bg-orange-50 text-orange-700"
            />

            <Resumo
              titulo="Expirados"
              valor={resumo.expirados}
              descricao="Precisam de renovação"
              classe="border-red-200 bg-red-50 text-red-700"
            />
          </section>
        )}

        {/* DADOS E AÇÕES */}
        <section className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:col-span-2">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Seus dados
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Informações usadas nos seus
                  cadastros e contatos.
                </p>
              </div>

              <Link
                href="/minha-conta/perfil"
                className="inline-flex justify-center rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
              >
                Editar meus dados
              </Link>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <InfoPerfil
                titulo="Nome"
                valor={nomeUsuario}
              />

              <InfoPerfil
                titulo="E-mail"
                valor={emailUsuario}
              />

              <InfoPerfil
                titulo="Telefone"
                valor={
                  profile?.telefone ||
                  'Ainda não informado'
                }
              />

              <InfoPerfil
                titulo="Localidade"
                valor={
                  [
                    profile?.cidade,
                    profile?.estado,
                  ]
                    .filter(Boolean)
                    .join(' - ') ||
                  'Ainda não informada'
                }
              />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-bold text-slate-900">
              Ações rápidas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Acesse os principais serviços do
              portal.
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href="/anunciar"
                className="block w-full rounded-xl bg-orange-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-orange-700"
              >
                Criar anúncio
              </Link>

<Link
  href={
    agenda
      ? '/agenda-local'
      : '/agenda-local/cadastro'
  }
  className="block w-full rounded-xl bg-sky-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-sky-700"
>
  {agenda
    ? 'Ver minha Agenda Local'
    : 'Cadastrar na Agenda'}
</Link>

              <Link
                href="/direto-do-produtor/participar"
                className="block w-full rounded-xl bg-emerald-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-emerald-700"
              >
                Participar como produtor
              </Link>

              <Link
                href="/planos"
                className="block w-full rounded-xl bg-violet-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-violet-700"
              >
                Conhecer os planos
              </Link>

              {podeAcessarAdmin && (
                <Link
                  href="/admin"
                  className="block w-full rounded-xl bg-slate-900 px-5 py-3 text-center font-semibold text-white transition hover:bg-black"
                >
                  Abrir painel administrativo
                </Link>
              )}
            </div>
          </article>
        </section>

        {/* SEGURANÇA */}
        <section className="flex flex-col justify-between gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Segurança da conta
            </h2>

            <p className="mt-2 text-slate-600">
              Você está conectado com uma sessão
              protegida pelo Supabase.
            </p>
          </div>

          <form
            action="/auth/logout"
            method="post"
          >
            <button
              type="submit"
              className="w-full rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 md:w-auto"
            >
              Sair da conta
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

type CorCard =
  | 'orange'
  | 'sky'
  | 'emerald'
  | 'violet';

const coresCard: Record<
  CorCard,
  {
    borda: string;
    fundoIcone: string;
    texto: string;
    botao: string;
    botaoHover: string;
  }
> = {
  orange: {
    borda: 'border-orange-200',
    fundoIcone: 'bg-orange-100',
    texto: 'text-orange-700',
    botao: 'bg-orange-600',
    botaoHover: 'hover:bg-orange-700',
  },

  sky: {
    borda: 'border-sky-200',
    fundoIcone: 'bg-sky-100',
    texto: 'text-sky-700',
    botao: 'bg-sky-600',
    botaoHover: 'hover:bg-sky-700',
  },

  emerald: {
    borda: 'border-emerald-200',
    fundoIcone: 'bg-emerald-100',
    texto: 'text-emerald-700',
    botao: 'bg-emerald-600',
    botaoHover: 'hover:bg-emerald-700',
  },

  violet: {
    borda: 'border-violet-200',
    fundoIcone: 'bg-violet-100',
    texto: 'text-violet-700',
    botao: 'bg-violet-600',
    botaoHover: 'hover:bg-violet-700',
  },
};

function CardConta({
  titulo,
  descricao,
  href,
  textoBotao,
  hrefSecundario,
  textoBotaoSecundario,
  icone,
  cor,
  numero,
}: {
  titulo: string;
  descricao: string;
  href: string;
  textoBotao: string;
  hrefSecundario?: string;
  textoBotaoSecundario?: string;
  icone: string;
  cor: CorCard;
  numero?: number;
}) {
  const estilo = coresCard[cor];

  return (
    <article
      className={`flex h-full flex-col rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${estilo.borda}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${estilo.fundoIcone}`}
        >
          {icone}
        </div>

        {typeof numero === 'number' && (
          <span
            className={`text-3xl font-black ${estilo.texto}`}
          >
            {numero}
          </span>
        )}
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-900">
        {titulo}
      </h2>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
        {descricao}
      </p>

      <div className="mt-6 space-y-3">
        <Link
          href={href}
          className={`flex w-full justify-center rounded-xl px-4 py-3 text-center font-semibold text-white transition ${estilo.botao} ${estilo.botaoHover}`}
        >
          {textoBotao}
        </Link>

        {hrefSecundario &&
          textoBotaoSecundario && (
            <Link
              href={hrefSecundario}
              className={`flex w-full justify-center rounded-xl border bg-white px-4 py-3 text-center text-sm font-semibold transition hover:bg-slate-50 ${estilo.borda} ${estilo.texto}`}
            >
              {textoBotaoSecundario}
            </Link>
          )}
      </div>
    </article>
  );
}

function Resumo({
  titulo,
  valor,
  descricao,
  classe,
}: {
  titulo: string;
  valor: number;
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

function InfoPerfil({
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