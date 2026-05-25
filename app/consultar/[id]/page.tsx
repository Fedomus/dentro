import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ConsultarPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirect=/consultar/${id}`)
  }

  // Verificar que sea demandante
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('user_id', user.id)
    .single()

  if (profile?.rol !== 'demandante') {
    redirect('/')
  }

  // Verificar si ya existe una conversación activa para este usuario + disponibilidad
  const { data: existente } = await supabase
    .from('conversaciones')
    .select('id')
    .eq('demandante_id', user.id)
    .eq('disponibilidad_id', id)
    .single()

  if (existente) {
    redirect(`/chat/${existente.id}`)
  }

  // Obtener la disponibilidad para sacar el oferente_id
  const { data: disponibilidad } = await supabase
    .from('disponibilidad')
    .select('oferente_id')
    .eq('id', id)
    .single()

  if (!disponibilidad) {
    redirect('/')
  }

  // Crear nueva conversación
  const { data: nueva } = await supabase
    .from('conversaciones')
    .insert({
      demandante_id: user.id,
      oferente_id: disponibilidad.oferente_id,
      disponibilidad_id: id,
    })
    .select('id')
    .single()

  if (nueva) {
    redirect(`/chat/${nueva.id}`)
  }

  redirect('/')
}
