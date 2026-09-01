'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Produtor = {
  id: string;
  produto: string;
  categoria: string | null;
  nome_produtor: string;
  telefone: string;
  cidade: string | null;
  localidade: string | null;
  endereco: string | null;
  descricao: string | null;
  imagem_url: string | null;
  data_inicio: string | null;
  data_vencimento: string | null;
  ativo: boolean;
  status: 'Ativo' | 'Aguardando' | 'Encerrado' | null;
};

function obterDataAtual(): string {
  const agora = new Date();
  const diferencaFuso = agora.getTimezoneOffset() * 60 * 1000;
  const dataLocal = new Date(agora.getTime() - diferencaFuso);
  return dataLocal.toISOString().split('T')[0];
}

function normalizarTelefone(valor: string): string {
  return valor.replace(/\D/g, '');
}

function criarLinkWhatsApp(produtor: Produtor): string {
  let telefone = normalizarTelefone(produtor.telefone || '');

  if (!telefone.startsWith('55')) {
    telefone = `55${telefone}`;
  }

  const mensagem = encodeURIComponent(
    `Olá! Vi o produto "${produtor.produto}" no Conecta Cidade e gostaria de saber mais.`
  );

  return `https://wa.me/${telefone}?text=${mensagem}`;
}

export default function DiretoDoProdutorPage() {
  const [produtores, setProdutores] = useState<Produtor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('Todas');

  const carregarProdutores = useCallback(async () => {
    setCarregando(true);
    setErro('');

    const hoje = obterDataAtual();

    const { data, error } = await supabase
      .from('direto_produtor')
      .select(
        `
          id,
          produto,
          categoria,
          nome_produtor,
          telefone,
          cidade,
          localidade,
          endereco,
          descricao,
          imagem_url,
          data_inicio,
          data_vencimento,
          ativo,
          status,
          created_at
        `
      )
      .eq('ativo', true)
      .eq('status', 'Ativo')
      .lte('data_inicio', hoje)
      .gte('data_vencimento', hoje)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar produtores:', error);
      setProdutores([]);
      setErro('Não foi possível carregar os produtores neste momento.');
      setCarregando(false);
      return;
    }

    setProdutores((data || []) as Produtor[]);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregarProdutores();
  }, [carregarProdutores]);

  const categorias = useMemo(() => {
    const lista = produtores
      .map((produtor) => produtor.categoria?.trim())
      .filter((categoria): categoria is string => Boolean(categoria));

    return ['Todas', ...Array.from(new Set(lista)).sort((a, b) => a.localeCompare(b))];
  }, [produtores]);

  const produtoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return produtores.filter((produtor) => {
      const correspondeCategoria =
        categoriaSelecionada === 'Todas' ||
        produtor.categoria === categoriaSelecionada;

      const correspondeBusca =
        !termo ||
        produtor.produto.toLowerCase().includes(termo) ||
        produtor.nome_produtor.toLowerCase().includes(termo) ||
        produtor.categoria?.toLowerCase().includes(termo) ||
        produtor.cidade?.toLowerCase().includes(termo) ||
        produtor.localidade?.toLowerCase().includes(termo) ||
        produtor.descricao?.toLowerCase().includes(termo);

      return correspondeCategoria && correspondeBusca;
    });
  }, [busca, categoriaSelecionada, produtores]);

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-800">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-lime-300 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-emerald-300 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-lime-300">
              Conecta Cidade
            </p>

            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-6xl">
              Direto do Produtor
            </h1>

            <p className="mt-5 text-xl font-semibold text-emerald-50 md:text-2xl">
              Produtos da nossa terra, direto de quem produz.
            </p>

            <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-100 md:text-lg">
              Conheça produtores locais, valorize a agricultura familiar e encontre
              alimentos, artesanato e produtos feitos em Nova União e região.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/anunciar"
                className="inline-flex items-center justify-center rounded-2xl bg-orange-600 px-6 py-3.5 font-bold text-white shadow-lg transition hover:bg-orange-700"
              >
                Quero Participar
              </Link>

              <Link
                href="/planos"
                className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Conhecer Planos
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
                Produção local
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                Encontre quem produz perto de você
              </h2>

              <p className="mt-3 text-slate-600">
                Pesquise por produto, produtor, categoria, cidade ou localidade.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar produto ou produtor..."
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />

              <select
                value={categoriaSelecionada}
                onChange={(event) => setCategoriaSelecionada(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                {categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {carregando ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-700" />
              <p className="mt-4 font-semibold text-slate-600">Carregando produtores...</p>
            </div>
          ) : erro ? (
            <div className="rounded-3xl border border-red-200 bg-red-50 px-6 py-16 text-center">
              <h3 className="text-xl font-extrabold text-red-800">Não foi possível carregar</h3>
              <p className="mt-2 text-red-700">{erro}</p>
              <button
                type="button"
                onClick={carregarProdutores}
                className="mt-6 rounded-xl bg-red-700 px-5 py-3 font-bold text-white transition hover:bg-red-800"
              >
                Tentar novamente
              </button>
            </div>
          ) : produtoresFiltrados.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
              <h3 className="text-2xl font-extrabold text-slate-800">Nenhum produtor encontrado</h3>
              <p className="mt-3 text-slate-500">Tente alterar a pesquisa ou selecionar outra categoria.</p>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">
                  {produtoresFiltrados.length}{' '}
                  {produtoresFiltrados.length === 1
                    ? 'produtor encontrado'
                    : 'produtores encontrados'}
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {produtoresFiltrados.map((produtor) => {
                  const local = [produtor.cidade, produtor.localidade]
                    .filter(Boolean)
                    .join(' • ');

                  return (
                    <article
                      key={produtor.id}
                      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        <img
                          src={produtor.imagem_url || '/images/nova-uniao.jpg'}
                          alt={produtor.produto}
                          onError={(event) => {
                            if (!event.currentTarget.src.endsWith('/images/nova-uniao.jpg')) {
                              event.currentTarget.src = '/images/nova-uniao.jpg';
                            }
                          }}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        {produtor.categoria && (
                          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-800 shadow-sm backdrop-blur">
                            {produtor.categoria}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="text-2xl font-extrabold text-slate-900">{produtor.produto}</h3>
                        <p className="mt-2 font-semibold text-slate-700">{produtor.nome_produtor}</p>
                        <p className="mt-2 text-sm font-medium text-emerald-700">{local || 'Nova União'}</p>

                        {produtor.descricao && (
                          <p className="mt-4 line-clamp-4 text-sm leading-6 text-slate-600">
                            {produtor.descricao}
                          </p>
                        )}

                        <div className="mt-auto pt-6">
                          <a
                            href={criarLinkWhatsApp(produtor)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3.5 font-bold text-white transition hover:bg-emerald-700"
                          >
                            Falar pelo WhatsApp
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900 px-6 py-10 text-center md:px-12">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-lime-300">
              Produz em Nova União ou região?
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-white">
              Divulgue seus produtos no Conecta Cidade
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-300">
              Participe do programa Direto do Produtor e aproxime sua produção de novos clientes.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/anunciar"
                className="rounded-2xl bg-orange-600 px-6 py-3.5 font-bold text-white transition hover:bg-orange-700"
              >
                Quero Participar
              </Link>

              <Link
                href="/planos"
                className="rounded-2xl border border-slate-600 px-6 py-3.5 font-bold text-white transition hover:bg-slate-800"
              >
                Conhecer Planos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}