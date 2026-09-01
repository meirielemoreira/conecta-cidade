'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

type AgendaItem = {
  id: string;
  nome_completo: string;
  profissao: string;
  whatsapp: string;
  instagram?: string | null;
  descricao: string;
  foto_url?: string | null;
  pagamento_status: string;
  ativo: boolean;
  aprovado: boolean;
  data_expiracao: string;
  data_cadastro: string;
};

type ContatoUtil = {
  id: string;
  categoria: 'Saúde' | 'Administração Pública' | string;
  nome: string;
  telefone: string;
  ordem: number;
  ativo: boolean;
};

type FiltroAgenda =
  | 'todos'
  | 'pendente'
  | 'ativo'
  | 'inativo'
  | 'expirando'
  | 'expirado';

const cadastroInicial = {
  nome_completo: '',
  profissao: '',
  whatsapp: '',
  instagram: '',
  descricao: '',
};

const contatoInicial = {
  categoria: 'Saúde',
  nome: '',
  telefone: '',
  ordem: 1,
  ativo: true,
};

function formatarData(valor?: string | null) {
  if (!valor) return '—';
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? '—' : data.toLocaleDateString('pt-BR');
}

function diasAteVencimento(valor?: string | null) {
  if (!valor) return null;
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return null;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const vencimento = new Date(data);
  vencimento.setHours(0, 0, 0, 0);

  return Math.ceil(
    (vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function normalizarTelefone(telefone: string) {
  return telefone.replace(/\D/g, '');
}

function abrirWhatsApp(item: AgendaItem) {
  const numero = normalizarTelefone(item.whatsapp);

  if (!numero) {
    alert('Este cadastro não possui WhatsApp válido.');
    return;
  }

  const mensagem = encodeURIComponent(
    `Olá, ${item.nome_completo}! Estou entrando em contato pelo Conecta Cidade sobre seu cadastro na Agenda Local.`
  );

  window.open(`https://wa.me/55${numero}?text=${mensagem}`, '_blank');
}

export default function AgendaAdmin() {
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [contatosUteis, setContatosUteis] = useState<ContatoUtil[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingContatos, setLoadingContatos] = useState(true);

  const [mostrarNovoCadastro, setMostrarNovoCadastro] = useState(false);
  const [novoCadastro, setNovoCadastro] = useState(cadastroInicial);
  const [foto, setFoto] = useState<File | null>(null);
  const [previewNovaFoto, setPreviewNovaFoto] = useState<string | null>(null);
  const [salvandoNovo, setSalvandoNovo] = useState(false);

  const [modalAgendaAberto, setModalAgendaAberto] = useState(false);
  const [itemEditando, setItemEditando] = useState<AgendaItem | null>(null);
  const [novaFotoEdicao, setNovaFotoEdicao] = useState<File | null>(null);
  const [previewFotoEdicao, setPreviewFotoEdicao] = useState<string | null>(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const [busca, setBusca] = useState('');
  const [filtroAgenda, setFiltroAgenda] = useState<FiltroAgenda>('todos');

  const [mostrarNovoContato, setMostrarNovoContato] = useState(false);
  const [novoContato, setNovoContato] = useState(contatoInicial);
  const [contatoEditando, setContatoEditando] = useState<ContatoUtil | null>(null);
  const [salvandoContato, setSalvandoContato] = useState(false);

  const carregarAgenda = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('agenda_local')
      .select('*')
      .order('data_cadastro', { ascending: false });

    if (error) {
      console.error('Erro ao carregar Agenda Local:', error);
      alert(`Erro ao carregar Agenda Local: ${error.message}`);
    } else {
      setAgendaItems(data || []);
    }

    setLoading(false);
  };

  const carregarContatosUteis = async () => {
    setLoadingContatos(true);

    const { data, error } = await supabase
      .from('contatos_uteis')
      .select('*')
      .order('categoria', { ascending: true })
      .order('ordem', { ascending: true });

    if (error) {
      console.error('Erro ao carregar contatos úteis:', error);
      alert(`Erro ao carregar contatos úteis: ${error.message}`);
    } else {
      setContatosUteis((data || []) as ContatoUtil[]);
    }

    setLoadingContatos(false);
  };

  const carregarTudo = async () => {
    await Promise.all([carregarAgenda(), carregarContatosUteis()]);
  };

  useEffect(() => {
    carregarTudo();
  }, []);

  const enviarImagem = async (arquivo: File, pasta: string): Promise<string> => {
    const extensao = arquivo.name.split('.').pop()?.toLowerCase() || 'jpg';
    const nomeArquivo = `${pasta}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extensao}`;

    const { error } = await supabase.storage
      .from('imagens-anuncios')
      .upload(nomeArquivo, arquivo, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    return supabase.storage
      .from('imagens-anuncios')
      .getPublicUrl(nomeArquivo).data.publicUrl;
  };

  const atualizarAgenda = async (id: string, updates: Partial<AgendaItem>) => {
    const { error } = await supabase
      .from('agenda_local')
      .update(updates)
      .eq('id', id);

    if (error) {
      alert(`Erro ao atualizar: ${error.message}`);
      return;
    }

    await carregarAgenda();
  };

  const aprovarAgenda = async (item: AgendaItem) => {
    await atualizarAgenda(item.id, {
      aprovado: true,
      ativo: true,
      pagamento_status:
        item.pagamento_status === 'cortesia' ? 'cortesia' : 'pago',
    });
  };

  const alternarAtivo = async (item: AgendaItem) => {
    await atualizarAgenda(item.id, { ativo: !item.ativo });
  };

  const renovarAgenda = async (id: string) => {
    const novaData = new Date();
    novaData.setDate(novaData.getDate() + 30);

    await atualizarAgenda(id, {
      data_expiracao: novaData.toISOString(),
      ativo: true,
      aprovado: true,
      pagamento_status: 'pago',
    });
  };

  const excluirAgenda = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cadastro?')) return;

    const { error } = await supabase
      .from('agenda_local')
      .delete()
      .eq('id', id);

    if (error) {
      alert(`Erro ao excluir: ${error.message}`);
      return;
    }

    await carregarAgenda();
  };

  const criarCadastroManual = async () => {
    if (
      !novoCadastro.nome_completo.trim() ||
      !novoCadastro.profissao.trim() ||
      !novoCadastro.whatsapp.trim()
    ) {
      alert('Preencha nome, profissão e WhatsApp.');
      return;
    }

    setSalvandoNovo(true);

    try {
      let fotoUrl: string | null = null;

      if (foto) {
        fotoUrl = await enviarImagem(foto, 'agenda-local/admin');
      }

      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + 30);

      const { error } = await supabase.from('agenda_local').insert([
        {
          nome_completo: novoCadastro.nome_completo.trim(),
          profissao: novoCadastro.profissao.trim(),
          whatsapp: novoCadastro.whatsapp.trim(),
          instagram: novoCadastro.instagram.trim() || null,
          descricao: novoCadastro.descricao.trim(),
          foto_url: fotoUrl,
          plano: 'Cortesia',
          categoria: 'Agenda Local',
          pagamento_status: 'cortesia',
          ativo: true,
          aprovado: true,
          data_inicio: new Date().toISOString(),
          data_expiracao: dataExpiracao.toISOString(),
          data_cadastro: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      alert('Cadastro criado com sucesso.');
      setMostrarNovoCadastro(false);
      setNovoCadastro(cadastroInicial);
      setFoto(null);
      setPreviewNovaFoto(null);

      await carregarAgenda();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao criar cadastro.');
    } finally {
      setSalvandoNovo(false);
    }
  };

  const abrirEdicaoAgenda = (item: AgendaItem) => {
    setItemEditando({ ...item });
    setNovaFotoEdicao(null);
    setPreviewFotoEdicao(item.foto_url || null);
    setModalAgendaAberto(true);
  };

  const salvarEdicaoAgenda = async () => {
    if (!itemEditando) return;

    if (
      !itemEditando.nome_completo.trim() ||
      !itemEditando.profissao.trim() ||
      !itemEditando.whatsapp.trim()
    ) {
      alert('Preencha nome, profissão e WhatsApp.');
      return;
    }

    setSalvandoEdicao(true);

    try {
      let fotoUrl = itemEditando.foto_url || null;

      if (novaFotoEdicao) {
        fotoUrl = await enviarImagem(novaFotoEdicao, 'agenda-local/admin-edicao');
      }

      const { error } = await supabase
        .from('agenda_local')
        .update({
          nome_completo: itemEditando.nome_completo.trim(),
          profissao: itemEditando.profissao.trim(),
          whatsapp: itemEditando.whatsapp.trim(),
          instagram: itemEditando.instagram?.trim() || null,
          descricao: itemEditando.descricao.trim(),
          foto_url: fotoUrl,
          ativo: itemEditando.ativo,
          aprovado: itemEditando.aprovado,
          pagamento_status: itemEditando.pagamento_status,
          data_expiracao: itemEditando.data_expiracao,
        })
        .eq('id', itemEditando.id);

      if (error) throw error;

      alert('Alterações salvas.');
      setModalAgendaAberto(false);
      setItemEditando(null);
      setNovaFotoEdicao(null);
      setPreviewFotoEdicao(null);

      await carregarAgenda();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Erro ao salvar alterações.'
      );
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const criarContato = async () => {
    if (!novoContato.nome.trim()) {
      alert('Informe o nome do contato.');
      return;
    }

    setSalvandoContato(true);

    const { error } = await supabase.from('contatos_uteis').insert([
      {
        categoria: novoContato.categoria,
        nome: novoContato.nome.trim(),
        telefone: novoContato.telefone.trim(),
        ordem: Number(novoContato.ordem) || 0,
        ativo: novoContato.ativo,
        updated_at: new Date().toISOString(),
      },
    ]);

    setSalvandoContato(false);

    if (error) {
      alert(`Erro ao criar contato: ${error.message}`);
      return;
    }

    setNovoContato(contatoInicial);
    setMostrarNovoContato(false);

    await carregarContatosUteis();
  };

  const salvarContato = async () => {
    if (!contatoEditando) return;

    if (!contatoEditando.nome.trim()) {
      alert('Informe o nome do contato.');
      return;
    }

    setSalvandoContato(true);

    try {
      const { data, error } = await supabase
        .from('contatos_uteis')
        .update({
          categoria: contatoEditando.categoria,
          nome: contatoEditando.nome.trim(),
          telefone: contatoEditando.telefone.trim(),
          ordem: Number(contatoEditando.ordem) || 0,
          ativo: contatoEditando.ativo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', contatoEditando.id)
        .select();

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        alert(
          'Nenhum registro foi atualizado. Verifique se a sessão administrativa está ativa e tente novamente.'
        );
        return;
      }

      setContatoEditando(null);
      await carregarContatosUteis();

      alert('Contato atualizado com sucesso.');
    } catch (error) {
      console.error('Erro ao salvar contato:', error);

      alert(
        error instanceof Error
          ? `Erro ao salvar contato: ${error.message}`
          : 'Erro ao salvar contato.'
      );
    } finally {
      setSalvandoContato(false);
    }
  };

  const alternarContatoAtivo = async (contato: ContatoUtil) => {
    const { error } = await supabase
      .from('contatos_uteis')
      .update({
        ativo: !contato.ativo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contato.id);

    if (error) {
      alert(`Erro ao atualizar contato: ${error.message}`);
      return;
    }

    await carregarContatosUteis();
  };

  const excluirContato = async (contato: ContatoUtil) => {
    if (!confirm(`Excluir o contato "${contato.nome}"?`)) return;

    const { error } = await supabase
      .from('contatos_uteis')
      .delete()
      .eq('id', contato.id);

    if (error) {
      alert(`Erro ao excluir contato: ${error.message}`);
      return;
    }

    await carregarContatosUteis();
  };

  const resumo = useMemo(() => {
    let pendentes = 0;
    let ativos = 0;
    let expirando = 0;
    let expirados = 0;

    agendaItems.forEach((item) => {
      const dias = diasAteVencimento(item.data_expiracao);

      if (!item.aprovado) pendentes += 1;

      if (
        item.aprovado &&
        item.ativo &&
        (dias === null || dias >= 0)
      ) {
        ativos += 1;
      }

      if (dias !== null && dias >= 0 && dias <= 7) {
        expirando += 1;
      }

      if (dias !== null && dias < 0) {
        expirados += 1;
      }
    });

    return { pendentes, ativos, expirando, expirados };
  }, [agendaItems]);

  const agendaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return agendaItems.filter((item) => {
      const dias = diasAteVencimento(item.data_expiracao);

      const correspondeBusca =
        !termo ||
        item.nome_completo.toLowerCase().includes(termo) ||
        item.profissao.toLowerCase().includes(termo) ||
        item.whatsapp.toLowerCase().includes(termo) ||
        (item.instagram || '').toLowerCase().includes(termo);

      if (!correspondeBusca) return false;

      if (filtroAgenda === 'pendente') return !item.aprovado;

      if (filtroAgenda === 'ativo') {
        return item.aprovado && item.ativo && (dias === null || dias >= 0);
      }

      if (filtroAgenda === 'inativo') return !item.ativo;

      if (filtroAgenda === 'expirando') {
        return dias !== null && dias >= 0 && dias <= 7;
      }

      if (filtroAgenda === 'expirado') {
        return dias !== null && dias < 0;
      }

      return true;
    });
  }, [agendaItems, busca, filtroAgenda]);

  const contatosSaude = contatosUteis.filter(
    (contato) => contato.categoria === 'Saúde'
  );

  const contatosAdministracao = contatosUteis.filter(
    (contato) => contato.categoria === 'Administração Pública'
  );

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-7 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-600">
              Administração
            </p>

            <h2 className="text-3xl font-bold text-slate-900 mt-1">
              Agenda Local
            </h2>

            <p className="text-slate-600 mt-2">
              Gerencie profissionais, pagamentos, vencimentos, fotos e contatos úteis.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={carregarTudo}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl font-semibold"
            >
              Atualizar agenda
            </button>

            <button
              type="button"
              onClick={() => setMostrarNovoCadastro((valor) => !valor)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-semibold"
            >
              {mostrarNovoCadastro ? 'Fechar formulário' : 'Novo profissional'}
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <CardResumo
          titulo="Pendentes"
          valor={resumo.pendentes}
          classe="border-amber-200 bg-amber-50 text-amber-800"
        />
        <CardResumo
          titulo="Ativos"
          valor={resumo.ativos}
          classe="border-emerald-200 bg-emerald-50 text-emerald-800"
        />
        <CardResumo
          titulo="Expirando"
          valor={resumo.expirando}
          classe="border-orange-200 bg-orange-50 text-orange-800"
        />
        <CardResumo
          titulo="Expirados"
          valor={resumo.expirados}
          classe="border-rose-200 bg-rose-50 text-rose-800"
        />
      </section>

      {mostrarNovoCadastro && (
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
          <h3 className="text-2xl font-bold mb-6">Novo cadastro manual</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <CampoAdmin
              label="Nome completo *"
              value={novoCadastro.nome_completo}
              onChange={(valor) =>
                setNovoCadastro({ ...novoCadastro, nome_completo: valor })
              }
            />
            <CampoAdmin
              label="Profissão *"
              value={novoCadastro.profissao}
              onChange={(valor) =>
                setNovoCadastro({ ...novoCadastro, profissao: valor })
              }
            />
            <CampoAdmin
              label="WhatsApp *"
              value={novoCadastro.whatsapp}
              onChange={(valor) =>
                setNovoCadastro({ ...novoCadastro, whatsapp: valor })
              }
            />
            <CampoAdmin
              label="Instagram"
              value={novoCadastro.instagram}
              onChange={(valor) =>
                setNovoCadastro({ ...novoCadastro, instagram: valor })
              }
            />

            <div>
              <label className="block font-medium mb-2">Foto</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const arquivo = event.target.files?.[0] || null;
                  setFoto(arquivo);
                  setPreviewNovaFoto(
                    arquivo ? URL.createObjectURL(arquivo) : null
                  );
                }}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
              />
            </div>

            {previewNovaFoto && (
              <div className="flex items-center">
                <img
                  src={previewNovaFoto}
                  alt="Prévia"
                  className="w-28 h-28 object-cover rounded-xl border"
                />
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="block font-medium mb-2">Descrição</label>
            <textarea
              value={novoCadastro.descricao}
              onChange={(event) =>
                setNovoCadastro({
                  ...novoCadastro,
                  descricao: event.target.value,
                })
              }
              rows={4}
              className="w-full border border-slate-300 rounded-xl px-4 py-4"
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => setMostrarNovoCadastro(false)}
              className="flex-1 py-3 bg-slate-200 rounded-xl font-semibold"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={criarCadastroManual}
              disabled={salvandoNovo}
              className="flex-1 py-3 bg-emerald-600 disabled:bg-slate-400 text-white rounded-xl font-semibold"
            >
              {salvandoNovo ? 'Salvando...' : 'Salvar cadastro'}
            </button>
          </div>
        </section>
      )}

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              Profissionais cadastrados
            </h3>
            <p className="text-slate-500 mt-1">
              Lista compacta para administração diária.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 w-full lg:w-auto">
            <input
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Nome, serviço, WhatsApp..."
              className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <select
              value={filtroAgenda}
              onChange={(event) =>
                setFiltroAgenda(event.target.value as FiltroAgenda)
              }
              className="border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="todos">Todos</option>
              <option value="pendente">Pendentes</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
              <option value="expirando">Expirando</option>
              <option value="expirado">Expirados</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Carregando...</div>
        ) : agendaFiltrada.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            Nenhum profissional encontrado.
          </div>
        ) : (
          <>
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
                    <th className="py-3 pr-3">Foto</th>
                    <th className="py-3 pr-3">Profissional</th>
                    <th className="py-3 pr-3">Serviço</th>
                    <th className="py-3 pr-3">WhatsApp</th>
                    <th className="py-3 pr-3">Pagamento</th>
                    <th className="py-3 pr-3">Vencimento</th>
                    <th className="py-3 pr-3">Status</th>
                    <th className="py-3 text-right">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {agendaFiltrada.map((item) => (
                    <LinhaAgenda
                      key={item.id}
                      item={item}
                      onWhatsApp={() => abrirWhatsApp(item)}
                      onAprovar={() => aprovarAgenda(item)}
                      onAtivo={() => alternarAtivo(item)}
                      onRenovar={() => renovarAgenda(item.id)}
                      onEditar={() => abrirEdicaoAgenda(item)}
                      onExcluir={() => excluirAgenda(item.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="xl:hidden space-y-3">
              {agendaFiltrada.map((item) => (
                <CardAgendaMobile
                  key={item.id}
                  item={item}
                  onWhatsApp={() => abrirWhatsApp(item)}
                  onAprovar={() => aprovarAgenda(item)}
                  onAtivo={() => alternarAtivo(item)}
                  onRenovar={() => renovarAgenda(item.id)}
                  onEditar={() => abrirEdicaoAgenda(item)}
                  onExcluir={() => excluirAgenda(item.id)}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 md:p-7 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
              Contatos úteis
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              Saúde e Administração Pública
            </h3>
            <p className="text-slate-600 mt-2">
              Edite nomes, telefones, ordem e disponibilidade sem mexer no código.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMostrarNovoContato((valor) => !valor)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
          >
            {mostrarNovoContato ? 'Fechar novo contato' : 'Novo contato'}
          </button>
        </div>

        {mostrarNovoContato && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 mb-6">
            <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-3">
              <select
                value={novoContato.categoria}
                onChange={(event) =>
                  setNovoContato({
                    ...novoContato,
                    categoria: event.target.value,
                  })
                }
                className="border border-slate-300 rounded-xl px-3 py-3 bg-white"
              >
                <option value="Saúde">Saúde</option>
                <option value="Administração Pública">
                  Administração Pública
                </option>
              </select>

              <input
                value={novoContato.nome}
                onChange={(event) =>
                  setNovoContato({
                    ...novoContato,
                    nome: event.target.value,
                  })
                }
                placeholder="Nome do órgão/serviço"
                className="border border-slate-300 rounded-xl px-3 py-3 bg-white xl:col-span-2"
              />

              <input
                value={novoContato.telefone}
                onChange={(event) =>
                  setNovoContato({
                    ...novoContato,
                    telefone: event.target.value,
                  })
                }
                placeholder="Telefone"
                className="border border-slate-300 rounded-xl px-3 py-3 bg-white"
              />

              <input
                type="number"
                min="0"
                value={novoContato.ordem}
                onChange={(event) =>
                  setNovoContato({
                    ...novoContato,
                    ordem: Number(event.target.value) || 0,
                  })
                }
                placeholder="Ordem"
                className="border border-slate-300 rounded-xl px-3 py-3 bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={novoContato.ativo}
                  onChange={(event) =>
                    setNovoContato({
                      ...novoContato,
                      ativo: event.target.checked,
                    })
                  }
                />
                Ativo
              </label>

              <button
                type="button"
                onClick={criarContato}
                disabled={salvandoContato}
                className="bg-blue-600 disabled:bg-slate-400 text-white px-5 py-2.5 rounded-xl font-semibold"
              >
                {salvandoContato ? 'Salvando...' : 'Salvar contato'}
              </button>
            </div>
          </div>
        )}

        {loadingContatos ? (
          <div className="py-10 text-center text-slate-500">
            Carregando contatos...
          </div>
        ) : (
          <div className="grid xl:grid-cols-2 gap-5">
            <ListaContatos
              titulo="Saúde"
              contatos={contatosSaude}
              contatoEditando={contatoEditando}
              setContatoEditando={setContatoEditando}
              salvandoContato={salvandoContato}
              onSalvar={salvarContato}
              onAlternar={alternarContatoAtivo}
              onExcluir={excluirContato}
            />

            <ListaContatos
              titulo="Administração Pública"
              contatos={contatosAdministracao}
              contatoEditando={contatoEditando}
              setContatoEditando={setContatoEditando}
              salvandoContato={salvandoContato}
              onSalvar={salvarContato}
              onAlternar={alternarContatoAtivo}
              onExcluir={excluirContato}
            />
          </div>
        )}
      </section>

      {modalAgendaAberto && itemEditando && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-3xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Editar cadastro</h3>

              <button
                type="button"
                onClick={() => {
                  setModalAgendaAberto(false);
                  setItemEditando(null);
                  setNovaFotoEdicao(null);
                  setPreviewFotoEdicao(null);
                }}
                className="w-10 h-10 rounded-full bg-slate-100 text-xl"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-[180px_1fr] gap-6">
              <div>
                <p className="font-medium mb-2">Foto atual</p>

                <div className="w-40 h-40 rounded-2xl overflow-hidden border bg-slate-100">
                  {previewFotoEdicao ? (
                    <img
                      src={previewFotoEdicao}
                      alt={itemEditando.nome_completo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                      Sem foto
                    </div>
                  )}
                </div>

                <label className="block font-medium mt-4 mb-2">
                  Trocar foto
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const arquivo = event.target.files?.[0] || null;
                    setNovaFotoEdicao(arquivo);
                    setPreviewFotoEdicao(
                      arquivo
                        ? URL.createObjectURL(arquivo)
                        : itemEditando.foto_url || null
                    );
                  }}
                  className="w-full text-sm"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <CampoAdmin
                  label="Nome completo"
                  value={itemEditando.nome_completo}
                  onChange={(valor) =>
                    setItemEditando({
                      ...itemEditando,
                      nome_completo: valor,
                    })
                  }
                />
                <CampoAdmin
                  label="Profissão"
                  value={itemEditando.profissao}
                  onChange={(valor) =>
                    setItemEditando({
                      ...itemEditando,
                      profissao: valor,
                    })
                  }
                />
                <CampoAdmin
                  label="WhatsApp"
                  value={itemEditando.whatsapp}
                  onChange={(valor) =>
                    setItemEditando({
                      ...itemEditando,
                      whatsapp: valor,
                    })
                  }
                />
                <CampoAdmin
                  label="Instagram"
                  value={itemEditando.instagram || ''}
                  onChange={(valor) =>
                    setItemEditando({
                      ...itemEditando,
                      instagram: valor,
                    })
                  }
                />

                <div>
                  <label className="block font-medium mb-2">Pagamento</label>
                  <select
                    value={itemEditando.pagamento_status}
                    onChange={(event) =>
                      setItemEditando({
                        ...itemEditando,
                        pagamento_status: event.target.value,
                      })
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                    <option value="cortesia">Cortesia</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    Data de vencimento
                  </label>

                  <input
                    type="date"
                    value={
                      itemEditando.data_expiracao
                        ? itemEditando.data_expiracao.slice(0, 10)
                        : ''
                    }
                    onChange={(event) =>
                      setItemEditando({
                        ...itemEditando,
                        data_expiracao: event.target.value
                          ? new Date(
                              `${event.target.value}T12:00:00`
                            ).toISOString()
                          : '',
                      })
                    }
                    className="w-full border border-slate-300 rounded-xl px-4 py-3"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-5">
              <label className="border rounded-xl px-4 py-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={itemEditando.aprovado}
                  onChange={(event) =>
                    setItemEditando({
                      ...itemEditando,
                      aprovado: event.target.checked,
                    })
                  }
                />
                Cadastro aprovado
              </label>

              <label className="border rounded-xl px-4 py-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={itemEditando.ativo}
                  onChange={(event) =>
                    setItemEditando({
                      ...itemEditando,
                      ativo: event.target.checked,
                    })
                  }
                />
                Cadastro ativo
              </label>
            </div>

            <div className="mt-4">
              <label className="block font-medium mb-2">Descrição</label>
              <textarea
                value={itemEditando.descricao}
                onChange={(event) =>
                  setItemEditando({
                    ...itemEditando,
                    descricao: event.target.value,
                  })
                }
                className="w-full border border-slate-300 rounded-xl px-4 py-4"
                rows={5}
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => {
                  setModalAgendaAberto(false);
                  setItemEditando(null);
                  setNovaFotoEdicao(null);
                  setPreviewFotoEdicao(null);
                }}
                className="flex-1 py-3 bg-slate-200 rounded-xl font-semibold"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={salvarEdicaoAgenda}
                disabled={salvandoEdicao}
                className="flex-1 py-3 bg-green-600 disabled:bg-slate-400 text-white rounded-xl font-semibold"
              >
                {salvandoEdicao ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CardResumo({
  titulo,
  valor,
  classe,
}: {
  titulo: string;
  valor: number;
  classe: string;
}) {
  return (
    <article className={`border rounded-2xl p-4 ${classe}`}>
      <p className="text-sm font-semibold">{titulo}</p>
      <p className="text-3xl font-bold mt-2">{valor}</p>
    </article>
  );
}

function LinhaAgenda({
  item,
  onWhatsApp,
  onAprovar,
  onAtivo,
  onRenovar,
  onEditar,
  onExcluir,
}: {
  item: AgendaItem;
  onWhatsApp: () => void;
  onAprovar: () => void;
  onAtivo: () => void;
  onRenovar: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const dias = diasAteVencimento(item.data_expiracao);

  return (
    <tr className="border-b border-slate-100 align-middle hover:bg-slate-50">
      <td className="py-3 pr-3">
        <div className="w-14 h-14 rounded-xl overflow-hidden border bg-slate-100">
          {item.foto_url ? (
            <img
              src={item.foto_url}
              alt={item.nome_completo}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-500">
              Sem foto
            </div>
          )}
        </div>
      </td>

      <td className="py-3 pr-3">
        <p className="font-bold text-slate-900">{item.nome_completo}</p>
        {item.instagram && (
          <p className="text-xs text-slate-500 mt-1">{item.instagram}</p>
        )}
      </td>

      <td className="py-3 pr-3 text-slate-700">{item.profissao}</td>

      <td className="py-3 pr-3">
        <button
          type="button"
          onClick={onWhatsApp}
          className="text-emerald-700 hover:underline font-semibold"
        >
          {item.whatsapp}
        </button>
      </td>

      <td className="py-3 pr-3">
        <span className="text-sm font-semibold text-slate-700">
          {item.pagamento_status}
        </span>
      </td>

      <td className="py-3 pr-3">
        <p>{formatarData(item.data_expiracao)}</p>
        {dias !== null && dias < 0 && (
          <p className="text-xs text-red-600 font-semibold">Expirado</p>
        )}
        {dias !== null && dias >= 0 && dias <= 7 && (
          <p className="text-xs text-orange-600 font-semibold">
            {dias} dia(s)
          </p>
        )}
      </td>

      <td className="py-3 pr-3">
        <div className="flex flex-wrap gap-1">
          <Selo
            ativo={item.aprovado}
            textoAtivo="Aprovado"
            textoInativo="Pendente"
          />
          <Selo
            ativo={item.ativo}
            textoAtivo="Ativo"
            textoInativo="Inativo"
          />
        </div>
      </td>

      <td className="py-3 text-right">
        <div className="flex flex-wrap justify-end gap-1.5">
          {!item.aprovado && (
            <button
              type="button"
              onClick={onAprovar}
              className="bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
            >
              Aprovar
            </button>
          )}

          <button
            type="button"
            onClick={onWhatsApp}
            className="bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
          >
            WhatsApp
          </button>

          <button
            type="button"
            onClick={onAtivo}
            className="bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
          >
            {item.ativo ? 'Desativar' : 'Ativar'}
          </button>

          <button
            type="button"
            onClick={onRenovar}
            className="bg-amber-100 text-amber-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
          >
            Renovar
          </button>

          <button
            type="button"
            onClick={onEditar}
            className="bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={onExcluir}
            className="bg-red-100 text-red-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
          >
            Excluir
          </button>
        </div>
      </td>
    </tr>
  );
}

function CardAgendaMobile({
  item,
  onWhatsApp,
  onAprovar,
  onAtivo,
  onRenovar,
  onEditar,
  onExcluir,
}: {
  item: AgendaItem;
  onWhatsApp: () => void;
  onAprovar: () => void;
  onAtivo: () => void;
  onRenovar: () => void;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  return (
    <article className="border border-slate-200 rounded-2xl p-4">
      <div className="flex gap-3">
        <div className="w-20 h-20 rounded-xl overflow-hidden border bg-slate-100 flex-shrink-0">
          {item.foto_url ? (
            <img
              src={item.foto_url}
              alt={item.nome_completo}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
              Sem foto
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-900">{item.nome_completo}</p>
          <p className="text-sm text-emerald-700">{item.profissao}</p>
          <p className="text-sm text-slate-500 mt-1">{item.whatsapp}</p>
          <p className="text-xs text-slate-500 mt-1">
            {item.pagamento_status} • {formatarData(item.data_expiracao)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        <Selo
          ativo={item.aprovado}
          textoAtivo="Aprovado"
          textoInativo="Pendente"
        />
        <Selo
          ativo={item.ativo}
          textoAtivo="Ativo"
          textoInativo="Inativo"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
        {!item.aprovado && (
          <button
            type="button"
            onClick={onAprovar}
            className="bg-green-100 text-green-700 py-2 rounded-xl text-sm font-semibold"
          >
            Aprovar
          </button>
        )}

        <button
          type="button"
          onClick={onWhatsApp}
          className="bg-emerald-100 text-emerald-700 py-2 rounded-xl text-sm font-semibold"
        >
          WhatsApp
        </button>

        <button
          type="button"
          onClick={onAtivo}
          className="bg-slate-100 text-slate-700 py-2 rounded-xl text-sm font-semibold"
        >
          {item.ativo ? 'Desativar' : 'Ativar'}
        </button>

        <button
          type="button"
          onClick={onRenovar}
          className="bg-amber-100 text-amber-700 py-2 rounded-xl text-sm font-semibold"
        >
          Renovar
        </button>

        <button
          type="button"
          onClick={onEditar}
          className="bg-blue-100 text-blue-700 py-2 rounded-xl text-sm font-semibold"
        >
          Editar
        </button>

        <button
          type="button"
          onClick={onExcluir}
          className="bg-red-100 text-red-700 py-2 rounded-xl text-sm font-semibold"
        >
          Excluir
        </button>
      </div>
    </article>
  );
}

function ListaContatos({
  titulo,
  contatos,
  contatoEditando,
  setContatoEditando,
  salvandoContato,
  onSalvar,
  onAlternar,
  onExcluir,
}: {
  titulo: string;
  contatos: ContatoUtil[];
  contatoEditando: ContatoUtil | null;
  setContatoEditando: (contato: ContatoUtil | null) => void;
  salvandoContato: boolean;
  onSalvar: () => void;
  onAlternar: (contato: ContatoUtil) => void;
  onExcluir: (contato: ContatoUtil) => void;
}) {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <h4 className="font-bold text-lg text-slate-900">{titulo}</h4>
      </div>

      <div className="divide-y divide-slate-100">
        {contatos.length === 0 ? (
          <div className="p-5 text-slate-500 text-sm">
            Nenhum contato cadastrado.
          </div>
        ) : (
          contatos.map((contato) => {
            const editando = contatoEditando?.id === contato.id;

            return (
              <div key={contato.id} className="p-4">
                {editando && contatoEditando ? (
                  <div className="space-y-3">
                    <select
                      value={contatoEditando.categoria}
                      onChange={(event) =>
                        setContatoEditando({
                          ...contatoEditando,
                          categoria: event.target.value,
                        })
                      }
                      className="w-full border border-slate-300 rounded-xl px-3 py-2.5 bg-white"
                    >
                      <option value="Saúde">Saúde</option>
                      <option value="Administração Pública">
                        Administração Pública
                      </option>
                    </select>

                    <input
                      value={contatoEditando.nome}
                      onChange={(event) =>
                        setContatoEditando({
                          ...contatoEditando,
                          nome: event.target.value,
                        })
                      }
                      className="w-full border border-slate-300 rounded-xl px-3 py-2.5"
                    />

                    <div className="grid grid-cols-[1fr_90px] gap-2">
                      <input
                        value={contatoEditando.telefone}
                        onChange={(event) =>
                          setContatoEditando({
                            ...contatoEditando,
                            telefone: event.target.value,
                          })
                        }
                        placeholder="Telefone"
                        className="border border-slate-300 rounded-xl px-3 py-2.5"
                      />

                      <input
                        type="number"
                        min="0"
                        value={contatoEditando.ordem}
                        onChange={(event) =>
                          setContatoEditando({
                            ...contatoEditando,
                            ordem: Number(event.target.value) || 0,
                          })
                        }
                        className="border border-slate-300 rounded-xl px-3 py-2.5"
                      />
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={contatoEditando.ativo}
                        onChange={(event) =>
                          setContatoEditando({
                            ...contatoEditando,
                            ativo: event.target.checked,
                          })
                        }
                      />
                      Ativo
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setContatoEditando(null)}
                        className="flex-1 bg-slate-200 rounded-xl py-2.5 font-semibold"
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        onClick={onSalvar}
                        disabled={salvandoContato}
                        className="flex-1 bg-blue-600 disabled:bg-slate-400 text-white rounded-xl py-2.5 font-semibold"
                      >
                        {salvandoContato ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {contato.nome}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {contato.telefone || 'Telefone não informado'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Ordem {contato.ordem} •{' '}
                        {contato.ativo ? 'Ativo' : 'Inativo'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setContatoEditando({ ...contato })}
                        className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs font-semibold"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => onAlternar(contato)}
                        className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold"
                      >
                        {contato.ativo ? 'Desativar' : 'Ativar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onExcluir(contato)}
                        className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs font-semibold"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function CampoAdmin({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div>
      <label className="block font-medium mb-2">{label}</label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full border border-slate-300 rounded-xl px-4 py-3"
      />
    </div>
  );
}

function Selo({
  ativo,
  textoAtivo,
  textoInativo,
}: {
  ativo: boolean;
  textoAtivo: string;
  textoInativo: string;
}) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
        ativo
          ? 'bg-green-100 text-green-700'
          : 'bg-slate-200 text-slate-600'
      }`}
    >
      {ativo ? textoAtivo : textoInativo}
    </span>
  );
}