'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createClient } from '../../../lib/supabase/client';

type Profile = {
  id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
};

type FormPerfil = {
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  estado: string;
};

export default function PerfilPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [form, setForm] = useState<FormPerfil>({
    nome: '',
    email: '',
    telefone: '',
    cidade: 'Nova União',
    estado: 'MG',
  });

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      setCarregando(true);
      setErro('');

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace('/login?redirect=/minha-conta/perfil');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, nome, email, telefone, cidade, estado, ativo')
          .eq('id', user.id)
          .maybeSingle<Profile>();

        if (profileError) throw profileError;
        if (!profile) throw new Error('Seu perfil não foi encontrado.');
        if (!profile.ativo) throw new Error('Sua conta está desativada.');

        if (!ativo) return;

        setForm({
          nome:
            profile.nome ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            '',
          email: profile.email || user.email || '',
          telefone: profile.telefone || '',
          cidade: profile.cidade || 'Nova União',
          estado: profile.estado || 'MG',
        });
      } catch (e) {
        if (ativo) {
          setErro(
            e instanceof Error
              ? e.message
              : 'Não foi possível carregar seus dados.'
          );
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    carregar();

    return () => {
      ativo = false;
    };
  }, [router, supabase]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setErro('');
    setSucesso('');
    setForm((atual) => ({ ...atual, [name]: value }));
  };

  const salvar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErro('');
    setSucesso('');

    const nome = form.nome.trim();
    const telefone = form.telefone.trim();
    const cidade = form.cidade.trim();
    const estado = form.estado.trim().toUpperCase();

    if (!nome) return setErro('Informe seu nome completo.');
    if (!telefone) return setErro('Informe seu WhatsApp ou telefone.');
    if (!cidade) return setErro('Informe sua cidade.');
    if (estado.length !== 2) {
      return setErro('Informe a sigla do estado com duas letras.');
    }

    setSalvando(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace('/login?redirect=/minha-conta/perfil');
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          nome,
          telefone,
          cidade,
          estado,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setForm((atual) => ({
        ...atual,
        nome,
        telefone,
        cidade,
        estado,
      }));

      setSucesso('Seus dados foram atualizados com sucesso.');
      router.refresh();
    } catch (e) {
      setErro(
        e instanceof Error
          ? e.message
          : 'Não foi possível atualizar seus dados.'
      );
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
          <p className="mt-4 font-semibold text-slate-600">
            Carregando seus dados...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-orange-600">
              Minha conta
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Editar meus dados
            </h1>
            <p className="mt-2 text-slate-600">
              Atualize seus dados de contato e localização.
            </p>
          </div>

          <Link
            href="/minha-conta"
            className="inline-flex justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            ← Voltar para minha conta
          </Link>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-9">
          {erro && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {erro}
            </div>
          )}

          {sucesso && !erro && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              {sucesso}
            </div>
          )}

          <form onSubmit={salvar} className="space-y-5">
            <Campo
              label="Nome completo *"
              name="nome"
              type="text"
              value={form.nome}
              onChange={handleChange}
              autoComplete="name"
              required
            />

            <Campo
              label="E-mail da conta"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              disabled
            />

            <Campo
              label="WhatsApp / Telefone *"
              name="telefone"
              type="tel"
              value={form.telefone}
              onChange={handleChange}
              autoComplete="tel"
              placeholder="(31) 99999-9999"
              required
            />

            <div className="grid gap-5 sm:grid-cols-[1fr_130px]">
              <Campo
                label="Cidade *"
                name="cidade"
                type="text"
                value={form.cidade}
                onChange={handleChange}
                autoComplete="address-level2"
                required
              />

              <Campo
                label="Estado *"
                name="estado"
                type="text"
                value={form.estado}
                onChange={handleChange}
                autoComplete="address-level1"
                maxLength={2}
                placeholder="MG"
                required
              />
            </div>

            <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
              O e-mail da conta não é alterado nesta página porque ele faz
              parte da autenticação do Supabase.
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="w-full rounded-xl bg-orange-600 px-5 py-4 font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {salvando ? 'Salvando alterações...' : 'Salvar meus dados'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function Campo({
  label,
  name,
  type,
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = '',
  autoComplete,
  maxLength,
}: {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:bg-slate-100 disabled:text-slate-500"
      />
    </div>
  );
}
