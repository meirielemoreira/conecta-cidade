import { NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';

function obterDestinoSeguro(valor: string | null) {
  if (
    valor &&
    valor.startsWith('/') &&
    !valor.startsWith('//')
  ) {
    return valor;
  }

  return '/minha-conta';
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const code = url.searchParams.get('code');
  const next = obterDestinoSeguro(
    url.searchParams.get('next')
  );

  if (!code) {
    return NextResponse.redirect(
      new URL(
        '/login?erro=callback-sem-codigo',
        url.origin
      )
    );
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(
      code
    );

  if (error) {
    console.error(
      'Erro ao trocar código pela sessão:',
      error
    );

    return NextResponse.redirect(
      new URL(
        '/login?erro=callback',
        url.origin
      )
    );
  }

  return NextResponse.redirect(
    new URL(next, url.origin)
  );
}