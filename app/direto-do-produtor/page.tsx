import type { Metadata } from 'next';
import DiretoDoProdutorClient from './DiretoDoProdutorClient';

export const metadata: Metadata = {
  title: 'Direto do Produtor em Nova União MG',

  description:
    'Encontre produtores locais, alimentos, artesanato e produtos da agricultura familiar de Nova União/MG e região no Conecta Cidade.',

  keywords: [
    'Direto do Produtor Nova União',
    'produtores Nova União MG',
    'produtor local Nova União',
    'agricultura familiar Nova União MG',
    'produtos rurais Nova União',
    'alimentos artesanais Nova União MG',
    'produtos locais Nova União',
    'produtores rurais Nova União MG',
  ],

  alternates: {
    canonical: '/direto-do-produtor',
  },

  openGraph: {
    title: 'Direto do Produtor em Nova União MG',
    description:
      'Conheça produtores locais e encontre alimentos, artesanato e produtos da agricultura familiar de Nova União/MG e região.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function DiretoDoProdutorPage() {
  return <DiretoDoProdutorClient />;
}