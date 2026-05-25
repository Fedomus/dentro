import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nombre = formData.get('nombre') as string

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre, rol: 'demandante' },
    },
  })

  if (error) {
    return NextResponse.redirect(
      new URL(`/registro?error=${encodeURIComponent(error.message)}`, request.url),
      { status: 302 }
    )
  }

  // Crear perfil en tabla profiles
  if (data.user) {
    await supabase.from('profiles').insert({
      user_id: data.user.id,
      nombre,
      rol: 'demandante',
    })
  }

  return NextResponse.redirect(new URL('/', request.url), { status: 302 })
}
