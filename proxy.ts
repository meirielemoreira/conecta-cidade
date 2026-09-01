import type { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Executa em todas as rotas, exceto arquivos internos
     * do Next.js e arquivos estáticos.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};