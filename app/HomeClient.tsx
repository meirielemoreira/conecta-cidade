'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

type Anuncio = {
  id: string;
  titulo: string;
  nome_loja: string | null;
  preco: number | null;
  imagens: unknown;
  plano_usado: string | null;
  categoria?: string | null;
  cidade?: string | null;
  telefone?: string | null;
  instagram?: string | null;
  destaque?: boolean | null;
};

type Profissional = {
  id: string;
  nome_completo: string;
  profissao: string;
  foto_url?: string | null;
  descricao?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
};

type CategoriaNovidade = {
  nome: string;
  categoriaBanco: string;
  rota: string;
  faixa: string;
  corFaixa: string;
  imagemPadrao: string;
};

const categoriasNovidades: CategoriaNovidade[] = [
  {
    nome: 'Morar & Construir',
    categoriaBanco: 'Morar & Construir',
    rota: '/morar-construir',
    faixa: 'MORAR & CONSTRUIR',
    corFaixa: 'bg-blue-600',
    imagemPadrao: '/images/categorias/morar-construir.png',
  },
  {
    nome: 'Motores & Rodas',
    categoriaBanco: 'Motores & Rodas',
    rota: '/motores-rodas',
    faixa: 'MOTORES & RODAS',
    corFaixa: 'bg-red-600',
    imagemPadrao: '/images/categorias/motores-rodas.png',
  },
  {
    nome: 'Promoções',
    categoriaBanco: 'Promoções',
    rota: '/promocoes',
    faixa: 'PROMOÇÕES',
    corFaixa: 'bg-orange-500',
    imagemPadrao: '/images/categorias/promocoes.png',
  },
  {
    nome: 'Direto do Produtor',
    categoriaBanco: 'Direto do Produtor',
    rota: '/direto-do-produtor',
    faixa: 'DIRETO DO PRODUTOR',
    corFaixa: 'bg-green-700',
    imagemPadrao: '/images/categorias/direto-do-produtor.png',
  },
  {
    nome: 'Onde é o Rolê',
    categoriaBanco: 'Onde é o Rolê?',
    rota: '/onde-role',
    faixa: 'ONDE É O ROLÊ',
    corFaixa: 'bg-purple-600',
    imagemPadrao: '/images/categorias/onde-role.png',
  },
  {
    nome: 'Nova União Informa',
    categoriaBanco: 'Nova União Informa',
    rota: '/nova-uniao-informa',
    faixa: 'NOVA UNIÃO INFORMA',
    corFaixa: 'bg-slate-700',
    imagemPadrao: '/images/categorias/nova-uniao-informa.png',
  },
];

function obterPrimeiraImagem(imagens: unknown): string | null {
  if (Array.isArray(imagens)) {
    const primeiraImagem = imagens[0];

    return typeof primeiraImagem === 'string' &&
      primeiraImagem.trim().length > 0
      ? primeiraImagem
      : null;
  }

  if (typeof imagens === 'string') {
    const valor = imagens.trim();

    if (!valor) {
      return null;
    }

    if (
      valor.startsWith('http://') ||
      valor.startsWith('https://') ||
      valor.startsWith('/')
    ) {
      return valor;
    }

    try {
      const convertido = JSON.parse(valor);

      if (
        Array.isArray(convertido) &&
        typeof convertido[0] === 'string'
      ) {
        return convertido[0];
      }
    } catch {
      return null;
    }
  }

  return null;
}

