'use client';

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { supabase } from '../../lib/supabase';

const BUCKET = 'imagens-anuncios';

type Informativo = {
  id: string;
  titulo: string;
  categoria: string | null;
  resumo: string | null;
  descricao: string | null;
  imagem_url: string | null;
  link_url: string | null;
  texto_botao: string | null;
  publicar_em: string | null;
  encerrar_publicacao_em: string | null;
  data_inicio: string | null;
  data_vencimento: string | null;
  ativo: boolean;
  destaque: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type FormularioInformativo = {
  titulo: string;
  categoria: string;
  descricao: string;
  imagem_url: string;
  link_url: string;
  texto_botao: string;
  publicar_em: string;
  encerrar_publicacao_em: string;
  data_inicio: string;
  data_vencimento: string;
  ativo: boolean;
  destaque: boolean;
};

type TipoMensagem = 'sucesso' | 'erro' | '';

const formularioInicial: FormularioInformativo = {
  titulo: '',
  categoria: 'Comunicado',
  descricao: '',
  imagem_url: '',
  link_url: '',
  texto_botao: 'Saiba mais',
  publicar_em: obterDataAtual(),
  encerrar_publicacao_em: '',
  data_inicio: '',
  data_vencimento: '',
  ativo: true,
  destaque: false,
};

const categoriasDisponiveis = [
  'Comunicado',
  'Notícia',
  'Campanha',
  'Saúde',
  'Vacinação',
  'Obras',
  'Concurso',
  'Evento',
  'Educação',
  'Serviço Público',
  'Outro',
];

function obterDataAtual(): string {
  const agora = new Date();
  const diferencaFuso = agora.getTimezoneOffset() * 60 * 1000;
  const dataLocal = new Date(agora.getTime() - diferencaFuso);

  return dataLocal.toISOString().split('T')[0];
}

function converterParaCampoData(valor?: string | null): string {
  if (!valor) {
    return '';
  }

  return valor.split('T')[0];
}

function formatarData(valor?: string | null): string {
  if (!valor) {
    return 'Não informada';
  }

  const somenteData = valor.split('T')[0];
  const partes = somenteData.split('-');

  if (partes.length !== 3) {
    return valor;
  }

  const [ano, mes, dia] = partes;

  return `${dia}/${mes}/${ano}`;
}

function normalizarTexto(valor: string): string | null {
  const texto = valor.trim();

  return texto.length > 0 ? texto : null;
}

function criarNomeArquivo(arquivo: File): string {
  const extensaoOriginal = arquivo.name.split('.').pop()?.toLowerCase();
  const extensao = extensaoOriginal || 'jpg';

  const nomeBase = arquivo.name
    .replace(/\.[^/.]+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  const identificador =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `nova-uniao-informa/${Date.now()}-${identificador}-${
    nomeBase || 'imagem'
  }.${extensao}`;
}

function extrairCaminhoStorage(url: string): string | null {
  if (!url) {
    return null;
  }

  const marcador = `/storage/v1/object/public/${BUCKET}/`;
  const indice = url.indexOf(marcador);

  if (indice === -1) {
    return null;
  }

  const caminho = url.slice(indice + marcador.length);

  try {
    return decodeURIComponent(caminho);
  } catch {
    return caminho;
  }
}

function validarLink(valor: string): boolean {
  const link = valor.trim();

  if (!link) {
    return true;
  }

  if (link.startsWith('/')) {
    return true;
  }

  try {
    const url = new URL(link);

    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function NovaUniaoInformaAdmin() {
  const [informativos, setInformativos] = useState<Informativo[]>([]);
  const [formulario, setFormulario] =
    useState<FormularioInformativo>(formularioInicial);

  const [idEdicao, setIdEdicao] = useState<string | null>(null);
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
  const [previewImagem, setPreviewImagem] = useState('');

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<
    'todos' | 'publicados' | 'ocultos' | 'destaques'
  >('todos');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<string | null>(null);

  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState<TipoMensagem>('');

  const mostrarMensagem = useCallback(
    (texto: string, tipo: Exclude<TipoMensagem, ''>) => {
      setMensagem(texto);
      setTipoMensagem(tipo);

      window.setTimeout(() => {
        setMensagem('');
        setTipoMensagem('');
      }, 5000);
    },
    []
  );

  const carregarInformativos = useCallback(async () => {
    setCarregando(true);

    const { data, error } = await supabase
      .from('nova_uniao_informa')
      .select('*')
      .order('destaque', { ascending: false })
      .order('publicar_em', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar informativos:', error);
      setInformativos([]);
      mostrarMensagem(
        `Não foi possível carregar os informativos: ${error.message}`,
        'erro'
      );
      setCarregando(false);
      return;
    }

    setInformativos((data || []) as Informativo[]);
    setCarregando(false);
  }, [mostrarMensagem]);

  useEffect(() => {
    carregarInformativos();
  }, [carregarInformativos]);

  useEffect(() => {
    return () => {
      if (previewImagem.startsWith('blob:')) {
        URL.revokeObjectURL(previewImagem);
      }
    };
  }, [previewImagem]);

  const limparFormulario = useCallback(() => {
    if (previewImagem.startsWith('blob:')) {
      URL.revokeObjectURL(previewImagem);
    }

    setFormulario({
      ...formularioInicial,
      publicar_em: obterDataAtual(),
    });

    setIdEdicao(null);
    setArquivoImagem(null);
    setPreviewImagem('');
  }, [previewImagem]);

  const informativosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return informativos.filter((informativo) => {
      const correspondeBusca =
        !termo ||
        informativo.titulo.toLowerCase().includes(termo) ||
        informativo.categoria?.toLowerCase().includes(termo) ||
        informativo.resumo?.toLowerCase().includes(termo);

      if (!correspondeBusca) {
        return false;
      }

      switch (filtroStatus) {
        case 'publicados':
          return informativo.ativo === true;

        case 'ocultos':
          return informativo.ativo === false;

        case 'destaques':
          return informativo.destaque === true;

        default:
          return true;
      }
    });
  }, [busca, filtroStatus, informativos]);

  const totalPublicados = useMemo(
    () => informativos.filter((item) => item.ativo).length,
    [informativos]
  );

  const totalDestaques = useMemo(
    () => informativos.filter((item) => item.destaque).length,
    [informativos]
  );

  const atualizarCampo = (
    campo: keyof FormularioInformativo,
    valor: string | boolean
  ) => {
    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));
  };

  const selecionarImagem = (event: ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0];

    if (!arquivo) {
      return;
    }

    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      mostrarMensagem(
        'Escolha uma imagem JPG, PNG, WEBP ou GIF.',
        'erro'
      );

      event.target.value = '';
      return;
    }

    const limiteBytes = 8 * 1024 * 1024;

    if (arquivo.size > limiteBytes) {
      mostrarMensagem(
        'A imagem deve ter no máximo 8 MB.',
        'erro'
      );

      event.target.value = '';
      return;
    }

    if (previewImagem.startsWith('blob:')) {
      URL.revokeObjectURL(previewImagem);
    }

    const novaPreview = URL.createObjectURL(arquivo);

    setArquivoImagem(arquivo);
    setPreviewImagem(novaPreview);
  };

  const removerImagemSelecionada = () => {
    if (previewImagem.startsWith('blob:')) {
      URL.revokeObjectURL(previewImagem);
    }

    setArquivoImagem(null);
    setPreviewImagem('');
    atualizarCampo('imagem_url', '');
  };

  const enviarImagem = async (): Promise<string | null> => {
    if (!arquivoImagem) {
      return normalizarTexto(formulario.imagem_url);
    }

    setEnviandoImagem(true);

    const caminho = criarNomeArquivo(arquivoImagem);

    const { error: erroUpload } = await supabase.storage
      .from(BUCKET)
      .upload(caminho, arquivoImagem, {
        cacheControl: '3600',
        upsert: false,
        contentType: arquivoImagem.type,
      });

    if (erroUpload) {
      setEnviandoImagem(false);
      throw new Error(`Erro no upload da imagem: ${erroUpload.message}`);
    }

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(caminho);

    setEnviandoImagem(false);

    if (!data.publicUrl) {
      throw new Error('O endereço público da imagem não foi gerado.');
    }

    return data.publicUrl;
  };

  const validarFormulario = (): string | null => {
    if (!formulario.titulo.trim()) {
      return 'Informe o título.';
    }

    if (formulario.titulo.trim().length < 3) {
      return 'O título deve ter pelo menos 3 caracteres.';
    }

    if (!formulario.descricao.trim()) {
      return 'Informe a descrição.';
    }

    if (!formulario.publicar_em) {
      return 'Informe a data de publicação.';
    }

    if (
      formulario.encerrar_publicacao_em &&
      formulario.encerrar_publicacao_em < formulario.publicar_em
    ) {
      return 'A retirada do site não pode ser anterior à publicação.';
    }

    if (
      formulario.data_inicio &&
      formulario.data_vencimento &&
      formulario.data_vencimento < formulario.data_inicio
    ) {
      return 'A data final do evento não pode ser anterior à data inicial.';
    }

    if (!validarLink(formulario.link_url)) {
      return 'Informe um link válido, começando com https:// ou /.';
    }

    return null;
  };

  const salvarInformativo = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (salvando || enviandoImagem) {
      return;
    }

    const erroValidacao = validarFormulario();

    if (erroValidacao) {
      mostrarMensagem(erroValidacao, 'erro');
      return;
    }

    setSalvando(true);

    try {
      const imagemAnterior = normalizarTexto(formulario.imagem_url);
      const imagemUrl = await enviarImagem();

      const payload = {
  titulo: formulario.titulo.trim(),

  categoria:
    formulario.categoria?.trim() || 'Comunicado',

  resumo: formulario.descricao.trim(),

  descricao: null,

  imagem_url: imagemUrl,

  link_url: normalizarTexto(formulario.link_url),

  texto_botao:
    normalizarTexto(formulario.texto_botao) ||
    'Saiba mais',

  publicar_em: formulario.publicar_em,

  encerrar_publicacao_em:
    formulario.encerrar_publicacao_em || null,

  data_inicio:
    formulario.data_inicio || null,

  data_vencimento:
    formulario.data_vencimento || null,

  ativo: formulario.ativo,

  destaque: formulario.destaque,

  updated_at: new Date().toISOString(),
};

      if (idEdicao) {
        const { error } = await supabase
          .from('nova_uniao_informa')
          .update(payload)
          .eq('id', idEdicao);

        if (error) {
          throw new Error(error.message);
        }

        if (
          arquivoImagem &&
          imagemAnterior &&
          imagemAnterior !== imagemUrl
        ) {
          const caminhoAnterior = extrairCaminhoStorage(imagemAnterior);

          if (caminhoAnterior) {
            const { error: erroRemocao } = await supabase.storage
              .from(BUCKET)
              .remove([caminhoAnterior]);

            if (erroRemocao) {
              console.warn(
                'A imagem antiga não pôde ser removida:',
                erroRemocao
              );
            }
          }
        }

        mostrarMensagem(
          'Informativo atualizado com sucesso.',
          'sucesso'
        );
      } else {
        const { error } = await supabase
          .from('nova_uniao_informa')
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          });

        if (error) {
          throw new Error(error.message);
        }

        mostrarMensagem(
          'Informativo cadastrado com sucesso.',
          'sucesso'
        );
      }

      limparFormulario();
      await carregarInformativos();
    } catch (error) {
      console.error('Erro ao salvar informativo:', error);

      const textoErro =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro inesperado.';

      mostrarMensagem(
        `Não foi possível salvar: ${textoErro}`,
        'erro'
      );
    } finally {
      setSalvando(false);
      setEnviandoImagem(false);
    }
  };

  const iniciarEdicao = (informativo: Informativo) => {
    if (previewImagem.startsWith('blob:')) {
      URL.revokeObjectURL(previewImagem);
    }

    setIdEdicao(informativo.id);
    setArquivoImagem(null);
    setPreviewImagem(informativo.imagem_url || '');

    setFormulario({
      titulo: informativo.titulo,
      categoria: informativo.categoria || 'Comunicado',
      descricao:
        informativo.resumo ||
        informativo.descricao ||
        '',
      imagem_url: informativo.imagem_url || '',
      link_url: informativo.link_url || '',
      texto_botao: informativo.texto_botao || 'Saiba mais',
      publicar_em:
        converterParaCampoData(informativo.publicar_em) ||
        obterDataAtual(),
      encerrar_publicacao_em: converterParaCampoData(
        informativo.encerrar_publicacao_em
      ),
      data_inicio: converterParaCampoData(
        informativo.data_inicio
      ),
      data_vencimento: converterParaCampoData(
        informativo.data_vencimento
      ),
      ativo: informativo.ativo === true,
      destaque: informativo.destaque === true,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const alternarAtivo = async (informativo: Informativo) => {
    setAcaoEmAndamento(informativo.id);

    const novoEstado = !informativo.ativo;

    const { error } = await supabase
      .from('nova_uniao_informa')
      .update({
        ativo: novoEstado,
        updated_at: new Date().toISOString(),
      })
      .eq('id', informativo.id);

    if (error) {
      console.error('Erro ao alterar publicação:', error);

      mostrarMensagem(
        `Não foi possível alterar a publicação: ${error.message}`,
        'erro'
      );

      setAcaoEmAndamento(null);
      return;
    }

    setInformativos((listaAtual) =>
      listaAtual.map((item) =>
        item.id === informativo.id
          ? {
              ...item,
              ativo: novoEstado,
            }
          : item
      )
    );

    mostrarMensagem(
      novoEstado
        ? 'Informativo publicado.'
        : 'Informativo retirado do site.',
      'sucesso'
    );

    setAcaoEmAndamento(null);
  };

  const alternarDestaque = async (
    informativo: Informativo
  ) => {
    setAcaoEmAndamento(informativo.id);

    const novoEstado = !informativo.destaque;

    const { error } = await supabase
      .from('nova_uniao_informa')
      .update({
        destaque: novoEstado,
        updated_at: new Date().toISOString(),
      })
      .eq('id', informativo.id);

    if (error) {
      console.error('Erro ao alterar destaque:', error);

      mostrarMensagem(
        `Não foi possível alterar o destaque: ${error.message}`,
        'erro'
      );

      setAcaoEmAndamento(null);
      return;
    }

    setInformativos((listaAtual) =>
      listaAtual.map((item) =>
        item.id === informativo.id
          ? {
              ...item,
              destaque: novoEstado,
            }
          : item
      )
    );

    mostrarMensagem(
      novoEstado
        ? 'Informativo colocado em destaque.'
        : 'Destaque removido.',
      'sucesso'
    );

    setAcaoEmAndamento(null);
  };

  const excluirInformativo = async (
    informativo: Informativo
  ) => {
    const confirmou = window.confirm(
      `Deseja realmente excluir "${informativo.titulo}"?\n\nEssa ação não poderá ser desfeita.`
    );

    if (!confirmou) {
      return;
    }

    setAcaoEmAndamento(informativo.id);

    const { error } = await supabase
      .from('nova_uniao_informa')
      .delete()
      .eq('id', informativo.id);

    if (error) {
      console.error('Erro ao excluir informativo:', error);

      mostrarMensagem(
        `Não foi possível excluir: ${error.message}`,
        'erro'
      );

      setAcaoEmAndamento(null);
      return;
    }

    const caminhoImagem = extrairCaminhoStorage(
      informativo.imagem_url || ''
    );

    if (caminhoImagem) {
      const { error: erroImagem } = await supabase.storage
        .from(BUCKET)
        .remove([caminhoImagem]);

      if (erroImagem) {
        console.warn(
          'O registro foi excluído, mas a imagem não pôde ser removida:',
          erroImagem
        );
      }
    }

    setInformativos((listaAtual) =>
      listaAtual.filter((item) => item.id !== informativo.id)
    );

    if (idEdicao === informativo.id) {
      limparFormulario();
    }

    mostrarMensagem(
      'Informativo excluído com sucesso.',
      'sucesso'
    );

    setAcaoEmAndamento(null);
  };

  const imagemExibida =
    previewImagem ||
    formulario.imagem_url ||
    '/images/nova-uniao.jpg';

  return (
    <div className="space-y-8">
      {/* CABEÇALHO */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
              Administração
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
              Nova União Informa
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Cadastre notícias, comunicados, campanhas, obras,
              eventos e informações importantes para a cidade.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <ResumoCard
              titulo="Total"
              valor={informativos.length}
            />

            <ResumoCard
              titulo="Publicados"
              valor={totalPublicados}
            />

            <ResumoCard
              titulo="Destaques"
              valor={totalDestaques}
            />
          </div>
        </div>
      </section>

      {/* MENSAGEM */}
      {mensagem && (
        <div
          role="alert"
          className={`rounded-2xl border px-5 py-4 text-sm font-semibold ${
            tipoMensagem === 'sucesso'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          {mensagem}
        </div>
      )}

      {/* FORMULÁRIO */}
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 md:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {idEdicao
                  ? 'Editar informativo'
                  : 'Novo informativo'}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Os campos marcados com * são obrigatórios.
              </p>
            </div>

            {idEdicao && (
              <button
                type="button"
                onClick={limparFormulario}
                className="w-fit rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancelar edição
              </button>
            )}
          </div>
        </div>

        <form
          onSubmit={salvarInformativo}
          className="grid gap-8 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_360px]"
        >
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Campo>
                <Rotulo htmlFor="titulo">
                  Título *
                </Rotulo>

                <input
                  id="titulo"
                  type="text"
                  value={formulario.titulo}
                  onChange={(event) =>
                    atualizarCampo(
                      'titulo',
                      event.target.value
                    )
                  }
                  maxLength={150}
                  placeholder="Ex.: Campanha de vacinação começa na segunda-feira"
                  className={classeCampo}
                />
              </Campo>

              <Campo>
                <Rotulo htmlFor="categoria">
                  Categoria
                </Rotulo>

                <select
                  id="categoria"
                  value={formulario.categoria}
                  onChange={(event) =>
                    atualizarCampo(
                      'categoria',
                      event.target.value
                    )
                  }
                  className={classeCampo}
                >
                  {categoriasDisponiveis.map((categoria) => (
                    <option
                      key={categoria}
                      value={categoria}
                    >
                      {categoria}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            <Campo>
              <div className="flex items-center justify-between gap-4">
                <Rotulo htmlFor="descricao">
                  Descrição *
                </Rotulo>

                <span className="text-xs text-slate-400">
                  {formulario.descricao.length}/800
                </span>
              </div>

              <textarea
                id="descricao"
                value={formulario.descricao}
                onChange={(event) =>
                  atualizarCampo(
                    'descricao',
                    event.target.value
                  )
                }
                maxLength={800}
                rows={6}
                placeholder="Escreva uma descrição curta e clara para o informativo."
                className={`${classeCampo} min-h-[150px] resize-y`}
              />

              <p className="text-xs leading-relaxed text-slate-500">
                Este é o único campo de texto. O conteúdo será
                utilizado tanto na Home quanto na página pública.
              </p>
            </Campo>

            <div className="grid gap-5 md:grid-cols-2">
              <Campo>
                <Rotulo htmlFor="link_url">
                  Link do botão
                </Rotulo>

                <input
                  id="link_url"
                  type="text"
                  value={formulario.link_url}
                  onChange={(event) =>
                    atualizarCampo(
                      'link_url',
                      event.target.value
                    )
                  }
                  placeholder="https://... ou /pagina"
                  className={classeCampo}
                />
              </Campo>

              <Campo>
                <Rotulo htmlFor="texto_botao">
                  Texto do botão
                </Rotulo>

                <input
                  id="texto_botao"
                  type="text"
                  value={formulario.texto_botao}
                  onChange={(event) =>
                    atualizarCampo(
                      'texto_botao',
                      event.target.value
                    )
                  }
                  maxLength={40}
                  placeholder="Saiba mais"
                  className={classeCampo}
                />
              </Campo>
            </div>

            {/* PUBLICAÇÃO */}
            <fieldset className="rounded-2xl border border-slate-200 p-5">
              <legend className="px-2 text-sm font-bold text-slate-800">
                Período de publicação no site
              </legend>

              <p className="mb-5 text-sm text-slate-500">
                Essas datas controlam quando o informativo aparece e
                desaparece do portal.
              </p>

              <div className="grid gap-5 md:grid-cols-2">
                <Campo>
                  <Rotulo htmlFor="publicar_em">
                    Publicar em *
                  </Rotulo>

                  <input
                    id="publicar_em"
                    type="date"
                    value={formulario.publicar_em}
                    onChange={(event) =>
                      atualizarCampo(
                        'publicar_em',
                        event.target.value
                      )
                    }
                    className={classeCampo}
                  />
                </Campo>

                <Campo>
                  <Rotulo htmlFor="encerrar_publicacao_em">
                    Retirar do site
                  </Rotulo>

                  <input
                    id="encerrar_publicacao_em"
                    type="date"
                    value={
                      formulario.encerrar_publicacao_em
                    }
                    min={formulario.publicar_em || undefined}
                    onChange={(event) =>
                      atualizarCampo(
                        'encerrar_publicacao_em',
                        event.target.value
                      )
                    }
                    className={classeCampo}
                  />

                  <p className="text-xs text-slate-500">
                    Deixe vazio para permanecer publicado sem data
                    final.
                  </p>
                </Campo>
              </div>
            </fieldset>

            {/* EVENTO */}
            <fieldset className="rounded-2xl border border-slate-200 p-5">
              <legend className="px-2 text-sm font-bold text-slate-800">
                Data real do evento ou atividade
              </legend>

              <p className="mb-5 text-sm text-slate-500">
                Preencha somente quando a informação possuir uma
                data específica, como evento, campanha ou prazo.
              </p>

              <div className="grid gap-5 md:grid-cols-2">
                <Campo>
                  <Rotulo htmlFor="data_inicio">
                    Data inicial
                  </Rotulo>

                  <input
                    id="data_inicio"
                    type="date"
                    value={formulario.data_inicio}
                    onChange={(event) =>
                      atualizarCampo(
                        'data_inicio',
                        event.target.value
                      )
                    }
                    className={classeCampo}
                  />
                </Campo>

                <Campo>
                  <Rotulo htmlFor="data_vencimento">
                    Data final
                  </Rotulo>

                  <input
                    id="data_vencimento"
                    type="date"
                    value={formulario.data_vencimento}
                    min={formulario.data_inicio || undefined}
                    onChange={(event) =>
                      atualizarCampo(
                        'data_vencimento',
                        event.target.value
                      )
                    }
                    className={classeCampo}
                  />
                </Campo>
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2">
              <OpcaoMarcacao
                titulo="Publicado"
                descricao="Permite que o informativo apareça no site durante o período configurado."
                marcado={formulario.ativo}
                onChange={(marcado) =>
                  atualizarCampo('ativo', marcado)
                }
              />

              <OpcaoMarcacao
                titulo="Destaque"
                descricao="Dá prioridade ao informativo nas listagens e na Home."
                marcado={formulario.destaque}
                onChange={(marcado) =>
                  atualizarCampo('destaque', marcado)
                }
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={limparFormulario}
                disabled={salvando}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Limpar
              </button>

              <button
                type="submit"
                disabled={salvando || enviandoImagem}
                className="rounded-xl bg-slate-900 px-7 py-3 font-bold text-white shadow-md transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {enviandoImagem
                  ? 'Enviando imagem...'
                  : salvando
                    ? 'Salvando...'
                    : idEdicao
                      ? 'Salvar alterações'
                      : 'Cadastrar informativo'}
              </button>
            </div>
          </div>

          {/* IMAGEM */}
          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900">
                Imagem
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Use uma imagem horizontal e com boa qualidade.
              </p>

              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="aspect-[4/3] bg-slate-100">
                  <img
                    src={imagemExibida}
                    alt="Pré-visualização do informativo"
                    onError={(event) => {
                      const imagem = event.currentTarget;

                      if (
                        !imagem.src.endsWith(
                          '/images/nova-uniao.jpg'
                        )
                      ) {
                        imagem.src =
                          '/images/nova-uniao.jpg';
                      }
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <p className="line-clamp-2 font-bold text-slate-900">
                    {formulario.titulo ||
                      'Título do informativo'}
                  </p>

                  <p className="mt-2 line-clamp-3 text-sm text-slate-500">
                    {formulario.descricao ||
                      'A descrição aparecerá aqui.'}
                  </p>
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-400 bg-white px-4 py-4 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-600 hover:bg-slate-100">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={selecionarImagem}
                  className="hidden"
                />

                Escolher imagem
              </label>

              {(arquivoImagem ||
                formulario.imagem_url ||
                previewImagem) && (
                <button
                  type="button"
                  onClick={removerImagemSelecionada}
                  className="mt-3 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Remover imagem
                </button>
              )}

              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Formatos aceitos: JPG, PNG, WEBP e GIF. Tamanho
                máximo: 8 MB.
              </p>
            </div>
          </aside>
        </form>
      </section>

      {/* LISTAGEM */}
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6 md:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Informativos cadastrados
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Edite, publique, destaque ou exclua os registros.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto">
              <div>
                <label
                  htmlFor="busca-informativo"
                  className="sr-only"
                >
                  Pesquisar informativos
                </label>

                <input
                  id="busca-informativo"
                  type="search"
                  value={busca}
                  onChange={(event) =>
                    setBusca(event.target.value)
                  }
                  placeholder="Pesquisar..."
                  className="h-11 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200 sm:min-w-[260px]"
                />
              </div>

              <div>
                <label
                  htmlFor="filtro-status"
                  className="sr-only"
                >
                  Filtrar por status
                </label>

                <select
                  id="filtro-status"
                  value={filtroStatus}
                  onChange={(event) =>
                    setFiltroStatus(
                      event.target.value as typeof filtroStatus
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
                >
                  <option value="todos">
                    Todos
                  </option>

                  <option value="publicados">
                    Publicados
                  </option>

                  <option value="ocultos">
                    Não publicados
                  </option>

                  <option value="destaques">
                    Destaques
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {carregando ? (
            <div className="py-16 text-center">
              <p className="font-semibold text-slate-600">
                Carregando informativos...
              </p>
            </div>
          ) : informativosFiltrados.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
              <h3 className="text-lg font-bold text-slate-800">
                Nenhum informativo encontrado
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Cadastre um novo informativo ou altere os filtros.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {informativosFiltrados.map((informativo) => {
                const bloqueado =
                  acaoEmAndamento === informativo.id;

                return (
                  <article
                    key={informativo.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
                  >
                    <div className="relative h-52 bg-slate-100">
                      <img
                        src={
                          informativo.imagem_url ||
                          '/images/nova-uniao.jpg'
                        }
                        alt=""
                        onError={(event) => {
                          const imagem = event.currentTarget;

                          if (
                            !imagem.src.endsWith(
                              '/images/nova-uniao.jpg'
                            )
                          ) {
                            imagem.src =
                              '/images/nova-uniao.jpg';
                          }
                        }}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <span className="rounded-lg bg-slate-900/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                          {informativo.categoria ||
                            'Comunicado'}
                        </span>

                        {informativo.destaque && (
                          <span className="rounded-lg bg-amber-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                            Destaque
                          </span>
                        )}
                      </div>

                      <span
                        className={`absolute bottom-3 right-3 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow ${
                          informativo.ativo
                            ? 'bg-emerald-600'
                            : 'bg-slate-500'
                        }`}
                      >
                        {informativo.ativo
                          ? 'Publicado'
                          : 'Oculto'}
                      </span>
                    </div>

                    <div className="flex min-h-[320px] flex-col p-5">
                      <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-slate-900">
                        {informativo.titulo}
                      </h3>

                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {informativo.resumo ||
                          informativo.descricao ||
                          'Sem descrição.'}
                      </p>

                      <div className="mt-5 space-y-2 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
                        <p>
                          <strong className="text-slate-800">
                            Publicação:
                          </strong>{' '}
                          {formatarData(
                            informativo.publicar_em
                          )}
                        </p>

                        <p>
                          <strong className="text-slate-800">
                            Retirada:
                          </strong>{' '}
                          {informativo.encerrar_publicacao_em
                            ? formatarData(
                                informativo.encerrar_publicacao_em
                              )
                            : 'Sem data final'}
                        </p>

                        {(informativo.data_inicio ||
                          informativo.data_vencimento) && (
                          <p>
                            <strong className="text-slate-800">
                              Evento:
                            </strong>{' '}
                            {informativo.data_inicio
                              ? formatarData(
                                  informativo.data_inicio
                                )
                              : '—'}
                            {' até '}
                            {informativo.data_vencimento
                              ? formatarData(
                                  informativo.data_vencimento
                                )
                              : '—'}
                          </p>
                        )}
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                        <button
                          type="button"
                          onClick={() =>
                            iniciarEdicao(informativo)
                          }
                          disabled={bloqueado}
                          className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            alternarAtivo(informativo)
                          }
                          disabled={bloqueado}
                          className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                            informativo.ativo
                              ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {informativo.ativo
                            ? 'Retirar'
                            : 'Publicar'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            alternarDestaque(informativo)
                          }
                          disabled={bloqueado}
                          className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
                            informativo.destaque
                              ? 'border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                          }`}
                        >
                          {informativo.destaque
                            ? 'Tirar destaque'
                            : 'Destacar'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            excluirInformativo(informativo)
                          }
                          disabled={bloqueado}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {bloqueado
                            ? 'Aguarde...'
                            : 'Excluir'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const classeCampo =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-200';

function Campo({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="space-y-2">{children}</div>;
}

function Rotulo({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-bold text-slate-800"
    >
      {children}
    </label>
  );
}

function ResumoCard({
  titulo,
  valor,
}: {
  titulo: string;
  valor: number;
}) {
  return (
    <div className="min-w-[90px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
      <p className="text-2xl font-extrabold text-slate-900">
        {valor}
      </p>

      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {titulo}
      </p>
    </div>
  );
}

function OpcaoMarcacao({
  titulo,
  descricao,
  marcado,
  onChange,
}: {
  titulo: string;
  descricao: string;
  marcado: boolean;
  onChange: (marcado: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-slate-100">
      <input
        type="checkbox"
        checked={marcado}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="mt-1 h-5 w-5 shrink-0 accent-slate-900"
      />

      <span>
        <span className="block font-bold text-slate-900">
          {titulo}
        </span>

        <span className="mt-1 block text-sm leading-relaxed text-slate-500">
          {descricao}
        </span>
      </span>
    </label>
  );
}