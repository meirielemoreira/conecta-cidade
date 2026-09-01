'use client'

import Link from 'next/link'

export default function AnuncioCard({ anuncio }: { anuncio: any }) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-2xl transition-all group">
      {anuncio.imagens && anuncio.imagens.length > 0 && (
        <div className="relative h-64">
          <img 
            src={anuncio.imagens[0]} 
            alt={anuncio.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4 bg-white/90 px-4 py-1 rounded-2xl text-sm font-medium">
            {anuncio.plano_usado === 'gratuito' ? 'Teste Grátis' : 'Destaque'}
          </div>
        </div>
      )}

      <div className="p-6">
        <h3 className="font-bold text-2xl mb-3 line-clamp-2">{anuncio.titulo}</h3>
        <p className="text-gray-600 line-clamp-3 mb-6">{anuncio.descricao}</p>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-3xl font-bold text-green-600">
              R$ {anuncio.preco ? anuncio.preco.toLocaleString('pt-BR') : 'Sob consulta'}
            </p>
          </div>
          
          <a 
            href={`https://wa.me/55${anuncio.telefone?.replace(/\D/g, '')}`}
            target="_blank"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-medium text-sm transition"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}