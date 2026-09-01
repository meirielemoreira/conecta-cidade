'use client';

import {
  PointerEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

type CarrosselCardProps = {
  imagens: unknown;
  titulo: string;
  plano?: string | null;
};

const LIMITE_FOTOS_POR_PLANO: Record<string, number> = {
  Gratuito: 5,
  Impulso: 5,
  Vitrine: 8,
  Exclusivo: 10,
};

function normalizarImagens(imagens: unknown): string[] {
  if (Array.isArray(imagens)) {
    return imagens.filter(
      (imagem): imagem is string =>
        typeof imagem === 'string' &&
        imagem.trim().length > 0
    );
  }

  if (typeof imagens !== 'string') {
    return [];
  }

  const valor = imagens.trim();

  if (!valor) {
    return [];
  }

  if (
    valor.startsWith('http://') ||
    valor.startsWith('https://') ||
    valor.startsWith('/')
  ) {
    return [valor];
  }

  try {
    const convertido: unknown = JSON.parse(valor);

    if (Array.isArray(convertido)) {
      return convertido.filter(
        (imagem): imagem is string =>
          typeof imagem === 'string' &&
          imagem.trim().length > 0
      );
    }
  } catch {
    return [];
  }

  return [];
}

export default function CarrosselCard({
  imagens,
  titulo,
  plano,
}: CarrosselCardProps) {
  const imagensPermitidas = useMemo(() => {
    const imagensNormalizadas =
      normalizarImagens(imagens);

    const limite =
      LIMITE_FOTOS_POR_PLANO[
        plano || ''
      ] ?? 5;

    return imagensNormalizadas.slice(
      0,
      limite
    );
  }, [imagens, plano]);

  const [indiceAtual, setIndiceAtual] =
    useState(0);

  const [imagemComErro, setImagemComErro] =
    useState<Record<number, boolean>>({});

  const [inicioArraste, setInicioArraste] =
    useState<number | null>(null);

  useEffect(() => {
    setIndiceAtual(0);
    setImagemComErro({});
  }, [imagensPermitidas.length]);

  const totalFotos =
    imagensPermitidas.length;

  const possuiVariasFotos =
    totalFotos > 1;

  const mostrarAnterior = (
    event?: React.MouseEvent
  ) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!possuiVariasFotos) return;

    setIndiceAtual((indice) =>
      indice === 0
        ? totalFotos - 1
        : indice - 1
    );
  };

  const mostrarProxima = (
    event?: React.MouseEvent
  ) => {
    event?.preventDefault();
    event?.stopPropagation();

    if (!possuiVariasFotos) return;

    setIndiceAtual((indice) =>
      indice === totalFotos - 1
        ? 0
        : indice + 1
    );
  };

  const handlePointerDown = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    setInicioArraste(event.clientX);
  };

  const handlePointerUp = (
    event: PointerEvent<HTMLDivElement>
  ) => {
    if (
      inicioArraste === null ||
      !possuiVariasFotos
    ) {
      setInicioArraste(null);
      return;
    }

    const distancia =
      event.clientX - inicioArraste;

    const limiteArraste = 45;

    if (distancia > limiteArraste) {
      mostrarAnterior();
    }

    if (distancia < -limiteArraste) {
      mostrarProxima();
    }

    setInicioArraste(null);
  };

  const imagemAtual =
    imagensPermitidas[indiceAtual];

  if (
    !imagemAtual ||
    imagemComErro[indiceAtual]
  ) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-12 w-12 fill-none stroke-current stroke-[1.5]"
        >
          <rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="2"
          />

          <circle
            cx="8.5"
            cy="9"
            r="1.5"
          />

          <path d="m4 17 5-5 4 4 2-2 5 5" />
        </svg>

        <span className="mt-3 text-sm font-semibold">
          Anúncio sem foto
        </span>
      </div>
    );
  }

  return (
    <div
      className="group/carrossel relative h-full w-full touch-pan-y select-none overflow-hidden bg-slate-100"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() =>
        setInicioArraste(null)
      }
      onPointerLeave={() =>
        setInicioArraste(null)
      }
    >
      <img
        src={imagemAtual}
        alt={`${titulo} — foto ${
          indiceAtual + 1
        }`}
        loading={
          indiceAtual === 0
            ? 'eager'
            : 'lazy'
        }
        draggable={false}
        onError={() =>
          setImagemComErro(
            (errosAtuais) => ({
              ...errosAtuais,
              [indiceAtual]: true,
            })
          )
        }
        className="h-full w-full object-cover transition-transform duration-500 group-hover/carrossel:scale-[1.03]"
      />

      {/* Pré-carrega apenas a próxima imagem */}
      {possuiVariasFotos && (
        <img
          src={
            imagensPermitidas[
              (indiceAtual + 1) %
                totalFotos
            ]
          }
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="hidden"
        />
      )}

      {possuiVariasFotos && (
        <>
          <button
            type="button"
            onClick={mostrarAnterior}
            aria-label="Ver foto anterior"
            className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-slate-800 opacity-100 shadow-md transition hover:bg-white md:opacity-0 md:group-hover/carrossel:opacity-100"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={mostrarProxima}
            aria-label="Ver próxima foto"
            className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl font-bold text-slate-800 opacity-100 shadow-md transition hover:bg-white md:opacity-0 md:group-hover/carrossel:opacity-100"
          >
            ›
          </button>

          <span className="absolute right-3 top-3 rounded-full bg-slate-950/75 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
            {indiceAtual + 1}/{totalFotos}
          </span>

          <div className="absolute bottom-3 left-1/2 flex max-w-[80%] -translate-x-1/2 items-center gap-1.5">
            {imagensPermitidas.map(
              (_, indice) => (
                <button
                  key={indice}
                  type="button"
                  aria-label={`Mostrar foto ${
                    indice + 1
                  }`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIndiceAtual(indice);
                  }}
                  className={`h-1.5 rounded-full shadow-sm transition-all ${
                    indice === indiceAtual
                      ? 'w-5 bg-white'
                      : 'w-1.5 bg-white/65 hover:bg-white'
                  }`}
                />
              )
            )}
          </div>
        </>
      )}

      {plano && plano !== 'Gratuito' && (
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm ${
            plano === 'Exclusivo'
              ? 'bg-emerald-600'
              : plano === 'Vitrine'
                ? 'bg-amber-600'
                : 'bg-orange-600'
          }`}
        >
          {plano}
        </span>
      )}
    </div>
  );
}