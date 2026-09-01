'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

type AnuncioFinanceiro = {
  id: string;
  titulo: string;
  nome_loja: string;
  telefone: string;
  plano_usado: string;
  status: string;
  payment_status: string;
  aprovado: boolean;
  ativo?: boolean;
  created_at: string;
  data_expiracao?: string | null;
  instagram?: string | null;
  preco?: number | string | null;
  origem?: 'anuncio' | 'agenda_local';
};

type AgendaLocalFinanceiro = {
  id: string;
  nome_completo: string;
  profissao: string;
  whatsapp: string;
  instagram?: string | null;
  pagamento_status: string;
  aprovado: boolean;
  ativo: boolean;
  created_at?: string | null;
  data_cadastro?: string | null;
  data_expiracao?: string | null;
  plano?: string | null;
};

type FiltroModalidade =
  | 'todos'
  | 'pago'
  | 'gratuito'
  | 'cortesia';

type FiltroFinanceiro =
  | 'todos'
  | 'pendente'
  | 'aprovado'
  | 'erro'
  | 'expirando'
  | 'expirado';

type FiltroPeriodo =
  | 'todos'
  | '7dias'
  | '30dias'
  | 'mes_atual'
  | 'personalizado';

type StatusFinanceiro =
  | 'pendente'
  | 'aprovado'
  | 'erro'
  | 'isento_cortesia'
  | 'nao_se_aplica'
  | 'recusado'
  | 'reembolsado'
  | 'cancelado';

type ModalEdicao = {
  anuncio: AnuncioFinanceiro;
  plano: string;
  pagamentoStatus: StatusFinanceiro;
  dataExpiracao: string;
  observacao: string;
};

