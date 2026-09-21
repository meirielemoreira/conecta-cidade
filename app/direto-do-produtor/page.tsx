import type { Metadata } from 'next';
import DiretoDoProdutorClient from './DiretoDoProdutorClient';

export const metadata: Metadata = {
  title: 'Direto do Produtor | Conecta Cidade',

  description:
  'Encontre produtores locais, alimentos, artesanato e produtos da agricultura familiar no Portal Conecta Cidade.',

  keywords: [
    'Direto do Produtor',
    'produtores locais',
    'produtor local',
    'agricultura familiar',
    'produtos rurais',
    'alimentos artesanais',
    'produtos locais',
    'produtores rurais',
    'produtores Minas Gerais',
    'Portal Conecta Cidade',
  ],

  alternates: {
    canonical: '/direto-do-produtor',
  },

  openGraph: {
    title: 'Direto do Produtor | Portal Conecta Cidade',
    description:
      'Conheça produtores locais e encontre alimentos, artesanato e produtos da agricultura familiar.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function DiretoDoProdutorPage() {
  return <DiretoDoProdutorClient />;
}