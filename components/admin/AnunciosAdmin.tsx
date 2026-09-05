'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Categoria = {
  id: number;
  nome: string;
  slug: string;
};

type Anuncio = {
  id: string;
  titulo: string;
  nome_loja: string | null;
  telefone: string | null;
  email?: string | null;
  instagram?: string | null;
  descricao?: string | null;
  preco?: number | null;
  categoria?: string | null;
  tipo?: string | null;
  cidade?: string | null;
  estado?: string | null;
  plano_usado: string | null;
  status: string | null;
  payment_status: string | null;
  aprovado: boolean;
  ativo?: boolean;
  destaque?: boolean;
  imagens: string[] | null;
  created_at: string;
  data_expiracao?: string | null;
};

type FormNovoAnuncio = {
  titulo: string;
  nome_loja: string;
  telefone: string;
  email: string;
  instagram: string;
  descricao: string;
  preco: string;
  categoria: string;
  plano_usado: string;
  payment_status: string;
  cidade: string;
  estado: string;
};

const planos = ['Gratuito', 'Impulso', 'Vitrine', 'Exclusivo', 'Cortesia'];
const estadosAnuncio = ['pendente', 'aprovado', 'rejeitado', 'vencido'];
const pagamentos = ['pendente', 'pago', 'cortesia'];

const novoAnuncioInicial: FormNovoAnuncio = {
  titulo: '',
  nome_loja: '',
  telefone: '',
  email: '',
  instagram: '',
  descricao: '',
  preco: '',
  categoria: '',
  plano_usado: 'Cortesia',
  payment_status: 'cortesia',
  cidade: 'Nova União',
  estado: 'MG',
};

function tipoPelaCategoria(categoria: string) {
  switch (categoria) {
    case 'Morar & Construir':
      return 'imovel';
    case 'Motores & Rodas':
      return 'veiculo';
    case 'Onde é o Rolê?':
      return 'evento';
    case 'Direto do Produtor':
      return 'produto_local';
    case 'Nova União Informa':
      return 'informativo';
    default:
      return 'promocao';
  }
}

function normalizarPreco(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null;

  const numero =
    typeof valor === 'number'
      ? valor
      : Number(String(valor).replace(/\./g, '').replace(',', '.'));

  return Number.isFinite(numero) ? numero : null;
}

