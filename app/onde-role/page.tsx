import type { Metadata } from 'next';
import PaginaCategoria from '../../components/categorias/PaginaCategoria';

export const metadata: Metadata = {
  title: 'Onde é o Rolê? em Nova União MG',

  description:
    'Encontre festas, shows, eventos, gastronomia e opções de lazer em Nova União/MG no Conecta Cidade.',

  keywords: [
    'eventos Nova União MG',
    'festas Nova União MG',
    'shows Nova União MG',
    'onde ir Nova União MG',
    'lazer Nova União MG',
    'gastronomia Nova União MG',
    'restaurantes Nova União MG',
    'agenda de eventos Nova União',
    'Onde é o Rolê Nova União',
  ],

  alternates: {
    canonical: '/onde-role',
  },

  openGraph: {
    title: 'Onde é o Rolê? em Nova União MG',
    description:
      'Festas, shows, eventos, gastronomia e opções de lazer em Nova União/MG.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function OndeRolePage() {
  return (
    <PaginaCategoria
      titulo="Onde é o Rolê?"
      descricao="Festas, shows, eventos, gastronomia e opções de lazer."
      categoriaBanco="Onde é o Rolê?"
      corHero="from-purple-700 to-indigo-900"
      imagemHero="/images/categorias/onde-role.png"
      imagemPadrao="/images/categorias/onde-role.png"
      corDestaque="bg-purple-600"
      placeholderBusca="Pesquisar evento, festa, show ou restaurante..."
      textoVazio="Ainda não existem eventos disponíveis."
    />
  );
}