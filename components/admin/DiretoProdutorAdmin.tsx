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
const LIMITE_PRODUTORES_ATIVOS = 10;

type StatusProdutor = 'Ativo' | 'Aguardando' | 'Encerrado';

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
  status: StatusProdutor | null;
  observacao: string | null;
  entrou_fila_em?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type FormularioProdutor = {
  produto: string;
  categoria: string;
  nome_produtor: string;
  telefone: string;
  cidade: string;
  localidade: string;
  endereco: string;
  descricao: string;
  imagem_url: string;
  data_inicio: string;
  data_vencimento: string;
  ativo: boolean;
  status: StatusProdutor;
  observacao: string;
};

type TipoMensagem = 'sucesso' | 'erro' | '';

const categoriasDisponiveis = [
  'Queijos e derivados',
  'Pães e quitandas',
  'Bolos e doces',
  'Hortaliças',
  'Frutas',
  'Leite e derivados',
  'Ovos',
  'Mel',
  'Artesanato',
  'Agricultura familiar',
  'Outros',
];

function obterDataAtual(): string {
  const agora = new Date();
  const diferencaFuso = agora.getTimezoneOffset() * 60 * 1000;
  const dataLocal = new Date(agora.getTime() - diferencaFuso);
  return dataLocal.toISOString().split('T')[0];
}

function adicionarDias(data: string, dias: number): string {
  if (!data) return '';

  const [ano, mes, dia] = data.split('-').map(Number);
  const novaData = new Date(ano, mes - 1, dia);

  novaData.setDate(novaData.getDate() + dias);

  const diferencaFuso = novaData.getTimezoneOffset() * 60 * 1000;
  const dataLocal = new Date(novaData.getTime() - diferencaFuso);

  return dataLocal.toISOString().split('T')[0];
}

function criarFormularioInicial(): FormularioProdutor {
  const dataInicio = obterDataAtual();

  return {
    produto: '',
    categoria: 'Agricultura familiar',
    nome_produtor: '',
    telefone: '',
    cidade: 'Nova União',
    localidade: '',
    endereco: '',
    descricao: '',
    imagem_url: '',
    data_inicio: dataInicio,
    data_vencimento: adicionarDias(dataInicio, 30),
    ativo: true,
    status: 'Ativo',
    observacao: '',
  };
}

function converterParaCampoData(valor?: string | null): string {
  return valor ? valor.split('T')[0] : '';
}

function formatarData(valor?: string | null): string {
  if (!valor) return 'Não informada';

  const partes = valor.split('T')[0].split('-');

  if (partes.length !== 3) return valor;

  const [ano, mes, dia] = partes;

  return `${dia}/${mes}/${ano}`;
}

function normalizarTexto(valor: string): string | null {
  const texto = valor.trim();
  return texto.length > 0 ? texto : null;
}

function normalizarTelefone(valor: string): string {
  return valor.replace(/\D/g, '');
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

  return `direto-produtor/${Date.now()}-${identificador}-${nomeBase || 'imagem'}.${extensao}`;
}

function extrairCaminhoStorage(url: string): string | null {
  if (!url) return null;

  const marcador = `/storage/v1/object/public/${BUCKET}/`;
  const indice = url.indexOf(marcador);

  if (indice === -1) return null;

  const caminho = url.slice(indice + marcador.length);

  try {
    return decodeURIComponent(caminho);
  } catch {
    return caminho;
  }
}

function obterStatusEfetivo(produtor: Produtor): StatusProdutor {
  if (
    produtor.status === 'Aguardando' ||
    produtor.status === 'Encerrado'
  ) {
    return produtor.status;
  }

  return produtor.ativo ? 'Ativo' : 'Encerrado';
}