function formatarPrecoDigitado(valor: string): string {
  const somenteNumeros = valor.replace(/\D/g, '');

  if (!somenteNumeros) return '';

  const numero = Number(somenteNumeros) / 100;

  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatarPrecoParaCampo(valor?: number | null): string {
  if (valor === null || valor === undefined) return '';

  return Number(valor).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatarPreco(valor?: number | null) {
  if (valor === null || valor === undefined) return 'Sem preço';

  return Number(valor).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarData(valor?: string | null) {
  if (!valor) return '—';
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? '—' : data.toLocaleDateString('pt-BR');
}

export default function AnunciosAdmin() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');

  const [mostrarNovoAnuncio, setMostrarNovoAnuncio] = useState(false);
  const [novoAnuncio, setNovoAnuncio] = useState<FormNovoAnuncio>(novoAnuncioInicial);
  const [fotoAnuncio, setFotoAnuncio] = useState<File | null>(null);
  const [salvandoNovo, setSalvandoNovo] = useState(false);

  const [modalAnuncioAberto, setModalAnuncioAberto] = useState(false);
  const [anuncioEditando, setAnuncioEditando] = useState<Anuncio | null>(null);
  const [precoEdicao, setPrecoEdicao] = useState('');
  const [novaFotoEdicao, setNovaFotoEdicao] = useState<File | null>(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);

  const carregarDados = async () => {
    setLoading(true);

    const [resAnuncios, resCategorias] = await Promise.all([
      supabase.from('anuncios').select('*').order('created_at', { ascending: false }),
      supabase
        .from('categorias')
        .select('id, nome, slug')
        .eq('ativa', true)
        .order('ordem', { ascending: true }),
    ]);

    if (resAnuncios.error) {
      console.error('Erro ao carregar anúncios:', resAnuncios.error);
      alert(`Erro ao carregar anúncios: ${resAnuncios.error.message}`);
    } else {
      setAnuncios(resAnuncios.data || []);
    }

    if (resCategorias.error) {
      console.error('Erro ao carregar categorias:', resCategorias.error);
    } else {
      setCategorias(resCategorias.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const pendentes = anuncios.filter((anuncio) => anuncio.status === 'pendente').length;
  const aprovados = anuncios.filter(
    (anuncio) => anuncio.status === 'aprovado' || anuncio.aprovado === true
  ).length;
  const rejeitados = anuncios.filter((anuncio) => anuncio.status === 'rejeitado').length;

  const anunciosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return anuncios.filter((anuncio) => {
      const correspondeStatus =
        filtroStatus === 'todos' ||
        anuncio.status === filtroStatus ||
        (filtroStatus === 'aprovado' && anuncio.aprovado);

      const correspondeBusca =
        !termo ||
        anuncio.titulo?.toLowerCase().includes(termo) ||
        anuncio.nome_loja?.toLowerCase().includes(termo) ||
        anuncio.telefone?.toLowerCase().includes(termo) ||
        anuncio.categoria?.toLowerCase().includes(termo);

      return correspondeStatus && correspondeBusca;
    });
  }, [anuncios, busca, filtroStatus]);

  const enviarImagem = async (arquivo: File, pasta: string): Promise<string> => {
    const extensao = arquivo.name.split('.').pop()?.toLowerCase() || 'jpg';
    const nomeArquivo = `${pasta}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extensao}`;

    const { error } = await supabase.storage
      .from('imagens-anuncios')
      .upload(nomeArquivo, arquivo, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    return supabase.storage.from('imagens-anuncios').getPublicUrl(nomeArquivo).data.publicUrl;
  };

  const atualizarStatus = async (id: string, novoStatus: 'aprovado' | 'rejeitado') => {
    const anuncio = anuncios.find((item) => item.id === id);

    if (novoStatus === 'aprovado' && (!anuncio?.imagens || anuncio.imagens.length === 0)) {
      const continuar = confirm('Este anúncio não possui foto. Deseja aprovar mesmo assim?');
      if (!continuar) return;
    }

    const { error } = await supabase
      .from('anuncios')
      .update({
        aprovado: novoStatus === 'aprovado',
        status: novoStatus,
        ativo: novoStatus === 'aprovado',
      })
      .eq('id', id);

    if (error) {
      alert(`Erro ao atualizar: ${error.message}`);
      return;
    }

    await carregarDados();
  };

  const alterarDestaque = async (id: string, destaque: boolean) => {
    const { error } = await supabase.from('anuncios').update({ destaque }).eq('id', id);

    if (error) {
      alert(`Erro ao alterar destaque: ${error.message}`);
      return;
    }

    await carregarDados();
  };

  const renovarAnuncio = async (anuncio: Anuncio) => {
    const dias =
      anuncio.plano_usado === 'Gratuito' ? 7 : anuncio.plano_usado === 'Impulso' ? 15 : 30;

    if (!confirm(`Deseja renovar este anúncio por mais ${dias} dias?`)) return;

    const base =
      anuncio.data_expiracao && new Date(anuncio.data_expiracao).getTime() > Date.now()
        ? new Date(anuncio.data_expiracao)
        : new Date();

    base.setDate(base.getDate() + dias);

    const { error } = await supabase
      .from('anuncios')
      .update({
        data_expiracao: base.toISOString(),
        ativo: true,
        aprovado: true,
        status: 'aprovado',
      })
      .eq('id', anuncio.id);

    if (error) {
      alert(`Erro ao renovar: ${error.message}`);
      return;
    }

    alert(`Anúncio renovado por mais ${dias} dias.`);
    await carregarDados();
  };

  const excluirAnuncio = async (id: string) => {
  const anuncio = anuncios.find((item) => item.id === id);

  const nomeAnuncio =
    anuncio?.titulo || anuncio?.nome_loja || 'este anúncio';

  const confirmar = confirm(
    `ATENÇÃO!\n\nDeseja realmente excluir "${nomeAnuncio}"?\n\nEssa ação não poderá ser desfeita.`
  );

  if (!confirmar) return;

  try {
    const { data, error } = await supabase
      .from('anuncios')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) {
      console.error('Erro ao excluir anúncio:', error);
      alert(`Erro ao excluir anúncio: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      console.error(
        'Nenhum anúncio foi excluído. Possível bloqueio de RLS.',
        { id }
      );

      alert(
        'O anúncio não foi excluído.\n\n' +
          'O banco não autorizou a exclusão do registro. ' +
          'Verifique a permissão administrativa (RLS).'
      );

      return;
    }

    // Remove imediatamente da tela.
    setAnuncios((listaAtual) =>
      listaAtual.filter((item) => item.id !== id)
    );

    alert('Anúncio excluído com sucesso.');
  } catch (error) {
    console.error('Erro inesperado ao excluir anúncio:', error);

    alert(
      error instanceof Error
        ? `Erro ao excluir anúncio: ${error.message}`
        : 'Não foi possível excluir o anúncio.'
    );
  }
};

  const criarAnuncioManual = async () => {
    if (!novoAnuncio.titulo.trim() || !novoAnuncio.nome_loja.trim() || !novoAnuncio.categoria) {
      alert('Preencha título, anunciante e categoria.');
      return;
    }

    setSalvandoNovo(true);

    try {
      let imagemUrl: string | null = null;
      if (fotoAnuncio) imagemUrl = await enviarImagem(fotoAnuncio, 'admin');

      const dias =
        novoAnuncio.plano_usado === 'Gratuito'
          ? 7
          : novoAnuncio.plano_usado === 'Impulso'
            ? 15
            : 30;

      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + dias);

      const { error } = await supabase.from('anuncios').insert([
        {
          tipo: tipoPelaCategoria(novoAnuncio.categoria),
          titulo: novoAnuncio.titulo.trim(),
          nome_loja: novoAnuncio.nome_loja.trim(),
          telefone: novoAnuncio.telefone.trim() || null,
          email: novoAnuncio.email.trim() || null,
          instagram: novoAnuncio.instagram.trim() || null,
          descricao: novoAnuncio.descricao.trim() || null,
          preco: normalizarPreco(novoAnuncio.preco),
          categoria: novoAnuncio.categoria,
          cidade: novoAnuncio.cidade.trim() || 'Nova União',
          estado: novoAnuncio.estado.trim() || 'MG',
          imagens: imagemUrl ? [imagemUrl] : [],
          plano_usado: novoAnuncio.plano_usado,
          payment_status: novoAnuncio.payment_status,
          status: 'aprovado',
          aprovado: true,
          ativo: true,
          destaque: novoAnuncio.plano_usado === 'Impulso',
          data_expiracao: dataExpiracao.toISOString(),
        },
      ]);

      if (error) throw error;

      alert('Anúncio criado com sucesso.');
      setMostrarNovoAnuncio(false);
      setNovoAnuncio(novoAnuncioInicial);
      setFotoAnuncio(null);
      await carregarDados();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao criar anúncio.');
    } finally {
      setSalvandoNovo(false);
    }
  };

  const abrirEdicaoAnuncio = (anuncio: Anuncio) => {
    setAnuncioEditando({
      ...anuncio,
      preco: anuncio.preco ?? null,
      categoria: anuncio.categoria || '',
      cidade: anuncio.cidade || 'Nova União',
      estado: anuncio.estado || 'MG',
      plano_usado: anuncio.plano_usado || 'Gratuito',
      payment_status: anuncio.payment_status || 'pendente',
      status: anuncio.status || 'pendente',
      ativo: anuncio.ativo ?? true,
      destaque: anuncio.destaque ?? false,
    });
    setPrecoEdicao(formatarPrecoParaCampo(anuncio.preco));
    setNovaFotoEdicao(null);
    setModalAnuncioAberto(true);
  };

  const salvarEdicaoAnuncio = async () => {
    if (!anuncioEditando) return;
    if (!anuncioEditando.titulo.trim()) {
      alert('Informe o título do anúncio.');
      return;
    }

    setSalvandoEdicao(true);

    try {
      let imagensAtualizadas = anuncioEditando.imagens || [];

      if (novaFotoEdicao) {
        const novaUrl = await enviarImagem(
          novaFotoEdicao,
          `admin-edicao/${anuncioEditando.id}`
        );
        imagensAtualizadas = [novaUrl, ...imagensAtualizadas.filter(Boolean)];
      }

      const status = anuncioEditando.status || 'pendente';
      const aprovado = status === 'aprovado';

      const { error } = await supabase
        .from('anuncios')
        .update({
          titulo: anuncioEditando.titulo.trim(),
          nome_loja: anuncioEditando.nome_loja?.trim() || null,
          telefone: anuncioEditando.telefone?.trim() || null,
          email: anuncioEditando.email?.trim() || null,
          instagram: anuncioEditando.instagram?.trim() || null,
          descricao: anuncioEditando.descricao?.trim() || null,
          preco: normalizarPreco(precoEdicao),
          categoria: anuncioEditando.categoria || null,
          tipo: tipoPelaCategoria(anuncioEditando.categoria || ''),
          cidade: anuncioEditando.cidade?.trim() || 'Nova União',
          estado: anuncioEditando.estado?.trim() || 'MG',
          plano_usado: anuncioEditando.plano_usado,
          payment_status: anuncioEditando.payment_status,
          status,
          aprovado,
          ativo: anuncioEditando.ativo ?? true,
          destaque: anuncioEditando.destaque ?? false,
          data_expiracao: anuncioEditando.data_expiracao || null,
          imagens: imagensAtualizadas,
        })
        .eq('id', anuncioEditando.id);

      if (error) throw error;

      alert('Alterações salvas.');
      setModalAnuncioAberto(false);
      setAnuncioEditando(null);
      setPrecoEdicao('');
      setNovaFotoEdicao(null);
      await carregarDados();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar.');
    } finally {
      setSalvandoEdicao(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Anúncios</h2>
          <p className="text-slate-500 mt-1">Cadastre, aprove, edite e renove anúncios.</p>
        </div>
        <button
          type="button"
          onClick={carregarDados}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-2xl"
        >
          Atualizar anúncios
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Contador valor={pendentes} titulo="Pendentes" classe="bg-yellow-100 text-yellow-700" />
        <Contador valor={aprovados} titulo="Aprovados" classe="bg-green-100 text-green-700" />
        <Contador valor={rejeitados} titulo="Rejeitados" classe="bg-red-100 text-red-700" />
      </div>

      <div className="bg-white border rounded-3xl p-5 mb-6">
        <div className="grid md:grid-cols-[1fr_220px_auto] gap-4">
          <input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Pesquisar anúncio, anunciante, telefone ou categoria..."
            className="border border-slate-300 rounded-2xl px-4 py-3"
          />

          <select
            value={filtroStatus}
            onChange={(event) => setFiltroStatus(event.target.value)}
            className="border border-slate-300 rounded-2xl px-4 py-3 bg-white"
          >
            <option value="todos">Todos os status</option>
            <option value="pendente">Pendentes</option>
            <option value="aprovado">Aprovados</option>
            <option value="rejeitado">Rejeitados</option>
            <option value="vencido">Vencidos</option>
          </select>

          <button
            type="button"
            onClick={() => setMostrarNovoAnuncio((valor) => !valor)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-medium"
          >
            {mostrarNovoAnuncio ? 'Fechar formulário' : 'Novo anúncio'}
          </button>
        </div>
      </div>

      {mostrarNovoAnuncio && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border mb-8">
          <h3 className="text-2xl font-bold mb-6">Novo anúncio manual</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <CampoAdmin label="Título do anúncio *" value={novoAnuncio.titulo} onChange={(valor) => setNovoAnuncio({ ...novoAnuncio, titulo: valor })} />
            <CampoAdmin label="Anunciante *" value={novoAnuncio.nome_loja} onChange={(valor) => setNovoAnuncio({ ...novoAnuncio, nome_loja: valor })} />
            <CampoAdmin label="Telefone" value={novoAnuncio.telefone} onChange={(valor) => setNovoAnuncio({ ...novoAnuncio, telefone: valor })} />
            <CampoAdmin label="E-mail" type="email" value={novoAnuncio.email} onChange={(valor) => setNovoAnuncio({ ...novoAnuncio, email: valor })} />
            <CampoAdmin label="Instagram" value={novoAnuncio.instagram} onChange={(valor) => setNovoAnuncio({ ...novoAnuncio, instagram: valor })} />
            <CampoAdmin
              label="Preço"
              value={novoAnuncio.preco}
              onChange={(valor) =>
                setNovoAnuncio({
                  ...novoAnuncio,
                  preco: formatarPrecoDigitado(valor),
                })
              }
            />
            <SelecaoAdmin label="Categoria *" value={novoAnuncio.categoria} onChange={(valor) => setNovoAnuncio({ ...novoAnuncio, categoria: valor })} options={categorias.map((categoria) => ({ value: categoria.nome, label: categoria.nome }))} placeholder="Selecione a categoria" />
            <SelecaoAdmin label="Plano" value={novoAnuncio.plano_usado} onChange={(valor) => setNovoAnuncio({ ...novoAnuncio, plano_usado: valor })} options={planos.map((plano) => ({ value: plano, label: plano }))} />
            <SelecaoAdmin label="Pagamento" value={novoAnuncio.payment_status} onChange={(valor) => setNovoAnuncio({ ...novoAnuncio, payment_status: valor })} options={pagamentos.map((pagamento) => ({ value: pagamento, label: pagamento }))} />
            <CampoAdmin label="Cidade" value={novoAnuncio.cidade} onChange={(valor) => setNovoAnuncio({ ...novoAnuncio, cidade: valor })} />
            <CampoAdmin label="Estado" value={novoAnuncio.estado} onChange={(valor) => setNovoAnuncio({ ...novoAnuncio, estado: valor })} />

            <div>
              <label className="block font-medium mb-2">Foto</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setFotoAnuncio(event.target.files?.[0] || null)}
                className="w-full border rounded-2xl px-4 py-3"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block font-medium mb-2">Descrição</label>
            <textarea
              value={novoAnuncio.descricao}
              onChange={(event) => setNovoAnuncio({ ...novoAnuncio, descricao: event.target.value })}
              rows={5}
              className="w-full border rounded-3xl px-4 py-4"
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button type="button" onClick={() => setMostrarNovoAnuncio(false)} className="flex-1 py-4 bg-slate-200 rounded-2xl">Cancelar</button>
            <button type="button" onClick={criarAnuncioManual} disabled={salvandoNovo} className="flex-1 py-4 bg-emerald-600 disabled:bg-slate-400 text-white rounded-2xl">
              {salvandoNovo ? 'Salvando...' : 'Salvar anúncio'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow border overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Carregando...</div>
        ) : (
          <table className="w-full min-w-[1150px]">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-4 text-left">Foto</th>
                <th className="p-4 text-left">Anúncio</th>
                <th className="p-4 text-left">Categoria</th>
                <th className="p-4 text-left">Preço</th>
                <th className="p-4 text-left">Contato</th>
                <th className="p-4 text-left">Plano</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Vencimento</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {anunciosFiltrados.map((anuncio) => (
                <tr key={anuncio.id} className={!anuncio.imagens?.length ? 'bg-red-50' : 'hover:bg-slate-50'}>
                  <td className="p-4">
                    {anuncio.imagens?.[0] ? (
                      <img src={anuncio.imagens[0]} alt={anuncio.titulo} className="w-20 h-20 object-cover rounded-xl" />
                    ) : (
                      <div className="w-20 h-20 bg-red-100 border border-red-200 rounded-xl flex items-center justify-center text-red-600 text-xs text-center">Sem foto</div>
                    )}
                  </td>
                  <td className="p-4 max-w-[260px]">
                    <p className="font-bold">{anuncio.nome_loja || 'Sem anunciante'}</p>
                    <p className="text-sm text-slate-600 line-clamp-2">{anuncio.titulo}</p>
                  </td>
                  <td className="p-4 text-sm">{anuncio.categoria || '—'}</td>
                  <td className="p-4 font-bold text-orange-600">{formatarPreco(anuncio.preco)}</td>
                  <td className="p-4 text-sm">
                    {anuncio.telefone || '—'}
                    {anuncio.instagram && <p className="text-blue-600">{anuncio.instagram}</p>}
                  </td>
                  <td className="p-4 text-sm">
                    <p className="font-semibold text-orange-600">{anuncio.plano_usado || '—'}</p>
                    <p className="text-xs text-slate-500">{anuncio.payment_status || 'pendente'}</p>
                  </td>
                  <td className="p-4">
                    <Status status={anuncio.status || 'pendente'} />
                    {anuncio.destaque && <p className="text-xs text-amber-600 mt-2">Destaque</p>}
                  </td>
                  <td className="p-4 text-sm">{formatarData(anuncio.data_expiracao)}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap justify-center gap-2">
                      {!anuncio.aprovado && <button type="button" onClick={() => atualizarStatus(anuncio.id, 'aprovado')} className="bg-green-600 text-white px-3 py-2 rounded-xl text-sm">Aprovar</button>}
                      <button type="button" onClick={() => atualizarStatus(anuncio.id, 'rejeitado')} className="bg-slate-700 text-white px-3 py-2 rounded-xl text-sm">Rejeitar</button>
                      <button type="button" onClick={() => alterarDestaque(anuncio.id, !anuncio.destaque)} className="bg-yellow-500 text-white px-3 py-2 rounded-xl text-sm">{anuncio.destaque ? 'Tirar destaque' : 'Destacar'}</button>
                      <button type="button" onClick={() => renovarAnuncio(anuncio)} className="bg-orange-600 text-white px-3 py-2 rounded-xl text-sm">Renovar</button>
                      <button type="button" onClick={() => abrirEdicaoAnuncio(anuncio)} className="bg-blue-600 text-white px-3 py-2 rounded-xl text-sm">Editar</button>
                      <button type="button" onClick={() => excluirAnuncio(anuncio.id)} className="bg-red-600 text-white px-3 py-2 rounded-xl text-sm">Excluir</button>
                    </div>
                  </td>
                </tr>
              ))}

              {anunciosFiltrados.length === 0 && (
                <tr><td colSpan={9} className="p-12 text-center text-slate-500">Nenhum anúncio encontrado.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalAnuncioAberto && anuncioEditando && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Editar anúncio</h3>
              <button
                type="button"
                onClick={() => {
                  setModalAnuncioAberto(false);
                  setAnuncioEditando(null);
                  setPrecoEdicao('');
                  setNovaFotoEdicao(null);
                }}
                className="w-10 h-10 rounded-full bg-slate-100 text-xl"
              >
                ×
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <CampoAdmin label="Título do anúncio" value={anuncioEditando.titulo || ''} onChange={(valor) => setAnuncioEditando({ ...anuncioEditando, titulo: valor })} />
              <CampoAdmin label="Anunciante" value={anuncioEditando.nome_loja || ''} onChange={(valor) => setAnuncioEditando({ ...anuncioEditando, nome_loja: valor })} />
              <CampoAdmin
                label="Preço"
                value={precoEdicao}
                onChange={(valor) =>
                  setPrecoEdicao(formatarPrecoDigitado(valor))
                }
              />
              <SelecaoAdmin label="Categoria" value={anuncioEditando.categoria || ''} onChange={(valor) => setAnuncioEditando({ ...anuncioEditando, categoria: valor })} options={categorias.map((categoria) => ({ value: categoria.nome, label: categoria.nome }))} placeholder="Selecione a categoria" />
              <CampoAdmin label="Telefone" value={anuncioEditando.telefone || ''} onChange={(valor) => setAnuncioEditando({ ...anuncioEditando, telefone: valor })} />
              <CampoAdmin label="E-mail" type="email" value={anuncioEditando.email || ''} onChange={(valor) => setAnuncioEditando({ ...anuncioEditando, email: valor })} />
              <CampoAdmin label="Instagram" value={anuncioEditando.instagram || ''} onChange={(valor) => setAnuncioEditando({ ...anuncioEditando, instagram: valor })} />
              <CampoAdmin label="Cidade" value={anuncioEditando.cidade || ''} onChange={(valor) => setAnuncioEditando({ ...anuncioEditando, cidade: valor })} />
              <CampoAdmin label="Estado" value={anuncioEditando.estado || ''} onChange={(valor) => setAnuncioEditando({ ...anuncioEditando, estado: valor })} />
              <SelecaoAdmin label="Plano" value={anuncioEditando.plano_usado || ''} onChange={(valor) => setAnuncioEditando({ ...anuncioEditando, plano_usado: valor })} options={planos.map((plano) => ({ value: plano, label: plano }))} />
              <SelecaoAdmin label="Pagamento" value={anuncioEditando.payment_status || ''} onChange={(valor) => setAnuncioEditando({ ...anuncioEditando, payment_status: valor })} options={pagamentos.map((pagamento) => ({ value: pagamento, label: pagamento }))} />
              <SelecaoAdmin label="Status" value={anuncioEditando.status || 'pendente'} onChange={(valor) => setAnuncioEditando({ ...anuncioEditando, status: valor })} options={estadosAnuncio.map((status) => ({ value: status, label: status }))} />

              <div>
                <label className="block font-medium mb-2">Data de vencimento</label>
                <input
                  type="date"
                  value={anuncioEditando.data_expiracao ? anuncioEditando.data_expiracao.slice(0, 10) : ''}
                  onChange={(event) => setAnuncioEditando({
                    ...anuncioEditando,
                    data_expiracao: event.target.value ? new Date(`${event.target.value}T12:00:00`).toISOString() : null,
                  })}
                  className="w-full border rounded-2xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block font-medium mb-2">Adicionar nova foto principal</label>
                <input type="file" accept="image/*" onChange={(event) => setNovaFotoEdicao(event.target.files?.[0] || null)} className="w-full border rounded-2xl px-4 py-3" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-5">
              <label className="border rounded-2xl px-4 py-4 flex items-center gap-3">
                <input type="checkbox" checked={anuncioEditando.ativo ?? true} onChange={(event) => setAnuncioEditando({ ...anuncioEditando, ativo: event.target.checked })} />
                Anúncio ativo
              </label>
              <label className="border rounded-2xl px-4 py-4 flex items-center gap-3">
                <input type="checkbox" checked={anuncioEditando.destaque ?? false} onChange={(event) => setAnuncioEditando({ ...anuncioEditando, destaque: event.target.checked })} />
                Anúncio em destaque
              </label>
            </div>

            <div className="mt-5">
              <label className="block font-medium mb-2">Descrição</label>
              <textarea value={anuncioEditando.descricao || ''} onChange={(event) => setAnuncioEditando({ ...anuncioEditando, descricao: event.target.value })} rows={6} className="w-full border rounded-3xl px-4 py-4" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-7">
              <button
                type="button"
                onClick={() => {
                  setModalAnuncioAberto(false);
                  setAnuncioEditando(null);
                  setPrecoEdicao('');
                  setNovaFotoEdicao(null);
                }}
                className="flex-1 py-4 bg-slate-200 rounded-2xl"
              >
                Cancelar
              </button>
              <button type="button" onClick={salvarEdicaoAnuncio} disabled={salvandoEdicao} className="flex-1 py-4 bg-green-600 disabled:bg-slate-400 text-white rounded-2xl">{salvandoEdicao ? 'Salvando...' : 'Salvar alterações'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Contador({ valor, titulo, classe }: { valor: number; titulo: string; classe: string }) {
  return <div className={`${classe} rounded-2xl p-5 text-center`}><p className="text-4xl font-bold">{valor}</p><p className="text-sm mt-1">{titulo}</p></div>;
}

function Status({ status }: { status: string }) {
  const classe = status === 'aprovado' ? 'bg-green-100 text-green-700' : status === 'rejeitado' ? 'bg-red-100 text-red-700' : status === 'vencido' ? 'bg-slate-200 text-slate-700' : 'bg-yellow-100 text-yellow-700';
  return <span className={`${classe} px-3 py-1 rounded-full text-xs font-bold`}>{status.toUpperCase()}</span>;
}

function CampoAdmin({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (valor: string) => void; type?: string }) {
  return <div><label className="block font-medium mb-2">{label}</label><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full border border-slate-300 rounded-2xl px-4 py-3" /></div>;
}

function SelecaoAdmin({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (valor: string) => void; options: Array<{ value: string; label: string }>; placeholder?: string }) {
  return <div><label className="block font-medium mb-2">{label}</label><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full border border-slate-300 rounded-2xl px-4 py-3 bg-white">{placeholder && <option value="">{placeholder}</option>}{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>;
}
