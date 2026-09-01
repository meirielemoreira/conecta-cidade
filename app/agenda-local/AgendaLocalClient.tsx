'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Profissional = {
  id: string;
  nome_completo: string;
  profissao: string;
  whatsapp: string;
  instagram?: string | null;
  descricao?: string | null;
  foto_url?: string | null;
};

type ContatoUtil = {
  id: string;
  categoria: string;
  nome: string;
  telefone: string;
  ordem: number;
  ativo: boolean;
};

function telefoneParaLink(telefone: string) {
  return telefone.replace(/\D/g, '');
}

function normalizarTexto(texto?: string | null) {
  if (!texto) return '';

  return texto
    .trim()
    .toLocaleLowerCase('pt-BR')
    .replace(/(^|[\s\-–—/])([a-záàâãéèêíïóôõöúç])/g, (match) =>
      match.toLocaleUpperCase('pt-BR')
    );
}

export default function AgendaLocalPage() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [contatosUteis, setContatosUteis] = useState<ContatoUtil[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingContatos, setLoadingContatos] = useState(true);

  useEffect(() => {
    carregarTudo();
  }, []);

  async function carregarTudo() {
    await Promise.all([
      carregarProfissionais(),
      carregarContatosUteis(),
    ]);
  }

  async function carregarProfissionais() {
    setLoading(true);

    const { data, error } = await supabase
      .from('agenda_local')
      .select('*')
      .eq('ativo', true)
      .eq('aprovado', true)
      .order('data_cadastro', { ascending: false });

    if (error) {
      console.error('Erro ao carregar profissionais:', error);
    } else {
      setProfissionais((data || []) as Profissional[]);
    }

    setLoading(false);
  }

  async function carregarContatosUteis() {
    setLoadingContatos(true);

    const { data, error } = await supabase
      .from('contatos_uteis')
      .select('id, categoria, nome, telefone, ordem, ativo')
      .eq('ativo', true)
      .order('categoria', { ascending: true })
      .order('ordem', { ascending: true });

    if (error) {
      console.error('Erro ao carregar contatos úteis:', error);
    } else {
      setContatosUteis((data || []) as ContatoUtil[]);
    }

    setLoadingContatos(false);
  }

  const profissionaisFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) return profissionais;

    return profissionais.filter(
      (item) =>
        item.nome_completo?.toLowerCase().includes(termo) ||
        item.profissao?.toLowerCase().includes(termo)
    );
  }, [profissionais, busca]);

  const contatosSaude = useMemo(
    () =>
      contatosUteis.filter(
        (contato) => contato.categoria === 'Saúde'
      ),
    [contatosUteis]
  );

  const contatosAdministracao = useMemo(
    () =>
      contatosUteis.filter(
        (contato) =>
          contato.categoria === 'Administração Pública'
      ),
    [contatosUteis]
  );

  return (
    <main className="bg-slate-50 min-h-screen">

      {/* HERO */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">

          <h1 className="text-3xl md:text-4xl font-extrabold">
            Agenda Local
          </h1>

          <p className="text-emerald-100 text-sm md:text-base mt-1">
            Profissionais, serviços e contatos úteis de Nova União
          </p>

        </div>
      </section>

      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6">

        {/* ================================================= */}
        {/* CARDS SUPERIORES */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          {/* SAÚDE */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">

            <h2 className="text-lg font-bold mb-3 text-green-600 flex items-center gap-2">
              🏥 Saúde
            </h2>

            {loadingContatos ? (

              <p className="text-sm text-slate-500">
                Carregando contatos...
              </p>

            ) : contatosSaude.length === 0 ? (

              <p className="text-sm text-slate-500">
                Nenhum contato disponível.
              </p>

            ) : (

              <div className="space-y-1">

                {contatosSaude.map((contato) => {

                  const numero = telefoneParaLink(
                    contato.telefone || ''
                  );

                  return (
                    <div
                      key={contato.id}
                      className="
                        border-b border-slate-200
                        last:border-b-0
                        py-1.5
                        flex
                        justify-between
                        items-center
                        gap-3
                      "
                    >

                      <div className="text-sm font-medium text-slate-700">
                        {contato.nome}
                      </div>

                      {contato.telefone ? (

                        <a
                          href={
                            numero
                              ? `tel:${numero}`
                              : undefined
                          }
                          className="
                            text-green-700
                            font-semibold
                            text-sm
                            whitespace-nowrap
                            hover:underline
                          "
                        >
                          {contato.telefone}
                        </a>

                      ) : (

                        <span className="text-xs text-slate-400">
                          Sem telefone
                        </span>

                      )}

                    </div>
                  );
                })}

              </div>

            )}

          </div>

          {/* ADMINISTRAÇÃO */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">

            <h2 className="text-lg font-bold mb-3 text-blue-600 flex items-center gap-2">
              🏛️ Administração Pública
            </h2>

            {loadingContatos ? (

              <p className="text-sm text-slate-500">
                Carregando contatos...
              </p>

            ) : contatosAdministracao.length === 0 ? (

              <p className="text-sm text-slate-500">
                Nenhum contato disponível.
              </p>

            ) : (

              <div className="space-y-1">

                {contatosAdministracao.map((contato) => {

                  const numero = telefoneParaLink(
                    contato.telefone || ''
                  );

                  return (
                    <div
                      key={contato.id}
                      className="
                        border-b border-slate-200
                        last:border-b-0
                        py-1.5
                        flex
                        justify-between
                        items-center
                        gap-3
                      "
                    >

                      <div className="text-sm font-medium text-slate-700">
                        {contato.nome}
                      </div>

                      {contato.telefone ? (

                        <a
                          href={
                            numero
                              ? `tel:${numero}`
                              : undefined
                          }
                          className="
                            text-blue-700
                            font-semibold
                            text-sm
                            whitespace-nowrap
                            hover:underline
                          "
                        >
                          {contato.telefone}
                        </a>

                      ) : (

                        <span className="text-xs text-slate-400">
                          Sem telefone
                        </span>

                      )}

                    </div>
                  );
                })}

              </div>

            )}

          </div>

          {/* AGENDA LOCAL */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col">

            <h2 className="text-lg font-bold text-emerald-700 mb-2">
              Agenda Local
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              Seus clientes estão procurando por você.
            </p>

            <p className="text-sm text-orange-600 font-medium leading-relaxed mt-1">
              Todos os dias moradores procuram profissionais e serviços locais
              em Nova União.
            </p>

            <a
              href="/agenda-local/cadastro"
              className="
                mt-3
                block
                w-full
                bg-emerald-600
                hover:bg-emerald-700
                text-white
                text-center
                py-2.5
                px-3
                rounded-xl
                font-semibold
                text-sm
                transition
              "
            >
              🚀 Cadastrar meu serviço agora
            </a>

          </div>

        </div>

        {/* ================================================= */}
        {/* PROFISSIONAIS */}
        {/* ================================================= */}

        <section>

          <div className="text-center mb-5">

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Profissionais e Empresas
            </h2>

            <p className="text-sm md:text-base text-slate-600 mt-1">
              Encontre pedreiros, eletricistas, manicures, reboque e muito mais.
            </p>

          </div>

          {/* BUSCA */}
          <div className="max-w-xl mx-auto mb-6">

            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar profissional ou serviço..."
              className="
                w-full
                bg-white
                border
                border-slate-300
                rounded-xl
                px-4
                py-3
                text-sm
                focus:outline-none
                focus:border-emerald-500
                focus:ring-2
                focus:ring-emerald-100
              "
            />

          </div>

          {/* ================================================= */}
          {/* CARDS */}
          {/* ================================================= */}

          {loading ? (

            <p className="text-center py-12 text-slate-500">
              Carregando profissionais...
            </p>

          ) : profissionaisFiltrados.length === 0 ? (

            <p className="text-center py-12 text-slate-500">
              Nenhum profissional encontrado.
            </p>

          ) : (

            <div
              className="
                grid
                grid-cols-2
                md:grid-cols-3
                xl:grid-cols-5
                gap-3
                md:gap-4
                items-stretch
              "
            >

              {profissionaisFiltrados.map((item) => {

                const numeroWhatsapp =
                  item.whatsapp?.replace(/\D/g, '') || '';

                const instagram =
                  item.instagram
                    ?.replace('@', '')
                    .replace('https://instagram.com/', '')
                    .replace('https://www.instagram.com/', '')
                    .replace(/\/$/, '');

                return (

                  <article
                    key={item.id}
                    className="
                      bg-white
                      rounded-2xl
                      shadow-sm
                      border
                      border-slate-200
                      overflow-hidden
                      hover:shadow-md
                      transition
                      flex
                      flex-col
                      min-w-0
                    "
                  >

                    {/* FOTO */}
                    <div className="relative w-full h-32 sm:h-36 md:h-40 bg-white border-b border-slate-100">

                      {item.foto_url ? (

                        <Image
                          src={item.foto_url}
                          alt={item.nome_completo || 'Profissional da Agenda Local'}
                          fill
                          sizes="
                            (max-width: 767px) 50vw,
                            (max-width: 1279px) 33vw,
                            20vw
                          "
                          className="object-contain p-1"
                        />

                      ) : (

                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                          Sem foto
                        </div>

                      )}

                    </div>

                    {/* CONTEÚDO */}
                    <div className="p-3 flex flex-col flex-1 min-w-0">

                      {/* NOME */}
                      <h3
                        className="
                          text-sm
                          md:text-[15px]
                          font-extrabold
                          text-slate-900
                          leading-tight
                          line-clamp-2
                        "
                      >
                        {normalizarTexto(item.nome_completo)}
                      </h3>

                      {/* PROFISSÃO */}
                      <p
                        className="
                          text-xs
                          md:text-sm
                          text-emerald-700
                          font-semibold
                          leading-snug
                          mt-1
                          line-clamp-2
                        "
                      >
                        {normalizarTexto(item.profissao)}
                      </p>

                      {/* DESCRIÇÃO */}
                      {item.descricao && (

                        <p
                          className="
                            text-xs
                            text-slate-600
                            leading-relaxed
                            mt-2
                            line-clamp-3
                          "
                        >
                          {item.descricao}
                        </p>

                      )}

                      {/* BOTÕES */}
                      <div className="flex gap-2 mt-auto pt-3">

                        {/* WHATSAPP */}
                        {numeroWhatsapp && (

                          <a
                            href={`https://wa.me/55${numeroWhatsapp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`WhatsApp de ${item.nome_completo}`}
                            title="WhatsApp"
                            className="
                              flex-1
                              h-9
                              bg-green-600
                              hover:bg-green-700
                              text-white
                              rounded-xl
                              flex
                              items-center
                              justify-center
                              transition
                            "
                          >

                            <WhatsAppIcon />

                          </a>

                        )}

                        {/* INSTAGRAM */}
                        {instagram && (

                          <a
                            href={`https://instagram.com/${instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Instagram de ${item.nome_completo}`}
                            title="Instagram"
                            className="
                              flex-1
                              h-9
                              bg-pink-600
                              hover:bg-pink-700
                              text-white
                              rounded-xl
                              flex
                              items-center
                              justify-center
                              transition
                            "
                          >

                            <InstagramIcon />

                          </a>

                        )}

                      </div>

                    </div>

                  </article>

                );
              })}

            </div>

          )}

        </section>

      </section>

    </main>
  );
}


/* ========================================================= */
/* ÍCONE WHATSAPP */
/* ========================================================= */

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="w-5 h-5 fill-current"
    >
      <path d="M12.04 2a9.84 9.84 0 0 0-8.43 14.91L2 22l5.22-1.57A9.99 9.99 0 1 0 12.04 2Zm0 17.98a8.05 8.05 0 0 1-4.1-1.12l-.29-.17-3.1.93.94-3.02-.19-.31A7.94 7.94 0 1 1 12.04 20Zm4.4-5.95c-.24-.12-1.43-.7-1.65-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.2-.47-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.43-.59 1.63-1.15.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}


/* ========================================================= */
/* ÍCONE INSTAGRAM */
/* ========================================================= */

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="w-5 h-5 fill-none stroke-current stroke-2"
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