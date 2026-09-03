'use client';

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import type { User } from '@supabase/supabase-js';

import { createClient } from '../../lib/supabase/client';

/* =========================================================
   TIPOS
========================================================= */

type Categoria = {
  id: number;
  nome: string;
  slug: string;
};

type Plano = {
  nome: string;
  preco: string;
  descricao: string;
  observacao: string;
  fotosMax: number;
  borderClass: string;
  priceClass: string;
  buttonClass: string;
  showInstagram: boolean;
};

type Profile = {
  id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
};

type FormularioAnuncio = {
  nome: string;
  email: string;
  telefone: string;
  nome_loja: string;
  titulo: string;
  descricao: string;
  preco: string;
  instagram: string;
  categoria: string;
};

type DimensoesImagem = {
  largura: number;
  altura: number;
};

/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const CATEGORIAS_PERMITIDAS = [
  'Morar & Construir',
  'Motores & Rodas',
  'Promoções',
  'Onde é o Rolê?',
];

const TAMANHO_MAXIMO_IMAGEM = 5 * 1024 * 1024;

const LADO_MENOR_MINIMO = 600;
const LADO_MAIOR_MINIMO = 800;

const TIPOS_IMAGEM_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

/* =========================================================
   PREÇO EM FORMATO BRASILEIRO
========================================================= */

