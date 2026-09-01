import type { Metadata } from 'next';
import NovaUniaoInformaClient from './NovaUniaoInformaClient';

export const metadata: Metadata = {
  title: 'Nova União Informa',

  description:
    'Acompanhe notícias, comunicados, campanhas, eventos e informações importantes para os moradores de Nova União/MG no Conecta Cidade.',

  keywords: [
    'Nova União MG',
    'notícias Nova União MG',
    'informações Nova União MG',
    'comunicados Nova União MG',
    'eventos Nova União MG',
    'Nova União Informa',
    'notícias de Nova União',
    'informações da cidade Nova União',
  ],

  alternates: {
    canonical: '/nova-uniao-informa',
  },

  openGraph: {
    title: 'Nova União Informa',
    description:
      'Notícias, comunicados, campanhas, eventos e informações importantes para os moradores de Nova União/MG.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function NovaUniaoInformaPage() {
  return <NovaUniaoInformaClient />;
}