
'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { supabase } from '../../lib/supabase';

const BUCKET = 'imagens-anuncios';
const PASTA = 'banners-home';
const TAMANHO_MAXIMO = 8 * 1024 * 1024;

const TIPOS_PERMITIDOS = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

type BannerHome = {
  id: string;
  titulo: string;
  imagem_url: string;
  link_destino: string | null;
  tipo: 'publicidade' | 'institucional';
  ativo: boolean;
  ordem: number;
  data_inicio: string | null;
  data_fim: string | null;
  created_at: string;
  updated_at: string;
};

type Formulario = {
  titulo: string;
  link_destino: string;
  tipo: 'publicidade' | 'institucional';
  ativo: boolean;
  ordem: string;
  data_inicio: string;
  data_fim: string;
};

const formularioInicial: Formulario = {
  titulo: '',
  link_destino: '',
  tipo: 'institucional',
  ativo: true,
  ordem: '0',
  data_inicio: '',
  data_fim: '',
};

function paraCampoData(valor: string | null): string {
  if (!valor) return '';

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return '';

  const local = new Date(
    data.getTime() - data.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
}

function paraISO(valor: string): string | null {
  if (!valor) return null;
  return new Date(valor).toISOString();
}

function formatarData(valor: string | null): string {
  if (!valor) return 'Sem limite';

  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return 'Data inválida';

  return data.toLocaleString('pt-BR');
}

function extrairCaminhoBanner(url: string): string | null {
  if (!url) return null;

  const marcador = `/storage/v1/object/public/${BUCKET}/`;
  const indice = url.indexOf(marcador);

  if (indice === -1) return null;

  let caminho = url
    .slice(indice + marcador.length)
    .split('?')[0]
    .split('#')[0];

  try {
    caminho = decodeURIComponent(caminho);
  } catch {
    return null;
  }

  const partes = caminho.split('/');

  // Somente arquivos no formato:
  // ID-DO-USUARIO/banners-home/arquivo
  if (
    partes.length !== 3 ||
    !/^[0-9a-f-]{36}$/i.test(partes[0]) ||
    partes[1] !== PASTA ||
    !partes[2] ||
    partes.some((parte) => parte === '.' || parte === '..')
  ) {
    return null;
  }

  return caminho;
}

function validarLink(valor: string): boolean {
  if (!valor) return true;

  if (valor.startsWith('/') && !valor.startsWith('//')) {
    return true;
  }

  try {
    const url = new URL(valor);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function statusBanner(banner: BannerHome): string {
  if (!banner.ativo) return 'Inativo';

  const agora = Date.now();

  if (
    banner.data_inicio &&
    new Date(banner.data_inicio).getTime() > agora
  ) {
    return 'Agendado';
  }

  if (
    banner.data_fim &&
    new Date(banner.data_fim).getTime() < agora
  ) {
    return 'Vencido';
  }

  return 'Em exibição';
}

export default function BannersHomeAdmin() {
  const [banners, setBanners] = useState<BannerHome[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<string | null>(
    null
  );

  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [idEdicao, setIdEdicao] = useState<string | null>(null);

  const [formulario, setFormulario] =
    useState<Formulario>(formularioInicial);

  const [arquivoImagem, setArquivoImagem] = useState<File | null>(
    null
  );
  const [imagemAtual, setImagemAtual] = useState('');

  const carregarBanners = useCallback(async () => {
    setCarregando(true);
    setErro('');

    const { data, error } = await supabase
      .from('banners_home')
      .select('*')
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar banners:', error);
      setErro(`Não foi possível carregar os banners: ${error.message}`);
    } else {
      setBanners((data ?? []) as BannerHome[]);
    }

    setCarregando(false);
  }, []);

  useEffect(() => {
    void carregarBanners();
  }, [carregarBanners]);

  const limparFormulario = () => {
    setFormulario({ ...formularioInicial });
    setArquivoImagem(null);
    setImagemAtual('');
    setIdEdicao(null);
    setMostrarFormulario(false);
  };

  const abrirCadastro = () => {
    setErro('');
    setMensagem('');
    setFormulario({ ...formularioInicial });
    setArquivoImagem(null);
    setImagemAtual('');
    setIdEdicao(null);
    setMostrarFormulario(true);
  };

  const abrirEdicao = (banner: BannerHome) => {
    setErro('');
    setMensagem('');
    setIdEdicao(banner.id);
    setImagemAtual(banner.imagem_url);
    setArquivoImagem(null);

    setFormulario({
      titulo: banner.titulo,
      link_destino: banner.link_destino || '',
      tipo: banner.tipo,
      ativo: banner.ativo,
      ordem: String(banner.ordem),
      data_inicio: paraCampoData(banner.data_inicio),
      data_fim: paraCampoData(banner.data_fim),
    });

    setMostrarFormulario(true);
  };

  const selecionarImagem = (event: ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    if (!TIPOS_PERMITIDOS.includes(arquivo.type)) {
      setErro('Escolha uma imagem JPG, PNG, WEBP ou GIF.');
      event.target.value = '';
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO) {
      setErro('A imagem deve ter no máximo 8 MB.');
      event.target.value = '';
      return;
    }

    setErro('');
    setArquivoImagem(arquivo);
  };

  const enviarImagem = async (arquivo: File): Promise<string> => {
    const {
      data: { user },
      error: erroUsuario,
    } = await supabase.auth.getUser();

    if (erroUsuario) throw erroUsuario;

    if (!user) {
      throw new Error('Sessão expirada. Entre novamente no Admin.');
    }

    const extensao = arquivo.name.split('.').pop()?.toLowerCase();

    const nomeArquivo =
      `${user.id}/${PASTA}/` +
      `${Date.now()}-${Math.random().toString(36).slice(2)}.` +
      `${extensao || 'jpg'}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(nomeArquivo, arquivo, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    return supabase.storage
      .from(BUCKET)
      .getPublicUrl(nomeArquivo).data.publicUrl;
  };

  const removerImagem = async (url: string): Promise<boolean> => {
    const caminho = extrairCaminhoBanner(url);

    // Não excluir imagens externas ou de outros módulos.
    if (!caminho) return false;

    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([caminho]);

    if (error) {
      console.warn('Erro ao remover imagem do banner:', error);
      return false;
    }

    return true;
  };

  const salvarBanner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (salvando) return;

    setErro('');
    setMensagem('');

    const titulo = formulario.titulo.trim();
    const link = formulario.link_destino.trim();

    if (!titulo) {
      setErro('Informe o título do banner.');
      return;
    }

    if (!arquivoImagem && !imagemAtual) {
      setErro('Selecione uma imagem para o banner.');
      return;
    }

    if (!validarLink(link)) {
      setErro('Informe um link válido, começando com https:// ou /.');
      return;
    }

    const ordem = Number(formulario.ordem);

    if (!Number.isInteger(ordem) || ordem < 0) {
      setErro('A ordem deve ser um número inteiro maior ou igual a zero.');
      return;
    }

    const inicio = paraISO(formulario.data_inicio);
    const fim = paraISO(formulario.data_fim);

    if (inicio && fim && new Date(fim) <= new Date(inicio)) {
      setErro('A data final deve ser posterior à data inicial.');
      return;
    }

    setSalvando(true);

    let novaImagemUrl = '';
    let registroSalvo = false;

    try {
      if (arquivoImagem) {
        novaImagemUrl = await enviarImagem(arquivoImagem);
      }

      const imagemUrl = novaImagemUrl || imagemAtual;

      const payload = {
        titulo,
        imagem_url: imagemUrl,
        link_destino: link || null,
        tipo: formulario.tipo,
        ativo: formulario.ativo,
        ordem,
        data_inicio: inicio,
        data_fim: fim,
        updated_at: new Date().toISOString(),
      };

      if (idEdicao) {
        const { error } = await supabase
          .from('banners_home')
          .update(payload)
          .eq('id', idEdicao);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('banners_home')
          .insert(payload);

        if (error) throw error;
      }

      registroSalvo = true;

      let avisoImagem = '';

      if (idEdicao && novaImagemUrl && imagemAtual) {
        const caminhoAnterior = extrairCaminhoBanner(imagemAtual);

        if (caminhoAnterior) {
          const removida = await removerImagem(imagemAtual);

          if (!removida) {
            avisoImagem =
              ' A imagem anterior não pôde ser removida do Storage.';
          }
        }
      }

      limparFormulario();
      setMensagem(`Banner salvo com sucesso.${avisoImagem}`);

      await carregarBanners();
    } catch (error) {
      console.error('Erro ao salvar banner:', error);

      // Se o banco falhou após o upload, limpar a nova imagem.
      if (novaImagemUrl && !registroSalvo) {
        const removida = await removerImagem(novaImagemUrl);

        if (!removida) {
          console.warn(
            'O upload não foi vinculado ao banner e precisa de limpeza.'
          );
        }
      }

      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o banner.'
      );
    } finally {
      setSalvando(false);
    }
  };

  const alterarAtivo = async (banner: BannerHome) => {
    if (acaoEmAndamento) return;

    setErro('');
    setMensagem('');
    setAcaoEmAndamento(banner.id);

    const { error } = await supabase
      .from('banners_home')
      .update({
        ativo: !banner.ativo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', banner.id);

    if (error) {
      setErro(`Não foi possível alterar o banner: ${error.message}`);
    } else {
      setMensagem(
        banner.ativo
          ? 'Banner desativado com sucesso.'
          : 'Banner ativado com sucesso.'
      );
      await carregarBanners();
    }

    setAcaoEmAndamento(null);
  };

  const excluirBanner = async (banner: BannerHome) => {
    if (acaoEmAndamento) return;

    const confirmou = window.confirm(
      `Deseja excluir definitivamente o banner "${banner.titulo}"?\n\n` +
      'O cadastro será apagado e a imagem correspondente será removida ' +
      'do Storage quando pertencer à pasta de banners.\n\n' +
      'Para apenas retirar da Home, use Desativar.'
    );

    if (!confirmou) return;

    setErro('');
    setMensagem('');
    setAcaoEmAndamento(banner.id);

    const { error } = await supabase
      .from('banners_home')
      .delete()
      .eq('id', banner.id);

    if (error) {
      setErro(`Não foi possível excluir o banner: ${error.message}`);
      setAcaoEmAndamento(null);
      return;
    }

    const caminho = extrairCaminhoBanner(banner.imagem_url);

    if (caminho) {
      const removida = await removerImagem(banner.imagem_url);

      if (!removida) {
        setMensagem(
          'Banner excluído do banco, mas a imagem não pôde ser removida do Storage.'
        );
      } else {
        setMensagem('Banner e imagem excluídos com sucesso.');
      }
    } else {
      setMensagem(
        'Banner excluído. A imagem não foi removida porque não pertence à pasta de banners.'
      );
    }

    await carregarBanners();
    setAcaoEmAndamento(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Banners da Home
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Gerencie banners comerciais e institucionais da página inicial.
            </p>
          </div>

          {!mostrarFormulario && (
            <button
              type="button"
              onClick={abrirCadastro}
              className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
            >
              + Novo banner
            </button>
          )}
        </div>

        {erro && (
          <p
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {erro}
          </p>
        )}

        {mensagem && (
          <p
            role="status"
            className="mt-5 rounded-xl bg-slate-100 p-4 text-sm text-slate-700"
          >
            {mensagem}
          </p>
        )}
      </div>

      {mostrarFormulario && (
        <form
          onSubmit={salvarBanner}
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="text-xl font-bold text-slate-900">
            {idEdicao ? 'Editar banner' : 'Cadastrar banner'}
          </h3>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Título *
            </label>
            <input
              type="text"
              required
              maxLength={150}
              value={formulario.titulo}
              onChange={(event) =>
                setFormulario((atual) => ({
                  ...atual,
                  titulo: event.target.value,
                }))
              }
              placeholder="Ex.: Campanha de divulgação do Portal"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tipo de banner
              </label>
              <select
                value={formulario.tipo}
                onChange={(event) =>
                  setFormulario((atual) => ({
                    ...atual,
                    tipo: event.target.value as Formulario['tipo'],
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              >
                <option value="institucional">Institucional</option>
                <option value="publicidade">Publicidade</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Ordem de exibição
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={formulario.ordem}
                onChange={(event) =>
                  setFormulario((atual) => ({
                    ...atual,
                    ordem: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Link ao clicar no banner
            </label>
            <input
              type="text"
              value={formulario.link_destino}
              onChange={(event) =>
                setFormulario((atual) => ({
                  ...atual,
                  link_destino: event.target.value,
                }))
              }
              placeholder="https://exemplo.com.br ou /anunciar"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
            />
            <p className="mt-1 text-xs text-slate-500">
              Opcional. Deixe vazio quando não houver destino.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Início da exibição
              </label>
              <input
                type="datetime-local"
                value={formulario.data_inicio}
                onChange={(event) =>
                  setFormulario((atual) => ({
                    ...atual,
                    data_inicio: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Fim da exibição
              </label>
              <input
                type="datetime-local"
                value={formulario.data_fim}
                onChange={(event) =>
                  setFormulario((atual) => ({
                    ...atual,
                    data_fim: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              Imagem do banner *
            </label>

            {imagemAtual && !arquivoImagem && (
              <img
                src={imagemAtual}
                alt="Imagem atual do banner"
                className="mb-4 aspect-[4/3] w-full max-w-sm rounded-xl border border-slate-200 object-cover"
              />
            )}

            {arquivoImagem && (
              <p className="mb-3 text-sm font-medium text-slate-700">
                Nova imagem: {arquivoImagem.name}
              </p>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={selecionarImagem}
              className="block w-full text-sm text-slate-700"
            />

            <p className="mt-2 text-xs text-slate-500">
              JPG, PNG, WEBP ou GIF. Máximo de 8 MB.
              Proporção recomendada: 4:3 (ex.: 1200 × 900).
            </p>
          </div>

          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={formulario.ativo}
              onChange={(event) =>
                setFormulario((atual) => ({
                  ...atual,
                  ativo: event.target.checked,
                }))
              }
              className="h-5 w-5 accent-orange-600"
            />
            Banner ativo
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={salvando}
              className="rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar banner'}
            </button>

            <button
              type="button"
              disabled={salvando}
              onClick={limparFormulario}
              className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-bold text-slate-900">
          Banners cadastrados
        </h3>

        {carregando && (
          <p className="text-sm text-slate-500">Carregando banners...</p>
        )}

        {!carregando && !erro && banners.length === 0 && (
          <p className="text-sm text-slate-500">
            Nenhum banner cadastrado ainda.
          </p>
        )}

        {!carregando && banners.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {banners.map((banner) => {
              const status = statusBanner(banner);
              const ocupado = acaoEmAndamento !== null;

              return (
                <article
                  key={banner.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <img
                    src={banner.imagem_url}
                    alt={banner.titulo}
                    loading="lazy"
                    className="aspect-[4/3] w-full bg-slate-100 object-cover"
                  />

                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase text-slate-500">
                        {banner.tipo === 'publicidade'
                          ? 'Publicidade'
                          : 'Institucional'}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900">
                      {banner.titulo}
                    </h4>

                    <div className="space-y-1 text-xs text-slate-600">
                      <p>Ordem: {banner.ordem}</p>
                      <p>Início: {formatarData(banner.data_inicio)}</p>
                      <p>Fim: {formatarData(banner.data_fim)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        disabled={ocupado || salvando}
                        onClick={() => abrirEdicao(banner)}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        disabled={ocupado || salvando}
                        onClick={() => void alterarAtivo(banner)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                      >
                        {banner.ativo ? 'Desativar' : 'Ativar'}
                      </button>

                      <button
                        type="button"
                        disabled={ocupado || salvando}
                        onClick={() => void excluirBanner(banner)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
                      >
                        {acaoEmAndamento === banner.id
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
    </div>
  );
}
