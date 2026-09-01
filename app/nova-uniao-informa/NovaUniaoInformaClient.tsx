'use client';

import { useEffect, useMemo, useState } from 'react';
import InformativoCard, {
  Informativo,
} from '../../components/InformativoCard';
import { supabase } from '../../lib/supabase';

const TABELA = 'nova_uniao_informa';

function obterDataAtual(): string {
  const agora = new Date();
  const diferencaFuso = agora.getTimezoneOffset() * 60 * 1000;
  const dataLocal = new Date(agora.getTime() - diferencaFuso);

  return dataLocal.toISOString().split('T')[0];
}

function obterMensagemErro(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    return String(
      (error as { message?: unknown }).message ||
        'Erro desconhecido.'
    );
  }

  return 'Ocorreu um erro inesperado.';
}

export default function NovaUniaoInformaPage() {
  const [informativos, setInformativos] = useState<
    Informativo[]
  >([]);

  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [ordenacao, setOrdenacao] = useState<
    'recentes' | 'antigos' | 'titulo'
  >('recentes');

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const carregarInformativos = async () => {
      setCarregando(true);
      setErro('');

      const hoje = obterDataAtual();

      const { data, error } = await supabase
        .from(TABELA)
        .select('*')
        .eq('ativo', true)
        .lte('publicar_em', hoje)
        .or(
          `encerrar_publicacao_em.is.null,encerrar_publicacao_em.gte.${hoje}`
        )
        .order('destaque', { ascending: false })
        .order('publicar_em', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error(
          'Erro ao carregar Nova União Informa:',
          error
        );

        setErro(
          `Não foi possível carregar os informativos: ${obterMensagemErro(
            error
          )}`
        );

        setInformativos([]);
        setCarregando(false);
        return;
      }

      setInformativos(
        (data || []) as Informativo[]
      );

      setCarregando(false);
    };

    void carregarInformativos();
  }, []);

  const categorias = useMemo(() => {
    const nomes = informativos
      .map((item) => item.categoria?.trim())
      .filter(
        (nome): nome is string =>
          Boolean(nome)
      );

    return [
      'Todas',
      ...Array.from(new Set(nomes)).sort((a, b) =>
        a.localeCompare(b, 'pt-BR')
      ),
    ];
  }, [informativos]);

  const informativosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    const resultado = informativos.filter(
      (informativo) => {
        const correspondeCategoria =
          categoria === 'Todas' ||
          informativo.categoria === categoria;

        const textoPesquisa = [
          informativo.titulo,
          informativo.categoria,
          informativo.resumo,
          informativo.descricao,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const correspondeBusca =
          !termo || textoPesquisa.includes(termo);

        return (
          correspondeCategoria &&
          correspondeBusca
        );
      }
    );

    return [...resultado].sort((a, b) => {
      if (a.destaque !== b.destaque) {
        return a.destaque ? -1 : 1;
      }

      if (ordenacao === 'titulo') {
        return a.titulo.localeCompare(
          b.titulo,
          'pt-BR'
        );
      }

      const dataA = new Date(
        a.publicar_em ||
          a.created_at ||
          0
      ).getTime();

      const dataB = new Date(
        b.publicar_em ||
          b.created_at ||
          0
      ).getTime();

      return ordenacao === 'antigos'
        ? dataA - dataB
        : dataB - dataA;
    });
  }, [
    busca,
    categoria,
    informativos,
    ordenacao,
  ]);

  const destaques = informativosFiltrados.filter(
    (item) => item.destaque
  );

  const demais = informativosFiltrados.filter(
    (item) => !item.destaque
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 px-6 py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-orange-300">
            Conecta Cidade
          </p>

          <h1 className="mt-3 text-4xl font-black md:text-6xl">
            Nova União Informa
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">
            Notícias, comunicados, campanhas,
            eventos e informações importantes para
            os moradores de Nova União.
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white px-6 py-6 shadow-sm">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[minmax(0,1fr)_260px_220px]">
          <label className="sr-only" htmlFor="busca-informativo">
            Pesquisar informativos
          </label>

          <input
            id="busca-informativo"
            type="search"
            value={busca}
            onChange={(event) =>
              setBusca(event.target.value)
            }
            placeholder="Pesquisar notícia, comunicado ou informação..."
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />

          <label className="sr-only" htmlFor="categoria-informativo">
            Filtrar por categoria
          </label>

          <select
            id="categoria-informativo"
            value={categoria}
            onChange={(event) =>
              setCategoria(event.target.value)
            }
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          >
            {categorias.map((item) => (
              <option key={item} value={item}>
                {item === 'Todas'
                  ? 'Todas as categorias'
                  : item}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="ordenacao-informativo">
            Ordenar informativos
          </label>

          <select
            id="ordenacao-informativo"
            value={ordenacao}
            onChange={(event) =>
              setOrdenacao(
                event.target.value as typeof ordenacao
              )
            }
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          >
            <option value="recentes">
              Mais recentes
            </option>

            <option value="antigos">
              Mais antigos
            </option>

            <option value="titulo">
              Ordem alfabética
            </option>
          </select>
        </div>
      </section>

      <section className="px-6 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900">
              Informativos
            </h2>

            <p className="mt-2 text-slate-600">
              {informativosFiltrados.length}{' '}
              {informativosFiltrados.length === 1
                ? 'resultado encontrado'
                : 'resultados encontrados'}
            </p>
          </div>

          {erro && (
            <div
              role="alert"
              className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700"
            >
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="py-20 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

              <p className="mt-4 font-semibold text-slate-600">
                Carregando informativos...
              </p>
            </div>
          ) : informativosFiltrados.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
              <h3 className="text-xl font-bold text-slate-800">
                Nenhum informativo encontrado
              </h3>

              <p className="mt-2 text-slate-500">
                Tente alterar a busca ou selecionar
                outra categoria.
              </p>
            </div>
          ) : (
            <div className="space-y-14">
              {destaques.length > 0 && (
                <section>
                  <div className="mb-6">
                    <p className="text-sm font-extrabold uppercase tracking-[0.15em] text-amber-600">
                      Prioridade
                    </p>

                    <h3 className="mt-1 text-2xl font-black text-slate-900">
                      Informações em destaque
                    </h3>
                  </div>

                  <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                    {destaques.map(
                      (informativo) => (
                        <InformativoCard
                          key={informativo.id}
                          informativo={informativo}
                        />
                      )
                    )}
                  </div>
                </section>
              )}

              {demais.length > 0 && (
                <section>
                  {destaques.length > 0 && (
                    <h3 className="mb-6 text-2xl font-black text-slate-900">
                      Mais informações
                    </h3>
                  )}

                  <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                    {demais.map(
                      (informativo) => (
                        <InformativoCard
                          key={informativo.id}
                          informativo={informativo}
                        />
                      )
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}