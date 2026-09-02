'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function RedefinirSenhaPage() {
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] =
    useState('');

  const [carregando, setCarregando] =
    useState(false);

  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const redefinirSenha = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErro('');
    setSucesso('');

    if (!senha) {
      setErro('Informe a nova senha.');
      return;
    }

    if (senha.length < 6) {
      setErro(
        'A senha deve possuir pelo menos 6 caracteres.'
      );
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setCarregando(true);

    try {
      const { error } =
        await supabase.auth.updateUser({
          password: senha,
        });

      if (error) {
        throw error;
      }

      setSucesso(
        'Senha redefinida com sucesso.'
      );

      setSenha('');
      setConfirmarSenha('');

      setTimeout(() => {
        router.replace('/minha-conta');
        router.refresh();
      }, 1500);
    } catch (erroDesconhecido) {
      const mensagem =
        erroDesconhecido instanceof Error
          ? erroDesconhecido.message
          : 'Não foi possível redefinir sua senha.';

      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
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
            Redefinir senha
          </h1>

          <p className="text-slate-500 mt-2">
            Digite sua nova senha abaixo.
          </p>
        </div>

        <form
          onSubmit={redefinirSenha}
          className="space-y-4 mt-7"
        >
          <div>
            <label
              htmlFor="nova-senha"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Nova senha
            </label>

            <input
              id="nova-senha"
              type="password"
              value={senha}
              onChange={(event) =>
                setSenha(event.target.value)
              }
              autoComplete="new-password"
              minLength={6}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="confirmar-senha"
              className="block text-sm font-semibold text-slate-700 mb-2"
            >
              Confirmar nova senha
            </label>

            <input
              id="confirmar-senha"
              type="password"
              value={confirmarSenha}
              onChange={(event) =>
                setConfirmarSenha(
                  event.target.value
                )
              }
              autoComplete="new-password"
              minLength={6}
              required
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

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
              : 'Salvar nova senha'}
          </button>
        </form>
      </section>
    </main>
  );
}