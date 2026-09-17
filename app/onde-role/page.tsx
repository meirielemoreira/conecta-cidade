import type { Metadata } from 'next';
import PaginaCategoria from '../../components/categorias/PaginaCategoria';

export const metadata: Metadata = {
  title: 'Onde é o Rolê? | Conecta Cidade',

  description:
    'Encontre festas, shows, eventos, gastronomia e opções de lazer nas cidades atendidas pelo Conecta Cidade.',

  keywords: [
    'eventos',
    'festas',
    'shows',
    'onde ir',
    'lazer',
    'gastronomia',
    'restaurantes',
    'agenda de eventos',
    'eventos Minas Gerais',
    'Onde é o Rolê',
    'Conecta Cidade',
  ],

  alternates: {
    canonical: '/onde-role',
  },

  openGraph: {
    title: 'Onde é o Rolê? | Conecta Cidade',
    description:
      'Festas, shows, eventos, gastronomia e opções de lazer na sua cidade.',
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