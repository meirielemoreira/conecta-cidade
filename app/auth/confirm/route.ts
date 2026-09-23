import { NextResponse } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '../../../lib/supabase/server';

function obterDestinoSeguro(valor: string | null) {
  if (
    valor &&
    valor.startsWith('/') &&
    !valor.startsWith('//')
  ) {
    return valor;
  }

  return '/redefinir-senha';
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;

  const next = obterDestinoSeguro(
    url.searchParams.get('next')
  );

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      new URL(
        '/login?erro=confirmacao-invalida',
        url.origin
      )
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    console.error(
      'Erro ao verificar token de autenticação:',
      error
    );

    return NextResponse.redirect(
      new URL(
        '/login?erro=confirmacao',
        url.origin
      )
    );
  }

  return NextResponse.redirect(
    new URL(next, url.origin)
  );
}