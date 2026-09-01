import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Minha Conta',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function MinhaContaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}