function formatarPreco(preco: number | null | undefined): string | null {
  if (preco === null || preco === undefined) {
    return null;
  }

  return preco.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function obterRotaCategoria(categoria?: string | null): string {
  switch (categoria) {
    case 'Morar & Construir':
      return '/morar-construir';

    case 'Motores & Rodas':
      return '/motores-rodas';

    case 'Promoções':
      return '/promocoes';

    case 'Direto do Produtor':
      return '/direto-do-produtor';

    case 'Onde é o Rolê?':
    case 'Onde é o Rolê':
      return '/onde-role';

    case 'Nova União Informa':
      return '/nova-uniao-informa';

    default:
      return '/';
  }
}

export default function Home() {
  const router = useRouter();

  const [termoBusca, setTermoBusca] = useState('');
  const [destaques, setDestaques] = useState<Anuncio[]>([]);
  const [profissionaisMes, setProfissionaisMes] = useState<Profissional[]>([]);
  const [loadingDestaques, setLoadingDestaques] = useState(true);
  const [loadingProfissionais, setLoadingProfissionais] = useState(true);

  useEffect(() => {
   const carregarDestaques = async () => {
  setLoadingDestaques(true);

  const { data, error } = await supabase
    .from('anuncios')
    .select(`
      id,
      titulo,
      nome_loja,
      preco,
      imagens,
      plano_usado,
      categoria,
      cidade,
      telefone,
      instagram,
      destaque
    `)
    .eq('aprovado', true)
    .eq('ativo', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao carregar destaques:', error);
    setDestaques([]);
    setLoadingDestaques(false);
    return;
  }

  const anunciosComDestaque = (data || []).filter((anuncio) => {
    const plano = anuncio.plano_usado
      ?.trim()
      .toLowerCase();

    return (
      anuncio.destaque === true ||
      plano === 'impulso' ||
      plano === 'vitrine' ||
      plano === 'exclusivo' ||
      plano === 'premium'
    );
  });

  setDestaques(anunciosComDestaque);
  setLoadingDestaques(false);
};

    const carregarProfissionais = async () => {
      setLoadingProfissionais(true);

      const { data, error } = await supabase
        .from('agenda_local')
        .select(`
          id,
          nome_completo,
          profissao,
          foto_url,
          descricao,
          whatsapp,
          instagram
        `)
        .eq('aprovado', true)
        .eq('ativo', true)
        .order('data_cadastro', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Erro ao carregar profissionais:', error);
        setProfissionaisMes([]);
      } else {
        setProfissionaisMes(data || []);
      }

      setLoadingProfissionais(false);
    };

    carregarDestaques();
    carregarProfissionais();
  }, []);

  const pesquisar = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const termo = termoBusca.trim().toLowerCase();

    if (!termo) {
      return;
    }

    if (
      termo.includes('casa') ||
      termo.includes('imóvel') ||
      termo.includes('imovel') ||
      termo.includes('apartamento') ||
      termo.includes('terreno') ||
      termo.includes('construção') ||
      termo.includes('construcao')
    ) {
      router.push('/morar-construir');
      return;
    }

    if (
      termo.includes('carro') ||
      termo.includes('moto') ||
      termo.includes('veículo') ||
      termo.includes('veiculo') ||
      termo.includes('oficina')
    ) {
      router.push('/motores-rodas');
      return;
    }

    if (
      termo.includes('queijo') ||
      termo.includes('horta') ||
      termo.includes('fruta') ||
      termo.includes('mel') ||
      termo.includes('produtor') ||
      termo.includes('artesanato')
    ) {
      router.push('/direto-do-produtor');
      return;
    }

    if (
      termo.includes('festa') ||
      termo.includes('evento') ||
      termo.includes('show') ||
      termo.includes('rolê') ||
      termo.includes('role')
    ) {
      router.push('/onde-role');
      return;
    }

    if (
      termo.includes('pedreiro') ||
      termo.includes('eletricista') ||
      termo.includes('manicure') ||
      termo.includes('profissional') ||
      termo.includes('serviço') ||
      termo.includes('servico')
    ) {
      router.push('/agenda-local');
      return;
    }

    router.push('/promocoes');
  };

  return (
    <main className="bg-white">
      {/* HERO COMPACTO */}
<section className="relative overflow-hidden min-h-[420px] sm:min-h-[440px] lg:min-h-[460px] flex items-center">

  <Image
    src="/images/nova-uniao.jpg"
    alt="Vista de Nova União, Minas Gerais"
    fill
    preload
    sizes="100vw"
    className="object-cover object-center"
  />

  <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 lg:py-14 text-center text-white">
          <div className="inline-flex items-center bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-4">
            <span className="text-xs sm:text-sm font-medium">
              Portal Comercial e Informativo
            </span>
          </div>

          <h1 className="max-w-5xl mx-auto text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
            Tudo de
            <span className="text-orange-400"> Nova União </span>
            em um só lugar
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg lg:text-xl text-white/90 mt-4">
            Empresas, promoções, serviços, profissionais, eventos e informações da cidade.
          </p>

          <form
            onSubmit={pesquisar}
            className="max-w-3xl mx-auto mt-6"
          >
            <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-2xl p-2 shadow-2xl">
              <input
                type="text"
                value={termoBusca}
                onChange={(event) => setTermoBusca(event.target.value)}
                placeholder="O que você procura hoje?"
                className="min-w-0 flex-1 h-12 sm:h-13 rounded-xl bg-white text-slate-800 px-4 sm:px-5 text-base focus:outline-none"
              />

              <button
                type="submit"
                className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition shrink-0"
              >
                Pesquisar
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <Link
              href="/anunciar"
              className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition shadow-lg"
            >
              Anunciar Agora
            </Link>

            <Link
              href="/planos"
              className="inline-flex items-center justify-center bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/40 text-white px-6 py-3 rounded-xl font-bold text-sm sm:text-base transition"
            >
              Ver Planos
            </Link>
          </div>
        </div>
      </section>

      {/* NOVIDADES */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Novidades
            </h2>

            <p className="text-slate-500 mt-2">
              Confira as novidades de Nova União.
            </p>
          </div>

          <Link
            href="/anunciar"
            className="shrink-0 text-orange-600 font-semibold hover:text-orange-700 transition"
          >
            Ver todas →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {categoriasNovidades.map((categoria) => (
            <CategoryCard
              key={categoria.rota}
              category={categoria}
            />
          ))}
        </div>
      </section>

   {/* DESTAQUES */}
<section className="bg-slate-50 py-16">
  <div className="max-w-7xl mx-auto px-6">
    <div className="flex items-center justify-between gap-4 mb-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
          Destaques
        </h2>

        <p className="text-slate-500 mt-2">
          Anúncios com maior visibilidade no Conecta Cidade.
        </p>
      </div>

      <Link
        href="/planos"
        className="shrink-0 text-orange-600 font-semibold hover:text-orange-700 transition"
      >
        Conhecer planos →
      </Link>
    </div>

    {loadingDestaques ? (
      <p className="text-center text-slate-500 py-16">
        Carregando destaques...
      </p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {Array.from({ length: 6 }).map((_, indice) => (
          <DestaqueRotativoCard
            key={indice}
            anuncios={destaques}
            posicao={indice}
          />
        ))}
      </div>
    )}
  </div>
</section>
     {/* PROFISSIONAL DO MÊS */}
<section className="max-w-7xl mx-auto px-6 py-16">
  <div className="flex items-center justify-between gap-4 mb-8">
    <div>
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
        Profissional do Mês
      </h2>

      <p className="text-slate-500 mt-2">
        Conheça profissionais e empresas da Agenda Local.
      </p>
    </div>

    <Link
      href="/agenda-local"
      className="shrink-0 text-orange-600 font-semibold hover:text-orange-700 transition"
    >
      Ver todos →
    </Link>
  </div>

  {loadingProfissionais ? (
    <p className="text-center text-slate-500 py-16">
      Carregando profissionais...
    </p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
      {Array.from({ length: 6 }).map((_, indice) => (
        <ProfissionalRotativoCard
          key={indice}
          profissionais={profissionaisMes}
          posicao={indice}
        />
      ))}
    </div>
  )}
</section>
   {/* CARDS COMERCIAIS */}
<section className="bg-slate-50 py-16">
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* ANUNCIE AGORA */}
      <article
        className="
          relative
          min-h-[300px]
          overflow-hidden
          rounded-3xl
          border
          border-orange-200
          bg-gradient-to-br
          from-orange-50
          via-white
          to-orange-100
          p-8
          hover:shadow-xl
          hover:-translate-y-1
          transition-all
          duration-300
        "
      >
        {/* Elementos decorativos */}
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-orange-200/40" />
        <div className="absolute right-8 bottom-8 w-24 h-24 rounded-full bg-orange-300/20" />

        <div className="relative z-10 h-full flex flex-col">
          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-orange-600
              text-white
              flex
              items-center
              justify-center
              shadow-lg
              mb-6
            "
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="w-7 h-7 fill-none stroke-current stroke-2"
            >
              <path d="M3 11v2" />
              <path d="M6 9v6" />
              <path d="M9 7v10" />
              <path d="M12 5v14" />
              <path d="m15 8 6-3v14l-6-3Z" />
              <path d="M9 17v3a1 1 0 0 0 1 1h2" />
            </svg>
          </div>

          <p className="text-orange-600 text-xs font-bold uppercase tracking-[0.18em]">
            Mais visibilidade
          </p>

          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
            Anuncie Agora
          </h3>

          <p className="text-slate-600 leading-relaxed mt-3 max-w-sm">
            Divulgue produtos, serviços, imóveis, veículos ou sua empresa
            para moradores de Nova União.
          </p>

          <ul className="space-y-2 text-sm text-slate-700 mt-5 mb-7">
            <li className="flex items-center gap-2">
              <span className="text-orange-600 font-bold">✓</span>
              Plano gratuito disponível
            </li>

            <li className="flex items-center gap-2">
              <span className="text-orange-600 font-bold">✓</span>
              Cadastro rápido e simples
            </li>
          </ul>

          <Link
            href="/anunciar"
            className="
              mt-auto
              w-fit
              inline-flex
              items-center
              justify-center
              gap-2
              bg-orange-600
              hover:bg-orange-700
              text-white
              px-6
              py-3
              rounded-xl
              font-semibold
              transition
              shadow-md
            "
          >
            Publicar anúncio
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>

      {/* PLANOS */}
      <article
        className="
          relative
          min-h-[300px]
          overflow-hidden
          rounded-3xl
          border
          border-amber-200
          bg-gradient-to-br
          from-amber-50
          via-white
          to-yellow-100
          p-8
          hover:shadow-xl
          hover:-translate-y-1
          transition-all
          duration-300
        "
      >
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-amber-200/40" />
        <div className="absolute right-8 bottom-8 w-24 h-24 rounded-full bg-yellow-300/20" />

        <div className="relative z-10 h-full flex flex-col">
          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-amber-500
              text-white
              flex
              items-center
              justify-center
              shadow-lg
              mb-6
            "
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="w-7 h-7 fill-none stroke-current stroke-2"
            >
              <path d="m3 7 4 4 5-7 5 7 4-4-2 11H5Z" />
              <path d="M5 21h14" />
            </svg>
          </div>

          <p className="text-amber-600 text-xs font-bold uppercase tracking-[0.18em]">
            Ganhe destaque
          </p>

          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
            Planos e Preços
          </h3>

          <p className="text-slate-600 leading-relaxed mt-3 max-w-sm">
            Escolha o plano ideal para aumentar a exposição do seu anúncio
            e atrair mais clientes.
          </p>

          <div className="mt-5 mb-7">
            <p className="text-xs text-slate-500">
              Planos a partir de
            </p>

            <p className="text-3xl font-extrabold text-slate-900">
              R$ 0,00
              <span className="text-sm font-normal text-slate-500">
                {' '}/ mês
              </span>
            </p>
          </div>

          <Link
            href="/planos"
            className="
              mt-auto
              w-fit
              inline-flex
              items-center
              justify-center
              gap-2
              bg-amber-500
              hover:bg-amber-600
              text-white
              px-6
              py-3
              rounded-xl
              font-semibold
              transition
              shadow-md
            "
          >
            Conhecer planos
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>

      {/* AGENDA LOCAL */}
      <article
        className="
          relative
          min-h-[300px]
          overflow-hidden
          rounded-3xl
          border
          border-emerald-200
          bg-gradient-to-br
          from-emerald-50
          via-white
          to-teal-100
          p-8
          hover:shadow-xl
          hover:-translate-y-1
          transition-all
          duration-300
        "
      >
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-emerald-200/40" />
        <div className="absolute right-8 bottom-8 w-24 h-24 rounded-full bg-teal-300/20" />

        <div className="relative z-10 h-full flex flex-col">
          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-emerald-600
              text-white
              flex
              items-center
              justify-center
              shadow-lg
              mb-6
            "
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="w-7 h-7 fill-none stroke-current stroke-2"
            >
              <rect
                x="3"
                y="5"
                width="18"
                height="16"
                rx="2"
              />
              <path d="M16 3v4" />
              <path d="M8 3v4" />
              <path d="M3 10h18" />
              <path d="M8 14h3" />
              <path d="M8 17h6" />
            </svg>
          </div>

          <p className="text-emerald-600 text-xs font-bold uppercase tracking-[0.18em]">
            Serviços da cidade
          </p>

          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
            Agenda Local
          </h3>

          <p className="text-slate-600 leading-relaxed mt-3 max-w-sm">
            Encontre profissionais e empresas ou cadastre seu serviço para
            ser encontrado pelos moradores.
          </p>

          <ul className="space-y-2 text-sm text-slate-700 mt-5 mb-7">
            <li className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              Profissionais e serviços locais
            </li>

            <li className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              Contato direto pelo WhatsApp
            </li>
          </ul>

          <div className="mt-auto flex flex-wrap gap-3">
            <Link
              href="/agenda-local"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                bg-emerald-600
                hover:bg-emerald-700
                text-white
                px-5
                py-3
                rounded-xl
                font-semibold
                transition
                shadow-md
              "
            >
              Abrir Agenda
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              href="/agenda-local/cadastro"
              className="
                inline-flex
                items-center
                justify-center
                border
                border-emerald-300
                bg-white/80
                hover:bg-white
                text-emerald-700
                px-5
                py-3
                rounded-xl
                font-semibold
                transition
              "
            >
              Cadastrar serviço
            </Link>
          </div>
        </div>
      </article>

    </div>
  </div>
</section>
    </main>
  );
}

