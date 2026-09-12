'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export default function InstallAppPrompt() {
  const [visivel, setVisivel] = useState(false);

  const [eventoInstalacao, setEventoInstalacao] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [isIOS, setIsIOS] = useState(false);

  const [mostrarInstrucaoIOS, setMostrarInstrucaoIOS] =
    useState(false);

  const [mostrarInstrucaoAndroid, setMostrarInstrucaoAndroid] =
    useState(false);

  useEffect(() => {
    const navegador = window.navigator as Navigator & {
      standalone?: boolean;
    };

    const jaEstaInstalado =
      window.matchMedia('(display-mode: standalone)').matches ||
      navegador.standalone === true;

    if (jaEstaInstalado) {
      setVisivel(false);
      return;
    }

    setVisivel(true);

    const ios = /iphone|ipad|ipod/i.test(
      window.navigator.userAgent
    );

    setIsIOS(ios);

    const aoPoderInstalar = (event: Event) => {
      event.preventDefault();

      const evento = event as BeforeInstallPromptEvent;

      setEventoInstalacao(evento);
      setMostrarInstrucaoAndroid(false);
      setVisivel(true);
    };

    const aoInstalar = () => {
      setEventoInstalacao(null);
      setMostrarInstrucaoAndroid(false);
      setMostrarInstrucaoIOS(false);
      setVisivel(false);
    };

    window.addEventListener(
      'beforeinstallprompt',
      aoPoderInstalar
    );

    window.addEventListener(
      'appinstalled',
      aoInstalar
    );

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          console.log(
            'Service Worker do Conecta Cidade registrado.'
          );
        })
        .catch((error) => {
          console.error(
            'Erro ao registrar Service Worker:',
            error
          );
        });
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        aoPoderInstalar
      );

      window.removeEventListener(
        'appinstalled',
        aoInstalar
      );
    };
  }, []);

  const instalarAplicativo = async () => {
    if (eventoInstalacao) {
      await eventoInstalacao.prompt();

      const escolha = await eventoInstalacao.userChoice;

      setEventoInstalacao(null);

      if (escolha.outcome === 'accepted') {
        setVisivel(false);
      }

      return;
    }

    if (isIOS) {
      setMostrarInstrucaoIOS(true);
      setMostrarInstrucaoAndroid(false);
      return;
    }

    setMostrarInstrucaoAndroid(true);
    setMostrarInstrucaoIOS(false);
  };

  if (!visivel) {
    return null;
  }

  return (
    <div className="mb-4 flex justify-center">
      <div className="relative w-[calc(100%-1rem)] max-w-[650px] rounded-2xl border border-white/70 bg-white text-left shadow-xl">
        <button
          type="button"
          onClick={() => setVisivel(false)}
          aria-label="Fechar aviso de instalação"
          className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
        >
          ×
        </button>

        <div className="flex items-center gap-3 p-3 pr-10 sm:gap-4 sm:px-4 sm:py-3">
          <img
            src="/conecta-cidade-app.png"
            alt="Conecta Cidade"
            className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-md sm:h-16 sm:w-16"
          />

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#FF6600] sm:text-xs">
              Conecta Cidade
            </p>

            <h2 className="mt-0.5 text-sm font-extrabold leading-tight text-slate-900 sm:text-lg">
              📱 Sua cidade na palma da mão
            </h2>

            <p className="mt-0.5 text-[11px] leading-snug text-slate-600 sm:text-sm">
              Informação, serviços e oportunidades em um toque.
            </p>
          </div>

          <button
            type="button"
            onClick={instalarAplicativo}
            className="hidden mr-10 shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-[#FF6600] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#E85D00] sm:inline-flex"
          >
            Instalar aplicativo
          </button>
        </div>

        <div className="px-3 pb-3 sm:hidden">
          <button
            type="button"
            onClick={instalarAplicativo}
            className="w-full rounded-xl bg-[#FF6600] py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#E85D00]"
          >
            Instalar aplicativo
          </button>
        </div>

        {mostrarInstrucaoAndroid && (
          <div className="mx-3 mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 sm:mx-4 sm:text-sm">
            No Chrome, toque no menu <strong>⋮</strong> e escolha{' '}
            <strong>Instalar aplicativo</strong> ou{' '}
            <strong>Adicionar à tela inicial</strong>.
          </div>
        )}

        {mostrarInstrucaoIOS && (
          <div className="mx-3 mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 sm:mx-4 sm:text-sm">
            No iPhone, toque em <strong>Compartilhar</strong> no Safari e
            depois em <strong>Adicionar à Tela de Início</strong>.
          </div>
        )}
      </div>
    </div>
  );
}