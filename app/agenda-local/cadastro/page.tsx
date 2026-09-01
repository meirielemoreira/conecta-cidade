'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../../lib/supabase/client';

const LIMITE_FOTO = 5 * 1024 * 1024;

const LINK_PAGAMENTO_AGENDA =
  'https://mpago.la/2TZTUP6';

type FormAgenda = {
  nome_completo: string;
  profissao: string;
  whatsapp: string;
  instagram: string;
  endereco: string;
  descricao: string;
};

export default function CadastroAgendaLocal() {
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [verificandoLogin, setVerificandoLogin] =
    useState(true);

  const [userId, setUserId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<FormAgenda>({
      nome_completo: '',
      profissao: '',
      whatsapp: '',
      instagram: '',
      endereco: '',
      descricao: '',
    });

  const [foto, setFoto] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState('');

  /*
   * =====================================================
   * VERIFICAR LOGIN ANTES DE MOSTRAR O FORMULÁRIO
   * =====================================================
   */

  useEffect(() => {
    let ativo = true;

    const verificarConta = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!ativo) {
          return;
        }

        if (error || !user) {
          router.replace(
            '/login?redirect=/agenda-local/cadastro'
          );

          return;
        }

        setUserId(user.id);

        /*
         * Se possível, aproveitamos os dados já
         * cadastrados no perfil da pessoa.
         */
        const {
          data: profile,
        } = await supabase
          .from('profiles')
          .select(
            'nome, telefone'
          )
          .eq('id', user.id)
          .maybeSingle();

        if (
          ativo &&
          profile
        ) {
          setForm((formAtual) => ({
            ...formAtual,

            nome_completo:
              formAtual.nome_completo ||
              profile.nome ||
              '',

            whatsapp:
              formAtual.whatsapp ||
              profile.telefone ||
              '',
          }));
        }
      } catch (error) {
        console.error(
          'Erro ao verificar usuário:',
          error
        );

        if (ativo) {
          router.replace(
            '/login?redirect=/agenda-local/cadastro'
          );
        }
      } finally {
        if (ativo) {
          setVerificandoLogin(false);
        }
      }
    };

    verificarConta();

    return () => {
      ativo = false;
    };
  }, [router, supabase]);

  /*
   * =====================================================
   * CAMPOS
   * =====================================================
   */

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

    setForm((formAtual) => ({
      ...formAtual,
      [name]: value,
    }));
  };

  /*
   * =====================================================
   * FOTO
   * =====================================================
   */

  const handleFotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const arquivo =
      event.target.files?.[0];

    setErrorMsg('');

    if (!arquivo) {
      setFoto(null);
      setPreview(null);
      return;
    }

    if (
      !arquivo.type.startsWith(
        'image/'
      )
    ) {
      event.target.value = '';

      setFoto(null);
      setPreview(null);

      setErrorMsg(
        'Selecione uma imagem válida.'
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

  /*
   * =====================================================
   * CADASTRAR
   * =====================================================
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (!userId) {
      router.push(
        '/login?redirect=/agenda-local/cadastro'
      );

      return;
    }

    const nomeCompleto =
      form.nome_completo.trim();

    const profissao =
      form.profissao.trim();

    const whatsapp =
      form.whatsapp.trim();

    const instagram =
      form.instagram.trim();

    const endereco =
      form.endereco.trim();

    const descricao =
      form.descricao.trim();

    if (
      !nomeCompleto ||
      !profissao ||
      !whatsapp ||
      !foto
    ) {
      setErrorMsg(
        'Preencha os campos obrigatórios e envie uma foto.'
      );

      return;
    }

    setLoading(true);
    setErrorMsg('');

    let arquivoStorage:
      string | null = null;

    try {
      /*
       * Confere novamente a sessão
       * antes de gravar.
       */
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (
        userError ||
        !user
      ) {
        router.push(
          '/login?redirect=/agenda-local/cadastro'
        );

        return;
      }

      /*
       * Verifica se esta conta já possui
       * cadastro na Agenda Local.
       */
      const {
        data: cadastroExistente,
        error: cadastroError,
      } = await supabase
        .from('agenda_local')
        .select(
          'id, aprovado, ativo, pagamento_status'
        )
        .eq(
          'profile_id',
          user.id
        )
        .limit(1)
        .maybeSingle();

      if (cadastroError) {
        throw cadastroError;
      }

      if (cadastroExistente) {
        setErrorMsg(
          'Você já possui um cadastro na Agenda Local. Em breve ele poderá ser acompanhado diretamente pela sua área Minha Conta.'
        );

        return;
      }

      /*
       * Nome seguro para o arquivo.
       */
      const extensaoOriginal =
        foto.name
          .split('.')
          .pop();

      const extensao =
        extensaoOriginal
          ?.replace(
            /[^a-zA-Z0-9]/g,
            ''
          )
          .toLowerCase() ||
        'jpg';

      const nomeLimpo =
        nomeCompleto
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
        `agenda-local/${user.id}/` +
        `${nomeLimpo}-${Date.now()}.${extensao}`;

      /*
       * Upload
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
            cacheControl:
              '3600',

            upsert: false,

            contentType:
              foto.type,
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const {
        data:
          publicUrlData,
      } = supabase.storage
        .from(
          'imagens-anuncios'
        )
        .getPublicUrl(
          arquivoStorage
        );

      const fotoUrl =
        publicUrlData.publicUrl;

      /*
       * Datas
       */
      const agora =
        new Date();

      const expiracao =
        new Date(
          agora.getTime() +
            60 *
              24 *
              60 *
              60 *
              1000
        );

      /*
       * Banco
       */
      const {
        error: insertError,
      } = await supabase
        .from(
          'agenda_local'
        )
        .insert([
          {
            profile_id:
              user.id,

            nome_completo:
              nomeCompleto,

            profissao,

            whatsapp,

            instagram:
              instagram ||
              null,

            endereco:
              endereco ||
              null,

            descricao:
              descricao ||
              null,

            foto_url:
              fotoUrl,

            plano:
              'Agenda Local',

            categoria:
              'Agenda Local',

            pagamento_status:
              'pendente',

            ativo:
              false,

            aprovado:
              false,

            data_inicio:
              agora.toISOString(),

            data_expiracao:
              expiracao.toISOString(),

            data_cadastro:
              agora.toISOString(),
          },
        ]);

      if (insertError) {
        /*
         * Remove imagem caso o banco
         * rejeite o cadastro.
         */
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

      /*
       * Após salvar, envia ao
       * Mercado Pago.
       */
      window.location.href =
        LINK_PAGAMENTO_AGENDA;
    } catch (error: unknown) {
      console.error(
        'Erro Agenda Local:',
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
          : 'Não foi possível realizar o cadastro.';

      setErrorMsg(
        mensagem
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * =====================================================
   * VERIFICANDO LOGIN
   * =====================================================
   */

  if (verificandoLogin) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />

          <p className="mt-4 font-semibold text-slate-700">
            Verificando sua conta...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Aguarde um instante.
          </p>
        </div>
      </main>
    );
  }

  /*
   * =====================================================
   * PÁGINA
   * =====================================================
   */

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-emerald-600 py-12 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-100">
            Catálogo de serviços
          </p>

          <h1 className="mt-2 text-4xl font-bold md:text-5xl">
            Agenda Local
          </h1>

          <p className="mt-3 text-lg text-emerald-100 md:text-xl">
            Cadastre seu serviço e apareça
            para toda Nova União.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-slate-900">
              Dados do profissional
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Seu cadastro ficará vinculado
              automaticamente à sua conta
              Conecta Cidade.
            </p>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-6"
          >
            <Campo
              label="Nome completo *"
              name="nome_completo"
              value={
                form.nome_completo
              }
              onChange={
                handleInputChange
              }
              placeholder="Digite seu nome completo"
              required
            />

            <Campo
              label="Profissão / Serviço *"
              name="profissao"
              value={
                form.profissao
              }
              onChange={
                handleInputChange
              }
              placeholder="Ex.: Eletricista, dentista, salão de beleza"
              required
            />

            <Campo
              label="WhatsApp *"
              name="whatsapp"
              value={
                form.whatsapp
              }
              onChange={
                handleInputChange
              }
              placeholder="(31) 99999-9999"
              type="tel"
              required
            />

            <Campo
              label="Instagram"
              name="instagram"
              value={
                form.instagram
              }
              onChange={
                handleInputChange
              }
              placeholder="@seuperfil"
            />

            <Campo
              label="Endereço"
              name="endereco"
              value={
                form.endereco
              }
              onChange={
                handleInputChange
              }
              placeholder="Rua, bairro ou ponto de referência"
            />

            <div>
              <label
                htmlFor="descricao"
                className="mb-2 block font-semibold text-slate-800"
              >
                Descrição dos serviços
              </label>

              <textarea
                id="descricao"
                name="descricao"
                value={
                  form.descricao
                }
                onChange={
                  handleInputChange
                }
                maxLength={600}
                rows={5}
                placeholder="Explique quais serviços você presta."
                className="w-full resize-y rounded-2xl border border-slate-300 px-4 py-4 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />

              <p className="mt-1 text-right text-xs text-slate-500">
                {
                  form
                    .descricao
                    .length
                }
                /600 caracteres
              </p>
            </div>

            <div>
              <label
                htmlFor="foto"
                className="mb-2 block font-semibold text-slate-800"
              >
                Foto do profissional ou
                serviço *
              </label>

              <input
                id="foto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleFotoChange
                }
                className="w-full rounded-2xl border border-slate-300 px-4 py-4"
                required
              />

              <p className="mt-2 text-xs leading-relaxed text-slate-500">
                JPG, PNG ou WebP • máximo
                de 5 MB. Recomendamos uma
                imagem quadrada com pelo
                menos 800 × 800 pixels.
              </p>

              {preview && (
                <img
                  src={preview}
                  alt="Prévia da foto"
                  className="mt-4 h-44 w-44 rounded-2xl border border-slate-200 object-cover shadow-sm"
                />
              )}
            </div>

            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm leading-relaxed text-sky-900">
              <strong>
                Plano Agenda Local —
                R$ 19,90
              </strong>

              <br />

              Até 60 dias de divulgação,
              com foto, WhatsApp e
              Instagram. O cadastro será
              analisado antes da publicação.
            </div>

            {errorMsg && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-red-700">
                <p className="font-semibold">
                  {errorMsg}
                </p>

                <Link
                  href="/minha-conta"
                  className="mt-3 inline-flex font-semibold text-orange-600 hover:text-orange-700"
                >
                  Ir para Minha Conta →
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading
              }
              className="w-full rounded-2xl bg-emerald-600 py-5 text-lg font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading
                ? 'Salvando cadastro...'
                : 'Continuar para pagamento'}
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
  name: keyof FormAgenda;
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
        className="mb-2 block font-semibold text-slate-800"
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