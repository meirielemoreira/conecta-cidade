import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    id: '/admin',
    name: 'Conecta Cidade Admin',
    short_name: 'Conecta Admin',
    description: 'Painel administrativo do Portal Conecta Cidade.',
    start_url: '/admin',
    scope: '/admin',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#0f172a',
    orientation: 'portrait',
    icons: [
      {
        src: '/conecta-cidade-app.png',
        sizes: '1254x1254',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  });
}