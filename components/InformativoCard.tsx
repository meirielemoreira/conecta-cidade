import Link from 'next/link';

export type Informativo = {
  id: string;
  categoria: string | null;
  titulo: string;
  resumo: string | null;
  descricao: string | null;
  imagem_url: string | null;
  publicar_em: string | null;
  encerrar_publicacao_em: string | null;
  data_inicio: string | null;
  data_vencimento: string | null;
  link_url: string | null;
  texto_botao: string | null;
  ativo: boolean;
  destaque: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type InformativoCardProps = {
  informativo: Informativo;
  compacto?: boolean;
};

function formatarData(valor?: string | null): string | null {
  if (!valor) {
    return null;
  }

  const somenteData = valor.split('T')[0];
  const partes = somenteData.split('-');

  if (partes.length !== 3) {
    return valor;
  }

  const [ano, mes, dia] = partes;

  return `${dia}/${mes}/${ano}`;
}

function linkExterno(link: string): boolean {
  return /^https?:\/\//i.test(link);
}

export default function InformativoCard({
  informativo,
  compacto = false,
}: InformativoCardProps) {
  const descricao =
    informativo.resumo ||
    informativo.descricao ||
    'Informação importante para os moradores de Nova União.';

  const imagem =
    informativo.imagem_url ||
    '/images/nova-uniao.jpg';

  const categoria =
    informativo.categoria?.trim() ||
    'Comunicado';

  const textoBotao =
    informativo.texto_botao?.trim() ||
    'Saiba mais';

  const dataInicio = formatarData(informativo.data_inicio);
  const dataFinal = formatarData(informativo.data_vencimento);
  const dataPublicacao = formatarData(
    informativo.publicar_em || informativo.created_at
  );

  const conteudoBotao = informativo.link_url ? (
    linkExterno(informativo.link_url) ? (
      <a
        href={informativo.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
      >
        {textoBotao}
      </a>
    ) : (
      <Link
        href={informativo.link_url}
        className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
      >
        {textoBotao}
      </Link>
    )
  ) : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div
        className={`relative overflow-hidden bg-slate-100 ${
          compacto ? 'h-44' : 'h-56'
        }`}
      >
        <img
          src={imagem}
          alt={informativo.titulo}
          loading="lazy"
          onError={(event) => {
            const elemento = event.currentTarget;

            if (!elemento.src.endsWith('/images/nova-uniao.jpg')) {
              elemento.src = '/images/nova-uniao.jpg';
            }
          }}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-lg bg-slate-950/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow">
            {categoria}
          </span>

          {informativo.destaque && (
            <span className="rounded-lg bg-amber-500 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-white shadow">
              Destaque
            </span>
          )}
        </div>
      </div>

      <div className={`flex flex-1 flex-col ${compacto ? 'p-5' : 'p-6'}`}>
        {dataPublicacao && (
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Publicado em {dataPublicacao}
          </p>
        )}

        <h3
          className={`mt-2 font-extrabold leading-snug text-slate-900 ${
            compacto ? 'line-clamp-2 text-lg' : 'line-clamp-2 text-xl'
          }`}
        >
          {informativo.titulo}
        </h3>

        <p
          className={`mt-3 leading-relaxed text-slate-600 ${
            compacto
              ? 'line-clamp-3 text-sm'
              : 'line-clamp-4 text-sm'
          }`}
        >
          {descricao}
        </p>

        {(dataInicio || dataFinal) && (
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <strong className="text-slate-800">Data:</strong>{' '}
            {dataInicio || 'A definir'}
            {dataFinal && dataFinal !== dataInicio
              ? ` até ${dataFinal}`
              : ''}
          </div>
        )}

        {conteudoBotao && (
          <div className="mt-auto pt-5">
            {conteudoBotao}
          </div>
        )}
      </div>
    </article>
  );
}