export default function DiretoProdutorAdmin() {
  const [produtores, setProdutores] = useState<Produtor[]>([]);

  const [formulario, setFormulario] =
    useState<FormularioProdutor>(criarFormularioInicial);

  const [idEdicao, setIdEdicao] = useState<string | null>(null);
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
  const [previewImagem, setPreviewImagem] = useState('');
  const [busca, setBusca] = useState('');

  const [filtroStatus, setFiltroStatus] = useState<
    'todos' | 'ativos' | 'aguardando' | 'encerrados'
  >('todos');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoImagem, setEnviandoImagem] = useState(false);

  const [acaoEmAndamento, setAcaoEmAndamento] =
    useState<string | null>(null);

  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] =
    useState<TipoMensagem>('');

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

  const carregarProdutores = useCallback(async () => {
    setCarregando(true);

    const { data, error } = await supabase
      .from('direto_produtor')
      .select('*')
      .order('ativo', { ascending: false })
      .order('data_inicio', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar produtores:', error);
      setProdutores([]);

      mostrarMensagem(
        `Não foi possível carregar os produtores: ${error.message}`,
        'erro'
      );

      setCarregando(false);
      return;
    }

    setProdutores((data || []) as Produtor[]);
    setCarregando(false);
  }, [mostrarMensagem]);

  useEffect(() => {
    carregarProdutores();
  }, [carregarProdutores]);

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

    setFormulario(criarFormularioInicial());
    setIdEdicao(null);
    setArquivoImagem(null);
    setPreviewImagem('');
  }, [previewImagem]);

  const totalAtivos = useMemo(
    () =>
      produtores.filter(
        (item) =>
          item.ativo &&
          obterStatusEfetivo(item) === 'Ativo'
      ).length,
    [produtores]
  );

  const totalAguardando = useMemo(
    () =>
      produtores.filter(
        (item) => obterStatusEfetivo(item) === 'Aguardando'
      ).length,
    [produtores]
  );

  const totalEncerrados = useMemo(
    () =>
      produtores.filter(
        (item) => obterStatusEfetivo(item) === 'Encerrado'
      ).length,
    [produtores]
  );

  const vagasRestantes = Math.max(
    0,
    LIMITE_PRODUTORES_ATIVOS - totalAtivos
  );

  /*
   * ============================================================
   * FILA DE ESPERA
   * ============================================================
   *
   * A ordem é definida por entrou_fila_em.
   *
   * Para registros antigos que ainda não tenham essa informação,
   * usamos created_at como segurança.
   */
  const filaDeEspera = useMemo(() => {
    return produtores
      .filter(
        (item) => obterStatusEfetivo(item) === 'Aguardando'
      )
      .slice()
      .sort((a, b) => {
        const dataA =
          a.entrou_fila_em ||
          a.created_at ||
          '';

        const dataB =
          b.entrou_fila_em ||
          b.created_at ||
          '';

        return dataA.localeCompare(dataB);
      });
  }, [produtores]);

  const posicaoNaFila = useCallback(
    (id: string): number | null => {
      const indice = filaDeEspera.findIndex(
        (item) => item.id === id
      );

      return indice >= 0 ? indice + 1 : null;
    },
    [filaDeEspera]
  );

  const produtoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const telefonePesquisado = normalizarTelefone(termo);

    return produtores.filter((produtor) => {
      const telefoneProdutor = normalizarTelefone(
        produtor.telefone || ''
      );

      const correspondeBusca =
        !termo ||
        produtor.produto.toLowerCase().includes(termo) ||
        produtor.nome_produtor.toLowerCase().includes(termo) ||
        produtor.categoria?.toLowerCase().includes(termo) ||
        produtor.cidade?.toLowerCase().includes(termo) ||
        produtor.localidade?.toLowerCase().includes(termo) ||
        (!!telefonePesquisado &&
          telefoneProdutor.includes(telefonePesquisado));

      if (!correspondeBusca) return false;

      const status = obterStatusEfetivo(produtor);

      if (filtroStatus === 'ativos') {
        return status === 'Ativo';
      }

      if (filtroStatus === 'aguardando') {
        return status === 'Aguardando';
      }

      if (filtroStatus === 'encerrados') {
        return status === 'Encerrado';
      }

      return true;
    });
  }, [busca, filtroStatus, produtores]);

  const atualizarCampo = (
    campo: keyof FormularioProdutor,
    valor: string | boolean
  ) => {
    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));
  };

  const alterarDataInicio = (novaData: string) => {
    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      data_inicio: novaData,
      data_vencimento: novaData
        ? adicionarDias(novaData, 30)
        : '',
    }));
  };

  const alterarStatusFormulario = (
    novoStatus: StatusProdutor
  ) => {
    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      status: novoStatus,
      ativo: novoStatus === 'Ativo',
    }));
  };

  const selecionarImagem = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

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

    if (arquivo.size > 8 * 1024 * 1024) {
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

    setArquivoImagem(arquivo);
    setPreviewImagem(URL.createObjectURL(arquivo));
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

      throw new Error(
        `Erro no upload da imagem: ${erroUpload.message}`
      );
    }

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(caminho);

    setEnviandoImagem(false);

    if (!data.publicUrl) {
      throw new Error(
        'O endereço público da imagem não foi gerado.'
      );
    }

    return data.publicUrl;
  };

  const validarFormulario = (): string | null => {
    if (!formulario.produto.trim()) {
      return 'Informe o produto.';
    }

    if (!formulario.nome_produtor.trim()) {
      return 'Informe o nome do produtor.';
    }

    if (!formulario.telefone.trim()) {
      return 'Informe o telefone ou WhatsApp.';
    }

    const telefoneNumeros = normalizarTelefone(
      formulario.telefone
    );

    if (
      telefoneNumeros.length < 10 ||
      telefoneNumeros.length > 13
    ) {
      return 'Informe um telefone válido com DDD.';
    }

    if (!formulario.cidade.trim()) {
      return 'Informe a cidade.';
    }

    if (!formulario.descricao.trim()) {
      return 'Informe a descrição.';
    }

    if (!formulario.data_inicio) {
      return 'Informe a data inicial.';
    }

    if (!formulario.data_vencimento) {
      return 'Informe a data final.';
    }

    if (
      formulario.data_vencimento <
      formulario.data_inicio
    ) {
      return 'A data final não pode ser anterior à data inicial.';
    }

    if (formulario.status === 'Ativo') {
      const produtorEmEdicao = idEdicao
        ? produtores.find(
            (item) => item.id === idEdicao
          )
        : null;

      const jaEraAtivo =
        !!produtorEmEdicao &&
        produtorEmEdicao.ativo &&
        obterStatusEfetivo(produtorEmEdicao) ===
          'Ativo';

      if (
        !jaEraAtivo &&
        totalAtivos >= LIMITE_PRODUTORES_ATIVOS
      ) {
        return 'As 10 vagas ativas já estão preenchidas. Cadastre o produtor como Aguardando.';
      }
    }

    return null;
  };

  const salvarProdutor = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (salvando || enviandoImagem) return;

    const erroValidacao = validarFormulario();

    if (erroValidacao) {
      mostrarMensagem(erroValidacao, 'erro');
      return;
    }

    setSalvando(true);

    try {
      const imagemAnterior = normalizarTexto(
        formulario.imagem_url
      );

      const imagemUrl = await enviarImagem();

      const produtorAnterior = idEdicao
        ? produtores.find(
            (item) => item.id === idEdicao
          )
        : null;

      const statusAnterior = produtorAnterior
        ? obterStatusEfetivo(produtorAnterior)
        : null;

      /*
       * Se o Admin cadastrar ou editar alguém como Aguardando,
       * registramos quando entrou na fila.
       *
       * Se ele já estava aguardando, preservamos a data original
       * para não perder sua posição.
       */
      let entrouFilaEm: string | null = null;

      if (formulario.status === 'Aguardando') {
        entrouFilaEm =
          statusAnterior === 'Aguardando'
            ? produtorAnterior?.entrou_fila_em ||
              produtorAnterior?.created_at ||
              new Date().toISOString()
            : new Date().toISOString();
      }

      const payload = {
        produto: formulario.produto.trim(),

        categoria:
          formulario.categoria.trim() ||
          'Agricultura familiar',

        nome_produtor:
          formulario.nome_produtor.trim(),

        telefone: formulario.telefone.trim(),

        cidade: formulario.cidade.trim(),

        localidade: normalizarTexto(
          formulario.localidade
        ),

        endereco: normalizarTexto(
          formulario.endereco
        ),

        descricao: formulario.descricao.trim(),

        imagem_url: imagemUrl,

        data_inicio: formulario.data_inicio,

        data_vencimento:
          formulario.data_vencimento,

        ativo: formulario.status === 'Ativo',

        status: formulario.status,

        observacao: normalizarTexto(
          formulario.observacao
        ),

        entrou_fila_em: entrouFilaEm,

        updated_at: new Date().toISOString(),
      };

      if (idEdicao) {
        const { error } = await supabase
          .from('direto_produtor')
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
          const caminhoAnterior =
            extrairCaminhoStorage(imagemAnterior);

          if (caminhoAnterior) {
            const { error: erroRemocao } =
              await supabase.storage
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
          'Produtor atualizado com sucesso.',
          'sucesso'
        );
      } else {
        const { error } = await supabase
          .from('direto_produtor')
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          });

        if (error) {
          throw new Error(error.message);
        }

        mostrarMensagem(
          formulario.status === 'Aguardando'
            ? 'Produtor cadastrado na lista de espera.'
            : 'Produtor cadastrado com sucesso.',
          'sucesso'
        );
      }

      limparFormulario();
      await carregarProdutores();
    } catch (error) {
      console.error(
        'Erro ao salvar produtor:',
        error
      );

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

  const iniciarEdicao = (produtor: Produtor) => {
    if (previewImagem.startsWith('blob:')) {
      URL.revokeObjectURL(previewImagem);
    }

    const status = obterStatusEfetivo(produtor);

    setIdEdicao(produtor.id);
    setArquivoImagem(null);
    setPreviewImagem(produtor.imagem_url || '');

    setFormulario({
      produto: produtor.produto,
      categoria:
        produtor.categoria ||
        'Agricultura familiar',
      nome_produtor: produtor.nome_produtor,
      telefone: produtor.telefone,
      cidade: produtor.cidade || 'Nova União',
      localidade: produtor.localidade || '',
      endereco: produtor.endereco || '',
      descricao: produtor.descricao || '',
      imagem_url: produtor.imagem_url || '',

      data_inicio:
        converterParaCampoData(
          produtor.data_inicio
        ) || obterDataAtual(),

      data_vencimento:
        converterParaCampoData(
          produtor.data_vencimento
        ) ||
        adicionarDias(obterDataAtual(), 30),

      ativo: status === 'Ativo',
      status,
      observacao: produtor.observacao || '',
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /*
   * ============================================================
   * ALTERAÇÃO DE SITUAÇÃO / FILA DE ESPERA
   * ============================================================
   */
  const alterarSituacao = async (
    produtor: Produtor,
    novoStatus: StatusProdutor
  ) => {
    const statusAtual =
      obterStatusEfetivo(produtor);

    /*
     * ----------------------------------------------------------
     * ATIVAR
     * ----------------------------------------------------------
     */
    if (
      novoStatus === 'Ativo' &&
      statusAtual !== 'Ativo'
    ) {
      /*
       * Se as 10 vagas estiverem ocupadas,
       * ele permanece ou entra na fila.
       */
      if (
        totalAtivos >=
        LIMITE_PRODUTORES_ATIVOS
      ) {
        setAcaoEmAndamento(produtor.id);

        const entrouFilaEm =
          produtor.entrou_fila_em ||
          new Date().toISOString();

        const { error } = await supabase
          .from('direto_produtor')
          .update({
            status: 'Aguardando',
            ativo: false,
            entrou_fila_em: entrouFilaEm,
            updated_at: new Date().toISOString(),
          })
          .eq('id', produtor.id);

        if (error) {
          mostrarMensagem(
            `Não foi possível colocar na lista de espera: ${error.message}`,
            'erro'
          );

          setAcaoEmAndamento(null);
          return;
        }

        await carregarProdutores();

        mostrarMensagem(
          statusAtual === 'Aguardando'
            ? 'As 10 vagas estão ocupadas. Este produtor permanece na lista de espera.'
            : 'As 10 vagas estão ocupadas. O produtor foi colocado na lista de espera.',
          'sucesso'
        );

        setAcaoEmAndamento(null);
        return;
      }

      /*
       * Há vaga disponível.
       *
       * Ao ativar alguém da fila, começa um NOVO
       * período de 30 dias a partir de hoje.
       */
      const dataInicio = obterDataAtual();

      const dataVencimento = adicionarDias(
        dataInicio,
        30
      );

      setAcaoEmAndamento(produtor.id);

      const { error } = await supabase
        .from('direto_produtor')
        .update({
          status: 'Ativo',
          ativo: true,
          data_inicio: dataInicio,
          data_vencimento: dataVencimento,
          entrou_fila_em: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', produtor.id);

      if (error) {
        mostrarMensagem(
          `Não foi possível ativar o produtor: ${error.message}`,
          'erro'
        );

        setAcaoEmAndamento(null);
        return;
      }

      await carregarProdutores();

      mostrarMensagem(
        'Produtor ativado. O período de 30 dias começou hoje.',
        'sucesso'
      );

      setAcaoEmAndamento(null);
      return;
    }

    /*
     * ----------------------------------------------------------
     * COLOCAR NA LISTA DE ESPERA
     * ----------------------------------------------------------
     */
    if (novoStatus === 'Aguardando') {
      setAcaoEmAndamento(produtor.id);

      /*
       * Se já estava na fila, preserva a data original.
       * Isso evita perder a posição.
       */
      const entrouFilaEm =
        statusAtual === 'Aguardando'
          ? produtor.entrou_fila_em ||
            produtor.created_at ||
            new Date().toISOString()
          : new Date().toISOString();

      const { error } = await supabase
        .from('direto_produtor')
        .update({
          status: 'Aguardando',
          ativo: false,
          entrou_fila_em: entrouFilaEm,
          updated_at: new Date().toISOString(),
        })
        .eq('id', produtor.id);

      if (error) {
        mostrarMensagem(
          `Não foi possível colocar na lista de espera: ${error.message}`,
          'erro'
        );

        setAcaoEmAndamento(null);
        return;
      }

      await carregarProdutores();

      mostrarMensagem(
        'Produtor colocado na lista de espera.',
        'sucesso'
      );

      setAcaoEmAndamento(null);
      return;
    }

    /*
     * ----------------------------------------------------------
     * ENCERRAR
     * ----------------------------------------------------------
     */
    if (novoStatus === 'Encerrado') {
      setAcaoEmAndamento(produtor.id);

      const { error } = await supabase
        .from('direto_produtor')
        .update({
          status: 'Encerrado',
          ativo: false,
          entrou_fila_em: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', produtor.id);

      if (error) {
        mostrarMensagem(
          `Não foi possível encerrar a participação: ${error.message}`,
          'erro'
        );

        setAcaoEmAndamento(null);
        return;
      }

      await carregarProdutores();

      mostrarMensagem(
        'Participação encerrada. A vaga ficou disponível.',
        'sucesso'
      );

      setAcaoEmAndamento(null);
    }
  };

  const excluirProdutor = async (
    produtor: Produtor
  ) => {
    const confirmou = window.confirm(
      `Deseja realmente excluir permanentemente "${produtor.produto}" de ${produtor.nome_produtor}?\n\nO histórico também será apagado. Para apenas retirar do site, use "Encerrar".`
    );

    if (!confirmou) return;

    setAcaoEmAndamento(produtor.id);

    const { error } = await supabase
      .from('direto_produtor')
      .delete()
      .eq('id', produtor.id);

    if (error) {
      mostrarMensagem(
        `Não foi possível excluir: ${error.message}`,
        'erro'
      );

      setAcaoEmAndamento(null);
      return;
    }

    const caminhoImagem = extrairCaminhoStorage(
      produtor.imagem_url || ''
    );

    if (caminhoImagem) {
      const { error: erroImagem } =
        await supabase.storage
          .from(BUCKET)
          .remove([caminhoImagem]);

      if (erroImagem) {
        console.warn(
          'O registro foi excluído, mas a imagem não pôde ser removida:',
          erroImagem
        );
      }
    }

    setProdutores((listaAtual) =>
      listaAtual.filter(
        (item) => item.id !== produtor.id
      )
    );

    if (idEdicao === produtor.id) {
      limparFormulario();
    }

    mostrarMensagem(
      'Produtor excluído permanentemente.',
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
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
              Administração
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
              Direto do Produtor
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Cadastre, organize e acompanhe os produtores
              participantes, a lista de espera e o histórico do
              programa.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ResumoCard
              titulo="Ativos"
              valor={totalAtivos}
            />

            <ResumoCard
              titulo="Aguardando"
              valor={totalAguardando}
            />

            <ResumoCard
              titulo="Encerrados"
              valor={totalEncerrados}
            />

            <ResumoCard
              titulo="Vagas restantes"
              valor={vagasRestantes}
            />
          </div>
        </div>
      </section>

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

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 md:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                {idEdicao
                  ? 'Editar produtor'
                  : 'Novo produtor'}
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
          onSubmit={salvarProdutor}
          className="grid gap-8 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_360px]"
        >
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Campo>
                <Rotulo htmlFor="produto">
                  Produto *
                </Rotulo>

                <input
                  id="produto"
                  value={formulario.produto}
                  onChange={(e) =>
                    atualizarCampo(
                      'produto',
                      e.target.value
                    )
                  }
                  maxLength={120}
                  placeholder="Ex.: Queijo artesanal"
                  className={classeCampo}
                />
              </Campo>

              <Campo>
                <Rotulo htmlFor="categoria">
                  Categoria *
                </Rotulo>

                <select
                  id="categoria"
                  value={formulario.categoria}
                  onChange={(e) =>
                    atualizarCampo(
                      'categoria',
                      e.target.value
                    )
                  }
                  className={classeCampo}
                >
                  {categoriasDisponiveis.map(
                    (categoria) => (
                      <option key={categoria}>
                        {categoria}
                      </option>
                    )
                  )}
                </select>
              </Campo>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Campo>
                <Rotulo htmlFor="nome_produtor">
                  Nome do produtor *
                </Rotulo>

                <input
                  id="nome_produtor"
                  value={formulario.nome_produtor}
                  onChange={(e) =>
                    atualizarCampo(
                      'nome_produtor',
                      e.target.value
                    )
                  }
                  maxLength={150}
                  placeholder="Nome completo ou nome do negócio"
                  className={classeCampo}
                />
              </Campo>

              <Campo>
                <Rotulo htmlFor="telefone">
                  Telefone / WhatsApp *
                </Rotulo>

                <input
                  id="telefone"
                  type="tel"
                  value={formulario.telefone}
                  onChange={(e) =>
                    atualizarCampo(
                      'telefone',
                      e.target.value
                    )
                  }
                  maxLength={20}
                  placeholder="(31) 99999-9999"
                  className={classeCampo}
                />
              </Campo>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Campo>
                <Rotulo htmlFor="cidade">
                  Cidade *
                </Rotulo>

                <input
                  id="cidade"
                  value={formulario.cidade}
                  onChange={(e) =>
                    atualizarCampo(
                      'cidade',
                      e.target.value
                    )
                  }
                  maxLength={100}
                  placeholder="Nova União"
                  className={classeCampo}
                />
              </Campo>

              <Campo>
                <Rotulo htmlFor="localidade">
                  Localidade
                </Rotulo>

                <input
                  id="localidade"
                  value={formulario.localidade}
                  onChange={(e) =>
                    atualizarCampo(
                      'localidade',
                      e.target.value
                    )
                  }
                  maxLength={150}
                  placeholder="Bairro, comunidade ou zona rural"
                  className={classeCampo}
                />
              </Campo>
            </div>

            <Campo>
              <Rotulo htmlFor="endereco">
                Endereço
              </Rotulo>

              <input
                id="endereco"
                value={formulario.endereco}
                onChange={(e) =>
                  atualizarCampo(
                    'endereco',
                    e.target.value
                  )
                }
                maxLength={250}
                placeholder="Endereço ou ponto de referência"
                className={classeCampo}
              />
            </Campo>

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
                onChange={(e) =>
                  atualizarCampo(
                    'descricao',
                    e.target.value
                  )
                }
                maxLength={800}
                rows={6}
                placeholder="Conte um pouco sobre o produto, produção, encomendas e forma de entrega."
                className={`${classeCampo} min-h-[150px] resize-y`}
              />
            </Campo>

            <fieldset className="rounded-2xl border border-slate-200 p-5">
              <legend className="px-2 text-sm font-bold text-slate-800">
                Período de participação
              </legend>

              <p className="mb-5 text-sm text-slate-500">
                A data final é preenchida automaticamente com 30
                dias, mas poderá ser alterada pela administração.
              </p>

              <div className="grid gap-5 md:grid-cols-2">
                <Campo>
                  <Rotulo htmlFor="data_inicio">
                    Data inicial *
                  </Rotulo>

                  <input
                    id="data_inicio"
                    type="date"
                    value={formulario.data_inicio}
                    onChange={(e) =>
                      alterarDataInicio(
                        e.target.value
                      )
                    }
                    className={classeCampo}
                  />
                </Campo>

                <Campo>
                  <Rotulo htmlFor="data_vencimento">
                    Data final *
                  </Rotulo>

                  <input
                    id="data_vencimento"
                    type="date"
                    value={
                      formulario.data_vencimento
                    }
                    min={
                      formulario.data_inicio ||
                      undefined
                    }
                    onChange={(e) =>
                      atualizarCampo(
                        'data_vencimento',
                        e.target.value
                      )
                    }
                    className={classeCampo}
                  />
                </Campo>
              </div>
            </fieldset>

            <div className="grid gap-5 md:grid-cols-2">
              <Campo>
                <Rotulo htmlFor="status">
                  Status *
                </Rotulo>

                <select
                  id="status"
                  value={formulario.status}
                  onChange={(e) =>
                    alterarStatusFormulario(
                      e.target
                        .value as StatusProdutor
                    )
                  }
                  className={classeCampo}
                >
                  <option>Ativo</option>
                  <option>Aguardando</option>
                  <option>Encerrado</option>
                </select>

                <p className="text-xs text-slate-500">
                  Apenas produtores com status Ativo aparecem no
                  portal.
                </p>
              </Campo>

              <Campo>
                <Rotulo htmlFor="observacao">
                  Observação interna
                </Rotulo>

                <textarea
                  id="observacao"
                  value={formulario.observacao}
                  onChange={(e) =>
                    atualizarCampo(
                      'observacao',
                      e.target.value
                    )
                  }
                  maxLength={500}
                  rows={4}
                  placeholder="Anotações da administração. Não aparecem no site."
                  className={`${classeCampo} min-h-[118px] resize-y`}
                />
              </Campo>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={limparFormulario}
                disabled={salvando}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Limpar
              </button>

              <button
                type="submit"
                disabled={
                  salvando || enviandoImagem
                }
                className="rounded-xl bg-slate-900 px-7 py-3 font-bold text-white shadow-md transition hover:bg-slate-800 disabled:opacity-60"
              >
                {enviandoImagem
                  ? 'Enviando imagem...'
                  : salvando
                    ? 'Salvando...'
                    : idEdicao
                      ? 'Salvar alterações'
                      : 'Cadastrar produtor'}
              </button>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-bold text-slate-900">
                Foto do produto
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Use uma foto clara, bem iluminada e com boa
                qualidade.
              </p>

              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="aspect-[4/3] bg-slate-100">
                  <img
                    src={imagemExibida}
                    alt="Pré-visualização do produto"
                    onError={(event) => {
                      if (
                        !event.currentTarget.src.endsWith(
                          '/images/nova-uniao.jpg'
                        )
                      ) {
                        event.currentTarget.src =
                          '/images/nova-uniao.jpg';
                      }
                    }}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <p className="line-clamp-2 font-bold text-slate-900">
                    {formulario.produto ||
                      'Nome do produto'}
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {formulario.nome_produtor ||
                      'Nome do produtor'}
                  </p>

                  <p className="mt-2 line-clamp-3 text-sm text-slate-500">
                    {formulario.descricao ||
                      'A descrição do produto aparecerá aqui.'}
                  </p>
                </div>
              </div>

              <label className="mt-5 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-400 bg-white px-4 py-4 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
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
                  onClick={
                    removerImagemSelecionada
                  }
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

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-bold text-amber-900">
                Limite do programa
              </p>

              <p className="mt-2 text-sm leading-relaxed text-amber-800">
                O programa permite até{' '}
                {LIMITE_PRODUTORES_ATIVOS} produtores ativos
                simultaneamente. No momento existem{' '}
                <strong>
                  {vagasRestantes} vagas disponíveis
                </strong>
                .
              </p>

              {totalAguardando > 0 && (
                <p className="mt-3 text-sm leading-relaxed text-amber-800">
                  Existem também{' '}
                  <strong>
                    {totalAguardando}{' '}
                    {totalAguardando === 1
                      ? 'produtor'
                      : 'produtores'}
                  </strong>{' '}
                  na lista de espera.
                </p>
              )}
            </div>
          </aside>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-6 md:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Produtores cadastrados
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Consulte participantes ativos, lista de espera e
                histórico encerrado.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto">
              <input
                type="search"
                value={busca}
                onChange={(e) =>
                  setBusca(e.target.value)
                }
                placeholder="Produto, produtor, telefone..."
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-slate-200 sm:min-w-[280px]"
              />

              <select
                value={filtroStatus}
                onChange={(e) =>
                  setFiltroStatus(
                    e.target
                      .value as typeof filtroStatus
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-800 outline-none focus:ring-4 focus:ring-slate-200"
              >
                <option value="todos">
                  Todos
                </option>

                <option value="ativos">
                  Ativos
                </option>

                <option value="aguardando">
                  Aguardando
                </option>

                <option value="encerrados">
                  Encerrados
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {carregando ? (
            <div className="py-16 text-center">
              <p className="font-semibold text-slate-600">
                Carregando produtores...
              </p>
            </div>
          ) : produtoresFiltrados.length ===
            0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
              <h3 className="text-lg font-bold text-slate-800">
                Nenhum produtor encontrado
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Cadastre um novo produtor ou altere os filtros.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full border-separate border-spacing-0">
                <thead>
                  <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="border-b border-slate-200 px-4 py-3">
                      Foto
                    </th>

                    <th className="border-b border-slate-200 px-4 py-3">
                      Produto
                    </th>

                    <th className="border-b border-slate-200 px-4 py-3">
                      Produtor
                    </th>

                    <th className="border-b border-slate-200 px-4 py-3">
                      Telefone
                    </th>

                    <th className="border-b border-slate-200 px-4 py-3">
                      Período
                    </th>

                    <th className="border-b border-slate-200 px-4 py-3">
                      Status
                    </th>

                    <th className="border-b border-slate-200 px-4 py-3 text-right">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {produtoresFiltrados.map(
                    (produtor) => {
                      const bloqueado =
                        acaoEmAndamento ===
                        produtor.id;

                      const status =
                        obterStatusEfetivo(
                          produtor
                        );

                      const posicao =
                        status === 'Aguardando'
                          ? posicaoNaFila(
                              produtor.id
                            )
                          : null;

                      return (
                        <tr
                          key={produtor.id}
                          className="align-middle transition hover:bg-slate-50"
                        >
                          <td className="border-b border-slate-100 px-4 py-4">
                            <img
                              src={
                                produtor.imagem_url ||
                                '/images/nova-uniao.jpg'
                              }
                              alt=""
                              onError={(e) => {
                                if (
                                  !e.currentTarget.src.endsWith(
                                    '/images/nova-uniao.jpg'
                                  )
                                ) {
                                  e.currentTarget.src =
                                    '/images/nova-uniao.jpg';
                                }
                              }}
                              className="h-16 w-20 rounded-xl object-cover"
                            />
                          </td>

                          <td className="border-b border-slate-100 px-4 py-4">
                            <p className="max-w-[220px] font-extrabold text-slate-900">
                              {produtor.produto}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {produtor.categoria ||
                                'Sem categoria'}
                            </p>
                          </td>

                          <td className="border-b border-slate-100 px-4 py-4">
                            <p className="font-semibold text-slate-800">
                              {
                                produtor.nome_produtor
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {[
                                produtor.cidade,
                                produtor.localidade,
                              ]
                                .filter(Boolean)
                                .join(' • ') ||
                                'Local não informado'}
                            </p>
                          </td>

                          <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-700">
                            {produtor.telefone}
                          </td>

                          <td className="border-b border-slate-100 px-4 py-4 text-sm text-slate-600">
                            {status ===
                            'Aguardando' ? (
                              <>
                                <p className="font-semibold text-amber-700">
                                  Aguardando vaga
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  Novo período começa
                                  quando for ativado
                                </p>
                              </>
                            ) : (
                              <>
                                <p>
                                  {formatarData(
                                    produtor.data_inicio
                                  )}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  até{' '}
                                  {formatarData(
                                    produtor.data_vencimento
                                  )}
                                </p>
                              </>
                            )}
                          </td>

                          <td className="border-b border-slate-100 px-4 py-4">
                            <StatusBadge
                              status={status}
                            />

                            {status ===
                              'Aguardando' &&
                              posicao && (
                                <p className="mt-2 text-xs font-bold text-amber-700">
                                  {posicao}º na fila
                                </p>
                              )}
                          </td>

                          <td className="border-b border-slate-100 px-4 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  iniciarEdicao(
                                    produtor
                                  )
                                }
                                disabled={
                                  bloqueado
                                }
                                className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                              >
                                Editar
                              </button>

                              {status !==
                                'Ativo' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    alterarSituacao(
                                      produtor,
                                      'Ativo'
                                    )
                                  }
                                  disabled={
                                    bloqueado
                                  }
                                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                                >
                                  Ativar
                                </button>
                              )}

                              {status !==
                                'Encerrado' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    alterarSituacao(
                                      produtor,
                                      'Encerrado'
                                    )
                                  }
                                  disabled={
                                    bloqueado
                                  }
                                  className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                                >
                                  Encerrar
                                </button>
                              )}

                              {status ===
                                'Encerrado' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    alterarSituacao(
                                      produtor,
                                      'Aguardando'
                                    )
                                  }
                                  disabled={
                                    bloqueado
                                  }
                                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                                >
                                  Aguardar
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  excluirProdutor(
                                    produtor
                                  )
                                }
                                disabled={
                                  bloqueado
                                }
                                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                              >
                                {bloqueado
                                  ? 'Aguarde...'
                                  : 'Excluir'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
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
  return (
    <div className="space-y-2">
      {children}
    </div>
  );
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
    <div className="min-w-[110px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">
      <p className="text-2xl font-extrabold text-slate-900">
        {valor}
      </p>

      <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {titulo}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: StatusProdutor;
}) {
  const classes: Record<
    StatusProdutor,
    string
  > = {
    Ativo:
      'border-emerald-200 bg-emerald-50 text-emerald-700',

    Aguardando:
      'border-amber-200 bg-amber-50 text-amber-700',

    Encerrado:
      'border-slate-300 bg-slate-100 text-slate-600',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${classes[status]}`}
    >
      {status}
    </span>
  );
}