type ConfiguracaoPlano = {
  id: string;
  codigo: string;
  nome: string;
  valor: number | string;
  duracao_dias: number | null;
  link_pagamento: string | null;
  ativo: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type ValoresPlanos = Record<string, number>;

const VALORES_PLANOS_PADRAO: ValoresPlanos = {
  gratuito: 0,
  impulso: 9.9,
  vitrine: 19.9,
  exclusivo: 29.9,
  agenda_local: 19.9,
};

const NOMES_PLANOS = [
  'Gratuito',
  'Impulso',
  'Vitrine',
  'Exclusivo',
];

const STATUS_FINANCEIROS: Array<{
  value: StatusFinanceiro;
  label: string;
}> = [
  {
    value: 'pendente',
    label: 'Pendente',
  },
  {
    value: 'aprovado',
    label: 'Aprovado',
  },
  {
    value: 'erro',
    label: 'Erro no pagamento',
  },
  {
    value: 'isento_cortesia',
    label: 'Isento — Cortesia',
  },
  {
    value: 'nao_se_aplica',
    label: 'Não se aplica — Gratuito',
  },
  {
    value: 'recusado',
    label: 'Recusado',
  },
  {
    value: 'reembolsado',
    label: 'Reembolsado',
  },
  {
    value: 'cancelado',
    label: 'Cancelado',
  },
];

function normalizarTexto(valor?: string | null) {
  return String(valor || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function somenteNumeros(valor?: string | null) {
  return String(valor || '').replace(/\D/g, '');
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function formatarData(valor?: string | null) {
  if (!valor) {
    return 'Não definida';
  }

  const data = new Date(`${valor.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(data.getTime())) {
    return 'Data inválida';
  }

  return new Intl.DateTimeFormat('pt-BR').format(data);
}

function dataParaInput(valor?: string | null) {
  if (!valor) {
    return '';
  }

  return valor.slice(0, 10);
}

function obterValorPlano(
  plano?: string | null,
  valoresPlanos: ValoresPlanos = VALORES_PLANOS_PADRAO
) {
  const planoNormalizado = normalizarTexto(plano)
    .replace(/\s+/g, '_');

  return (
    valoresPlanos[planoNormalizado] ??
    VALORES_PLANOS_PADRAO[planoNormalizado] ??
    0
  );
}

function obterModalidade(
  anuncio: AnuncioFinanceiro
): 'pago' | 'gratuito' | 'cortesia' {
  const pagamento = normalizarTexto(anuncio.payment_status);
  const plano = normalizarTexto(anuncio.plano_usado);

  if (
    pagamento === 'isento_cortesia' ||
    pagamento === 'cortesia' ||
    pagamento === 'isento - cortesia' ||
    pagamento === 'isento — cortesia'
  ) {
    return 'cortesia';
  }

  if (
    plano === 'gratuito' ||
    pagamento === 'nao_se-aplica' ||
    pagamento === 'nao_se_aplica' ||
    pagamento === 'não se aplica'
  ) {
    return 'gratuito';
  }

  return 'pago';
}

function obterStatusFinanceiro(
  anuncio: AnuncioFinanceiro
): StatusFinanceiro {
  const modalidade = obterModalidade(anuncio);
  const status = normalizarTexto(anuncio.payment_status);

  if (modalidade === 'cortesia') {
    return 'isento_cortesia';
  }

  if (modalidade === 'gratuito') {
    return 'nao_se_aplica';
  }

  if (
    status === 'aprovado' ||
    status === 'approved' ||
    status === 'pago' ||
    status === 'paid'
  ) {
    return 'aprovado';
  }

  if (
    status === 'erro' ||
    status === 'erro no pagamento' ||
    status === 'failed'
  ) {
    return 'erro';
  }

  if (
    status === 'recusado' ||
    status === 'rejected'
  ) {
    return 'recusado';
  }

  if (
    status === 'reembolsado' ||
    status === 'refunded'
  ) {
    return 'reembolsado';
  }

  if (
    status === 'cancelado' ||
    status === 'cancelled'
  ) {
    return 'cancelado';
  }

  return 'pendente';
}

function obterDiasAteVencimento(valor?: string | null) {
  if (!valor) {
    return null;
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const vencimento = new Date(`${valor.slice(0, 10)}T12:00:00`);
  vencimento.setHours(0, 0, 0, 0);

  if (Number.isNaN(vencimento.getTime())) {
    return null;
  }

  const diferenca =
    vencimento.getTime() - hoje.getTime();

  return Math.ceil(diferenca / (1000 * 60 * 60 * 24));
}

function inicioDoDia(data: Date) {
  const copia = new Date(data);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function fimDoDia(data: Date) {
  const copia = new Date(data);
  copia.setHours(23, 59, 59, 999);
  return copia;
}

function obterIntervaloPeriodo(
  filtro: FiltroPeriodo,
  dataInicio: string,
  dataFim: string
): { inicio: Date | null; fim: Date | null } {
  const hoje = new Date();

  if (filtro === 'todos') {
    return { inicio: null, fim: null };
  }

  if (filtro === '7dias') {
    const inicio = inicioDoDia(new Date());
    inicio.setDate(inicio.getDate() - 6);
    return { inicio, fim: fimDoDia(hoje) };
  }

  if (filtro === '30dias') {
    const inicio = inicioDoDia(new Date());
    inicio.setDate(inicio.getDate() - 29);
    return { inicio, fim: fimDoDia(hoje) };
  }

  if (filtro === 'mes_atual') {
    return {
      inicio: new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1,
        0,
        0,
        0,
        0
      ),
      fim: fimDoDia(hoje),
    };
  }

  return {
    inicio: dataInicio
      ? inicioDoDia(new Date(`${dataInicio}T12:00:00`))
      : null,
    fim: dataFim
      ? fimDoDia(new Date(`${dataFim}T12:00:00`))
      : null,
  };
}

function anuncioDentroDoPeriodo(
  anuncio: AnuncioFinanceiro,
  filtro: FiltroPeriodo,
  dataInicio: string,
  dataFim: string
) {
  const { inicio, fim } = obterIntervaloPeriodo(
    filtro,
    dataInicio,
    dataFim
  );

  if (!inicio && !fim) return true;

  const referencia = new Date(anuncio.created_at);
  if (Number.isNaN(referencia.getTime())) return false;
  if (inicio && referencia < inicio) return false;
  if (fim && referencia > fim) return false;
  return true;
}

function obterNomeEmpresa(anuncio: AnuncioFinanceiro) {
  return (
    anuncio.nome_loja?.trim() ||
    anuncio.titulo?.trim() ||
    'Anunciante sem nome'
  );
}

function obterMensagemWhatsApp(
  anuncio: AnuncioFinanceiro,
  tipo:
    | 'aprovado'
    | 'pendente'
    | 'erro'
    | 'expirando'
    | 'expirado'
) {
  const nome = obterNomeEmpresa(anuncio);
  const plano = anuncio.plano_usado || 'selecionado';

  const mensagens = {
    aprovado:
      `Olá, ${nome}! O pagamento do seu Plano ${plano} no Conecta Cidade foi aprovado. ` +
      `Seu anúncio seguirá o fluxo de publicação do portal. Obrigado pela confiança!`,

    pendente:
      `Olá, ${nome}! Identificamos que o pagamento do seu Plano ${plano} no Conecta Cidade ainda está pendente. ` +
      `Caso já tenha realizado o pagamento, desconsidere esta mensagem ou envie o comprovante para conferência.`,

    erro:
      `Olá, ${nome}! Não conseguimos confirmar o pagamento do seu Plano ${plano} no Conecta Cidade. ` +
      `Por favor, confira os dados do pagamento ou entre em contato conosco para regularização.`,

    expirando:
      `Olá, ${nome}! Seu Plano ${plano} no Conecta Cidade está próximo do vencimento, previsto para ${formatarData(
        anuncio.data_expiracao
      )}. Entre em contato para renovar e manter seu anúncio ativo.`,

    expirado:
      `Olá, ${nome}! Seu Plano ${plano} no Conecta Cidade venceu em ${formatarData(
        anuncio.data_expiracao
      )}. Entre em contato para renovar e reativar sua divulgação.`,
  };

  return mensagens[tipo];
}

export default function FinanceiroAdmin() {
  const [anuncios, setAnuncios] = useState<AnuncioFinanceiro[]>([]);
  const [agendaLocal, setAgendaLocal] = useState<AgendaLocalFinanceiro[]>([]);
  const [configuracoesPlanos, setConfiguracoesPlanos] = useState<
    ConfiguracaoPlano[]
  >([]);
  const [processandoPlano, setProcessandoPlano] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [processandoId, setProcessandoId] = useState<string | null>(
    null
  );

  const [busca, setBusca] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] =
    useState<FiltroPeriodo>('30dias');
  const [dataInicioPeriodo, setDataInicioPeriodo] = useState('');
  const [dataFimPeriodo, setDataFimPeriodo] = useState('');
  const [filtroModalidade, setFiltroModalidade] =
    useState<FiltroModalidade>('todos');
  const [filtroFinanceiro, setFiltroFinanceiro] =
    useState<FiltroFinanceiro>('todos');

  const [modalEdicao, setModalEdicao] =
    useState<ModalEdicao | null>(null);

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  const carregarAnuncios = async () => {
    setErro('');

    const { data, error } = await supabase
      .from('anuncios')
      .select('*')
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      console.error(
        'Erro ao carregar dados financeiros:',
        error
      );

      setErro(
        'Não foi possível carregar os dados financeiros.'
      );
      setAnuncios([]);
      return;
    }

    setAnuncios((data || []) as AnuncioFinanceiro[]);
  };

  const carregarAgendaLocal = async () => {
    const { data, error } = await supabase
      .from('agenda_local')
      .select(
        'id, nome_completo, profissao, whatsapp, instagram, pagamento_status, aprovado, ativo, created_at, data_cadastro, data_expiracao, plano'
      )
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      console.error(
        'Erro ao carregar Agenda Local no financeiro:',
        error
      );

      setErro(
        'Os anúncios foram carregados, mas não foi possível carregar os dados financeiros da Agenda Local.'
      );
      setAgendaLocal([]);
      return;
    }

    setAgendaLocal(
      (data || []) as AgendaLocalFinanceiro[]
    );
  };

  const carregarConfiguracoesPlanos = async () => {
    const { data, error } = await supabase
      .from('configuracoes_planos')
      .select('*')
      .order('nome', {
        ascending: true,
      });

    if (error) {
      console.error(
        'Erro ao carregar configurações dos planos:',
        error
      );

      setErro(
        'Os dados financeiros foram carregados, mas não foi possível carregar as configurações dos planos.'
      );
      setConfiguracoesPlanos([]);
      return;
    }

    setConfiguracoesPlanos(
      (data || []) as ConfiguracaoPlano[]
    );
  };

  const carregarFinanceiroCompleto = async () => {
    setLoading(true);
    setErro('');

    await Promise.all([
      carregarAnuncios(),
      carregarAgendaLocal(),
      carregarConfiguracoesPlanos(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    carregarFinanceiroCompleto();
  }, []);

  useEffect(() => {
    if (!mensagem) {
      return;
    }

    const temporizador = window.setTimeout(() => {
      setMensagem('');
    }, 4000);

    return () => {
      window.clearTimeout(temporizador);
    };
  }, [mensagem]);

  const valoresPlanos = useMemo<ValoresPlanos>(() => {
    const valores: ValoresPlanos = {
      ...VALORES_PLANOS_PADRAO,
    };

    configuracoesPlanos.forEach((configuracao) => {
      valores[configuracao.codigo] =
        Number(configuracao.valor) || 0;
    });

    return valores;
  }, [configuracoesPlanos]);

  const atualizarConfiguracaoLocal = (
    codigo: string,
    campo:
      | 'valor'
      | 'duracao_dias'
      | 'link_pagamento'
      | 'ativo',
    valor: string | number | boolean | null
  ) => {
    setConfiguracoesPlanos((estadoAtual) =>
      estadoAtual.map((configuracao) =>
        configuracao.codigo === codigo
          ? {
              ...configuracao,
              [campo]: valor,
            }
          : configuracao
      )
    );
  };

  const salvarConfiguracaoPlano = async (
    configuracao: ConfiguracaoPlano
  ) => {
    setProcessandoPlano(configuracao.codigo);
    setErro('');
    setMensagem('');

    const valorNumerico = Number(configuracao.valor);

    if (
      !Number.isFinite(valorNumerico) ||
      valorNumerico < 0
    ) {
      setErro(
        `Informe um valor válido para ${configuracao.nome}.`
      );
      setProcessandoPlano(null);
      return;
    }

    if (
      configuracao.duracao_dias !== null &&
      (!Number.isInteger(
        Number(configuracao.duracao_dias)
      ) ||
        Number(configuracao.duracao_dias) <= 0)
    ) {
      setErro(
        `Informe uma duração válida para ${configuracao.nome}.`
      );
      setProcessandoPlano(null);
      return;
    }

    const linkPagamento =
      configuracao.link_pagamento?.trim() || null;

    if (
      linkPagamento &&
      !/^https?:\/\//i.test(linkPagamento)
    ) {
      setErro(
        `O link de pagamento de ${configuracao.nome} precisa começar com http:// ou https://.`
      );
      setProcessandoPlano(null);
      return;
    }

    const { error } = await supabase
      .from('configuracoes_planos')
      .update({
        valor: valorNumerico,
        duracao_dias:
          configuracao.duracao_dias === null
            ? null
            : Number(configuracao.duracao_dias),
        link_pagamento: linkPagamento,
        ativo: configuracao.ativo,
        updated_at: new Date().toISOString(),
      })
      .eq('codigo', configuracao.codigo);

    if (error) {
      console.error(
        'Erro ao salvar configuração do plano:',
        error
      );

      setErro(
        `Não foi possível salvar ${configuracao.nome}: ${error.message}`
      );
      setProcessandoPlano(null);
      return;
    }

    setConfiguracoesPlanos((estadoAtual) =>
      estadoAtual.map((item) =>
        item.codigo === configuracao.codigo
          ? {
              ...item,
              valor: valorNumerico,
              duracao_dias:
                configuracao.duracao_dias === null
                  ? null
                  : Number(configuracao.duracao_dias),
              link_pagamento: linkPagamento,
            }
          : item
      )
    );

    setMensagem(
      `${configuracao.nome} atualizado com sucesso.`
    );
    setProcessandoPlano(null);
  };

  const registrosFinanceiros = useMemo<
    AnuncioFinanceiro[]
  >(() => {
    const registrosAnuncios =
      anuncios.map((anuncio) => ({
        ...anuncio,
        origem: 'anuncio' as const,
      }));

    const registrosAgenda =
      agendaLocal.map((agenda) => ({
        id: agenda.id,
        titulo: agenda.profissao || 'Agenda Local',
        nome_loja:
          agenda.nome_completo || 'Profissional',
        telefone: agenda.whatsapp || '',
        plano_usado: 'Agenda Local',
        status:
          agenda.aprovado && agenda.ativo
            ? 'APROVADO'
            : agenda.aprovado
              ? 'APROVADO'
              : 'PENDENTE',
        payment_status:
          agenda.pagamento_status || 'pendente',
        aprovado: agenda.aprovado,
        ativo: agenda.ativo,
        created_at:
          agenda.data_cadastro ||
          agenda.created_at ||
          new Date().toISOString(),
        data_expiracao:
          agenda.data_expiracao || null,
        instagram: agenda.instagram || null,
        preco: null,
        origem: 'agenda_local' as const,
      }));

    return [
      ...registrosAnuncios,
      ...registrosAgenda,
    ].sort((a, b) => {
      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });
  }, [anuncios, agendaLocal]);

  const anunciosDoPeriodo = useMemo(() => {
    return registrosFinanceiros.filter((anuncio) =>
      anuncioDentroDoPeriodo(
        anuncio,
        filtroPeriodo,
        dataInicioPeriodo,
        dataFimPeriodo
      )
    );
  }, [
    registrosFinanceiros,
    filtroPeriodo,
    dataInicioPeriodo,
    dataFimPeriodo,
  ]);

  const resumo = useMemo(() => {
    let receitaRecebida = 0;
    let pagamentosPendentes = 0;
    let pagamentosAprovados = 0;
    let pagamentosComErro = 0;
    let gratuitos = 0;
    let cortesias = 0;
    let expirando = 0;
    let expirados = 0;
    let pagosAtivos = 0;

    const porPlano: Record<string, number> = {
      gratuito: 0,
      impulso: 0,
      vitrine: 0,
      exclusivo: 0,
      agenda_local: 0,
    };

    anunciosDoPeriodo.forEach((anuncio) => {
      const modalidade = obterModalidade(anuncio);
      const statusFinanceiro = obterStatusFinanceiro(anuncio);
      const valorPlano = obterValorPlano(
        anuncio.plano_usado,
        valoresPlanos
      );
      const dias = obterDiasAteVencimento(anuncio.data_expiracao);
      const planoNormalizado = normalizarTexto(
        anuncio.plano_usado
      ).replace(/\s+/g, '_');

      if (planoNormalizado in porPlano) {
        porPlano[planoNormalizado] += 1;
      }

      if (
        modalidade === 'pago' &&
        statusFinanceiro === 'aprovado'
      ) {
        receitaRecebida += valorPlano;
        pagamentosAprovados += 1;
        if (anuncio.ativo !== false) pagosAtivos += 1;
      }

      if (
        modalidade === 'pago' &&
        statusFinanceiro === 'pendente'
      ) pagamentosPendentes += 1;

      if (
        modalidade === 'pago' &&
        (statusFinanceiro === 'erro' ||
          statusFinanceiro === 'recusado')
      ) pagamentosComErro += 1;

      if (modalidade === 'gratuito') gratuitos += 1;
      if (modalidade === 'cortesia') cortesias += 1;
      if (dias !== null && dias >= 0 && dias <= 7) expirando += 1;
      if (dias !== null && dias < 0) expirados += 1;
    });

    return {
      receitaRecebida,
      pagamentosPendentes,
      pagamentosAprovados,
      pagamentosComErro,
      gratuitos,
      cortesias,
      expirando,
      expirados,
      pagosAtivos,
      ticketMedio:
        pagamentosAprovados > 0
          ? receitaRecebida / pagamentosAprovados
          : 0,
      porPlano,
    };
  }, [anunciosDoPeriodo, valoresPlanos]);

  const anunciosFiltrados = useMemo(() => {
    const termo = normalizarTexto(busca);

    return registrosFinanceiros.filter((anuncio) => {
      if (
        !anuncioDentroDoPeriodo(
          anuncio,
          filtroPeriodo,
          dataInicioPeriodo,
          dataFimPeriodo
        )
      ) {
        return false;
      }

      const modalidade = obterModalidade(anuncio);
      const statusFinanceiro =
        obterStatusFinanceiro(anuncio);
      const dias = obterDiasAteVencimento(
        anuncio.data_expiracao
      );

      const correspondeBusca =
        !termo ||
        normalizarTexto(anuncio.nome_loja).includes(
          termo
        ) ||
        normalizarTexto(anuncio.titulo).includes(
          termo
        ) ||
        normalizarTexto(anuncio.telefone).includes(
          termo
        ) ||
        normalizarTexto(anuncio.plano_usado).includes(
          termo
        );

      const correspondeModalidade =
        filtroModalidade === 'todos' ||
        modalidade === filtroModalidade;

      let correspondeFinanceiro = true;

      if (filtroFinanceiro === 'pendente') {
        correspondeFinanceiro =
          statusFinanceiro === 'pendente';
      }

      if (filtroFinanceiro === 'aprovado') {
        correspondeFinanceiro =
          statusFinanceiro === 'aprovado';
      }

      if (filtroFinanceiro === 'erro') {
        correspondeFinanceiro =
          statusFinanceiro === 'erro';
      }

      if (filtroFinanceiro === 'expirando') {
        correspondeFinanceiro =
          dias !== null && dias >= 0 && dias <= 7;
      }

      if (filtroFinanceiro === 'expirado') {
        correspondeFinanceiro =
          dias !== null && dias < 0;
      }

      return (
        correspondeBusca &&
        correspondeModalidade &&
        correspondeFinanceiro
      );
    });
  }, [
    registrosFinanceiros,
    busca,
    filtroModalidade,
    filtroFinanceiro,
    filtroPeriodo,
    dataInicioPeriodo,
    dataFimPeriodo,
  ]);

  const atualizarPagamentoRapido = async (
    anuncio: AnuncioFinanceiro,
    novoStatus: StatusFinanceiro
  ) => {
    setProcessandoId(anuncio.id);
    setErro('');

    const { error } = await supabase
      .from('anuncios')
      .update({
        payment_status: novoStatus,
      })
      .eq('id', anuncio.id);

    if (error) {
      console.error(
        'Erro ao atualizar pagamento:',
        error
      );

      setErro(
        'Não foi possível atualizar o status financeiro.'
      );
      setProcessandoId(null);
      return;
    }

    setAnuncios((estadoAtual) =>
      estadoAtual.map((item) =>
        item.id === anuncio.id
          ? {
              ...item,
              payment_status: novoStatus,
            }
          : item
      )
    );

    setMensagem('Status financeiro atualizado.');
    setProcessandoId(null);
  };

  const abrirEdicao = (
    anuncio: AnuncioFinanceiro
  ) => {
    setModalEdicao({
      anuncio,
      plano: anuncio.plano_usado || 'Gratuito',
      pagamentoStatus:
        obterStatusFinanceiro(anuncio),
      dataExpiracao: dataParaInput(
        anuncio.data_expiracao
      ),
      observacao: '',
    });

    setErro('');
  };

  const salvarEdicao = async () => {
    if (!modalEdicao) {
      return;
    }

    setProcessandoId(modalEdicao.anuncio.id);
    setErro('');

    const atualizacao: {
      plano_usado: string;
      payment_status: StatusFinanceiro;
      data_expiracao: string | null;
    } = {
      plano_usado: modalEdicao.plano,
      payment_status:
        modalEdicao.pagamentoStatus,
      data_expiracao:
        modalEdicao.dataExpiracao || null,
    };

    const { error } = await supabase
      .from('anuncios')
      .update(atualizacao)
      .eq('id', modalEdicao.anuncio.id);

    if (error) {
      console.error(
        'Erro ao salvar alterações financeiras:',
        error
      );

      setErro(
        'Não foi possível salvar as alterações. Verifique se a coluna data_expiracao existe na tabela anuncios.'
      );
      setProcessandoId(null);
      return;
    }

    setAnuncios((estadoAtual) =>
      estadoAtual.map((item) =>
        item.id === modalEdicao.anuncio.id
          ? {
              ...item,
              ...atualizacao,
            }
          : item
      )
    );

    setMensagem(
      'Informações financeiras salvas com sucesso.'
    );
    setModalEdicao(null);
    setProcessandoId(null);
  };

  const copiarMensagem = async (
    anuncio: AnuncioFinanceiro,
    tipo:
      | 'aprovado'
      | 'pendente'
      | 'erro'
      | 'expirando'
      | 'expirado'
  ) => {
    const texto = obterMensagemWhatsApp(
      anuncio,
      tipo
    );

    try {
      await navigator.clipboard.writeText(texto);
      setMensagem(
        'Mensagem copiada para a área de transferência.'
      );
    } catch (clipboardError) {
      console.error(
        'Erro ao copiar mensagem:',
        clipboardError
      );

      setErro(
        'Não foi possível copiar a mensagem automaticamente.'
      );
    }
  };

  const abrirWhatsApp = (
    anuncio: AnuncioFinanceiro,
    tipo:
      | 'aprovado'
      | 'pendente'
      | 'erro'
      | 'expirando'
      | 'expirado'
  ) => {
    let telefone = somenteNumeros(
      anuncio.telefone
    );

    if (!telefone) {
      setErro(
        'Esse anunciante não possui telefone cadastrado.'
      );
      return;
    }

    if (
      telefone.length === 10 ||
      telefone.length === 11
    ) {
      telefone = `55${telefone}`;
    }

    const mensagemWhatsApp =
      obterMensagemWhatsApp(anuncio, tipo);

    const url =
      `https://wa.me/${telefone}` +
      `?text=${encodeURIComponent(
        mensagemWhatsApp
      )}`;

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const limparFiltros = () => {
    setBusca('');
    setFiltroModalidade('todos');
    setFiltroFinanceiro('todos');
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-10 shadow-sm">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />

          <p className="text-slate-600 mt-4">
            Carregando informações financeiras...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-violet-600 mb-2">
              Controle financeiro
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Painel financeiro
            </h2>

            <p className="text-slate-600 mt-2 max-w-3xl">
              Acompanhe receitas, desempenho dos planos,
              pagamentos pendentes, vencimentos e
              configurações comerciais do portal.
            </p>
          </div>

          <button
            type="button"
            onClick={carregarFinanceiroCompleto}
            className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-2xl font-semibold transition-colors"
          >
            Atualizar financeiro
          </button>
        </div>
      </section>

      {mensagem && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-5 py-4 font-medium">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 font-medium">
          {erro}
        </div>
      )}

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-7 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-violet-600 mb-2">
              Visão financeira
            </p>
            <h3 className="text-2xl font-bold text-slate-900">
              Resumo do período
            </h3>
            <p className="text-sm text-slate-500 mt-2 max-w-3xl">
              O período considera a data de cadastro do anúncio ou da Agenda Local. O resumo consolida Anúncios + Agenda Local; o histórico exato de cada renovação será registrado em uma etapa própria.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 w-full xl:w-auto">
            <select
              value={filtroPeriodo}
              onChange={(event) =>
                setFiltroPeriodo(event.target.value as FiltroPeriodo)
              }
              className="border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="todos">Todo o período</option>
              <option value="7dias">Últimos 7 dias</option>
              <option value="30dias">Últimos 30 dias</option>
              <option value="mes_atual">Mês atual</option>
              <option value="personalizado">Personalizado</option>
            </select>

            {filtroPeriodo === 'personalizado' && (
              <>
                <input
                  type="date"
                  value={dataInicioPeriodo}
                  onChange={(event) =>
                    setDataInicioPeriodo(event.target.value)
                  }
                  className="border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  type="date"
                  value={dataFimPeriodo}
                  onChange={(event) =>
                    setDataFimPeriodo(event.target.value)
                  }
                  className="border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-violet-500"
                />
              </>
            )}
          </div>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <CardResumo
          titulo="Receita aprovada"
          valor={formatarMoeda(resumo.receitaRecebida)}
          descricao={`${resumo.pagamentosAprovados} pagamento(s) aprovado(s)`}
          destaque="emerald"
        />
        <CardResumo
          titulo="Pagamentos pendentes"
          valor={String(resumo.pagamentosPendentes)}
          descricao="Aguardando confirmação"
          destaque="amber"
        />
        <CardResumo
          titulo="Erros / recusados"
          valor={String(resumo.pagamentosComErro)}
          descricao="Precisam de atenção"
          destaque="red"
        />
        <CardResumo
          titulo="Ticket médio"
          valor={formatarMoeda(resumo.ticketMedio)}
          descricao="Média dos pagamentos aprovados"
          destaque="violet"
        />
        <CardResumo
          titulo="Pagos ativos"
          valor={String(resumo.pagosAtivos)}
          descricao="Planos pagos em divulgação"
          destaque="blue"
        />
        <CardResumo
          titulo="Gratuitos"
          valor={String(resumo.gratuitos)}
          descricao="Cadastros gratuitos no período"
          destaque="slate"
        />
        <CardResumo
          titulo="Expirando"
          valor={String(resumo.expirando)}
          descricao="Vencem nos próximos 7 dias"
          destaque="orange"
        />
        <CardResumo
          titulo="Expirados"
          valor={String(resumo.expirados)}
          descricao="Precisam de nova contratação"
          destaque="rose"
        />
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-7 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wider text-violet-600 mb-2">
          Desempenho comercial
        </p>
        <h3 className="text-2xl font-bold text-slate-900">
          Quantidade por plano
        </h3>
        <p className="text-slate-600 mt-2 mb-5">
          Veja quais opções estão sendo mais utilizadas no período selecionado.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <MiniCardPlano nome="Gratuito" quantidade={resumo.porPlano.gratuito} />
          <MiniCardPlano nome="Impulso" quantidade={resumo.porPlano.impulso} />
          <MiniCardPlano nome="Vitrine" quantidade={resumo.porPlano.vitrine} />
          <MiniCardPlano nome="Exclusivo" quantidade={resumo.porPlano.exclusivo} />
          <MiniCardPlano nome="Agenda Local" quantidade={resumo.porPlano.agenda_local} />
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-7 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-wider text-amber-600 mb-2">
          Atenção comercial
        </p>
        <h3 className="text-2xl font-bold text-slate-900">
          Pagamentos pendentes
        </h3>
        <p className="text-slate-600 mt-2 mb-5">
          Clientes com plano pago sem confirmação. Use o WhatsApp para oferecer ajuda na conclusão.
        </p>

        {anunciosDoPeriodo.filter(
          (anuncio) =>
            obterModalidade(anuncio) === 'pago' &&
            obterStatusFinanceiro(anuncio) === 'pendente'
        ).length === 0 ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-5 text-emerald-800">
            Nenhum pagamento pendente no período selecionado.
          </div>
        ) : (
          <div className="space-y-3">
            {anunciosDoPeriodo
              .filter(
                (anuncio) =>
                  obterModalidade(anuncio) === 'pago' &&
                  obterStatusFinanceiro(anuncio) === 'pendente'
              )
              .map((anuncio) => (
                <div
                  key={anuncio.id}
                  className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"
                >
                  <div>
                    <p className="font-bold text-slate-900">
                      {obterNomeEmpresa(anuncio)}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {anuncio.plano_usado || 'Plano não definido'} •{' '}
                      {formatarMoeda(
                        obterValorPlano(anuncio.plano_usado, valoresPlanos)
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => abrirWhatsApp(anuncio, 'pendente')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
                    >
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => copiarMensagem(anuncio, 'pendente')}
                      className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold"
                    >
                      Copiar mensagem
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-7 shadow-sm">
        <div className="mb-5">
          <p className="text-sm font-bold uppercase tracking-wider text-violet-600 mb-2">Histórico financeiro</p>
          <h3 className="text-2xl font-bold text-slate-900">Consultar clientes e cadastros</h3>
          <p className="text-slate-600 mt-2">Pesquisa e acompanhamento consolidado de Anúncios + Agenda Local. Alterações operacionais continuam nas respectivas abas.</p>
        </div>
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label
              htmlFor="busca-financeiro"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Buscar cliente
            </label>

            <input
              id="busca-financeiro"
              type="text"
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
              placeholder="Nome, empresa, profissão, telefone ou plano"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            />
          </div>

          <div>
            <label
              htmlFor="filtro-modalidade"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Modalidade
            </label>

            <select
              id="filtro-modalidade"
              value={filtroModalidade}
              onChange={(event) =>
                setFiltroModalidade(
                  event.target
                    .value as FiltroModalidade
                )
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="todos">
                Todas
              </option>

              <option value="pago">
                Pagos
              </option>

              <option value="gratuito">
                Gratuitos
              </option>

              <option value="cortesia">
                Benefícios
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="filtro-financeiro"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Situação
            </label>

            <select
              id="filtro-financeiro"
              value={filtroFinanceiro}
              onChange={(event) =>
                setFiltroFinanceiro(
                  event.target
                    .value as FiltroFinanceiro
                )
              }
              className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            >
              <option value="todos">
                Todas
              </option>

              <option value="pendente">
                Pendentes
              </option>

              <option value="aprovado">
                Aprovados
              </option>

              <option value="erro">
                Erros
              </option>

              <option value="expirando">
                Expirando
              </option>

              <option value="expirado">
                Expirados
              </option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-5 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Exibindo{' '}
            <strong className="text-slate-900">
              {anunciosFiltrados.length}
            </strong>{' '}
            de{' '}
            <strong className="text-slate-900">
              {registrosFinanceiros.length}
            </strong>{' '}
            registro(s).
          </p>

          <button
            type="button"
            onClick={limparFiltros}
            className="text-violet-700 hover:text-violet-900 font-semibold"
          >
            Limpar filtros
          </button>
        </div>
      </section>

      {anunciosFiltrados.length === 0 ? (
        <section className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-2xl">
            $
          </div>

          <h3 className="text-xl font-bold text-slate-900 mt-5">
            Nenhum registro encontrado
          </h3>

          <p className="text-slate-600 mt-2">
            Altere os filtros ou verifique se existem
            anúncios ou profissionais da Agenda Local cadastrados.
          </p>
        </section>
      ) : (
        <>
          <section className="hidden xl:block bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px]">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <CabecalhoTabela>
                      Anunciante
                    </CabecalhoTabela>

                    <CabecalhoTabela>
                      Plano
                    </CabecalhoTabela>

                    <CabecalhoTabela>
                      Modalidade
                    </CabecalhoTabela>

                    <CabecalhoTabela>
                      Valor
                    </CabecalhoTabela>

                    <CabecalhoTabela>
                      Financeiro
                    </CabecalhoTabela>

                    <CabecalhoTabela>
                      Vencimento
                    </CabecalhoTabela>

                    <CabecalhoTabela>
                      Anúncio
                    </CabecalhoTabela>

                    <CabecalhoTabela>
                      Ações
                    </CabecalhoTabela>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {anunciosFiltrados.map(
                    (anuncio) => (
                      <LinhaFinanceira
                        key={anuncio.id}
                        anuncio={anuncio}
                        valoresPlanos={valoresPlanos}
                        processando={
                          processandoId ===
                          anuncio.id
                        }
                        onAprovar={() =>
                          atualizarPagamentoRapido(
                            anuncio,
                            'aprovado'
                          )
                        }
                        onPendente={() =>
                          atualizarPagamentoRapido(
                            anuncio,
                            'pendente'
                          )
                        }
                        onEditar={() =>
                          abrirEdicao(anuncio)
                        }
                        onWhatsApp={() =>
                          abrirWhatsApp(
                            anuncio,
                            obterTipoMensagem(anuncio)
                          )
                        }
                        onCopiar={() =>
                          copiarMensagem(
                            anuncio,
                            obterTipoMensagem(anuncio)
                          )
                        }
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="xl:hidden grid md:grid-cols-2 gap-5">
            {anunciosFiltrados.map(
              (anuncio) => (
                <CardFinanceiroMobile
                  key={anuncio.id}
                  anuncio={anuncio}
                  valoresPlanos={valoresPlanos}
                  processando={
                    processandoId === anuncio.id
                  }
                  onAprovar={() =>
                    atualizarPagamentoRapido(
                      anuncio,
                      'aprovado'
                    )
                  }
                  onPendente={() =>
                    atualizarPagamentoRapido(
                      anuncio,
                      'pendente'
                    )
                  }
                  onEditar={() =>
                    abrirEdicao(anuncio)
                  }
                  onWhatsApp={() =>
                    abrirWhatsApp(
                      anuncio,
                      obterTipoMensagem(anuncio)
                    )
                  }
                  onCopiar={() =>
                    copiarMensagem(
                      anuncio,
                      obterTipoMensagem(anuncio)
                    )
                  }
                />
              )
            )}
          </section>
        </>
      )}

      <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-violet-600 mb-2">
              Configurações comerciais
            </p>

            <h3 className="text-2xl font-bold text-slate-900">
              Planos e links de pagamento
            </h3>

            <p className="text-slate-600 mt-2 max-w-3xl">
              Altere valores, duração, link do Mercado Pago e disponibilidade sem editar o código do site.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            Salve cada plano individualmente.
          </p>
        </div>

        {configuracoesPlanos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <p className="font-semibold text-slate-700">
              Nenhuma configuração de plano foi encontrada.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {configuracoesPlanos.map((configuracao) => {
              const gratuito =
                configuracao.codigo === 'gratuito';

              return (
                <article
                  key={configuracao.codigo}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="grid gap-4 xl:grid-cols-[180px_150px_150px_minmax(280px,1fr)_120px_130px] xl:items-end">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Plano
                      </p>

                      <p className="mt-2 font-bold text-slate-900">
                        {configuracao.nome}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {configuracao.codigo}
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor={`valor-${configuracao.codigo}`}
                        className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
                      >
                        Valor
                      </label>

                      <input
                        id={`valor-${configuracao.codigo}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={configuracao.valor}
                        onChange={(event) =>
                          atualizarConfiguracaoLocal(
                            configuracao.codigo,
                            'valor',
                            event.target.value
                          )
                        }
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`duracao-${configuracao.codigo}`}
                        className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
                      >
                        Duração
                      </label>

                      <div className="relative">
                        <input
                          id={`duracao-${configuracao.codigo}`}
                          type="number"
                          min="1"
                          step="1"
                          value={
                            configuracao.duracao_dias ?? ''
                          }
                          onChange={(event) =>
                            atualizarConfiguracaoLocal(
                              configuracao.codigo,
                              'duracao_dias',
                              event.target.value === ''
                                ? null
                                : Number(event.target.value)
                            )
                          }
                          className="w-full border border-slate-300 rounded-xl px-3 py-2.5 pr-12 bg-white outline-none focus:ring-2 focus:ring-violet-500"
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                          dias
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor={`link-${configuracao.codigo}`}
                        className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
                      >
                        Link Mercado Pago
                      </label>

                      <input
                        id={`link-${configuracao.codigo}`}
                        type="url"
                        value={
                          configuracao.link_pagamento || ''
                        }
                        onChange={(event) =>
                          atualizarConfiguracaoLocal(
                            configuracao.codigo,
                            'link_pagamento',
                            event.target.value
                          )
                        }
                        disabled={gratuito}
                        placeholder={
                          gratuito
                            ? 'Não se aplica ao plano gratuito'
                            : 'https://mpago.la/...'
                        }
                        className="w-full border border-slate-300 rounded-xl px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-slate-100 disabled:text-slate-400"
                      />
                    </div>

                    <div>
                      <p className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Disponível
                      </p>

                      <label className="flex h-[42px] items-center gap-2 rounded-xl border border-slate-300 bg-white px-3">
                        <input
                          type="checkbox"
                          checked={configuracao.ativo}
                          onChange={(event) =>
                            atualizarConfiguracaoLocal(
                              configuracao.codigo,
                              'ativo',
                              event.target.checked
                            )
                          }
                          className="h-4 w-4 accent-violet-600"
                        />

                        <span className="text-sm font-semibold text-slate-700">
                          {configuracao.ativo
                            ? 'Ativo'
                            : 'Inativo'}
                        </span>
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        salvarConfiguracaoPlano(
                          configuracao
                        )
                      }
                      disabled={
                        processandoPlano ===
                        configuracao.codigo
                      }
                      className="h-[42px] rounded-xl bg-violet-600 hover:bg-violet-700 text-white px-4 font-semibold transition-colors disabled:opacity-50"
                    >
                      {processandoPlano ===
                      configuracao.codigo
                        ? 'Salvando...'
                        : 'Salvar'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>


      {modalEdicao && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center px-4 py-8">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8 border-b border-slate-200">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-violet-600 mb-2">
                    Editar financeiro
                  </p>

                  <h3 className="text-2xl font-bold text-slate-900">
                    {obterNomeEmpresa(
                      modalEdicao.anuncio
                    )}
                  </h3>

                  <p className="text-slate-500 mt-1">
                    Atualize plano, pagamento e
                    vencimento.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setModalEdicao(null)
                  }
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  aria-label="Fechar"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-5">
              <div>
                <label
                  htmlFor="editar-plano"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Plano
                </label>

                <select
                  id="editar-plano"
                  value={modalEdicao.plano}
                  onChange={(event) => {
                    const novoPlano =
                      event.target.value;

                    setModalEdicao(
                      (estadoAtual) => {
                        if (!estadoAtual) {
                          return null;
                        }

                        return {
                          ...estadoAtual,
                          plano: novoPlano,
                          pagamentoStatus:
                            normalizarTexto(
                              novoPlano
                            ) === 'gratuito'
                              ? 'nao_se_aplica'
                              : estadoAtual.pagamentoStatus ===
                                  'nao_se_aplica'
                                ? 'pendente'
                                : estadoAtual.pagamentoStatus,
                        };
                      }
                    );
                  }}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {NOMES_PLANOS.map((plano) => (
                    <option
                      key={plano}
                      value={plano}
                    >
                      {plano} —{' '}
                      {formatarMoeda(
                        obterValorPlano(plano, valoresPlanos)
                      )}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="editar-pagamento"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Situação financeira
                </label>

                <select
                  id="editar-pagamento"
                  value={
                    modalEdicao.pagamentoStatus
                  }
                  onChange={(event) =>
                    setModalEdicao(
                      (estadoAtual) =>
                        estadoAtual
                          ? {
                              ...estadoAtual,
                              pagamentoStatus:
                                event.target
                                  .value as StatusFinanceiro,
                            }
                          : null
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {STATUS_FINANCEIROS.map(
                    (status) => (
                      <option
                        key={status.value}
                        value={status.value}
                      >
                        {status.label}
                      </option>
                    )
                  )}
                </select>

                {modalEdicao.pagamentoStatus ===
                  'isento_cortesia' && (
                  <p className="text-sm text-violet-700 bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 mt-3">
                    Esse plano será registrado como
                    benefício administrativo, com valor
                    comercial preservado e valor cobrado
                    igual a zero.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="editar-vencimento"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Data de vencimento
                </label>

                <input
                  id="editar-vencimento"
                  type="date"
                  value={
                    modalEdicao.dataExpiracao
                  }
                  onChange={(event) =>
                    setModalEdicao(
                      (estadoAtual) =>
                        estadoAtual
                          ? {
                              ...estadoAtual,
                              dataExpiracao:
                                event.target.value,
                            }
                          : null
                    )
                  }
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label
                  htmlFor="editar-observacao"
                  className="block text-sm font-semibold text-slate-700 mb-2"
                >
                  Observação administrativa
                </label>

                <textarea
                  id="editar-observacao"
                  value={modalEdicao.observacao}
                  onChange={(event) =>
                    setModalEdicao(
                      (estadoAtual) =>
                        estadoAtual
                          ? {
                              ...estadoAtual,
                              observacao:
                                event.target.value,
                            }
                          : null
                    )
                  }
                  rows={3}
                  placeholder="Exemplo: empresa convidada para o lançamento."
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />

                <p className="text-xs text-slate-500 mt-2">
                  A observação aparece apenas durante esta
                  edição. Para salvá-la no banco será
                  necessário criar uma coluna específica
                  posteriormente.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <p className="text-sm text-slate-500">
                  Valor comercial do plano
                </p>

                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {formatarMoeda(
                    obterValorPlano(modalEdicao.plano, valoresPlanos)
                  )}
                </p>

                {modalEdicao.pagamentoStatus ===
                  'isento_cortesia' && (
                  <p className="text-sm font-semibold text-violet-700 mt-2">
                    Valor cobrado: R$ 0,00
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-slate-200 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setModalEdicao(null)
                }
                disabled={
                  processandoId ===
                  modalEdicao.anuncio.id
                }
                className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={salvarEdicao}
                disabled={
                  processandoId ===
                  modalEdicao.anuncio.id
                }
                className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold disabled:opacity-50"
              >
                {processandoId ===
                modalEdicao.anuncio.id
                  ? 'Salvando...'
                  : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function obterTipoMensagem(
  anuncio: AnuncioFinanceiro
):
  | 'aprovado'
  | 'pendente'
  | 'erro'
  | 'expirando'
  | 'expirado' {
  const dias = obterDiasAteVencimento(
    anuncio.data_expiracao
  );

  if (dias !== null && dias < 0) {
    return 'expirado';
  }

  if (dias !== null && dias >= 0 && dias <= 7) {
    return 'expirando';
  }

  const status = obterStatusFinanceiro(anuncio);

  if (status === 'aprovado') {
    return 'aprovado';
  }

  if (status === 'erro') {
    return 'erro';
  }

  return 'pendente';
}

function MiniCardPlano({
  nome,
  quantidade,
}: {
  nome: string;
  quantidade: number;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-600">{nome}</p>
      <p className="text-3xl font-bold text-slate-900 mt-2">{quantidade}</p>
    </article>
  );
}

function CardResumo({
  titulo,
  valor,
  descricao,
  destaque,
}: {
  titulo: string;
  valor: string;
  descricao: string;
  destaque:
    | 'emerald'
    | 'amber'
    | 'red'
    | 'orange'
    | 'blue'
    | 'violet'
    | 'slate'
    | 'rose';
}) {
  const estilos = {
    emerald:
      'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber:
      'bg-amber-50 border-amber-200 text-amber-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    orange:
      'bg-orange-50 border-orange-200 text-orange-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    violet:
      'bg-violet-50 border-violet-200 text-violet-700',
    slate:
      'bg-slate-100 border-slate-200 text-slate-700',
    rose: 'bg-rose-50 border-rose-200 text-rose-700',
  };

  return (
    <article
      className={`border rounded-3xl p-5 ${estilos[destaque]}`}
    >
      <p className="text-sm font-semibold opacity-80">
        {titulo}
      </p>

      <p className="text-3xl font-bold mt-3">
        {valor}
      </p>

      <p className="text-sm mt-2 opacity-80">
        {descricao}
      </p>
    </article>
  );
}

function CabecalhoTabela({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="text-left text-xs uppercase tracking-wider text-slate-500 font-bold px-5 py-4">
      {children}
    </th>
  );
}

function LinhaFinanceira({
  anuncio,
  valoresPlanos,
  processando,
  onAprovar,
  onPendente,
  onEditar,
  onWhatsApp,
  onCopiar,
}: {
  anuncio: AnuncioFinanceiro;
  valoresPlanos: ValoresPlanos;
  processando: boolean;
  onAprovar: () => void;
  onPendente: () => void;
  onEditar: () => void;
  onWhatsApp: () => void;
  onCopiar: () => void;
}) {
  const modalidade = obterModalidade(anuncio);
  const statusFinanceiro =
    obterStatusFinanceiro(anuncio);
  const dias = obterDiasAteVencimento(
    anuncio.data_expiracao
  );

  return (
    <tr className="hover:bg-slate-50/70">
      <td className="px-5 py-5">
        <p className="font-bold text-slate-900">
          {obterNomeEmpresa(anuncio)}
        </p>

        <p className="text-sm text-slate-500 mt-1">
          {anuncio.telefone || 'Sem telefone'}
        </p>

        <p className="text-xs font-semibold text-violet-600 mt-1">
          {anuncio.origem === 'agenda_local'
            ? 'Agenda Local'
            : 'Anúncios'}
        </p>
      </td>

      <td className="px-5 py-5">
        <p className="font-semibold text-slate-800">
          {anuncio.plano_usado || 'Não definido'}
        </p>
      </td>

      <td className="px-5 py-5">
        <BadgeModalidade modalidade={modalidade} />
      </td>

      <td className="px-5 py-5">
        <p className="font-semibold text-slate-900">
          {modalidade === 'cortesia'
            ? 'R$ 0,00'
            : formatarMoeda(
                obterValorPlano(anuncio.plano_usado, valoresPlanos)
              )}
        </p>

        {modalidade === 'cortesia' && (
          <p className="text-xs text-slate-500 mt-1">
            Comercial:{' '}
            {formatarMoeda(
              obterValorPlano(anuncio.plano_usado, valoresPlanos)
            )}
          </p>
        )}
      </td>

      <td className="px-5 py-5">
        <BadgeFinanceiro
          status={statusFinanceiro}
        />
      </td>

      <td className="px-5 py-5">
        <p className="font-medium text-slate-800">
          {formatarData(anuncio.data_expiracao)}
        </p>

        {dias !== null && (
          <p
            className={`text-xs mt-1 font-semibold ${
              dias < 0
                ? 'text-red-600'
                : dias <= 7
                  ? 'text-orange-600'
                  : 'text-slate-500'
            }`}
          >
            {dias < 0
              ? `Vencido há ${Math.abs(dias)} dia(s)`
              : dias === 0
                ? 'Vence hoje'
                : `${dias} dia(s) restante(s)`}
          </p>
        )}
      </td>

      <td className="px-5 py-5">
        <BadgeAnuncio anuncio={anuncio} />
      </td>

      <td className="px-5 py-5">
        <div className="flex flex-wrap gap-2">
          {anuncio.origem !== 'agenda_local' &&
            modalidade === 'pago' &&
            statusFinanceiro !== 'aprovado' && (
              <button
                type="button"
                onClick={onAprovar}
                disabled={processando}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                Aprovar
              </button>
            )}

          {anuncio.origem !== 'agenda_local' &&
            modalidade === 'pago' &&
            statusFinanceiro === 'aprovado' && (
              <button
                type="button"
                onClick={onPendente}
                disabled={processando}
                className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                Pendente
              </button>
            )}

          <button
            type="button"
            onClick={onWhatsApp}
            className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-2 rounded-lg text-xs font-semibold"
          >
            WhatsApp
          </button>

          <button
            type="button"
            onClick={onCopiar}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold"
          >
            Copiar
          </button>
        </div>
      </td>
    </tr>
  );
}

function CardFinanceiroMobile({
  anuncio,
  valoresPlanos,
  processando,
  onAprovar,
  onPendente,
  onEditar,
  onWhatsApp,
  onCopiar,
}: {
  anuncio: AnuncioFinanceiro;
  valoresPlanos: ValoresPlanos;
  processando: boolean;
  onAprovar: () => void;
  onPendente: () => void;
  onEditar: () => void;
  onWhatsApp: () => void;
  onCopiar: () => void;
}) {
  const modalidade = obterModalidade(anuncio);
  const statusFinanceiro =
    obterStatusFinanceiro(anuncio);
  const dias = obterDiasAteVencimento(
    anuncio.data_expiracao
  );

  return (
    <article className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {obterNomeEmpresa(anuncio)}
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            {anuncio.telefone || 'Sem telefone'}
          </p>

          <p className="text-xs font-semibold text-violet-600 mt-1">
            {anuncio.origem === 'agenda_local'
              ? 'Agenda Local'
              : 'Anúncios'}
          </p>
        </div>

        <BadgeModalidade modalidade={modalidade} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-5">
        <InfoMobile
          titulo="Plano"
          valor={
            anuncio.plano_usado || 'Não definido'
          }
        />

        <InfoMobile
          titulo="Valor"
          valor={
            modalidade === 'cortesia'
              ? 'R$ 0,00'
              : formatarMoeda(
                  obterValorPlano(anuncio.plano_usado, valoresPlanos)
                )
          }
        />

        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">
            Financeiro
          </p>

          <BadgeFinanceiro
            status={statusFinanceiro}
          />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
            Vencimento
          </p>

          <p className="text-sm font-semibold text-slate-800 mt-2">
            {formatarData(
              anuncio.data_expiracao
            )}
          </p>

          {dias !== null && dias <= 7 && (
            <p
              className={`text-xs font-semibold mt-1 ${
                dias < 0
                  ? 'text-red-600'
                  : 'text-orange-600'
              }`}
            >
              {dias < 0
                ? `Vencido há ${Math.abs(
                    dias
                  )} dia(s)`
                : dias === 0
                  ? 'Vence hoje'
                  : `Faltam ${dias} dia(s)`}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-slate-100">
        <BadgeAnuncio anuncio={anuncio} />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-5">
        {modalidade === 'pago' &&
          statusFinanceiro !== 'aprovado' && (
            <button
              type="button"
              onClick={onAprovar}
              disabled={processando}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              Aprovar
            </button>
          )}

        {modalidade === 'pago' &&
          statusFinanceiro === 'aprovado' && (
            <button
              type="button"
              onClick={onPendente}
              disabled={processando}
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              Marcar pendente
            </button>
          )}

        <button
          type="button"
          onClick={onWhatsApp}
          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-2.5 rounded-xl text-sm font-semibold"
        >
          WhatsApp
        </button>

        <button
          type="button"
          onClick={onCopiar}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-sm font-semibold"
        >
          Copiar mensagem
        </button>
      </div>
    </article>
  );
}

function InfoMobile({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
        {titulo}
      </p>

      <p className="text-sm font-semibold text-slate-800 mt-2">
        {valor}
      </p>
    </div>
  );
}

function BadgeModalidade({
  modalidade,
}: {
  modalidade:
    | 'pago'
    | 'gratuito'
    | 'cortesia';
}) {
  const estilos = {
    pago:
      'bg-emerald-100 text-emerald-800 border-emerald-200',
    gratuito:
      'bg-blue-100 text-blue-800 border-blue-200',
    cortesia:
      'bg-violet-100 text-violet-800 border-violet-200',
  };

  const nomes = {
    pago: 'Pago',
    gratuito: 'Gratuito',
    cortesia: 'Benefício',
  };

  return (
    <span
      className={`inline-flex border px-3 py-1 rounded-full text-xs font-bold ${estilos[modalidade]}`}
    >
      {nomes[modalidade]}
    </span>
  );
}

function BadgeFinanceiro({
  status,
}: {
  status: StatusFinanceiro;
}) {
  const configuracoes: Record<
    StatusFinanceiro,
    {
      nome: string;
      estilo: string;
    }
  > = {
    pendente: {
      nome: 'Pendente',
      estilo:
        'bg-amber-100 text-amber-800 border-amber-200',
    },
    aprovado: {
      nome: 'Aprovado',
      estilo:
        'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    erro: {
      nome: 'Erro',
      estilo:
        'bg-red-100 text-red-800 border-red-200',
    },
    isento_cortesia: {
      nome: 'Isento',
      estilo:
        'bg-violet-100 text-violet-800 border-violet-200',
    },
    nao_se_aplica: {
      nome: 'Não se aplica',
      estilo:
        'bg-blue-100 text-blue-800 border-blue-200',
    },
    recusado: {
      nome: 'Recusado',
      estilo:
        'bg-rose-100 text-rose-800 border-rose-200',
    },
    reembolsado: {
      nome: 'Reembolsado',
      estilo:
        'bg-cyan-100 text-cyan-800 border-cyan-200',
    },
    cancelado: {
      nome: 'Cancelado',
      estilo:
        'bg-slate-200 text-slate-700 border-slate-300',
    },
  };

  const configuracao =
    configuracoes[status];

  return (
    <span
      className={`inline-flex border px-3 py-1 rounded-full text-xs font-bold ${configuracao.estilo}`}
    >
      {configuracao.nome}
    </span>
  );
}

function BadgeAnuncio({
  anuncio,
}: {
  anuncio: AnuncioFinanceiro;
}) {
  const ativo =
    anuncio.ativo !== false &&
    (anuncio.aprovado === true ||
      normalizarTexto(anuncio.status) ===
        'aprovado' ||
      normalizarTexto(anuncio.status) ===
        'ativo');

  if (ativo) {
    return (
      <span className="inline-flex bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
        Ativo
      </span>
    );
  }

  if (
    normalizarTexto(anuncio.status) ===
    'rejeitado'
  ) {
    return (
      <span className="inline-flex bg-red-100 text-red-800 border border-red-200 px-3 py-1 rounded-full text-xs font-bold">
        Rejeitado
      </span>
    );
  }

  return (
    <span className="inline-flex bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
      Aguardando
    </span>
  );
}