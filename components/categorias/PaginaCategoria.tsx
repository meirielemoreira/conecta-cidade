'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import CarrosselCard from '../anuncios/CarrosselCard';

type AnuncioCategoria = {
  id: string;
  titulo: string;
  nome_loja: string | null;
  descricao: string | null;
  preco: number | null;
  imagens: unknown;
  cidade: string | null;
  categoria: string | null;
  plano_usado: string | null;
  created_at: string;
};

type PaginaCategoriaProps = {
  titulo: string;
  descricao: string;
  categoriaBanco: string;
  corHero: string;
  imagemHero?: string;
  imagemPadrao?: string;
  corDestaque?: string;
  placeholderBusca: string;
  textoVazio: string;
};

function formatarPreco(preco: number | null) {
  if (preco === null || preco === undefined) {
    return null;
  }

  return preco.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export default function PaginaCategoria({
  titulo,
  descricao,
  categoriaBanco,
  corHero,
  imagemHero,
  imagemPadrao,
  corDestaque,
  placeholderBusca,
  textoVazio,
}: PaginaCategoriaProps) {
 const [anuncios, setAnuncios] = useState<AnuncioCategoria[]>([]);
const [busca, setBusca] = useState('');
const [ordem, setOrdem] = useState('recentes');
const [loading, setLoading] = useState(true);

const linkAnunciar = `/anunciar?categoria=${encodeURIComponent(
  categoriaBanco
)}`;
  useEffect(() => {
    const carregarAnuncios = async () => {
      setLoading(true);

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
  categoria,
  plano_usado,
  created_at
`)
        .eq('categoria', categoriaBanco)
        .eq('aprovado', true)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Erro ao carregar ${titulo}:`, error);
        setAnuncios([]);
      } else {
        setAnuncios(data || []);
      }

      setLoading(false);
    };

    carregarAnuncios();
  }, [categoriaBanco, titulo]);

  const anunciosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    const resultado = anuncios.filter((anuncio) => {
      if (!termo) {
        return true;
      }

      return (
        anuncio.titulo?.toLowerCase().includes(termo) ||
        anuncio.nome_loja?.toLowerCase().includes(termo) ||
        anuncio.descricao?.toLowerCase().includes(termo)
      );
    });

    return [...resultado].sort((a, b) => {
      if (ordem === 'menor-preco') {
        return (a.preco ?? Number.MAX_SAFE_INTEGER) -
          (b.preco ?? Number.MAX_SAFE_INTEGER);
      }

      if (ordem === 'maior-preco') {
        return (b.preco ?? 0) - (a.preco ?? 0);
      }

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });
  }, [anuncios, busca, ordem]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className={`bg-gradient-to-r ${corHero} text-white py-16`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
              Conecta Cidade
            </p>

            <h1 className="text-4xl md:text-6xl font-extrabold mt-3">
              {titulo}
            </h1>

            <p className="text-lg md:text-xl text-white/85 mt-4">
              {descricao}
            </p>
          </div>
        </div>
      </section>

      {/* BUSCA E ORDENAÇÃO */}
      <section className="max-w-7xl mx-auto px-6 -mt-7 relative z-10">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-lg p-5">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
            <input
              type="text"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder={placeholderBusca}
              className="w-full border border-slate-300 rounded-2xl px-5 py-4 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500"
            />

            <select
              value={ordem}
              onChange={(event) => setOrdem(event.target.value)}
              className="w-full border border-slate-300 rounded-2xl px-5 py-4 bg-white focus:outline-none focus:border-orange-500"
            >
              <option value="recentes">Mais recentes</option>
              <option value="menor-preco">Menor preço</option>
              <option value="maior-preco">Maior preço</option>
            </select>
          </div>
        </div>
      </section>

      {/* LISTAGEM */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Anúncios
            </h2>

            <p className="text-slate-500 mt-1">
              Resultados encontrados: {anunciosFiltrados.length}
            </p>
          </div>

          <Link
  href={linkAnunciar}
  className="inline-flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition"
>
  Anunciar nesta categoria
</Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-500">
            Carregando anúncios...
          </div>
        ) : anunciosFiltrados.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
            <h3 className="text-xl font-bold text-slate-900">
              Nenhum resultado encontrado
            </h3>

            <p className="text-slate-500 mt-2">
              {textoVazio}
            </p>

            <Link
  href={linkAnunciar}
  className="inline-block mt-6 bg-orange-600 hover:bg-orange-700 text-white px-7 py-3 rounded-xl font-semibold transition"
>
  Publicar anúncio
</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {anunciosFiltrados.map((anuncio) => {

              const preco = formatarPreco(anuncio.preco);

              return (
                <article
                  key={anuncio.id}
                  className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
<div className="relative h-52 overflow-hidden bg-slate-100">
  <CarrosselCard
    imagens={anuncio.imagens}
    titulo={anuncio.titulo}
    plano={anuncio.plano_usado}
  />

  <Link
    href={`/anuncio/${anuncio.id}`}
    aria-label={`Abrir anúncio: ${anuncio.titulo}`}
    className="absolute inset-0 z-[5]"
  />
</div>

<div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 line-clamp-1">
                      {anuncio.nome_loja || titulo}
                    </p>

                    <Link href={`/anuncio/${anuncio.id}`}>
                      <h3 className="font-bold text-lg text-slate-900 line-clamp-2 min-h-[56px] mt-2 hover:text-orange-600 transition">
                        {anuncio.titulo}
                      </h3>
                    </Link>

                    {preco && (
                      <p className="text-2xl font-extrabold text-orange-600 mt-3">
                        {preco}
                      </p>
                    )}

                    <p className="text-sm text-slate-500 mt-3">
                      {anuncio.cidade || 'Nova União'} • MG
                    </p>
<Link
  href={`/anuncio/${anuncio.id}`}
  className="mt-4 inline-flex items-center font-semibold text-orange-600 transition hover:text-orange-700"
>
  Ver anúncio completo →
</Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}