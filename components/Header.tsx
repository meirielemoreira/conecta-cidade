'use client';

import Link from 'next/link';
import { useState } from 'react';

const menuItems = [
  {
    label: 'Início',
    href: '/',
  },
  {
    label: 'Morar & Construir',
    href: '/morar-construir',
  },
  {
    label: 'Motores & Rodas',
    href: '/motores-rodas',
  },
  {
    label: 'Promoções',
    href: '/promocoes',
  },
  {
    label: 'Direto do Produtor',
    href: '/direto-do-produtor',
  },
  {
    label: 'Onde é o Rolê?',
    href: '/onde-role',
  },
  {
    label: 'Nova União Informa',
    href: '/nova-uniao-informa',
  },
  {
    label: 'Agenda Local',
    href: '/agenda-local',
  },
  {
    label: 'Planos',
    href: '/planos',
  },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const fecharMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between min-h-20 gap-3">
          {/* LOGO */}
          <Link
            href="/"
            onClick={fecharMenu}
            className="flex items-center gap-3 shrink-0"
            aria-label="Ir para a página inicial"
          >
            <div className="w-11 h-11 md:w-12 md:h-12 bg-[#FF6B00] rounded-2xl flex items-center justify-center text-white font-black text-lg md:text-xl shadow-md">
              CN
            </div>

            <div>
              <p className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                Conecta Cidade
              </p>

              <p className="text-xs text-slate-500">
                Nova União • MG
              </p>
            </div>
          </Link>

          {/* MENU DESKTOP */}
          <nav
            className="hidden xl:flex items-center justify-center gap-4"
            aria-label="Navegação principal"
          >
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-slate-700 hover:text-[#FF6B00] font-medium transition whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* AÇÕES DESKTOP */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <Link
              href="/minha-conta"
              className="inline-flex items-center justify-center border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-4 py-3 rounded-xl font-semibold transition whitespace-nowrap"
            >
              Minha Conta
            </Link>

            <Link
              href="/anunciar"
              className="inline-flex items-center justify-center bg-[#FF6B00] hover:bg-[#FF7F11] text-white px-4 py-3 rounded-xl font-semibold transition shadow-md whitespace-nowrap"
            >
              + Anunciar Grátis
            </Link>
          </div>

          {/* BOTÃO MOBILE / TABLET */}
          <button
            type="button"
            onClick={() => setMenuOpen((aberto) => !aberto)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            className="xl:hidden w-11 h-11 rounded-xl border border-slate-200 text-slate-800 flex items-center justify-center text-2xl hover:bg-slate-50 transition shrink-0"
          >
            {menuOpen ? '×' : '☰'}
          </button>
        </div>
      </div>

      {/* MENU MOBILE E TABLET */}
      {menuOpen && (
        <div className="xl:hidden bg-white border-t border-gray-200 shadow-lg">
          <nav
            className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-1"
            aria-label="Navegação móvel"
          >
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={fecharMenu}
                className="text-slate-700 hover:text-[#FF6B00] hover:bg-orange-50 font-medium px-4 py-3 rounded-xl transition"
              >
                {item.label}
              </Link>
            ))}

            {/* MINHA CONTA NO MENU MOBILE/TABLET */}
            <Link
              href="/minha-conta"
              onClick={fecharMenu}
              className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 py-3.5 px-5 rounded-xl text-center font-semibold transition mt-3"
            >
              Minha Conta
            </Link>

            {/* ANUNCIAR NO MOBILE */}
            <Link
              href="/anunciar"
              onClick={fecharMenu}
              className="md:hidden bg-[#FF6B00] hover:bg-[#FF7F11] text-white py-4 px-5 rounded-xl text-center font-semibold transition mt-2"
            >
              + Anunciar Grátis
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}