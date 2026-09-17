import type { Metadata } from 'next';
import NovaUniaoInformaClient from './NovaUniaoInformaClient';

export const metadata: Metadata = {
  title: 'Informa Cidade | Conecta Cidade',

  description:
    'Acompanhe notícias, comunicados, campanhas, eventos e informações importantes das cidades atendidas pelo Conecta Cidade.',

  keywords: [
    'Informa Cidade',
    'notícias da cidade',
    'informações da cidade',
    'comunicados municipais',
    'eventos da cidade',
    'campanhas municipais',
    'informações locais',
    'notícias locais',
    'Conecta Cidade',
  ],

  alternates: {
    canonical: '/nova-uniao-informa',
  },

  openGraph: {
    title: 'Informa Cidade | Conecta Cidade',
    description:
      'Notícias, comunicados, campanhas, eventos e informações importantes das cidades atendidas pelo Conecta Cidade.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function NovaUniaoInformaPage() {
  return <NovaUniaoInformaClient />;
}