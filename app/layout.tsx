import type { Metadata, Viewport } from "next";
import "./globals.css";

import Header from "../components/Header";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://portalconectacidade.com.br"),

  title: {
    default: "Portal Conecta Cidade",
    template: "%s | Conecta Cidade",
  },

  description:
    "Empresas, imóveis, veículos, promoções, serviços, eventos e informações da sua cidade e região em um só lugar.",

  keywords: [
    "Portal Conecta Cidade",
    "Conecta Cidade",
    "anúncios locais",
    "classificados",
    "empresas locais",
    "serviços locais",
    "profissionais",
    "Agenda Local",
    "Direto do Produtor",
    "promoções",
    "eventos",
    "imóveis",
    "veículos",
    "comércio local",
    "Minas Gerais",
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

  manifest: "/manifest.webmanifest",

  icons: {
    icon: "/conecta-cidade-app.png",
    apple: "/conecta-cidade-app.png",
  },

  appleWebApp: {
    capable: true,
    title: "Conecta Cidade",
    statusBarStyle: "default",
  },

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
    title: "Portal Conecta Cidade",
    description:
      "Empresas, imóveis, veículos, promoções, serviços, eventos e informações da sua cidade e região em um só lugar.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Portal Conecta Cidade",
    description:
      "Empresas, imóveis, veículos, promoções, serviços, eventos e informações da sua cidade e região em um só lugar.",
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ff6600",
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