function CategoryCard({
  category,
}: {
  category: CategoriaNovidade;
}) {
  const [anunciosCategoria, setAnunciosCategoria] = useState<Anuncio[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let componenteAtivo = true;

    const carregarAnunciosCategoria = async () => {
      /*
       * NOVA UNIÃO INFORMA
       *
       * Essa categoria utiliza a tabela nova_uniao_informa.
       * Os dados são convertidos para o mesmo formato dos anúncios,
       * preservando toda a estrutura visual e a rotação atual do card.
       */
      if (category.categoriaBanco === 'Nova União Informa') {
        const agora = new Date();

        const hojeLocal = new Date(
          agora.getTime() -
            agora.getTimezoneOffset() * 60 * 1000
        )
          .toISOString()
          .split('T')[0];

        const { data, error } = await supabase
          .from('nova_uniao_informa')
          .select(`
            id,
            titulo,
            imagem_url,
            publicar_em,
            encerrar_publicacao_em,
            destaque,
            created_at
          `)
          .eq('ativo', true)
          .lte('publicar_em', hojeLocal)
          .or(
            `encerrar_publicacao_em.is.null,encerrar_publicacao_em.gte.${hojeLocal}`
          )
          .order('destaque', {
            ascending: false,
          })
          .order('publicar_em', {
            ascending: false,
          })
          .order('created_at', {
            ascending: false,
          });

        if (error) {
          console.error(
            'Erro ao carregar Nova União Informa:',
            error
          );

          if (componenteAtivo) {
            setAnunciosCategoria([]);
            setCurrentIndex(0);
          }

          return;
        }

        const informativosConvertidos: Anuncio[] = (data || []).map(
          (informativo) => ({
            id: informativo.id,
            titulo: informativo.titulo,
            nome_loja: 'Nova União Informa',
            preco: null,

            /*
             * O campo imagem_url da tabela nova_uniao_informa
             * é colocado dentro de imagens para continuar usando
             * a função obterPrimeiraImagem já existente na Home.
             */
            imagens: informativo.imagem_url
              ? [informativo.imagem_url]
              : [],

            plano_usado: null,
            categoria: 'Nova União Informa',
            cidade: 'Nova União',
            telefone: null,
            instagram: null,
            destaque: informativo.destaque,
          })
        );

        if (componenteAtivo) {
          setAnunciosCategoria(informativosConvertidos);
          setCurrentIndex(0);
        }

        return;
      }
      /*
       * DIRETO DO PRODUTOR
       *
       * O Direto do Produtor possui tabela própria.
       * A Home deve mostrar somente produtores ativos.
       */
      /*
       * DIRETO DO PRODUTOR
       *
       * O Direto do Produtor utiliza a tabela próprio
       * direto_produtor.
       */
      if (category.categoriaBanco === 'Direto do Produtor') {
        const hoje = new Date()
          .toISOString()
          .split('T')[0];

        const { data, error } = await supabase
          .from('direto_produtor')
          .select(`
            id,
            produto,
            categoria,
            nome_produtor,
            telefone,
            cidade,
            localidade,
            descricao,
            imagem_url,
            data_inicio,
            data_vencimento,
            ativo,
            status,
            created_at
          `)
          .eq('ativo', true)
          .eq('status', 'Ativo')
          .or(
            `data_vencimento.is.null,data_vencimento.gte.${hoje}`
          )
          .order('created_at', {
            ascending: false,
          });

        if (error) {
          console.error(
            'Erro ao carregar Direto do Produtor:',
            error
          );

          if (componenteAtivo) {
            setAnunciosCategoria([]);
            setCurrentIndex(0);
          }

          return;
        }

        const produtoresConvertidos: Anuncio[] =
          (data || []).map((produtor) => ({
            id: produtor.id,
            titulo: produtor.produto,
            nome_loja: produtor.nome_produtor,
            preco: null,

            imagens: produtor.imagem_url
              ? [produtor.imagem_url]
              : [],

            plano_usado: null,
            categoria: 'Direto do Produtor',
            cidade: produtor.cidade || 'Nova União',
            telefone: produtor.telefone || null,
            instagram: null,
            destaque: false,
          }));

        if (componenteAtivo) {
          setAnunciosCategoria(
            produtoresConvertidos
          );
          setCurrentIndex(0);
        }

        return;
      }
      /*
       * DEMAIS CATEGORIAS
       *
       * Este é o mesmo carregamento que já existia.
       * Não foi alterada a tabela, os filtros ou a ordenação.
       */
      const { data, error } = await supabase
        .from('anuncios')
        .select(`
          id,
          titulo,
          nome_loja,
          preco,
          imagens,
          plano_usado,
          categoria,
          cidade
        `)
        .eq('categoria', category.categoriaBanco)
        .eq('aprovado', true)
        .eq('ativo', true)
        .order('created_at', {
          ascending: false,
        });

      if (error) {
        console.error(
          `Erro ao carregar ${category.nome}:`,
          error
        );

        if (componenteAtivo) {
          setAnunciosCategoria([]);
          setCurrentIndex(0);
        }

        return;
      }

      if (componenteAtivo) {
        setAnunciosCategoria(data || []);
        setCurrentIndex(0);
      }
    };

    carregarAnunciosCategoria();

    return () => {
      componenteAtivo = false;
    };
  }, [category.categoriaBanco, category.nome]);

  /*
   * Mantém a rotação automática já existente.
   * Também funciona para os informativos porque eles foram
   * convertidos para o mesmo formato dos anúncios.
   */
  useEffect(() => {
    if (anunciosCategoria.length <= 1) {
      return;
    }

    const intervalo = window.setInterval(() => {
      setCurrentIndex(
        (indiceAtual) =>
          (indiceAtual + 1) % anunciosCategoria.length
      );
    }, 10000);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [anunciosCategoria.length]);

  const anuncioAtual = anunciosCategoria[currentIndex];

  const imagemAtual =
    obterPrimeiraImagem(anuncioAtual?.imagens) ||
    category.imagemPadrao;

  const tituloAtual =
    anuncioAtual?.titulo || category.nome;

  const precoAtual =
    formatarPreco(anuncioAtual?.preco);

  return (
    <Link
      href={category.rota}
      className="group block"
      aria-label={`Ver anúncios de ${category.nome}`}
    >
      <article className="h-[315px] bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
        <div className="relative h-44 bg-slate-100 overflow-hidden shrink-0">
          <CardImage
            src={imagemAtual}
            alt={tituloAtual}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 17vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <span
            className={`absolute top-3 left-3 ${category.corFaixa} text-white text-[9px] font-bold tracking-wide px-2.5 py-1.5 rounded-lg shadow-md`}
          >
            {category.faixa}
          </span>
        </div>

        <div className="p-4 flex-1 flex flex-col text-left">
          <h3 className="font-bold text-base leading-snug text-slate-900 line-clamp-2 min-h-[44px]">
            {tituloAtual}
          </h3>

          {precoAtual && (
            <p className="text-orange-600 font-bold text-lg mt-2">
              {precoAtual}
            </p>
          )}

          {!anuncioAtual && (
            <p className="text-sm text-slate-500 mt-2">
              Em breve novos anúncios
            </p>
          )}

          <p className="text-xs text-slate-500 mt-auto pt-2">
            {anuncioAtual?.cidade || 'Nova União'} • MG
          </p>
        </div>
      </article>
    </Link>
  );
}

