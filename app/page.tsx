import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Conecta Cidade - Nova União',
  description:
    'Portal comercial e informativo de Nova União/MG. Encontre empresas, promoções, serviços, profissionais, eventos, produtores, anúncios e informações da cidade.',
  keywords: [
    'Nova União MG',
    'Conecta Cidade',
    'empresas Nova União MG',
    'comércio Nova União',
    'anúncios Nova União',
    'serviços Nova União',
    'profissionais Nova União',
    'promoções Nova União',
    'Agenda Local Nova União',
    'Direto do Produtor Nova União',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Conecta Cidade - Nova União',
    description:
      'Empresas, promoções, serviços, profissionais, eventos e informações de Nova União/MG em um só lugar.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function Home() {
  return <HomeClient />;
}