function formatarPrecoDigitado(valor: string): string {
  const somenteNumeros = valor.replace(/\D/g, '');

  if (!somenteNumeros) {
    return '';
  }

  const valorEmCentavos = Number(somenteNumeros);

  return (valorEmCentavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function converterPrecoParaNumero(valor: string): number | null {
  if (!valor.trim()) {
    return null;
  }

  const somenteNumeros = valor.replace(/\D/g, '');

  if (!somenteNumeros) {
    return null;
  }

  const valorConvertido = Number(somenteNumeros) / 100;

  return Number.isFinite(valorConvertido)
    ? valorConvertido
    : null;
}

/* =========================================================
   PÁGINA PRINCIPAL
========================================================= */

export default function AnunciarPage() {
  return (
    <Suspense fallback={<CarregandoPagina />}>
      <AnunciarConteudo />
    </Suspense>
  );
}

/* =========================================================
   CONTEÚDO DA PÁGINA
========================================================= */

function AnunciarConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const previewUrlsRef = useRef<string[]>([]);

  const [usuario, setUsuario] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [
    verificandoLogin,
    setVerificandoLogin,
  ] = useState(true);

  const [
    planoSelecionado,
    setPlanoSelecionado,
  ] = useState('Gratuito');

  const [categorias, setCategorias] =
    useState<Categoria[]>([]);

  const [
    loadingCategorias,
    setLoadingCategorias,
  ] = useState(true);

  const [loading, setLoading] =
    useState(false);

  const [errorMsg, setErrorMsg] =
    useState('');

  const [successMsg, setSuccessMsg] =
    useState('');

  const [imageErrorMsg, setImageErrorMsg] =
    useState('');

  const [imagens, setImagens] =
    useState<File[]>([]);

  const [
    previewUrls,
    setPreviewUrls,
  ] = useState<string[]>([]);

  const [form, setForm] =
    useState<FormularioAnuncio>({
      nome: '',
      email: '',
      telefone: '',
      nome_loja: '',
      titulo: '',
      descricao: '',
      preco: '',
      instagram: '',
      categoria: '',
    });

  const planos: Plano[] = [
    {
      nome: 'Gratuito',
      preco: 'R$ 0,00',
      descricao:
        '1 anúncio • 5 fotos • 7 dias',
      observacao:
        'Ideal para começar',
      fotosMax: 5,
      borderClass:
        'border-slate-300',
      priceClass:
        'text-slate-800',
      buttonClass:
        'border-slate-400 text-slate-700',
      showInstagram: false,
    },
    {
      nome: 'Impulso',
      preco: 'R$ 9,90',
      descricao:
        '1 anúncio • 5 fotos • 15 dias',
      observacao:
        'Mais visibilidade',
      fotosMax: 5,
      borderClass:
        'border-orange-500',
      priceClass:
        'text-orange-600',
      buttonClass:
        'border-orange-500 text-orange-700',
      showInstagram: false,
    },
    {
      nome: 'Vitrine',
      preco: 'R$ 19,90/mês',
      descricao:
        'WhatsApp • Instagram • 8 fotos • 30 dias',
      observacao:
        'Exposição contínua',
      fotosMax: 8,
      borderClass:
        'border-amber-400',
      priceClass:
        'text-amber-700',
      buttonClass:
        'border-amber-500 text-amber-700',
      showInstagram: true,
    },
    {
      nome: 'Exclusivo',
      preco: 'R$ 29,90/mês',
      descricao:
        'Destaque fixo • 10 fotos • Repost social',
      observacao:
        'Máximo alcance',
      fotosMax: 10,
      borderClass:
        'border-emerald-500',
      priceClass:
        'text-emerald-700',
      buttonClass:
        'border-emerald-500 text-emerald-700',
      showInstagram: true,
    },
  ];

  const planoInfo = planos.find(
    (plano) =>
      plano.nome === planoSelecionado
  );

  /* =======================================================
     LOGIN E PROFILE
  ======================================================= */

  useEffect(() => {
    let componenteAtivo = true;

    const verificarUsuario = async () => {
      setVerificandoLogin(true);
      setErrorMsg('');

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          const planoUrl =
            searchParams.get('plano');

          const categoriaUrl =
            searchParams.get('categoria');

          const parametros = new URLSearchParams();

          if (planoUrl) {
            parametros.set('plano', planoUrl);
          }

          if (categoriaUrl) {
            parametros.set(
              'categoria',
              categoriaUrl
            );
          }

          const destino = parametros.toString()
            ? `/anunciar?${parametros.toString()}`
            : '/anunciar';

          router.replace(
            `/login?redirect=${encodeURIComponent(
              destino
            )}`
          );

          return;
        }

        if (!componenteAtivo) {
          return;
        }

        setUsuario(user);

        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from('profiles')
          .select(`
            id,
            nome,
            email,
            telefone,
            cidade,
            estado,
            ativo
          `)
          .eq('id', user.id)
          .maybeSingle<Profile>();

        if (profileError) {
          throw profileError;
        }

        if (!profileData) {
          throw new Error(
            'Seu perfil não foi encontrado. Entre novamente ou procure o atendimento.'
          );
        }

        if (!profileData.ativo) {
          throw new Error(
            'Sua conta está desativada. Procure o atendimento do Conecta Cidade.'
          );
        }

        if (!componenteAtivo) {
          return;
        }

        setProfile(profileData);

        setForm((formAtual) => ({
          ...formAtual,

          nome:
            profileData.nome ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            '',

          email:
            profileData.email ||
            user.email ||
            '',

          telefone:
            profileData.telefone ||
            '',
        }));
      } catch (error: unknown) {
        const mensagem =
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar sua conta.';

        if (componenteAtivo) {
          setErrorMsg(mensagem);
        }
      } finally {
        if (componenteAtivo) {
          setVerificandoLogin(false);
        }
      }
    };

    verificarUsuario();

    return () => {
      componenteAtivo = false;
    };
  }, [
    router,
    searchParams,
    supabase,
  ]);

  /* =======================================================
     CARREGAR SOMENTE AS CATEGORIAS DE ANÚNCIOS
  ======================================================= */

  useEffect(() => {
    let componenteAtivo = true;

    const carregarCategorias = async () => {
      setLoadingCategorias(true);

      const { data, error } =
        await supabase
          .from('categorias')
          .select('id, nome, slug')
          .eq('ativa', true)
          .in(
            'nome',
            CATEGORIAS_PERMITIDAS
          )
          .order('ordem', {
            ascending: true,
          });

      if (!componenteAtivo) {
        return;
      }

      if (error) {
        console.error(
          'Erro ao carregar categorias:',
          error
        );

        setErrorMsg(
          'Não foi possível carregar as categorias.'
        );
      } else {
        const categoriasFiltradas =
          (data || []).filter(
            (categoria) =>
              CATEGORIAS_PERMITIDAS.includes(
                categoria.nome
              )
          );

        setCategorias(categoriasFiltradas);
      }

      setLoadingCategorias(false);
    };

    carregarCategorias();

    return () => {
      componenteAtivo = false;
    };
  }, [supabase]);

  /* =======================================================
     PLANO E CATEGORIA RECEBIDOS PELA URL
  ======================================================= */

  useEffect(() => {
    const planoUrl =
      searchParams.get('plano');

    if (
      planoUrl &&
      planos.some(
        (plano) =>
          plano.nome === planoUrl
      )
    ) {
      setPlanoSelecionado(planoUrl);
    }

    const categoriaUrl =
      searchParams.get('categoria');

    if (
      categoriaUrl &&
      CATEGORIAS_PERMITIDAS.includes(
        categoriaUrl
      )
    ) {
      setForm((formAtual) => ({
        ...formAtual,
        categoria: categoriaUrl,
      }));
    }
  }, [searchParams]);

  /* =======================================================
     CONTROLE DAS URLS TEMPORÁRIAS
  ======================================================= */

  useEffect(() => {
    previewUrlsRef.current =
      previewUrls;
  }, [previewUrls]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach(
        (url) => {
          URL.revokeObjectURL(url);
        }
      );
    };
  }, []);

  /* =======================================================
     ALTERAÇÃO DOS CAMPOS
  ======================================================= */

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } =
      event.target;

    setErrorMsg('');
    setSuccessMsg('');

    setForm((formAtual) => ({
      ...formAtual,
      [name]: value,
    }));
  };

  /* =======================================================
     ALTERAÇÃO DO PREÇO
  ======================================================= */

  const handlePrecoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const valorFormatado =
      formatarPrecoDigitado(
        event.target.value
      );

    setErrorMsg('');
    setSuccessMsg('');

    setForm((formAtual) => ({
      ...formAtual,
      preco: valorFormatado,
    }));
  };

  /* =======================================================
     LEITURA DAS DIMENSÕES DA IMAGEM
  ======================================================= */

  const lerDimensoesImagem = (
    file: File
  ): Promise<DimensoesImagem> => {
    return new Promise(
      (resolve, reject) => {
        const url =
          URL.createObjectURL(file);

        const imagem = new Image();

        imagem.onload = () => {
          const largura =
            imagem.naturalWidth;

          const altura =
            imagem.naturalHeight;

          URL.revokeObjectURL(url);

          resolve({
            largura,
            altura,
          });
        };

        imagem.onerror = () => {
          URL.revokeObjectURL(url);

          reject(
            new Error(
              `Não foi possível analisar a imagem "${file.name}".`
            )
          );
        };

        imagem.src = url;
      }
    );
  };

  /* =======================================================
     SELEÇÃO E VALIDAÇÃO DAS FOTOS
  ======================================================= */

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files) {
      return;
    }

    const input = event.target;

    if (!planoInfo) {
      const mensagem =
        'Selecione um plano antes de escolher as fotos.';

      setErrorMsg(mensagem);
      setImageErrorMsg(mensagem);

      input.value = '';
      return;
    }

    const files = Array.from(
      input.files ?? []
    );

    if (
      imagens.length + files.length >
      planoInfo.fotosMax
    ) {
      const mensagem =
        `O Plano ${planoSelecionado} permite no máximo ${planoInfo.fotosMax} fotos.`;

      setErrorMsg(mensagem);
      setImageErrorMsg(mensagem);

      input.value = '';
      return;
    }

    try {
      setImageErrorMsg('');

      for (const file of files) {
        if (
          !TIPOS_IMAGEM_PERMITIDOS.includes(
            file.type
          )
        ) {
          throw new Error(
            `O arquivo "${file.name}" não está em um formato permitido. Utilize JPG, PNG ou WEBP.`
          );
        }

        if (
          file.size >
          TAMANHO_MAXIMO_IMAGEM
        ) {
          throw new Error(
            `A foto "${file.name}" ultrapassa o limite de 5 MB.`
          );
        }

        const {
          largura,
          altura,
        } =
          await lerDimensoesImagem(
            file
          );

        const ladoMenor = Math.min(
          largura,
          altura
        );

        const ladoMaior = Math.max(
          largura,
          altura
        );

        if (
          ladoMenor <
            LADO_MENOR_MINIMO ||
          ladoMaior <
            LADO_MAIOR_MINIMO
        ) {
          throw new Error(
            `A foto "${file.name}" possui resolução muito baixa (${largura} × ${altura} px). Utilize pelo menos 800 × 600 pixels.`
          );
        }
      }

      const novasUrls = files.map(
        (file) =>
          URL.createObjectURL(file)
      );

      setImagens(
        (imagensAtuais) => [
          ...imagensAtuais,
          ...files,
        ]
      );

      setPreviewUrls(
        (urlsAtuais) => [
          ...urlsAtuais,
          ...novasUrls,
        ]
      );

      setErrorMsg('');
      setImageErrorMsg('');

      setSuccessMsg(
        `${files.length} foto(s) adicionada(s) com sucesso.`
      );
    } catch (error: unknown) {
      const mensagem =
        error instanceof Error
          ? error.message
          : 'Não foi possível adicionar as imagens.';

      setErrorMsg(mensagem);
      setImageErrorMsg(mensagem);
    } finally {
      input.value = '';
    }
  };

  /* =======================================================
     REMOVER FOTO
  ======================================================= */

  const removeImage = (
    index: number
  ) => {
    const url =
      previewUrls[index];

    if (url) {
      URL.revokeObjectURL(url);
    }

    setImagens(
      (imagensAtuais) =>
        imagensAtuais.filter(
          (_, indice) =>
            indice !== index
        )
    );

    setPreviewUrls(
      (urlsAtuais) =>
        urlsAtuais.filter(
          (_, indice) =>
            indice !== index
        )
    );

    setSuccessMsg('');
  };

  /* =======================================================
     DEFINIR TIPO DO ANÚNCIO
  ======================================================= */

  const definirTipo = (
    categoria: string
  ) => {
    switch (categoria) {
      case 'Morar & Construir':
        return 'imovel';

      case 'Motores & Rodas':
        return 'veiculo';

      case 'Onde é o Rolê?':
        return 'evento';

      case 'Promoções':
      default:
        return 'promocao';
    }
  };

  /* =======================================================
     ATUALIZAR NOME E TELEFONE NO PROFILE
  ======================================================= */

  const atualizarDadosDoProfile =
    async () => {
      if (!usuario) {
        throw new Error(
          'Sua sessão expirou. Entre novamente.'
        );
      }

      const nomeLimpo =
        form.nome.trim();

      const telefoneLimpo =
        form.telefone.trim();

      const dadosMudaram =
        nomeLimpo !==
          (profile?.nome || '') ||
        telefoneLimpo !==
          (profile?.telefone || '');

      if (!dadosMudaram) {
        return;
      }

      const { error } =
        await supabase
          .from('profiles')
          .update({
            nome: nomeLimpo,
            telefone:
              telefoneLimpo,
            updated_at:
              new Date().toISOString(),
          })
          .eq('id', usuario.id);

      if (error) {
        throw new Error(
          `Não foi possível atualizar seus dados: ${error.message}`
        );
      }

      setProfile(
        (profileAtual) =>
          profileAtual
            ? {
                ...profileAtual,
                nome: nomeLimpo,
                telefone:
                  telefoneLimpo,
              }
            : profileAtual
      );
    };

  /* =======================================================
     ENVIO DAS IMAGENS PARA O STORAGE
  ======================================================= */

  const enviarImagens = async (
    profileId: string
  ) => {
    const imageUrls: string[] = [];

    for (const file of imagens) {
      const extensaoOriginal =
        file.name
          .split('.')
          .pop()
          ?.toLowerCase();

      const extensao =
        extensaoOriginal &&
        [
          'jpg',
          'jpeg',
          'png',
          'webp',
        ].includes(extensaoOriginal)
          ? extensaoOriginal
          : 'jpg';

      const identificador =
        typeof crypto !==
          'undefined' &&
        'randomUUID' in crypto
          ? crypto.randomUUID()
          : Math.random()
              .toString(36)
              .slice(2);

      const fileName =
        `${profileId}/` +
        `${Date.now()}-${identificador}.${extensao}`;

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from(
            'imagens-anuncios'
          )
          .upload(
            fileName,
            file,
            {
              cacheControl:
                '3600',
              upsert: false,
              contentType:
                file.type,
            }
          );

      if (uploadError) {
        throw new Error(
          `Erro ao enviar "${file.name}": ${uploadError.message}`
        );
      }

      const {
        data: publicUrlData,
      } =
        supabase.storage
          .from(
            'imagens-anuncios'
          )
          .getPublicUrl(
            fileName
          );

      imageUrls.push(
        publicUrlData.publicUrl
      );
    }

    return imageUrls;
  };

  /* =======================================================
     ENVIO DO FORMULÁRIO
  ======================================================= */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMsg('');
    setSuccessMsg('');

    if (!usuario || !profile) {
      setErrorMsg(
        'Sua conta não foi carregada. Entre novamente.'
      );

      return;
    }

    if (!planoSelecionado) {
      setErrorMsg(
        'Selecione um plano.'
      );

      return;
    }

    if (
      !form.categoria ||
      !CATEGORIAS_PERMITIDAS.includes(
        form.categoria
      )
    ) {
      setErrorMsg(
        'Selecione uma categoria válida.'
      );

      return;
    }

    if (!form.nome.trim()) {
      setErrorMsg(
        'Informe seu nome.'
      );

      return;
    }

    if (
      !form.telefone.trim()
    ) {
      setErrorMsg(
        'Informe seu WhatsApp ou telefone.'
      );

      return;
    }

    if (
      !form.nome_loja.trim()
    ) {
      setErrorMsg(
        'Informe o nome do negócio ou produto.'
      );

      return;
    }

    if (!form.titulo.trim()) {
      setErrorMsg(
        'Informe o título do anúncio.'
      );

      return;
    }

    if (
      form.categoria ===
        'Onde é o Rolê?' &&
      imagens.length === 0
    ) {
      setErrorMsg(
        'Cadastros de Onde é o Rolê? precisam ter pelo menos uma foto.'
      );

      return;
    }

    if (
      planoSelecionado !==
        'Gratuito' &&
      imagens.length === 0
    ) {
      setErrorMsg(
        'Anúncios pagos precisam ter pelo menos uma foto.'
      );

      return;
    }

    setLoading(true);

    try {
      const {
        data: {
          user: usuarioAtual,
        },
        error: sessionError,
      } =
        await supabase.auth.getUser();

      if (
        sessionError ||
        !usuarioAtual ||
        usuarioAtual.id !==
          usuario.id
      ) {
        const parametros =
          new URLSearchParams();

        parametros.set(
          'plano',
          planoSelecionado
        );

        parametros.set(
          'categoria',
          form.categoria
        );

        router.replace(
          `/login?redirect=${encodeURIComponent(
            `/anunciar?${parametros.toString()}`
          )}`
        );

        return;
      }

      await atualizarDadosDoProfile();

      const imageUrls =
        await enviarImagens(
          usuarioAtual.id
        );

      const precoValido =
        converterPrecoParaNumero(
          form.preco
        );

      const {
        data: anuncioCriado,
        error: anuncioError,
      } = await supabase
        .from('anuncios')
        .insert([
          {
            profile_id:
              usuarioAtual.id,

            tipo: definirTipo(
              form.categoria
            ),

            titulo:
              form.titulo.trim(),

            descricao:
              form.descricao.trim(),

            preco: precoValido,

            nome_loja:
              form.nome_loja.trim(),

            telefone:
              form.telefone.trim(),

            email:
              profile.email ||
              usuarioAtual.email ||
              form.email.trim(),

            instagram:
              planoInfo?.showInstagram
                ? form.instagram.trim()
                : '',

            imagens: imageUrls,

            cidade:
              profile.cidade ||
              'Nova União',

            estado:
              profile.estado ||
              'MG',

            plano_usado:
              planoSelecionado,

            categoria:
              form.categoria,

            status: 'pendente',

            payment_status:
              planoSelecionado ===
              'Gratuito'
                ? 'pago'
                : 'pendente',

            aprovado: false,

            ativo: true,
          },
        ])
        .select('id')
        .single();

      if (anuncioError) {
        throw new Error(
          `Não foi possível cadastrar o anúncio: ${anuncioError.message}`
        );
      }

      router.push(
        `/novo-anuncio?user_id=${usuarioAtual.id}` +
          `&anuncio_id=${anuncioCriado.id}` +
          `&plano=${encodeURIComponent(
            planoSelecionado
          )}`
      );
    } catch (error: unknown) {
      console.error(
        'Erro ao cadastrar anúncio:',
        error
      );

      const mensagem =
        error instanceof Error
          ? error.message
          : 'Erro ao cadastrar o anúncio. Tente novamente.';

      setErrorMsg(mensagem);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     CARREGAMENTO
  ======================================================= */

  if (verificandoLogin) {
    return <CarregandoPagina />;
  }

  /* =======================================================
     INTERFACE
  ======================================================= */

  return (
    <main className="min-h-screen bg-slate-100 pb-20 font-sans text-slate-800">
      {/* HERO */}

      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 py-8 text-white shadow-md md:py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 text-center">
          <h1 className="mx-auto w-full max-w-6xl text-center text-3xl font-extrabold uppercase leading-tight tracking-tight md:text-5xl">
            Impulsione seu negócio em Nova União!
          </h1>

          <p className="mx-auto mt-2 w-full max-w-4xl text-center text-sm font-medium uppercase tracking-wide text-slate-300 md:text-base">
            Alcance toda a cidade e região com nosso portal de serviços e produtos.
          </p>
        </div>
      </section>

      {/* TRÊS COLUNAS */}

      <div className="mx-auto max-w-[1500px] px-4 py-10 md:px-6">
        <div className="grid items-start gap-7 lg:grid-cols-12">
          {/* CARD FORMULÁRIO */}

          <section className="lg:col-span-5">
            <div className="rounded-2xl border border-sky-300 bg-white p-5 shadow-lg md:p-7">
              <FaixaCard
                texto="Reserve seu espaço publicitário agora!"
                classe="bg-sky-700"
              />

              <p className="mt-3 text-center text-sm font-medium text-slate-700">
                Escolha abaixo o que mais se encaixa com seu negócio.
              </p>

              {/* CONTA */}

              {usuario && (
                <div className="mt-5 rounded-xl border border-sky-200 bg-sky-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-sky-700">
                    Conta conectada
                  </p>

                  <div className="mt-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-bold text-slate-900">
                        {form.nome ||
                          'Usuário Conecta Cidade'}
                      </p>

                      <p className="text-xs text-slate-600">
                        {form.email}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          '/minha-conta'
                        )
                      }
                      className="text-left text-xs font-bold text-sky-700 hover:underline"
                    >
                      Abrir minha conta
                    </button>
                  </div>
                </div>
              )}

              {/* PLANOS */}

              <div className="mt-6">
                <h2 className="mb-3 text-sm font-bold text-slate-800">
                  Escolha um plano
                </h2>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {planos.map(
                    (plano) => {
                      const selecionado =
                        planoSelecionado ===
                        plano.nome;

                      return (
                        <button
                          type="button"
                          key={plano.nome}
                          onClick={() => {
                            setPlanoSelecionado(
                              plano.nome
                            );

                            setErrorMsg('');
                            setSuccessMsg('');

                            if (
                              imagens.length >
                              plano.fotosMax
                            ) {
                              const urlsRemovidas =
                                previewUrls.slice(
                                  plano.fotosMax
                                );

                              urlsRemovidas.forEach(
                                (url) =>
                                  URL.revokeObjectURL(
                                    url
                                  )
                              );

                              setImagens(
                                (atuais) =>
                                  atuais.slice(
                                    0,
                                    plano.fotosMax
                                  )
                              );

                              setPreviewUrls(
                                (atuais) =>
                                  atuais.slice(
                                    0,
                                    plano.fotosMax
                                  )
                              );
                            }

                            if (
                              !plano.showInstagram
                            ) {
                              setForm(
                                (formAtual) => ({
                                  ...formAtual,
                                  instagram: '',
                                })
                              );
                            }
                          }}
                          aria-pressed={
                            selecionado
                          }
                          className={`relative flex min-h-[190px] flex-col justify-between rounded-xl border-2 p-3 text-left transition-all ${
                            plano.borderClass
                          } ${
                            selecionado
                              ? 'bg-sky-50 ring-4 ring-sky-500/20'
                              : 'bg-white hover:-translate-y-1 hover:shadow-md'
                          }`}
                        >
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900">
                              {plano.nome}
                            </h3>

                            <p
                              className={`mt-1 text-xl font-black ${plano.priceClass}`}
                            >
                              {plano.preco}
                            </p>

                            <p className="mt-2 text-[11px] font-medium leading-relaxed text-slate-600">
                              {plano.descricao}
                            </p>

                            <p className="mt-2 text-[10px] text-slate-500">
                              {plano.observacao}
                            </p>
                          </div>

                          <span
                            className={`mt-3 block w-full rounded-md border py-1.5 text-center text-[10px] font-bold uppercase ${
                              selecionado
                                ? 'border-sky-700 bg-sky-700 text-white'
                                : plano.buttonClass
                            }`}
                          >
                            {selecionado
                              ? '✓ Selecionado'
                              : 'Selecionar'}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* MENSAGENS */}

              {errorMsg && (
                <div className="mt-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {errorMsg}
                </div>
              )}

              {successMsg &&
                !errorMsg && (
                  <div className="mt-5 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                    {successMsg}
                  </div>
                )}

              {/* FORMULÁRIO */}

              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-5"
              >
                <h2 className="text-sm font-bold text-slate-800">
                  Preencha os dados do anúncio
                </h2>

                <div>
                  <label
                    htmlFor="categoria"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Categoria *
                  </label>

                  <select
                    id="categoria"
                    name="categoria"
                    value={
                      form.categoria
                    }
                    onChange={
                      handleChange
                    }
                    required
                    disabled={
                      loadingCategorias
                    }
                    className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-100"
                  >
                    <option value="">
                      {loadingCategorias
                        ? 'Carregando categorias...'
                        : 'Selecione uma categoria'}
                    </option>

                    {categorias.map(
                      (categoria) => (
                        <option
                          key={
                            categoria.id
                          }
                          value={
                            categoria.nome
                          }
                        >
                          {categoria.nome}
                        </option>
                      )
                    )}
                  </select>

                  <p className="mt-1.5 text-xs text-slate-500">
                    Disponível para Morar & Construir, Motores & Rodas, Promoções e Onde é o Rolê?.
                  </p>
                </div>

                <Campo
                  label="Nome completo *"
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={
                    handleChange
                  }
                  required
                />

                <Campo
                  label="WhatsApp / Telefone *"
                  type="tel"
                  name="telefone"
                  value={
                    form.telefone
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="(31) 99999-9999"
                />

                <Campo
                  label="E-mail da conta"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={
                    handleChange
                  }
                  disabled
                />

                <Campo
                  label="Nome do negócio / Produto *"
                  type="text"
                  name="nome_loja"
                  value={
                    form.nome_loja
                  }
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="Ex.: Empório Agropet"
                />

                <Campo
                  label="Título do anúncio *"
                  type="text"
                  name="titulo"
                  value={form.titulo}
                  onChange={
                    handleChange
                  }
                  required
                  placeholder="Ex.: Apartamento para aluguel"
                />

                {/* PREÇO FORMATADO */}

                {form.categoria !==
                  'Onde é o Rolê?' && (
                  <div>
                    <label
                      htmlFor="preco"
                      className="mb-1.5 block text-sm font-semibold text-slate-700"
                    >
                      Preço (R$)
                    </label>

                    <div>
                      <input
                        id="preco"
                        type="text"
                        name="preco"
                        value={form.preco}
                        onChange={
                          handlePrecoChange
                        }
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="0,00"
                        className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                      />
                    </div>

                    <p className="mt-1.5 text-xs text-slate-500">
                      Digite somente os números. Para informar R$ 3,00, digite 300.
                    </p>
                  </div>
                )}

                {planoInfo?.showInstagram && (
                  <Campo
                    label="Instagram"
                    type="text"
                    name="instagram"
                    value={
                      form.instagram
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="@seu.instagram"
                  />
                )}

                {/* FOTOS */}

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-4">
                    <label
                      htmlFor="fotos-anuncio"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Fotos do anúncio
                    </label>

                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                      {imagens.length}/
                      {planoInfo?.fotosMax ||
                        5}
                    </span>
                  </div>

                  <input
                    id="fotos-anuncio"
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={
                      handleImageChange
                    }
                    disabled={
                      !planoSelecionado
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-700 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-sky-800 disabled:bg-slate-100"
                  />

                  {imageErrorMsg && (
                    <div className="mt-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                      {imageErrorMsg}
                    </div>
                  )}

                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-slate-700">
                    <p className="font-bold text-amber-800">
                      Recomendações para as fotos
                    </p>

                    <p className="mt-1">
                      JPG, PNG ou WEBP • Até 5 MB por foto • Resolução mínima de 800 × 600 px.
                    </p>

                    <p className="mt-1">
                      Recomendado: 1200 × 900 px ou 1080 × 1080 px. A primeira foto será usada como capa.
                    </p>
                  </div>
                </div>

                {/* PRÉVIAS */}

                {previewUrls.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-slate-600">
                      A primeira imagem será a foto principal.
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {previewUrls.map(
                        (url, index) => (
                          <div
                            key={url}
                            className="relative"
                          >
                            <img
                              src={url}
                              alt={`Prévia ${
                                index + 1
                              }`}
                              className="h-24 w-24 rounded-xl border border-slate-200 object-cover shadow-sm"
                            />

                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 rounded bg-slate-900/80 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                                Capa
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                removeImage(
                                  index
                                )
                              }
                              aria-label={`Remover foto ${
                                index + 1
                              }`}
                              className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 font-bold text-white shadow hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="descricao"
                    className="mb-1.5 block text-sm font-semibold text-slate-700"
                  >
                    Descrição
                  </label>

                  <textarea
                    id="descricao"
                    name="descricao"
                    value={
                      form.descricao
                    }
                    onChange={
                      handleChange
                    }
                    rows={6}
                    maxLength={1200}
                    placeholder="Descreva o produto, serviço, imóvel, veículo ou estabelecimento..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                  />

                  <p className="mt-1 text-right text-xs text-slate-500">
                    {form.descricao.length}
                    /1200 caracteres
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    loadingCategorias ||
                    !planoSelecionado ||
                    !usuario
                  }
                  className="w-full rounded-xl bg-sky-700 px-5 py-4 text-center text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loading
                    ? 'Enviando anúncio...'
                    : `Continuar com o Plano ${
                        planoSelecionado ||
                        'Selecionado'
                      }`}
                </button>
              </form>
            </div>
          </section>

          {/* CARD AGENDA LOCAL */}

          <section className="lg:col-span-4">
            <div className="rounded-2xl border border-orange-300 bg-white p-6 shadow-lg">
              <FaixaCard
                texto="Faça parte do nosso guia de profissionais!"
                classe="bg-orange-600"
              />

              <h2 className="mt-6 text-center text-2xl font-black uppercase leading-tight text-slate-900">
                Você presta serviços em Nova União?
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                Cadastre sua empresa ou profissão no maior catálogo de telefones úteis, empresas e serviços de Nova União.
              </p>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                Encontre profissionais e serviços como:
              </p>

              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
                <CategoriaServico
                  titulo="🏥 Saúde e utilidade pública"
                  descricao="Postos de saúde, farmácias, emergências, clínicas e hospitais."
                />

                <CategoriaServico
                  titulo="👨‍⚕️ Profissionais da saúde"
                  descricao="Médicos, dentistas, nutricionistas, psicólogos, fisioterapeutas e médicos ocupacionais."
                />

                <CategoriaServico
                  titulo="💅 Beleza e bem-estar"
                  descricao="Esteticistas, manicures, cabeleireiros e barbearias."
                />

                <CategoriaServico
                  titulo="🛠️ Construção e manutenção"
                  descricao="Pedreiros, marceneiros, eletricistas, encanadores, pintores e técnicos em refrigeração."
                />

                <CategoriaServico
                  titulo="🚗 Automotivo"
                  descricao="Mecânicos, borracharias e autoelétricas."
                />

                <CategoriaServico
                  titulo="💼 Profissionais e empresas"
                  descricao="Advogados, engenheiros, contadores, arquitetos, empresas e prestadores de serviços."
                />

                <p className="italic text-slate-500">
                  ...e muitos outros.
                </p>
              </div>

              <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-bold text-slate-900">
                  Seu contato ficará disponível para moradores encontrarem seu serviço com facilidade.
                </p>

                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  A Agenda Local organiza empresas, profissionais e telefones úteis em um catálogo de serviços da região.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    '/agenda-local/cadastro'
                  )
                }
                className="mt-6 w-full rounded-xl bg-orange-600 px-5 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-orange-700"
              >
                Cadastrar na Agenda Local →
              </button>
            </div>
          </section>

          {/* CARD DIRETO DO PRODUTOR */}

          <section className="lg:col-span-3">
            <div className="rounded-2xl border border-emerald-300 bg-white p-6 shadow-lg">
              <FaixaCard
                texto="Programa Direto do Produtor"
                classe="bg-emerald-600"
              />

              <h2 className="mt-6 text-center text-2xl font-black leading-tight text-slate-900">
                Divulgue gratuitamente sua produção local!
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                O Conecta Cidade reserva este espaço para divulgar gratuitamente pequenos produtores rurais, agricultores familiares, artesãos e produtores de alimentos de Nova União e região.
              </p>

              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                Nosso objetivo é fortalecer a economia local, incentivar a produção regional e aproximar quem produz de quem compra.
              </p>

              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <ul className="space-y-3 text-sm font-medium text-slate-800">
                  <ItemProdutor texto="Divulgação gratuita por até 30 dias" />

                  <ItemProdutor texto="Vagas limitadas" />

                  <ItemProdutor texto="Seleção realizada pela administração" />

                  <ItemProdutor texto="Lista de espera quando as vagas estiverem preenchidas" />
                </ul>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    '/direto-do-produtor/participar'
                  )
                }
                className="mt-6 w-full rounded-xl bg-emerald-600 px-5 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-emerald-700"
              >
                Quero participar
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    '/direto-do-produtor'
                  )
                }
                className="mt-3 w-full rounded-xl border border-emerald-600 bg-white px-5 py-3 text-xs font-bold uppercase tracking-wide text-emerald-700 transition hover:bg-emerald-50"
              >
                Ver produtores selecionados
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   COMPONENTES AUXILIARES
========================================================= */

function CarregandoPagina() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-sky-200 border-t-sky-700" />

        <p className="mt-4 font-semibold text-slate-600">
          Carregando sua conta...
        </p>
      </div>
    </main>
  );
}

function FaixaCard({
  texto,
  classe,
}: {
  texto: string;
  classe: string;
}) {
  return (
    <div className="flex justify-center">
      <span
        className={`${classe} inline-flex min-h-9 items-center justify-center rounded-lg px-5 py-2 text-center text-xs font-bold uppercase tracking-wide text-white shadow-sm`}
      >
        {texto}
      </span>
    </div>
  );
}

function Campo({
  label,
  type,
  name,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = '',
}: {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-100 disabled:text-slate-500"
      />
    </div>
  );
}

function CategoriaServico({
  titulo,
  descricao,
}: {
  titulo: string;
  descricao: string;
}) {
  return (
    <div>
      <p className="font-bold text-slate-900">
        {titulo}
      </p>

      <p className="text-slate-600">
        {descricao}
      </p>
    </div>
  );
}

function ItemProdutor({
  texto,
}: {
  texto: string;
}) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 font-black text-emerald-600">
        ✓
      </span>

      <span>{texto}</span>
    </li>
  );
}