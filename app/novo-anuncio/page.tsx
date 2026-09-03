'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

export default function NovoAnuncioPage() {
  return (
    <Suspense fallback={<CarregandoNovoAnuncio />}>
      <NovoAnuncioConteudo />
    </Suspense>
  );
}

function NovoAnuncioConteudo() {
  const searchParams = useSearchParams();

  const userId = searchParams.get('user_id');
  const plano = searchParams.get('plano') || 'Gratuito';

  const [copied, setCopied] = useState(false);

  const linksPagamento: Record<string, string> = {
    Impulso: 'https://mpago.la/2cUj9ui',
    Vitrine: 'https://mpago.la/22XxiEf',
    Exclusivo: 'https://mpago.la/1Fy4xE2',
    'Agenda Local': 'https://mpago.la/1G7a4Xp',
  };

  const linkPagamento = linksPagamento[plano];
  const isGratuito = plano === 'Gratuito';

  const copiarMensagem = async () => {
    const mensagem =
      `Olá! Acabei de cadastrar um anúncio no Conecta Cidade ` +
      `com o plano ${plano}. Aguardo o link de pagamento ou aprovação.`;

    try {
      await navigator.clipboard.writeText(mensagem);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (error) {
      console.error('Erro ao copiar mensagem:', error);

      setCopied(false);
    }
  };

  return (
    <>

      <main className="min-h-screen bg-slate-50 py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-6xl">
            ✅
          </div>

          <h1 className="mb-4 text-4xl font-bold text-slate-900">
            Cadastro realizado com sucesso!
          </h1>

          <p className="mb-10 text-lg text-slate-600">
            Seu anúncio foi enviado para análise.
          </p>

          {!isGratuito && linkPagamento && (
            <div className="mb-10 rounded-3xl border border-orange-200 bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-semibold text-orange-700">
                Próximo passo: realize o pagamento
              </h2>

              <p className="mb-6 text-slate-600">
                Para ativar o plano <strong>{plano}</strong>, clique no botão
                abaixo:
              </p>

              <a
                href={linkPagamento}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 block w-full rounded-2xl bg-orange-600 py-5 text-center text-lg font-semibold text-white transition hover:bg-orange-700"
              >
                💰 Pagar {plano} agora →
              </a>

              <button
                type="button"
                onClick={copiarMensagem}
                className="mx-auto flex items-center gap-2 font-medium text-orange-600 transition hover:text-orange-700"
              >
                📋{' '}
                {copied
                  ? 'Mensagem copiada!'
                  : 'Copiar mensagem para WhatsApp'}
              </button>
            </div>
          )}

          {!isGratuito && !linkPagamento && (
            <div className="mb-10 rounded-3xl border border-amber-200 bg-amber-50 p-8">
              <p className="text-lg font-medium text-amber-800">
                O anúncio foi cadastrado, mas o link de pagamento deste plano
                não está disponível.
              </p>

              <p className="mt-3 text-sm text-amber-700">
                Entre em contato pelo WhatsApp para concluir a ativação.
              </p>
            </div>
          )}

          {isGratuito && (
            <div className="mb-10 rounded-3xl border border-emerald-200 bg-emerald-50 p-8">
              <p className="text-lg font-medium text-emerald-700">
                Seu anúncio gratuito está em análise.
                <br />
                Entraremos em contato em breve via WhatsApp.
              </p>
            </div>
          )}

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
<Link
  href="/"
  className="rounded-2xl border border-slate-300 bg-white px-10 py-4 font-semibold text-slate-900 transition hover:bg-slate-100"
>
  ← Voltar para o início
</Link>

            <Link
              href="/anunciar"
              className="rounded-2xl bg-orange-600 px-10 py-4 font-semibold text-white transition hover:bg-orange-700"
            >
              Cadastrar novo anúncio
            </Link>
          </div>

          {userId && (
            <p className="mt-8 text-xs text-slate-400">
              Cadastro vinculado à conta: {userId}
            </p>
          )}

          <p className="mt-6 text-xs text-slate-500">
            Qualquer dúvida, entre em contato pelo WhatsApp (31) 98494-9887.
          </p>
        </div>
      </main>
    </>
  );
}

function CarregandoNovoAnuncio() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="text-center">
        <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

        <p className="mt-4 font-semibold text-slate-600">
          Carregando confirmação...
        </p>
      </div>
    </main>
  );
}