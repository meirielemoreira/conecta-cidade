import type { Metadata } from 'next';
import AgendaLocalClient from './AgendaLocalClient';

export const metadata: Metadata = {
  title: 'Agenda Local | Conecta Cidade',

  description:
    'Encontre profissionais, empresas, serviços e contatos úteis das cidades atendidas pela Agenda Local do Conecta Cidade.',

  keywords: [
    'Agenda Local',
    'profissionais locais',
    'serviços locais',
    'empresas locais',
    'prestadores de serviços',
    'contatos úteis',
    'comércio local',
    'serviços Minas Gerais',
    'Conecta Cidade',
  ],

  alternates: {
    canonical: '/agenda-local',
  },

  openGraph: {
    title: 'Agenda Local | Conecta Cidade',
    description:
      'Profissionais, empresas, serviços e contatos úteis da sua cidade em um só lugar.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function AgendaLocalPage() {
  return <AgendaLocalClient />;
}