import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const nombre      = (formData.get('nombre') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  const categoria_id = formData.get('categoria_id') as string
  const whatsapp    = (formData.get('whatsapp') as string)?.trim() || null

  if (!nombre || !categoria_id) {
    return NextResponse.redirect(
      new URL('/oferente/productos?error=Nombre+y+categor%C3%ADa+son+obligatorios', request.url),
      { status: 302 }
    )
  }

  const cookieStore = await cookies()
  const cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (incoming) => incoming.forEach(({ name, value, options }) =>
          cookiesToSet.push({ name, value, options })
        ),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url), { status: 302 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('zona_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.zona_id) {
    return NextResponse.redirect(
      new URL('/oferente/productos?error=No+ten%C3%A9s+zona+asignada', request.url),
      { status: 302 }
    )
  }

  // Crear producto
  const { data: producto, error: prodError } = await supabase
    .from('productos')
    .insert({ nombre, descripcion, categoria_id })
    .select('id')
    .single()

  if (prodError || !producto) {
    return NextResponse.redirect(
      new URL(`/oferente/productos?error=${encodeURIComponent(prodError?.message ?? 'Error al crear producto')}`, request.url),
      { status: 302 }
    )
  }

  // Crear disponibilidad
  const { error: dispError } = await supabase
    .from('disponibilidad')
    .insert({
      producto_id: producto.id,
      zona_id: profile.zona_id,
      oferente_id: user.id,
      activo: true,
      contacto_whatsapp: whatsapp,
    })

  if (dispError) {
    return NextResponse.redirect(
      new URL(`/oferente/productos?error=${encodeURIComponent(dispError.message)}`, request.url),
      { status: 302 }
    )
  }

  const response = NextResponse.redirect(
    new URL('/oferente/productos?ok=1', request.url),
    { status: 302 }
  )
  cookiesToSet.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
  )
  return response
}
