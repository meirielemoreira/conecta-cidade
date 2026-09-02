'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

type ModoFormulario = 'entrar' | 'cadastrar';

function obterDestinoSeguro(valor: string | null) {
  if (
    valor &&
    valor.startsWith('/') &&
    !valor.startsWith('//')
  ) {
    return valor;
  }

  return '/minha-conta';
}

export default function LoginPage() {
  return (
    <Suspense fallback={<CarregandoLogin />}>
      <LoginConteudo />
    </Suspense>
  );
}

function LoginConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const destino = obterDestinoSeguro(
    searchParams.get('redirect')
  );

  const [modo, setModo] =
    useState<ModoFormulario>('entrar');

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [carregando, setCarregando] =
    useState(false);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const limparMensagens = () => {
    setErro('');
    setSucesso('');
  };

  const entrarComGoogle = async () => {
    limparMensagens();
    setCarregando(true);

    const origem = window.location.origin;

    const redirectTo =
      `${origem}/auth/callback` +
      `?next=${encodeURIComponent(destino)}`;

    const { error } =
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

    if (error) {
      setErro(
        traduzirErroAutenticacao(error.message)
      );
      setCarregando(false);
    }
  };

  const recuperarSenha = async () => {
    limparMensagens();

    const emailLimpo = email
      .trim()
      .toLowerCase();

    if (!emailLimpo) {
      setErro(
        'Informe seu e-mail para recuperar a senha.'
      );
      return;
    }

    setCarregando(true);

    try {
      const origem = window.location.origin;

      const redirectTo =
        `${origem}/auth/callback` +
        `?next=${encodeURIComponent(
          '/redefinir-senha'
        )}`;

      const { error } =
        await supabase.auth.resetPasswordForEmail(
          emailLimpo,
          {
            redirectTo,
          }
        );

      if (error) {
        throw error;
      }

      setSucesso(
        'Enviamos um link para redefinir sua senha. Confira seu e-mail.'
      );
    } catch (erroDesconhecido) {
      const mensagem =
        erroDesconhecido instanceof Error
          ? erroDesconhecido.message
          : 'Não foi possível enviar o e-mail de recuperação.';

      setErro(
        traduzirErroAutenticacao(mensagem)
      );
    } finally {
      setCarregando(false);
    }
  };

  const enviarFormulario = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    limparMensagens();

    const emailLimpo = email
      .trim()
      .toLowerCase();

    const nomeLimpo = nome.trim();

    if (!emailLimpo) {
      setErro('Informe seu e-mail.');
      return;
    }

    if (!senha) {
      setErro('Informe sua senha.');
      return;
    }

    if (senha.length < 6) {
      setErro(
        'A senha deve possuir pelo menos 6 caracteres.'
      );
      return;
    }

    if (
      modo === 'cadastrar' &&
      !nomeLimpo
    ) {
      setErro('Informe seu nome completo.');
      return;
    }

    setCarregando(true);

    try {
      if (modo === 'cadastrar') {
        const origem = window.location.origin;

        const emailRedirectTo =
          `${origem}/auth/callback` +
          `?next=${encodeURIComponent(destino)}`;

        const { data, error } =
          await supabase.auth.signUp({
            email: emailLimpo,
            password: senha,
            options: {
              data: {
                full_name: nomeLimpo,
              },
              emailRedirectTo,
            },
          });

        if (error) {
          throw error;
        }

        if (data.session) {
          router.replace(destino);
          router.refresh();
          return;
        }

        setSucesso(
          'Cadastro realizado. Confira seu e-mail para confirmar a conta.'
        );

        setSenha('');
        return;
      }

      const { error } =
        await supabase.auth.signInWithPassword({
          email: emailLimpo,
          password: senha,
        });

      if (error) {
        throw error;
      }

      router.replace(destino);
      router.refresh();
    } catch (erroDesconhecido) {
      const mensagem =
        erroDesconhecido instanceof Error
          ? erroDesconhecido.message
          : 'Não foi possível concluir o acesso.';

      setErro(
        traduzirErroAutenticacao(mensagem)
      );
    } finally {
      setCarregando(false);
    }
  };

  const alternarModo = () => {
    setModo((modoAtual) =>
      modoAtual === 'entrar'
        ? 'cadastrar'
        : 'entrar'
    );

    setSenha('');
    limparMensagens();
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 flex items-center justify-center">
      <section className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-7 md:p-9 shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-2xl font-black">
            CN
          </div>

          <p className="text-sm uppercase tracking-wider font-bold text-orange-600 mt-5">
            Conecta Cidade
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-2">
            {modo === 'entrar'
              ? 'Entrar na sua conta'
              : 'Criar sua conta'}
          </h1>

          <p className="text-slate-500 mt-2">
            {modo === 'entrar'
              ? 'Acesse seus anúncios, cadastros e pagamentos.'
              : 'Crie uma conta para anunciar e acompanhar seus cadastros.'}
          </p>
        </div>

        <button
          type="button"
          onClick={entrarComGoogle}
          disabled={carregando}
          className="w-full mt-7 border border-slate-300 hover:bg-slate-50 disabled:opacity-50 rounded-2xl px-5 py-3.5 font-semibold text-slate-800 transition-colors"
        >
          Continuar com Google
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-slate-200 flex-1" />

          <span className="text-sm text-slate-400">
            ou
          </span>

          <div className="h-px bg-slate-200 flex-1" />
        </div>

        <form
          onSubmit={enviarFormulario}
          className="space-y-4"
        >
          {modo === 'cadastrar' && (
            <div>
              <label
                htmlFor="login-nome"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Nome completo
              </label>

              <input
                id="login-nome"
                name="nome"
                type="text"
                value={nome}
                onChange={(event) =>
                  setNome(event.target.value)
                }
                autoComplete="name"
                required
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              E-mail
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              autoComplete="email"
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="login-senha"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Senha
            </label>

            <input
              id="login-senha"
              name="senha"
              type="password"
              value={senha}
              onChange={(event) =>
                setSenha(event.target.value)
              }
              autoComplete={
                modo === 'entrar'
                  ? 'current-password'
                  : 'new-password'
              }
              minLength={6}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {modo === 'entrar' && (
            <div className="text-right">
              <button
                type="button"
                onClick={recuperarSenha}
                disabled={carregando}
                className="text-sm font-semibold text-orange-700 hover:text-orange-900 disabled:opacity-50"
              >
                Esqueci minha senha
              </button>
            </div>
          )}

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {erro}
            </div>
          )}

          {sucesso && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-4 py-3 text-sm">
              {sucesso}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-400 text-white rounded-xl px-5 py-3.5 font-semibold transition-colors"
          >
            {carregando
              ? 'Aguarde...'
              : modo === 'entrar'
                ? 'Entrar'
                : 'Criar conta'}
          </button>
        </form>

        <button
          type="button"
          onClick={alternarModo}
          disabled={carregando}
          className="w-full mt-5 text-orange-700 hover:text-orange-900 disabled:opacity-50 font-semibold"
        >
          {modo === 'entrar'
            ? 'Ainda não tenho conta'
            : 'Já tenho uma conta'}
        </button>
      </section>
    </main>
  );
}

function CarregandoLogin() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

        <p className="mt-4 font-semibold text-slate-600">
          Carregando login...
        </p>
      </div>
    </main>
  );
}

function traduzirErroAutenticacao(
  mensagem: string
) {
  const erro = mensagem.toLowerCase();

  if (
    erro.includes(
      'invalid login credentials'
    )
  ) {
    return 'E-mail ou senha incorretos.';
  }

  if (
    erro.includes(
      'email not confirmed'
    )
  ) {
    return 'Confirme seu e-mail antes de entrar.';
  }

  if (
    erro.includes(
      'user already registered'
    )
  ) {
    return 'Já existe uma conta cadastrada com esse e-mail.';
  }

  if (
    erro.includes(
      'password should be at least'
    )
  ) {
    return 'A senha deve possuir pelo menos 6 caracteres.';
  }

  if (
    erro.includes(
      'signup is disabled'
    )
  ) {
    return 'O cadastro de novos usuários está desativado no Supabase.';
  }

  if (
    erro.includes(
      'email rate limit exceeded'
    )
  ) {
    return 'Muitas tentativas foram realizadas. Aguarde alguns minutos.';
  }

  return mensagem;
}