import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = 'https://portalconectacidade.com.br';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/minha-conta/',
        ],
      },
    ],

    sitemap: `${siteUrl}/sitemap.xml`,
  };
}