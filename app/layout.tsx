import type { Metadata } from "next";
import "./globals.css";

import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Conecta Cidade - Nova União",
    template: "%s | Conecta Cidade",
  },

  description:
    "Portal comercial e informativo de Nova União/MG. Encontre anúncios, profissionais, serviços, agenda local, produtores, promoções, eventos e informações da cidade.",

  keywords: [
    "Nova União MG",
    "Conecta Cidade",
    "anúncios Nova União",
    "classificados Nova União MG",
    "serviços Nova União",
    "profissionais Nova União",
    "empresas Nova União MG",
    "Agenda Local Nova União",
    "Direto do Produtor Nova União",
    "promoções Nova União MG",
    "eventos Nova União MG",
    "comércio Nova União MG",
  ],

  authors: [
    {
      name: "Conecta Cidade",
    },
  ],

  creator: "Conecta Cidade",
  publisher: "Conecta Cidade",

  applicationName: "Conecta Cidade",

  category: "Portal local",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Conecta Cidade",
    title: "Conecta Cidade - Nova União",
    description:
      "Anúncios, empresas, profissionais, serviços, produtores, promoções, eventos e informações de Nova União/MG.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Conecta Cidade - Nova União",
    description:
      "Portal comercial e informativo de Nova União/MG.",
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#F8F9FA] text-[#222222] antialiased">
        <Header />

        {children}

        <Footer />
      </body>
    </html>
  );
}