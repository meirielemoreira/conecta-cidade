'use client';

import Link from 'next/link';
import {
  use,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { PointerEvent } from 'react';

import { supabase } from '../../../lib/supabase';

/* =========================================================
   TIPOS
========================================================= */

type Anuncio = {
  id: string;
  titulo: string;
  nome_loja: string | null;
  descricao: string | null;
  preco: number | null;
  imagens: unknown;
  cidade: string | null;
  estado: string | null;
  telefone: string | null;
  instagram: string | null;
  plano_usado: string | null;
  categoria: string | null;
  created_at: string;
};

type AnuncioRelacionado = {
  id: string;
  titulo: string;
  nome_loja: string | null;
  preco: number | null;
  imagens: unknown;
  cidade: string | null;
  estado: string | null;
  plano_usado: string | null;
};

type PaginaAnuncioProps = {
  params: Promise<{
    id: string;
  }>;
};

type EstiloPlano = {
  texto: string;
  icone: string;
  classe: string;
};

/* =========================================================
   CONFIGURAÇÕES DOS PLANOS
========================================================= */

const LIMITE_FOTOS_POR_PLANO: Record<string, number> = {
  Gratuito: 5,
  Impulso: 5,
  Vitrine: 8,
  Exclusivo: 10,
};

const PLANOS_COM_INSTAGRAM = [
  'Vitrine',
  'Exclusivo',
];

/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function normalizarImagens(imagens: unknown): string[] {
  if (Array.isArray(imagens)) {
    return imagens.filter(
      (imagem): imagem is string =>
        typeof imagem === 'string' &&
        imagem.trim().length > 0
    );
  }

  if (typeof imagens !== 'string') {
    return [];
  }

  const valor = imagens.trim();

  if (!valor) {
    return [];
  }

  if (
    valor.startsWith('http://') ||
    valor.startsWith('https://') ||
    valor.startsWith('/')
  ) {
    return [valor];
  }

  try {
    const convertido: unknown = JSON.parse(valor);

    if (Array.isArray(convertido)) {
      return convertido.filter(
        (imagem): imagem is string =>
          typeof imagem === 'string' &&
          imagem.trim().length > 0
      );
    }
  } catch {
    return [];
  }

  return [];
}

function limitarImagensPorPlano(
  imagens: unknown,
  plano: string | null
): string[] {
  const imagensNormalizadas =
    normalizarImagens(imagens);

  const limite =
    LIMITE_FOTOS_POR_PLANO[plano || ''] ?? 5;

  return imagensNormalizadas.slice(0, limite);
}

function obterPrimeiraImagem(
  imagens: unknown,
  plano: string | null
): string | null {
  return (
    limitarImagensPorPlano(imagens, plano)[0] ||
    null
  );
}

function formatarPreco(
  preco: number | null
): string | null {
  if (
    preco === null ||
    preco === undefined
  ) {
    return null;
  }

  return preco.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarData(data: string): string {
  const dataConvertida = new Date(data);

  if (
    Number.isNaN(dataConvertida.getTime())
  ) {
    return '';
  }

  return dataConvertida.toLocaleDateString(
    'pt-BR',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
  );
}

function limparTelefone(
  telefone: string | null
): string {
  return telefone?.replace(/\D/g, '') || '';
}

function criarLinkWhatsApp(
  telefone: string | null,
  titulo: string
): string | null {
  const telefoneLimpo =
    limparTelefone(telefone);

  if (!telefoneLimpo) {
    return null;
  }

  const telefoneComPais =
    telefoneLimpo.startsWith('55')
      ? telefoneLimpo
      : `55${telefoneLimpo}`;

  const mensagem = encodeURIComponent(
    `Olá! Vi o anúncio "${titulo}" no Conecta Cidade e gostaria de mais informações.`
  );

  return `https://wa.me/${telefoneComPais}?text=${mensagem}`;
}

function normalizarUsuarioInstagram(
  instagram: string | null
): string | null {
  if (!instagram?.trim()) {
    return null;
  }

  const valor = instagram.trim();

  const usuario = valor
    .replace(
      /^https?:\/\/(www\.)?instagram\.com\//i,
      ''
    )
    .replace(/^@/, '')
    .replace(/[/?#].*$/, '')
    .replace(/\/+$/, '')
    .trim();

  return usuario || null;
}

function criarLinkInstagram(
  instagram: string | null
): string | null {
  const usuario =
    normalizarUsuarioInstagram(instagram);

  if (!usuario) {
    return null;
  }

  return `https://instagram.com/${usuario}`;
}

function obterEstiloPlano(
  plano: string | null
): EstiloPlano {
  switch (plano) {
    case 'Exclusivo':
      return {
        texto: 'Exclusivo',
        icone: '👑',
        classe:
          'border border-emerald-300 bg-emerald-600 text-white shadow-sm',
      };

    case 'Vitrine':
      return {
        texto: 'Vitrine',
        icone: '◆',
        classe:
          'border border-amber-300 bg-amber-500 text-white shadow-sm',
      };

    case 'Impulso':
      return {
        texto: 'Impulso',
        icone: '★',
        classe:
          'border border-orange-300 bg-orange-600 text-white shadow-sm',
      };

    case 'Gratuito':
    default:
      return {
        texto: 'Gratuito',
        icone: '',
        classe:
          'border border-slate-300 bg-slate-100 text-slate-700',
      };
  }
}

function obterLinkCategoria(
  categoria: string
): string {
  switch (categoria) {
    case 'Morar & Construir':
      return '/morar-construir';

    case 'Motores & Rodas':
      return '/motores-rodas';

    case 'Promoções':
      return '/promocoes';

    case 'Onde é o Rolê?':
      return '/onde-role';

    default:
      return '/';
  }
}

/* =========================================================
   PÁGINA
========================================================= */

export default function PaginaAnuncio({
  params,
}: PaginaAnuncioProps) {
  const { id } = use(params);

  const [anuncio, setAnuncio] =
    useState<Anuncio | null>(null);

  const [
    anunciosRelacionados,
    setAnunciosRelacionados,
  ] = useState<AnuncioRelacionado[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [erro, setErro] = useState('');

  /* =======================================================
     CARREGAR ANÚNCIO
  ======================================================= */

  useEffect(() => {
    let componenteAtivo = true;

    const carregarAnuncio = async () => {
      setLoading(true);
      setErro('');

      const { data, error } = await supabase
        .from('anuncios')
        .select(`
          id,
          titulo,
          nome_loja,
          descricao,
          preco,
          imagens,
          cidade,
          estado,
          telefone,
          instagram,
          plano_usado,
          categoria,
          created_at
        `)
        .eq('id', id)
        .eq('aprovado', true)
        .eq('ativo', true)
        .maybeSingle<Anuncio>();

      if (!componenteAtivo) {
        return;
      }

      if (error) {
        console.error(
          'Erro ao carregar anúncio:',
          error
        );

        setErro(
          'Não foi possível carregar este anúncio.'
        );

        setLoading(false);
        return;
      }

      if (!data) {
        setErro(
          'Este anúncio não foi encontrado ou não está mais disponível.'
        );

        setLoading(false);
        return;
      }

      setAnuncio(data);
      setLoading(false);
    };

    carregarAnuncio();

    return () => {
      componenteAtivo = false;
    };
  }, [id]);

  /* =======================================================
     CARREGAR RELACIONADOS
  ======================================================= */

  useEffect(() => {
    if (!anuncio?.categoria) {
      return;
    }

    let componenteAtivo = true;

    const carregarRelacionados =
      async () => {
        const { data, error } =
          await supabase
            .from('anuncios')
            .select(`
              id,
              titulo,
              nome_loja,
              preco,
              imagens,
              cidade,
              estado,
              plano_usado
            `)
            .eq(
              'categoria',
              anuncio.categoria
            )
            .eq('aprovado', true)
            .eq('ativo', true)
            .neq('id', anuncio.id)
            .order('created_at', {
              ascending: false,
            })
            .limit(4);

        if (!componenteAtivo) {
          return;
        }

        if (error) {
          console.error(
            'Erro ao carregar anúncios relacionados:',
            error
          );

          setAnunciosRelacionados([]);
          return;
        }

        setAnunciosRelacionados(data || []);
      };

    carregarRelacionados();

    return () => {
      componenteAtivo = false;
    };
  }, [anuncio]);

  /* =======================================================
     DADOS PREPARADOS
  ======================================================= */

  const imagens = useMemo(
    () =>
      limitarImagensPorPlano(
        anuncio?.imagens,
        anuncio?.plano_usado || null
      ),
    [
      anuncio?.imagens,
      anuncio?.plano_usado,
    ]
  );

  const precoFormatado =
    formatarPreco(anuncio?.preco ?? null);

  const linkWhatsApp = anuncio
    ? criarLinkWhatsApp(
        anuncio.telefone,
        anuncio.titulo
      )
    : null;

  const podeMostrarInstagram = Boolean(
    anuncio &&
      PLANOS_COM_INSTAGRAM.includes(
        anuncio.plano_usado || ''
      ) &&
      anuncio.instagram?.trim()
  );

  const usuarioInstagram =
    podeMostrarInstagram
      ? normalizarUsuarioInstagram(
          anuncio?.instagram || null
        )
      : null;

  const linkInstagram =
    podeMostrarInstagram
      ? criarLinkInstagram(
          anuncio?.instagram || null
        )
      : null;

  /* =======================================================
     CARREGAMENTO
  ======================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

          <p className="mt-4 font-semibold text-slate-600">
            Carregando anúncio...
          </p>
        </div>
      </main>
    );
  }

  /* =======================================================
     ANÚNCIO NÃO ENCONTRADO
  ======================================================= */

  if (erro || !anuncio) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl font-bold text-red-600">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Anúncio indisponível
          </h1>

          <p className="mt-3 text-slate-600">
            {erro ||
              'Este anúncio não foi encontrado.'}
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
          >
            Voltar para o início
          </Link>
        </div>
      </main>
    );
  }

  const estiloPlano =
    obterEstiloPlano(anuncio.plano_usado);

  /* =======================================================
     INTERFACE
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      {/* CAMINHO DE NAVEGAÇÃO */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-6 py-4 text-sm text-slate-500">
          <Link
            href="/"
            className="transition hover:text-orange-600"
          >
            Início
          </Link>

          <span>/</span>

          {anuncio.categoria && (
            <>
              <Link
                href={obterLinkCategoria(
                  anuncio.categoria
                )}
                className="transition hover:text-orange-600"
              >
                {anuncio.categoria}
              </Link>

              <span>/</span>
            </>
          )}

          <span className="max-w-[320px] truncate font-semibold text-slate-800">
            {anuncio.titulo}
          </span>
        </div>
      </section>

      {/* CONTEÚDO PRINCIPAL */}

      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid items-start gap-8 lg:grid-cols-12">
          {/* GALERIA */}

          <div className="lg:col-span-7">
            <GaleriaAnuncio
              imagens={imagens}
              titulo={anuncio.titulo}
            />
          </div>

          {/* CARD DE INFORMAÇÕES */}

          <aside className="lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-9">
              {/* SELOS */}

              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-extrabold uppercase tracking-wide ${estiloPlano.classe}`}
                >
                  {estiloPlano.icone && (
                    <span aria-hidden="true">
                      {estiloPlano.icone}
                    </span>
                  )}

                  {estiloPlano.texto}
                </span>

                {anuncio.categoria && (
                  <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-extrabold text-orange-700">
                    {anuncio.categoria}
                  </span>
                )}
              </div>

              {/* EMPRESA E TÍTULO */}

              <div className="mt-7">
                <p className="text-sm font-extrabold uppercase tracking-[0.08em] text-orange-600">
                  {anuncio.nome_loja ||
                    'Anunciante'}
                </p>

                <h1 className="mt-3 text-3xl font-black leading-[1.12] text-slate-950 md:text-4xl">
                  {anuncio.titulo}
                </h1>
              </div>

              {/* PREÇO */}

              <div className="mt-7 rounded-2xl border border-orange-100 bg-orange-50/70 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Preço
                </p>

                {precoFormatado ? (
                  <p className="mt-1 text-4xl font-black tracking-tight text-orange-600 md:text-[42px]">
                    {precoFormatado}
                  </p>
                ) : (
                  <p className="mt-1 text-2xl font-extrabold text-slate-700">
                    Preço sob consulta
                  </p>
                )}
              </div>

              {/* DADOS */}

              <div className="mt-7 space-y-4 border-y border-slate-200 py-6 text-sm">
                <div className="flex items-start justify-between gap-5">
                  <span className="font-medium text-slate-500">
                    Localização
                  </span>

                  <span className="text-right font-bold text-slate-900">
                    {anuncio.cidade ||
                      'Nova União'}{' '}
                    •{' '}
                    {anuncio.estado || 'MG'}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-5">
                  <span className="font-medium text-slate-500">
                    Publicado em
                  </span>

                  <span className="text-right font-bold text-slate-900">
                    {formatarData(
                      anuncio.created_at
                    )}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-5">
                  <span className="font-medium text-slate-500">
                    Fotos
                  </span>

                  <span className="text-right font-bold text-slate-900">
                    {imagens.length}{' '}
                    {imagens.length === 1
                      ? 'foto'
                      : 'fotos'}
                  </span>
                </div>
              </div>

              {/* CONTATOS */}

              <div className="mt-7 space-y-3.5">
                {linkWhatsApp ? (
                  <a
                    href={linkWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-6 py-4 text-center text-base font-extrabold text-white shadow-md shadow-emerald-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
                  >
                    <WhatsAppIcon />

                    Conversar pelo WhatsApp
                  </a>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-sm font-semibold text-slate-500">
                    Contato não informado
                  </div>
                )}

                {podeMostrarInstagram &&
                  linkInstagram &&
                  usuarioInstagram && (
                    <a
                      href={linkInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-pink-500 bg-white px-6 py-4 text-center text-base font-extrabold text-pink-600 transition duration-200 hover:-translate-y-0.5 hover:bg-pink-50 hover:shadow-md"
                    >
                      <InstagramIcon />

                      @{usuarioInstagram}
                    </a>
                  )}
              </div>

              {/* AVISO */}

              <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4.5">
                <p className="text-xs leading-relaxed text-amber-900">
                  Para sua segurança, confirme os dados
                  do anúncio diretamente com o
                  anunciante antes de realizar
                  pagamentos ou combinar entregas.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* DESCRIÇÃO */}

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Descrição do anúncio
          </h2>

          {anuncio.descricao?.trim() ? (
            <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-700">
              {anuncio.descricao}
            </p>
          ) : (
            <p className="mt-4 text-slate-500">
              O anunciante não informou uma
              descrição adicional.
            </p>
          )}
        </section>

        {/* RELACIONADOS */}

        {anunciosRelacionados.length > 0 && (
          <section className="mt-12">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-orange-600">
                  Continue explorando
                </p>

                <h2 className="mt-1 text-3xl font-bold text-slate-900">
                  Você também pode gostar
                </h2>
              </div>

              {anuncio.categoria && (
                <Link
                  href={obterLinkCategoria(
                    anuncio.categoria
                  )}
                  className="font-semibold text-orange-600 transition hover:text-orange-700"
                >
                  Ver todos →
                </Link>
              )}
            </div>

            <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {anunciosRelacionados.map(
                (relacionado) => (
                  <CardRelacionado
                    key={relacionado.id}
                    anuncio={relacionado}
                  />
                )
              )}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

/* =========================================================
   GALERIA
========================================================= */

function GaleriaAnuncio({
  imagens,
  titulo,
}: {
  imagens: string[];
  titulo: string;
}) {
  const [indiceAtual, setIndiceAtual] =
    useState(0);

  const [
    imagemAmpliada,
    setImagemAmpliada,
  ] = useState(false);

  const [
    inicioArraste,
    setInicioArraste,
  ] = useState<number | null>(null);

  const [
    imagensComErro,
    setImagensComErro,
  ] = useState<Record<number, boolean>>({});

  const total = imagens.length;
  const possuiVarias = total > 1;

  useEffect(() => {
    setIndiceAtual(0);
    setImagensComErro({});
  }, [imagens.length]);

  useEffect(() => {
    if (!imagemAmpliada) {
      return;
    }

    const rolagemAnterior =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const controlarTeclado = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setImagemAmpliada(false);
      }

      if (
        event.key === 'ArrowRight' &&
        possuiVarias
      ) {
        setIndiceAtual((indice) =>
          indice === total - 1
            ? 0
            : indice + 1
        );
      }

      if (
        event.key === 'ArrowLeft' &&
        possuiVarias
      ) {
        setIndiceAtual((indice) =>
          indice === 0
            ? total - 1
            : indice - 1
        );
      }
    };

    window.addEventListener(
      'keydown',
      controlarTeclado
    );

    return () => {
      document.body.style.overflow =
        rolagemAnterior;

      window.removeEventListener(
        'keydown',
        controlarTeclado
      );
    };
  }, [
    imagemAmpliada,
    possuiVarias,
    total,
  ]);

  const anterior = () => {
    if (!possuiVarias) {
      return;
    }

    setIndiceAtual((indice) =>
      indice === 0
        ? total - 1
        : indice - 1
    );
  };

  const proxima = () => {
    if (!possuiVarias) {
      return;
    }

    setIndiceAtual((indice) =>
      indice === total - 1
        ? 0
        : indice + 1
    );
  };

  const handlePointerDown = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    setInicioArraste(event.clientX);
  };

  const handlePointerUp = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (
      inicioArraste === null ||
      !possuiVarias
    ) {
      setInicioArraste(null);
      return;
    }

    const distancia =
      event.clientX - inicioArraste;

    if (distancia > 50) {
      anterior();
    }

    if (distancia < -50) {
      proxima();
    }

    setInicioArraste(null);
  };

  const imagemAtual =
    imagens[indiceAtual];

  if (
    total === 0 ||
    !imagemAtual ||
    imagensComErro[indiceAtual]
  ) {
    return (
      <div className="flex min-h-[420px] w-full flex-col items-center justify-center rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 shadow-sm">
        <IconeSemImagem />

        <p className="mt-4 font-semibold">
          Anúncio sem foto
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div
          className="group relative flex h-[360px] w-full touch-pan-y select-none items-center justify-center overflow-hidden bg-slate-100 md:h-[540px]"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() =>
            setInicioArraste(null)
          }
          onPointerLeave={() =>
            setInicioArraste(null)
          }
        >
          <button
            type="button"
            onClick={() =>
              setImagemAmpliada(true)
            }
            aria-label="Ampliar imagem"
            className="absolute inset-0 z-[5] cursor-zoom-in"
          />

          <img
            src={imagemAtual}
            alt={`${titulo} — foto ${
              indiceAtual + 1
            }`}
            draggable={false}
            onError={() =>
              setImagensComErro((erros) => ({
                ...erros,
                [indiceAtual]: true,
              }))
            }
            className="h-full w-full object-contain"
          />

          <span className="absolute right-4 top-4 z-20 rounded-full bg-slate-950/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
            {indiceAtual + 1}/{total}
          </span>

          <span className="absolute bottom-4 right-4 z-20 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm">
            Clique para ampliar
          </span>

          {possuiVarias && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  anterior();
                }}
                aria-label="Foto anterior"
                className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-3xl font-bold text-slate-800 shadow-lg transition hover:bg-white"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  proxima();
                }}
                aria-label="Próxima foto"
                className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-3xl font-bold text-slate-800 shadow-lg transition hover:bg-white"
              >
                ›
              </button>
            </>
          )}
        </div>

        {possuiVarias && (
          <div className="border-t border-slate-200 bg-white p-4">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {imagens.map((imagem, indice) => (
                <button
                  key={`${imagem}-${indice}`}
                  type="button"
                  onClick={() =>
                    setIndiceAtual(indice)
                  }
                  aria-label={`Selecionar foto ${
                    indice + 1
                  }`}
                  className={`h-20 w-24 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-100 transition ${
                    indice === indiceAtual
                      ? 'border-orange-500 ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={imagem}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* IMAGEM AMPLIADA */}

      {imagemAmpliada && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada das fotos"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 p-4"
        >
          <button
            type="button"
            onClick={() =>
              setImagemAmpliada(false)
            }
            aria-label="Fechar imagem ampliada"
            className="absolute right-5 top-5 z-[110] flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl font-bold text-slate-900 shadow-lg"
          >
            ×
          </button>

          <span className="absolute left-5 top-5 z-[110] rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
            {indiceAtual + 1}/{total}
          </span>

          <div
            className="relative flex h-full w-full touch-pan-y items-center justify-center"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            <img
              src={imagemAtual}
              alt={`${titulo} — foto ampliada ${
                indiceAtual + 1
              }`}
              draggable={false}
              className="max-h-[90vh] max-w-[94vw] object-contain"
            />

            {possuiVarias && (
              <>
                <button
                  type="button"
                  onClick={anterior}
                  aria-label="Foto anterior"
                  className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-3xl font-bold text-slate-900 shadow-lg md:left-6"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={proxima}
                  aria-label="Próxima foto"
                  className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-3xl font-bold text-slate-900 shadow-lg md:right-6"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* =========================================================
   CARD RELACIONADO
========================================================= */

function CardRelacionado({
  anuncio,
}: {
  anuncio: AnuncioRelacionado;
}) {
  const [erroImagem, setErroImagem] =
    useState(false);

  const imagem =
    obterPrimeiraImagem(
      anuncio.imagens,
      anuncio.plano_usado
    );

  const preco = formatarPreco(anuncio.preco);

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link
        href={`/anuncio/${anuncio.id}`}
        className="block"
      >
        <div className="h-48 overflow-hidden bg-slate-100">
          {!imagem || erroImagem ? (
            <div className="flex h-full w-full flex-col items-center justify-center text-slate-400">
              <IconeSemImagem />

              <span className="mt-2 text-sm font-semibold">
                Sem foto
              </span>
            </div>
          ) : (
            <img
              src={imagem}
              alt={anuncio.titulo}
              loading="lazy"
              onError={() =>
                setErroImagem(true)
              }
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
            />
          )}
        </div>

        <div className="p-5">
          <p className="line-clamp-1 text-xs font-bold uppercase tracking-wide text-orange-600">
            {anuncio.nome_loja ||
              'Anunciante'}
          </p>

          <h3 className="mt-2 min-h-[52px] line-clamp-2 text-lg font-bold text-slate-900">
            {anuncio.titulo}
          </h3>

          {preco ? (
            <p className="mt-3 text-xl font-extrabold text-orange-600">
              {preco}
            </p>
          ) : (
            <p className="mt-3 text-base font-bold text-slate-600">
              Preço sob consulta
            </p>
          )}

          <p className="mt-3 text-sm text-slate-500">
            {anuncio.cidade ||
              'Nova União'}{' '}
            •{' '}
            {anuncio.estado || 'MG'}
          </p>
        </div>
      </Link>
    </article>
  );
}

/* =========================================================
   ÍCONES
========================================================= */

function IconeSemImagem() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-14 w-14 fill-none stroke-current stroke-[1.5]"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
      />

      <circle
        cx="8.5"
        cy="9"
        r="1.5"
      />

      <path d="m4 17 5-5 4 4 2-2 5 5" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-6 w-6 fill-current"
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
      className="h-6 w-6 fill-none stroke-current stroke-2"
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
  );
}