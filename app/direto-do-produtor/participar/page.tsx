'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';

const LIMITE_PRODUTORES_ATIVOS = 10;
const DURACAO_DIVULGACAO_DIAS = 30;
const LIMITE_FOTO = 5 * 1024 * 1024;

type FormProdutor = {
  nome_produtor: string;
  telefone: string;
  cidade: string;
  localidade: string;
  endereco: string;
  categoria: string;
  produto: string;
  descricao: string;
};

type MotivoBloqueio =
  | 'gratuito-anuncio'
  | 'direto-produtor'
  | null;

export default function ParticiparDiretoDoProdutor() {
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [verificandoConta, setVerificandoConta] =
    useState(true);

  const [userId, setUserId] =
    useState<string | null>(null);

  const [motivoBloqueio, setMotivoBloqueio] =
    useState<MotivoBloqueio>(null);

  const [form, setForm] =
    useState<FormProdutor>({
      nome_produtor: '',
      telefone: '',
      cidade: 'Nova União',
      localidade: '',
      endereco: '',
      categoria: '',
      produto: '',
      descricao: '',
    });

  const [foto, setFoto] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [aceitouRegras, setAceitouRegras] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState('');

  const [successMsg, setSuccessMsg] =
    useState('');

  const [entrouListaEspera, setEntrouListaEspera] =
    useState(false);

  /* =====================================================
     VERIFICAR LOGIN E DIREITO À GRATUIDADE
  ===================================================== */

  useEffect(() => {
    let ativo = true;

    const verificarConta = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!ativo) {
          return;
        }

        if (userError || !user) {
          router.replace(
            '/login?redirect=/direto-do-produtor/participar'
          );

          return;
        }

        setUserId(user.id);

        /*
         * Dados do perfil para facilitar
         * o preenchimento.
         */
        const {
          data: profile,
        } = await supabase
          .from('profiles')
          .select(`
            nome,
            telefone,
            cidade
          `)
          .eq('id', user.id)
          .maybeSingle();

        if (ativo && profile) {
          setForm((atual) => ({
            ...atual,

            nome_produtor:
              atual.nome_produtor ||
              profile.nome ||
              '',

            telefone:
              atual.telefone ||
              profile.telefone ||
              '',

            cidade:
              atual.cidade ||
              profile.cidade ||
              'Nova União',
          }));
        }

        /*
         * REGRA 1:
         * já usou anúncio gratuito de 7 dias?
         */
        const {
          data: anuncioGratuito,
          error: erroAnuncio,
        } = await supabase
          .from('anuncios')
          .select('id')
          .eq('profile_id', user.id)
          .eq('plano_usado', 'Gratuito')
          .limit(1)
          .maybeSingle();

        if (erroAnuncio) {
          throw erroAnuncio;
        }

        if (anuncioGratuito) {
          if (ativo) {
            setMotivoBloqueio(
              'gratuito-anuncio'
            );
          }

          return;
        }

        /*
         * REGRA 2:
         * já participou do Direto do Produtor?
         *
         * O histórico permanece no banco mesmo
         * depois de encerrado.
         */
        const {
          data: participacaoAnterior,
          error: erroParticipacao,
        } = await supabase
          .from('direto_produtor')
          .select('id, status')
          .eq('profile_id', user.id)
          .limit(1)
          .maybeSingle();

        if (erroParticipacao) {
          throw erroParticipacao;
        }

        if (
          participacaoAnterior &&
          ativo
        ) {
          setMotivoBloqueio(
            'direto-produtor'
          );

          return;
        }

        if (ativo) {
          setMotivoBloqueio(null);
        }
      } catch (error) {
        console.error(
          'Erro ao verificar benefício gratuito:',
          error
        );

        if (ativo) {
          setErrorMsg(
            'Não foi possível verificar sua conta neste momento. Atualize a página e tente novamente.'
          );
        }
      } finally {
        if (ativo) {
          setVerificandoConta(false);
        }
      }
    };

    verificarConta();

    return () => {
      ativo = false;
    };
  }, [router, supabase]);

  /* =====================================================
     CAMPOS
  ===================================================== */

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement
    >
  ) => {
    const {
      name,
      value,
    } = event.target;

    setErrorMsg('');

    setForm((atual) => ({
      ...atual,
      [name]: value,
    }));
  };

  /* =====================================================
     FOTO
  ===================================================== */

  const handleFotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const arquivo =
      event.target.files?.[0];

    setErrorMsg('');

    if (!arquivo) {
      return;
    }

    if (
      !arquivo.type.startsWith('image/')
    ) {
      event.target.value = '';

      setFoto(null);
      setPreview(null);

      setErrorMsg(
        'Envie um arquivo de imagem válido.'
      );

      return;
    }

    if (
      arquivo.size >
      LIMITE_FOTO
    ) {
      event.target.value = '';

      setFoto(null);
      setPreview(null);

      setErrorMsg(
        'A imagem deve ter no máximo 5 MB.'
      );

      return;
    }

    if (preview) {
      URL.revokeObjectURL(
        preview
      );
    }

    setFoto(arquivo);

    setPreview(
      URL.createObjectURL(
        arquivo
      )
    );
  };

  /* =====================================================
     LIMPAR FORMULÁRIO
  ===================================================== */

  const limparFormulario = () => {
    setForm({
      nome_produtor: '',
      telefone: '',
      cidade: 'Nova União',
      localidade: '',
      endereco: '',
      categoria: '',
      produto: '',
      descricao: '',
    });

    if (preview) {
      URL.revokeObjectURL(
        preview
      );
    }

    setFoto(null);
    setPreview(null);
    setAceitouRegras(false);
  };

  /* =====================================================
     CADASTRO
  ===================================================== */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');

    if (!userId) {
      router.push(
        '/login?redirect=/direto-do-produtor/participar'
      );

      return;
    }

    if (motivoBloqueio) {
      setErrorMsg(
        'Esta conta não está disponível para uma nova participação gratuita.'
      );

      return;
    }

    if (
      !form.nome_produtor.trim() ||
      !form.telefone.trim() ||
      !form.cidade.trim() ||
      !form.categoria.trim() ||
      !form.produto.trim() ||
      !form.descricao.trim() ||
      !foto
    ) {
      setErrorMsg(
        'Preencha todos os campos obrigatórios e envie uma foto do produto.'
      );

      return;
    }

    if (!aceitouRegras) {
      setErrorMsg(
        'Leia e aceite as regras para enviar o cadastro.'
      );

      return;
    }

    setLoading(true);

    let arquivoStorage:
      string | null = null;

    try {
      /*
       * CONFIRMA A SESSÃO NOVAMENTE
       */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push(
          '/login?redirect=/direto-do-produtor/participar'
        );

        return;
      }

      /*
       * REVALIDAÇÃO:
       * evita tentar contornar a regra
       * mantendo a página aberta.
       */
      const [
        resultadoAnuncioGratuito,
        resultadoParticipacao,
      ] = await Promise.all([
        supabase
          .from('anuncios')
          .select('id')
          .eq('profile_id', user.id)
          .eq('plano_usado', 'Gratuito')
          .limit(1)
          .maybeSingle(),

        supabase
          .from('direto_produtor')
          .select('id')
          .eq('profile_id', user.id)
          .limit(1)
          .maybeSingle(),
      ]);

      if (
        resultadoAnuncioGratuito.error
      ) {
        throw resultadoAnuncioGratuito.error;
      }

      if (
        resultadoParticipacao.error
      ) {
        throw resultadoParticipacao.error;
      }

      if (
        resultadoAnuncioGratuito.data
      ) {
        setMotivoBloqueio(
          'gratuito-anuncio'
        );

        setErrorMsg(
          'Sua conta já utilizou o Plano Gratuito de anúncios e, por isso, não pode utilizar também a participação gratuita do Direto do Produtor.'
        );

        return;
      }

      if (
        resultadoParticipacao.data
      ) {
        setMotivoBloqueio(
          'direto-produtor'
        );

        setErrorMsg(
          'Sua conta já participou do Direto do Produtor. A participação gratuita é disponibilizada uma vez por conta.'
        );

        return;
      }

      /*
       * CONSULTA QUANTOS PRODUTORES
       * ESTÃO ATIVOS.
       */
      const {
        count: totalAtivos,
        error: erroContagem,
      } = await supabase
        .from('direto_produtor')
        .select(
          'id',
          {
            count: 'exact',
            head: true,
          }
        )
        .eq('ativo', true)
        .eq('status', 'Ativo');

      if (erroContagem) {
        throw erroContagem;
      }

      const listaCheia =
        (totalAtivos || 0) >=
        LIMITE_PRODUTORES_ATIVOS;

      /*
       * NOME DO ARQUIVO
       */
      const fileExt =
        foto.name
          .split('.')
          .pop()
          ?.replace(
            /[^a-zA-Z0-9]/g,
            ''
          )
          .toLowerCase() ||
        'jpg';

      const nomeArquivo =
        form.nome_produtor
          .normalize('NFD')
          .replace(
            /[\u0300-\u036f]/g,
            ''
          )
          .replace(
            /[^a-zA-Z0-9]+/g,
            '-'
          )
          .replace(
            /^-+|-+$/g,
            ''
          )
          .toLowerCase();

      const produtoArquivo =
        form.produto
          .normalize('NFD')
          .replace(
            /[\u0300-\u036f]/g,
            ''
          )
          .replace(
            /[^a-zA-Z0-9]+/g,
            '-'
          )
          .replace(
            /^-+|-+$/g,
            ''
          )
          .toLowerCase();

      arquivoStorage =
        `direto-produtor/${user.id}/` +
        `${nomeArquivo}-${produtoArquivo}-${Date.now()}.${fileExt}`;

      /*
       * UPLOAD
       */
      const {
        error: uploadError,
      } = await supabase.storage
        .from(
          'imagens-anuncios'
        )
        .upload(
          arquivoStorage,
          foto,
          {
            cacheControl: '3600',
            upsert: false,
            contentType:
              foto.type,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from(
          'imagens-anuncios'
        )
        .getPublicUrl(
          arquivoStorage
        );

      const imagemUrl =
        publicUrlData.publicUrl;

      /*
       * As datas são criadas aqui como
       * referência inicial.
       *
       * Na próxima etapa vamos ajustar o
       * Admin para REINICIAR os 30 dias
       * quando o produtor for efetivamente
       * ativado.
       */
      const agora =
        new Date();

      const vencimento =
        new Date(
          agora.getTime() +
            DURACAO_DIVULGACAO_DIAS *
              24 *
              60 *
              60 *
              1000
        );

      /*
       * TODOS entram inicialmente como
       * Aguardando.
       *
       * O Admin decide a aprovação.
       */
      const {
        error: insertError,
      } = await supabase
        .from(
          'direto_produtor'
        )
        .insert([
          {
            profile_id:
              user.id,

            produto:
              form.produto.trim(),

            categoria:
              form.categoria.trim(),

            nome_produtor:
              form.nome_produtor.trim(),

            telefone:
              form.telefone.trim(),

            cidade:
              form.cidade.trim(),

            localidade:
              form.localidade.trim() ||
              null,

            endereco:
              form.endereco.trim() ||
              null,

            descricao:
              form.descricao.trim(),

            imagem_url:
              imagemUrl,

            data_inicio:
              agora.toISOString(),

            data_vencimento:
              vencimento.toISOString(),

            ativo: false,

            status:
              'Aguardando',

            observacao:
              listaCheia
                ? 'Lista de espera automática — 10 vagas ocupadas no momento do cadastro.'
                : 'Aguardando análise e aprovação da administração.',
          },
        ]);

      if (insertError) {
        await supabase.storage
          .from(
            'imagens-anuncios'
          )
          .remove([
            arquivoStorage,
          ]);

        arquivoStorage =
          null;

        throw insertError;
      }

      setEntrouListaEspera(
        listaCheia
      );

      limparFormulario();

      if (listaCheia) {
        setSuccessMsg(
          'Cadastro recebido! As 10 vagas estão ocupadas neste momento, então você entrou na lista de espera. Quando uma vaga for liberada, os cadastros serão considerados pela ordem de chegada e continuarão sujeitos à aprovação da administração.'
        );
      } else {
        setSuccessMsg(
          'Cadastro recebido com sucesso! Ele foi encaminhado para análise da administração. Se aprovado, seu produto poderá ficar divulgado gratuitamente por até 30 dias.'
        );
      }
    } catch (error: unknown) {
      console.error(
        'Erro ao cadastrar produtor:',
        error
      );

      if (arquivoStorage) {
        await supabase.storage
          .from(
            'imagens-anuncios'
          )
          .remove([
            arquivoStorage,
          ]);
      }

      const mensagem =
        error instanceof Error
          ? error.message
          : 'Erro ao enviar o cadastro. Tente novamente.';

      setErrorMsg(
        mensagem
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     VERIFICANDO LOGIN
  ===================================================== */

  if (verificandoConta) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

          <p className="mt-4 font-semibold text-slate-700">
            Verificando sua conta...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Estamos verificando sua elegibilidade
            para a participação gratuita.
          </p>
        </div>
      </main>
    );
  }

  /* =====================================================
     BLOQUEIO — JÁ USOU GRATUITO
  ===================================================== */

  if (
    motivoBloqueio ===
    'gratuito-anuncio'
  ) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <section className="rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm md:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
              🌱
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-wider text-emerald-700">
              Direto do Produtor
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Benefício gratuito já utilizado
            </h1>

            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-slate-600">
              O Direto do Produtor é uma
              oportunidade institucional e gratuita
              destinada a contas que ainda não
              utilizaram nenhuma das opções
              gratuitas do Conecta Cidade.
            </p>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
              Sua conta já utilizou o
              <strong> Plano Gratuito de anúncios</strong>.
              Por isso, uma nova gratuidade não
              está disponível para esta conta.
            </div>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/planos"
                className="rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
              >
                Conhecer planos
              </Link>

              <Link
                href="/minha-conta"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Voltar para Minha Conta
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  /* =====================================================
     BLOQUEIO — JÁ PARTICIPOU DO PROGRAMA
  ===================================================== */

  if (
    motivoBloqueio ===
    'direto-produtor'
  ) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <section className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm md:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
              🌱
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-wider text-emerald-700">
              Direto do Produtor
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Sua conta já participou
            </h1>

            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-slate-600">
              A participação gratuita do Direto
              do Produtor é disponibilizada uma
              vez por conta.
            </p>

            <p className="mt-3 text-slate-600">
              Seu histórico de participação foi
              encontrado no sistema.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/direto-do-produtor"
                className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                Ver Direto do Produtor
              </Link>

              <Link
                href="/minha-conta"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Voltar para Minha Conta
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  /* =====================================================
     FORMULÁRIO
  ===================================================== */

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-emerald-600 py-16 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Direto do Produtor
          </h1>

          <p className="text-lg text-emerald-100 md:text-xl">
            Divulgue gratuitamente o que você
            produz em Nova União e região.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">

        {/* INFORMATIVO */}

        <div className="mb-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 md:p-8">
          <h2 className="mb-3 text-xl font-bold text-emerald-800 md:text-2xl">
            🌱 O que é o Direto do Produtor?
          </h2>

          <p className="mb-4 leading-relaxed text-slate-700">
            O Direto do Produtor é um espaço
            institucional e gratuito criado para
            valorizar produtores rurais,
            agricultores familiares, artesãos e
            pequenos produtores de Nova União e
            região.
          </p>

          <p className="mb-6 leading-relaxed text-slate-700">
            O objetivo é aproximar quem produz de
            quem compra, incentivar o consumo
            local e dar mais visibilidade aos
            produtos da nossa comunidade.
          </p>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-bold text-slate-900">
              Como funciona?
            </h3>

            <ul className="space-y-2 text-sm text-slate-700 md:text-base">
              <li>
                ✓ Participação gratuita para
                contas elegíveis.
              </li>

              <li>
                ✓ 1 produto com 1 foto.
              </li>

              <li>
                ✓ Até 30 dias de divulgação.
              </li>

              <li>
                ✓ Todos os cadastros passam pela
                aprovação da administração.
              </li>

              <li>
                ✓ Até 10 produtores ativos ao
                mesmo tempo.
              </li>

              <li>
                ✓ Quando as vagas estiverem
                ocupadas, os novos cadastros
                ficam em lista de espera.
              </li>

              <li>
                ✓ A lista de espera respeita a
                ordem de chegada.
              </li>

              <li>
                ✓ A gratuidade não pode ser
                acumulada com outra opção gratuita
                já utilizada no Conecta Cidade.
              </li>
            </ul>
          </div>
        </div>

        {/* FORMULÁRIO */}

        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-2 text-center text-2xl font-bold text-slate-900 md:text-3xl">
            Cadastro do Produtor
          </h2>

          <p className="mb-8 text-center text-slate-600">
            Preencha seus dados e envie uma foto
            do produto.
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <Campo
              label="Nome do produtor *"
              name="nome_produtor"
              value={form.nome_produtor}
              onChange={handleInputChange}
              placeholder="Digite seu nome completo"
              required
            />

            <Campo
              label="WhatsApp *"
              name="telefone"
              value={form.telefone}
              onChange={handleInputChange}
              placeholder="Ex.: (31) 99999-9999"
              type="tel"
              required
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Campo
                label="Cidade *"
                name="cidade"
                value={form.cidade}
                onChange={handleInputChange}
                placeholder="Cidade"
                required
              />

              <Campo
                label="Localidade"
                name="localidade"
                value={form.localidade}
                onChange={handleInputChange}
                placeholder="Bairro, comunidade ou fazenda"
              />
            </div>

            <Campo
              label="Endereço"
              name="endereco"
              value={form.endereco}
              onChange={handleInputChange}
              placeholder="Endereço ou ponto de referência (opcional)"
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Campo
                label="Categoria *"
                name="categoria"
                value={form.categoria}
                onChange={handleInputChange}
                placeholder="Ex.: Queijos e derivados"
                required
              />

              <Campo
                label="Produto *"
                name="produto"
                value={form.produto}
                onChange={handleInputChange}
                placeholder="Ex.: Queijo frescal 1 kg"
                required
              />
            </div>

            <div>
              <label
                htmlFor="descricao"
                className="mb-2 block font-medium text-slate-800"
              >
                Descrição do produto *
              </label>

              <textarea
                id="descricao"
                name="descricao"
                value={form.descricao}
                onChange={handleInputChange}
                placeholder="Conte um pouco sobre o produto, como é produzido e como o cliente pode comprar."
                rows={5}
                maxLength={600}
                className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-4 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                required
              />

              <p className="mt-1 text-right text-xs text-slate-500">
                {form.descricao.length}/600
                caracteres
              </p>
            </div>

            <div>
              <label
                htmlFor="foto"
                className="mb-2 block font-medium text-slate-800"
              >
                Foto do produto *
              </label>

              <input
                id="foto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFotoChange}
                className="w-full rounded-2xl border border-slate-300 px-4 py-4"
                required
              />

              <p className="mt-2 text-xs text-slate-500">
                Envie uma foto nítida do produto,
                com tamanho máximo de 5 MB.
              </p>

              {preview && (
                <div className="mt-4">
                  <img
                    src={preview}
                    alt="Prévia do produto"
                    className="h-48 w-48 rounded-2xl border border-slate-200 object-cover"
                  />
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-slate-700">
              Após o envio, seu cadastro será
              analisado pela administração. A
              publicação não é automática. Se as
              10 vagas estiverem preenchidas, seu
              cadastro ficará na lista de espera
              respeitando a ordem de chegada.
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4">
              <input
                type="checkbox"
                checked={aceitouRegras}
                onChange={(event) =>
                  setAceitouRegras(
                    event.target.checked
                  )
                }
                className="mt-1 h-5 w-5 accent-emerald-600"
              />

              <span className="text-sm leading-relaxed text-slate-700">
                Li e concordo com as regras do
                Direto do Produtor, confirmo que
                as informações enviadas são
                verdadeiras e estou ciente de que
                a participação gratuita não pode
                ser acumulada com outro benefício
                gratuito já utilizado no portal.
              </span>
            </label>

            {errorMsg && (
              <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-red-700">
                {errorMsg}
              </p>
            )}

            {successMsg && (
              <div
                className={`rounded-2xl border p-5 text-center ${
                  entrouListaEspera
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                }`}
              >
                <p className="font-bold">
                  {entrouListaEspera
                    ? 'Cadastro na lista de espera!'
                    : 'Cadastro recebido!'}
                </p>

                <p className="mt-1 text-sm leading-relaxed">
                  {successMsg}
                </p>

                <Link
                  href="/minha-conta"
                  className="mt-4 inline-flex font-semibold underline"
                >
                  Ir para Minha Conta
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-emerald-600 py-5 text-lg font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading
                ? 'Enviando cadastro...'
                : 'Enviar para aprovação'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Campo({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
}: {
  label: string;
  name: keyof FormProdutor;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block font-medium text-slate-800"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-2xl border border-slate-300 px-4 py-4 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}