function DestaqueRotativoCard({
  anuncios,
  posicao,
}: {
  anuncios: Anuncio[];
  posicao: number;
}) {
  const [indiceRotacao, setIndiceRotacao] = useState(0);

  useEffect(() => {
    if (anuncios.length <= 1) {
      return;
    }

    const intervalo = window.setInterval(() => {
      setIndiceRotacao((indiceAtual) => {
        return (indiceAtual + 1) % anuncios.length;
      });
    }, 10000);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [anuncios.length]);

  const temAnuncioNestaPosicao =
    posicao < anuncios.length;

  const anuncioAtual = temAnuncioNestaPosicao
    ? anuncios[
        (indiceRotacao + posicao) %
          anuncios.length
      ]
    : null;

  /*
   * CARD VAZIO:
   * aparece quando ainda não existem seis anúncios com destaque.
   */
 if (!anuncioAtual) {
  return (
    <Link
      href="/planos"
      className="group block"
      aria-label="Conhecer planos com destaque"
    >
      <article className="h-[315px] bg-white border border-dashed border-orange-300 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
        <div className="h-36 shrink-0 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-105 transition">
            CN
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col text-left">
          <h3 className="font-bold text-base leading-snug text-slate-900 min-h-[44px]">
            Sua empresa pode aparecer aqui
          </h3>

          <p className="text-sm leading-snug text-slate-500 mt-2">
            Mais visibilidade para seus produtos e serviços.
          </p>

          <span className="text-orange-600 font-semibold text-sm mt-auto">
            Conhecer planos →
          </span>
        </div>
      </article>
    </Link>
  );
}

  const imagem =
    obterPrimeiraImagem(anuncioAtual.imagens) ||
    '/images/nova-uniao.jpg';

  const precoFormatado =
    formatarPreco(anuncioAtual.preco);

  const rotaCategoria =
    obterRotaCategoria(anuncioAtual.categoria);

  const linkAnuncio =
    `${rotaCategoria}?anuncio=${anuncioAtual.id}`;

  const telefoneLimpo =
    anuncioAtual.telefone?.replace(/\D/g, '') || '';

  const whatsapp = telefoneLimpo
    ? `https://wa.me/55${telefoneLimpo}`
    : null;

  const usuarioInstagram =
    anuncioAtual.instagram
      ?.replace('@', '')
      .trim() || '';

  const instagram = usuarioInstagram
    ? `https://instagram.com/${usuarioInstagram}`
    : null;

  return (
    <article
      className="
        h-[315px]
        bg-white
        border
        border-slate-200
        rounded-3xl
        overflow-hidden
        flex
        flex-col
        hover:shadow-xl
        hover:-translate-y-1
        transition-all
        duration-300
      "
    >
      {/* FOTO DO ANÚNCIO */}
      <Link
        href={linkAnuncio}
        className="group block shrink-0"
        aria-label={`Abrir anúncio: ${anuncioAtual.titulo}`}
      >
        <div className="relative h-40 bg-slate-100 overflow-hidden">
          <CardImage
            src={imagem}
            alt={anuncioAtual.titulo}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 17vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />

          <span
            className="
              absolute
              top-3
              left-3
              bg-orange-600
              text-white
              text-[9px]
              font-bold
              tracking-wide
              px-2.5
              py-1.5
              rounded-lg
              shadow-md
            "
          >
            DESTAQUE
          </span>
        </div>
      </Link>

      {/* CONTEÚDO */}
      <div className="p-3 flex-1 flex flex-col text-left min-h-0">
        <p
          className="
            text-[11px]
            font-semibold
            uppercase
            tracking-wide
            text-orange-600
            line-clamp-1
          "
        >
          {anuncioAtual.nome_loja || 'Anunciante'}
        </p>

        <Link href={linkAnuncio}>
          <h3
            className="
              font-bold
              text-sm
              leading-snug
              text-slate-900
              line-clamp-2
              min-h-[38px]
              mt-1
              hover:text-orange-600
              transition
            "
          >
            {anuncioAtual.titulo}
          </h3>
        </Link>

        {precoFormatado && (
          <p className="font-extrabold text-lg leading-none text-orange-600 mt-1">
            {precoFormatado}
          </p>
        )}

        <div className="mt-auto">
          <p className="text-[11px] text-slate-500 mb-2">
            {anuncioAtual.cidade || 'Nova União'} • MG
          </p>

          {(whatsapp || instagram) && (
            <div className="flex gap-2">
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Conversar pelo WhatsApp"
                  className="
                    flex-1
                    min-w-0
                    h-8
                    bg-green-600
                    hover:bg-green-700
                    text-white
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    gap-1.5
                    text-[11px]
                    font-semibold
                    transition
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="w-3.5 h-3.5 fill-current shrink-0"
                  >
                    <path d="M12.04 2a9.84 9.84 0 0 0-8.43 14.91L2 22l5.22-1.57A9.99 9.99 0 1 0 12.04 2Zm0 17.98a8.05 8.05 0 0 1-4.1-1.12l-.29-.17-3.1.93.94-3.02-.19-.31A7.94 7.94 0 1 1 12.04 20Zm4.4-5.95c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.43-.59 1.63-1.15.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
                  </svg>

                  <span>WhatsApp</span>
                </a>
              )}

              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir Instagram"
                  className="
                    flex-1
                    min-w-0
                    h-8
                    bg-pink-600
                    hover:bg-pink-700
                    text-white
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    gap-1.5
                    text-[11px]
                    font-semibold
                    transition
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="w-3.5 h-3.5 fill-none stroke-current stroke-2 shrink-0"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                    />
                    <circle cx="12" cy="12" r="4" />
                    <circle
                      cx="17.5"
                      cy="6.5"
                      r="1"
                      className="fill-current stroke-none"
                    />
                  </svg>

                  <span>Instagram</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function ProfissionalRotativoCard({
  profissionais,
  posicao,
}: {
  profissionais: Profissional[];
  posicao: number;
}) {
  const [indiceRotacao, setIndiceRotacao] = useState(0);

  useEffect(() => {
    if (profissionais.length <= 1) {
      return;
    }

    const intervalo = window.setInterval(() => {
      setIndiceRotacao((indiceAtual) => {
        return (indiceAtual + 1) % profissionais.length;
      });
    }, 10000);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [profissionais.length]);

  const temProfissionalNestaPosicao =
    posicao < profissionais.length;

  const profissionalAtual = temProfissionalNestaPosicao
    ? profissionais[
        (indiceRotacao + posicao) %
          profissionais.length
      ]
    : null;

  /*
   * CARD VAZIO
   * Aparece quando ainda existem menos de seis profissionais.
   */
  if (!profissionalAtual) {
    return (
      <Link
        href="/agenda-local/cadastro"
        className="group block"
        aria-label="Cadastrar serviço na Agenda Local"
      >
        <article className="h-[315px] bg-white border border-dashed border-emerald-300 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
          <div className="h-36 shrink-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-lg group-hover:scale-105 transition">
              AL
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col text-left">
            <h3 className="font-bold text-base leading-snug text-slate-900 min-h-[44px]">
              Cadastre seu serviço
            </h3>

            <p className="text-sm leading-snug text-slate-500 mt-2">
              Seja encontrado por moradores de Nova União.
            </p>

            <span className="text-emerald-600 font-semibold text-sm mt-auto">
              Entrar na Agenda Local →
            </span>
          </div>
        </article>
      </Link>
    );
  }

  const telefoneLimpo =
    profissionalAtual.whatsapp?.replace(/\D/g, '') || '';

  const whatsapp = telefoneLimpo
    ? `https://wa.me/55${telefoneLimpo}`
    : null;

  const usuarioInstagram =
    profissionalAtual.instagram
      ?.replace('@', '')
      .trim() || '';

  const instagram = usuarioInstagram
    ? `https://instagram.com/${usuarioInstagram}`
    : null;

  const foto =
    profissionalAtual.foto_url ||
    '/images/nova-uniao.jpg';

  return (
    <article className="h-[315px] bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      {/* FOTO */}
      <Link
        href={`/agenda-local?profissional=${profissionalAtual.id}`}
        className="group block shrink-0"
        aria-label={`Ver profissional: ${profissionalAtual.nome_completo}`}
      >
        <div className="relative h-36 bg-slate-100 overflow-hidden">
          <CardImage
            src={foto}
            alt={profissionalAtual.nome_completo}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 17vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />

          <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[9px] font-bold tracking-wide px-2.5 py-1.5 rounded-lg shadow-md">
            AGENDA LOCAL
          </span>
        </div>
      </Link>

      {/* CONTEÚDO */}
      <div className="p-3 flex-1 flex flex-col text-left min-h-0">
        <Link
          href={`/agenda-local?profissional=${profissionalAtual.id}`}
        >
          <h3 className="font-bold text-base leading-snug text-slate-900 line-clamp-2 min-h-[38px] hover:text-emerald-600 transition">
            {profissionalAtual.nome_completo}
          </h3>
        </Link>

        <p className="text-sm font-semibold text-emerald-600 line-clamp-1 mt-1">
          {profissionalAtual.profissao}
        </p>

        <p className="text-[11px] text-slate-500 mt-2">
          Nova União • MG
        </p>

        <div className="mt-auto">
          {(whatsapp || instagram) && (
            <div className="flex gap-2 mt-3">
              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Conversar com ${profissionalAtual.nome_completo} pelo WhatsApp`}
                  className="flex-1 min-w-0 h-8 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-semibold transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="w-3.5 h-3.5 fill-current shrink-0"
                  >
                    <path d="M12.04 2a9.84 9.84 0 0 0-8.43 14.91L2 22l5.22-1.57A9.99 9.99 0 1 0 12.04 2Zm0 17.98a8.05 8.05 0 0 1-4.1-1.12l-.29-.17-3.1.93.94-3.02-.19-.31A7.94 7.94 0 1 1 12.04 20Zm4.4-5.95c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.43-.59 1.63-1.15.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
                  </svg>

                  <span>WhatsApp</span>
                </a>
              )}

              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir Instagram de ${profissionalAtual.nome_completo}`}
                  className="flex-1 min-w-0 h-8 bg-pink-600 hover:bg-pink-700 text-white rounded-lg flex items-center justify-center gap-1.5 text-[11px] font-semibold transition"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="w-3.5 h-3.5 fill-none stroke-current stroke-2 shrink-0"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                    />

                    <circle
                      cx="17.5"
                      cy="6.5"
                      r="1"
                      className="fill-current stroke-none"
                    />
                  </svg>

                  <span>Instagram</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function CardImage({
  src,
  alt,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
}) {
  const imagemFallback = '/images/nova-uniao.jpg';
  const [imagemExibida, setImagemExibida] = useState(src);

  useEffect(() => {
    setImagemExibida(src);
  }, [src]);

  return (
    <Image
      src={imagemExibida}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      onError={() => {
        if (imagemExibida !== imagemFallback) {
          setImagemExibida(imagemFallback);
        }
      }}
    />
  );
}