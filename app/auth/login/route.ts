import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const cookieStore = await cookies()

  // Capturamos las cookies que Supabase quiere setear para pasarlas al redirect
  const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(incoming) {
          incoming.forEach(({ name, value, options }) =>
            cookiesToSet.push({ name, value, options })
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
      { status: 302 }
    )
  }

  // Determinar destino del redirect
  const explicitRedirect = request.nextUrl.searchParams.get('redirect')
  let redirectUrl = explicitRedirect ?? '/'

  if (!explicitRedirect && data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('rol')
      .eq('user_id', data.user.id)
      .single()

    if (profile?.rol === 'oferente') {
      redirectUrl = '/oferente/dashboard'
    }
  }

  // Crear el redirect y aplicar las cookies de sesión sobre él
  const response = NextResponse.redirect(new URL(redirectUrl, request.url), { status: 302 })
  cookiesToSet.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  )

  return response
}
