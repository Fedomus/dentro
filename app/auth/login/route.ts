import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
      { status: 302 }
    )
  }

  // Si hay un redirect explícito (ej: desde middleware), usarlo
  const explicitRedirect = request.nextUrl.searchParams.get('redirect')
  if (explicitRedirect) {
    return NextResponse.redirect(new URL(explicitRedirect, request.url), { status: 302 })
  }

  // Redirigir según rol del usuario
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('user_id', user.id)
      .single()

    if (profile?.rol === 'oferente') {
      return NextResponse.redirect(new URL('/oferente/dashboard', request.url), { status: 302 })
    }
  }

  return NextResponse.redirect(new URL('/', request.url), { status: 302 })
}
