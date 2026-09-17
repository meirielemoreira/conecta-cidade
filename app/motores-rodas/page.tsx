import type { Metadata } from 'next';
import PaginaCategoria from '../../components/categorias/PaginaCategoria';

export const metadata: Metadata = {
  title: 'Motores & Rodas | Conecta Cidade',
  description:
    'Encontre carros, motos, peças, acessórios, oficinas e serviços automotivos no Conecta Cidade.',
  keywords: [
    'carros',
    'motos',
    'veículos',
    'carros usados',
    'motos usadas',
    'peças automotivas',
    'oficinas',
    'serviços automotivos',
    'veículos Minas Gerais',
    'Conecta Cidade',
  ],
  alternates: {
    canonical: '/motores-rodas',
  },
  openGraph: {
    title: 'Motores & Rodas | Conecta Cidade',
    description:
      'Carros, motos, peças, acessórios, oficinas e serviços automotivos.',
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