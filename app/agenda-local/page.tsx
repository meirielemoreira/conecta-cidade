import type { Metadata } from 'next';
import AgendaLocalClient from './AgendaLocalClient';

export const metadata: Metadata = {
  title: 'Agenda Local',

  description:
    'Encontre profissionais, empresas, serviços e contatos úteis de Nova União/MG na Agenda Local do Conecta Cidade.',

  keywords: [
    'Agenda Local Nova União',
    'profissionais Nova União MG',
    'serviços Nova União MG',
    'empresas Nova União MG',
    'prestadores de serviços Nova União',
    'contatos úteis Nova União MG',
    'comércio Nova União MG',
    'Conecta Cidade Nova União',
  ],

  alternates: {
    canonical: '/agenda-local',
  },

  openGraph: {
    title: 'Agenda Local | Conecta Cidade',
    description:
      'Profissionais, empresas, serviços e contatos úteis de Nova União/MG em um só lugar.',
    type: 'website',
    locale: 'pt_BR',
  },
};

export default function AgendaLocalPage() {
  return <AgendaLocalClient />;
}