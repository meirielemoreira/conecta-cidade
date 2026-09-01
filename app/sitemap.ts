import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const paginas = [
    '',
    '/morar-construir',
    '/motores-rodas',
    '/promocoes',
    '/direto-do-produtor',
    '/onde-role',
    '/nova-uniao-informa',
    '/agenda-local',
    '/planos',
    '/anunciar',
    '/privacidade',
    '/termos',
    '/contato',
  ];

  return paginas.map((pagina) => ({
    url: `${siteUrl}${pagina}`,
    lastModified: new Date(),
    changeFrequency:
      pagina === ''
        ? 'daily'
        : pagina === '/nova-uniao-informa'
          ? 'daily'
          : 'weekly',
    priority:
      pagina === ''
        ? 1
        : pagina === '/planos'
          ? 0.9
          : 0.8,
  }));
}