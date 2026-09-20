import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Portal Conecta Cidade',
  description:
    'Encontre empresas, imóveis, veículos, promoções, serviços, profissionais, eventos, produtores, anúncios e informações da sua cidade e região.',

  keywords: [
    'Portal Conecta Cidade',
    'Conecta Cidade',
    'anúncios locais',
    'classificados locais',
    'empresas locais',
    'comércio local',
    'serviços locais',
    'profissionais locais',
    'promoções',
    'Agenda Local',
    'Direto do Produtor',
    'eventos',
    'imóveis',
    'veículos',
    'Minas Gerais',
    'Nova União MG',
    'Caeté MG',
    'Taquaraçu de Minas MG',
    'Jaboticatubas MG',
    'Bom Jesus do Amparo MG',
    'Itabira MG',
    'São Gonçalo do Rio Abaixo MG',
    'Barão de Cocais MG',
    'Santa Bárbara MG',
  ],

  alternates: {
    canonical: '/',
  },

  openGraph: {
    title: 'Portal Conecta Cidade',
    description:
      'Empresas, imóveis, veículos, promoções, serviços, eventos e informações da sua cidade e região em um só lugar.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function Home() {
  return <HomeClient />;
}