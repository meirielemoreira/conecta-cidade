import type { Metadata } from 'next';
import PaginaCategoria from '../../components/categorias/PaginaCategoria';

export const metadata: Metadata = {
  title: 'Motores & Rodas em Nova União MG',
  description:
    'Encontre carros, motos, peças, acessórios, oficinas e serviços automotivos em Nova União/MG no Conecta Cidade.',
  keywords: [
    'carros Nova União MG',
    'motos Nova União MG',
    'veículos Nova União MG',
    'carros usados Nova União MG',
    'motos usadas Nova União MG',
    'peças automotivas Nova União',
    'oficinas Nova União MG',
    'serviços automotivos Nova União',
  ],
  alternates: {
    canonical: '/motores-rodas',
  },
  openGraph: {
    title: 'Motores & Rodas em Nova União MG',
    description:
      'Carros, motos, peças, acessórios, oficinas e serviços automotivos em Nova União/MG.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function MotoresRodasPage() {
  return (
    <PaginaCategoria
      titulo="Motores & Rodas"
      descricao="Carros, motos, peças, acessórios, oficinas e serviços automotivos."
      categoriaBanco="Motores & Rodas"
      corHero="from-red-700 to-slate-900"
      imagemHero="/images/categorias/motores-rodas.png"
      imagemPadrao="/images/categorias/motores-rodas.png"
      corDestaque="bg-red-600"
      placeholderBusca="Pesquisar carro, moto, peça ou serviço..."
      textoVazio="Ainda não existem anúncios disponíveis em Motores & Rodas."
    />
  );
}