import type { Metadata } from 'next';
import PaginaCategoria from '../../components/categorias/PaginaCategoria';

export const metadata: Metadata = {
  title: 'Morar & Construir | Conecta Cidade',
  description:
    'Encontre imóveis, terrenos, aluguel, materiais de construção, profissionais e serviços para sua casa no Conecta Cidade.',
  keywords: [
    'imóveis',
    'casas',
    'terrenos',
    'aluguel',
    'construção',
    'material de construção',
    'pedreiro',
    'serviços para casa',
    'imóveis Minas Gerais',
    'Conecta Cidade',
  ],
  alternates: {
    canonical: '/morar-construir',
  },
  openGraph: {
    title: 'Morar & Construir | Conecta Cidade',
    description:
      'Imóveis, terrenos, aluguel, construção, materiais e serviços para sua casa.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function MorarConstruirPage() {
  return (
    <PaginaCategoria
      titulo="Morar & Construir"
      descricao="Imóveis, terrenos, aluguel, construção, materiais e serviços para sua casa."
      categoriaBanco="Morar & Construir"
      corHero="from-blue-700 to-slate-900"
      placeholderBusca="Pesquisar imóvel, terreno, material ou serviço..."
      textoVazio="Ainda não existem anúncios disponíveis em Morar & Construir."
    />
  );
}