'use client';

import { useEffect, useState } from 'react';
import AgendaAdmin from '../../components/admin/AgendaAdmin';
import AnunciosAdmin from '../../components/admin/AnunciosAdmin';
import DiretoProdutorAdmin from '../../components/admin/DiretoProdutorAdmin';
import FinanceiroAdmin from '../../components/admin/FinanceiroAdmin';
import NovaUniaoInformaAdmin from '../../components/admin/NovaUniaoInformaAdmin';
import { supabase } from '../../lib/supabase';

type Aba =
  | 'anuncios'
  | 'agenda'
  | 'informativos'
  | 'produtores'
  | 'financeiro';

export default function AdminPage() {
  const [activeTab, setActiveTab] =
    useState<Aba>('anuncios');

  const [verificandoLogin, setVerificandoLogin] =
    useState(true);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');

  const [loginError, setLoginError] =
    useState('');

  const [entrando, setEntrando] =
    useState(false);

  const [atualizacao, setAtualizacao] =
    useState(0);

  /*
   * =========================================================
   * VERIFICA SE O USUÁRIO AUTENTICADO É ADMINISTRADOR
   * =========================================================
   */
  const verificarAdministrador = async (userId: string) => {
    setVerificandoLogin(true);
    setLoginError('');

    try {
      const { data: perfil, error: perfilError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', userId)
        .single();

      if (perfilError) {
        console.error(
          'Erro ao verificar perfil:',
          perfilError
        );

        setIsAuthenticated(false);
        setVerificandoLogin(false);

        return false;
      }

      if (perfil?.role !== 'admin') {
        setIsAuthenticated(false);

        setLoginError(
          'Esta conta não possui permissão administrativa.'
        );

        setVerificandoLogin(false);

        return false;
      }

      setIsAuthenticated(true);
      setLoginError('');
      setVerificandoLogin(false);

      return true;
    } catch (error) {
      console.error(
        'Erro ao verificar administrador:',
        error
      );

      setIsAuthenticated(false);

      setLoginError(
        'Não foi possível verificar o acesso administrativo.'
      );

      setVerificandoLogin(false);

      return false;
    }
  };

  /*
   * =========================================================
   * VERIFICA SESSÃO AO ABRIR A PÁGINA
   * =========================================================
   */
  useEffect(() => {
    let ativo = true;

    const iniciarAutenticacao = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!ativo) return;

      if (error) {
        console.error('Erro ao verificar sessão:', error);
        setIsAuthenticated(false);
        setVerificandoLogin(false);
        return;
      }

      const user = data.session?.user;

      if (!user) {
        setIsAuthenticated(false);
        setVerificandoLogin(false);
        return;
      }

      await verificarAdministrador(user.id);
    };

    iniciarAutenticacao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!ativo) return;

        if (!session?.user) {
          setIsAuthenticated(false);
          setVerificandoLogin(false);
          return;
        }

        await verificarAdministrador(session.user.id);
      }
    );

    return () => {
      ativo = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * =========================================================
   * LOGIN COM EMAIL E SENHA
   * =========================================================
   */
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setLoginError(
        'Informe o e-mail e a senha.'
      );

      return;
    }

    setEntrando(true);
    setLoginError('');

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error || !data.user) {
        setLoginError(
          'E-mail ou senha incorretos.'
        );

        return;
      }

      const autorizado =
        await verificarAdministrador(data.user.id);

      if (!autorizado) {
        await supabase.auth.signOut();

        setLoginError(
          'Esta conta não possui permissão administrativa.'
        );

        return;
      }

      setEmail('');
      setPassword('');
    } catch (error) {
      console.error(
        'Erro no login administrativo:',
        error
      );

      setLoginError(
        'Não foi possível realizar o login.'
      );
    } finally {
      setEntrando(false);
    }
  };

  /*
   * =========================================================
   * LOGIN COM GOOGLE
   * =========================================================
   */
  const entrarComGoogle = async () => {
    setLoginError('');

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: 'google',

        options: {
          redirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/admin`
              : undefined,
        },
      });

    if (error) {
      console.error(
        'Erro no login Google:',
        error
      );

      setLoginError(
        'Não foi possível entrar com o Google.'
      );
    }
  };

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */
  const sair = async () => {
    await supabase.auth.signOut();

    setIsAuthenticated(false);

    setEmail('');
    setPassword('');
    setLoginError('');

    setActiveTab('anuncios');
  };

  /*
   * =========================================================
   * ATUALIZA COMPONENTES DO PAINEL
   * =========================================================
   */
  const atualizarPainel = () => {
    setAtualizacao(
      (valorAtual) => valorAtual + 1
    );
  };

  /*
   * =========================================================
   * VERIFICANDO ACESSO
   * =========================================================
   */
  if (verificandoLogin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />

          <p className="text-white mt-4">
            Verificando acesso...
          </p>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * TELA DE LOGIN
   * =========================================================
   */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-10">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md">
          <div className="text-center mb-7">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              CC
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Área Administrativa
            </h1>

            <p className="text-slate-500 mt-2">
              Acesse o painel do Conecta Cidade
            </p>
          </div>

          <button
            type="button"
            onClick={entrarComGoogle}
            className="w-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 py-3 rounded-xl font-semibold transition-colors mb-5"
          >
            Continuar com Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="h-px bg-slate-200 flex-1" />

            <span className="text-xs text-slate-400 uppercase font-semibold">
              ou
            </span>

            <div className="h-px bg-slate-200 flex-1" />
          </div>

          <label
            htmlFor="admin-email"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            E-mail
          </label>

          <input
            id="admin-email"
            type="email"
            placeholder="Digite seu e-mail"
            autoComplete="email"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);

              if (loginError) {
                setLoginError('');
              }
            }}
          />

          <label
            htmlFor="admin-password"
            className="block text-sm font-semibold text-slate-700 mb-2"
          >
            Senha
          </label>

          <input
            id="admin-password"
            type="password"
            placeholder="Digite sua senha"
            autoComplete="current-password"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);

              if (loginError) {
                setLoginError('');
              }
            }}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !entrando
              ) {
                handleLogin();
              }
            }}
          />

          <button
            type="button"
            onClick={handleLogin}
            disabled={entrando}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-400 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            {entrando
              ? 'Entrando...'
              : 'Entrar'}
          </button>

          {loginError && (
            <p className="text-red-600 text-center mt-4 font-medium">
              {loginError}
            </p>
          )}

          <p className="text-xs text-slate-400 text-center mt-6">
            Acesso exclusivo para contas com permissão administrativa.
          </p>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * PAINEL ADMINISTRATIVO
   * =========================================================
   */
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-orange-600 mb-2">
              Conecta Cidade
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Painel Administrativo
            </h1>

            <p className="text-slate-600 mt-2">
              Gerencie anúncios, profissionais,
              produtores, informativos e o fluxo
              financeiro do portal.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={atualizarPainel}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-2xl font-medium transition-colors"
            >
              Atualizar painel
            </button>

            <button
              type="button"
              onClick={sair}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-2xl font-medium transition-colors"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 bg-white border border-slate-200 rounded-3xl overflow-hidden mb-8 shadow-sm">
          <button
            type="button"
            onClick={() =>
              setActiveTab('anuncios')
            }
            className={`py-5 px-4 font-semibold transition-colors ${
              activeTab === 'anuncios'
                ? 'bg-orange-50 text-orange-700 border-b-4 border-orange-600'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Anúncios
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab('agenda')
            }
            className={`py-5 px-4 font-semibold transition-colors ${
              activeTab === 'agenda'
                ? 'bg-emerald-50 text-emerald-700 border-b-4 border-emerald-600'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Agenda Local
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab('informativos')
            }
            className={`py-5 px-4 font-semibold transition-colors ${
              activeTab === 'informativos'
                ? 'bg-blue-50 text-blue-700 border-b-4 border-blue-600'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Nova União Informa
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab('produtores')
            }
            className={`py-5 px-4 font-semibold transition-colors ${
              activeTab === 'produtores'
                ? 'bg-lime-50 text-lime-700 border-b-4 border-lime-600'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Direto do Produtor
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab('financeiro')
            }
            className={`py-5 px-4 font-semibold transition-colors ${
              activeTab === 'financeiro'
                ? 'bg-violet-50 text-violet-700 border-b-4 border-violet-600'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Financeiro
          </button>
        </div>

        <section>
          {activeTab === 'anuncios' && (
            <AnunciosAdmin
              key={`anuncios-${atualizacao}`}
            />
          )}

          {activeTab === 'agenda' && (
            <AgendaAdmin
              key={`agenda-${atualizacao}`}
            />
          )}

          {activeTab === 'informativos' && (
            <NovaUniaoInformaAdmin
              key={`informativos-${atualizacao}`}
            />
          )}

          {activeTab === 'produtores' && (
            <DiretoProdutorAdmin
              key={`produtores-${atualizacao}`}
            />
          )}

          {activeTab === 'financeiro' && (
            <FinanceiroAdmin
              key={`financeiro-${atualizacao}`}
            />
          )}
        </section>
      </div>
    </main>
  );
}