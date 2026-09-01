import type { Metadata } from 'next';
import PaginaCategoria from '../../components/categorias/PaginaCategoria';

export const metadata: Metadata = {
  title: 'Morar & Construir em Nova União MG',
  description:
    'Encontre imóveis, terrenos, aluguel, materiais de construção, profissionais e serviços para sua casa em Nova União/MG no Conecta Cidade.',
  keywords: [
    'imóveis Nova União MG',
    'casas Nova União MG',
    'terrenos Nova União MG',
    'aluguel Nova União MG',
    'construção Nova União MG',
    'material de construção Nova União',
    'pedreiro Nova União MG',
    'serviços para casa Nova União',
  ],
  alternates: {
    canonical: '/morar-construir',
  },
  openGraph: {
    title: 'Morar & Construir em Nova União MG',
    description:
      'Imóveis, terrenos, aluguel, construção, materiais e serviços para sua casa em Nova União/MG.',
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