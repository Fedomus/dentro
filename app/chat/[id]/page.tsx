import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import Logo from '@/components/Logo'
import ChatWindow from '@/components/chat/ChatWindow'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ChatPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/chat/${id}`)

  // Verificar que el usuario es participante (RLS ya lo protege, esto es para UX)
  const { data: conversacion } = await supabase
    .from('conversaciones')
    .select(`
      id,
      demandante_id,
      oferente_id,
      disponibilidad (
        productos ( nombre, descripcion )
      )
    `)
    .eq('id', id)
    .single()

  if (!conversacion) notFound()

  // Cargar mensajes iniciales
  const { data: mensajesIniciales } = await supabase
    .from('mensajes')
    .select('id, autor_id, contenido, created_at')
    .eq('conversacion_id', id)
    .order('created_at', { ascending: true })

  const dis = conversacion.disponibilidad as unknown as {
    productos: { nombre: string; descripcion: string }
  }
  const esOferente = conversacion.oferente_id === user.id

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Header del chat */}
      <div className="sticky top-0 z-10 bg-white border-b-2 border-[#E5E5E5] px-6 py-4 flex items-center gap-4">
        <a
          href={esOferente ? '/oferente/dashboard' : '/'}
          className="text-[#6DC200] font-bold text-sm"
        >
          ←
        </a>
        <div className="flex flex-col gap-0.5 flex-1">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
          </div>
          <span className="text-xs text-[#6DC200] font-bold">
            {dis?.productos?.nombre ?? 'Producto'} · Disponible DENTRO
          </span>
        </div>
      </div>

      {/* Ventana del chat (cliente, maneja tiempo real) */}
      <ChatWindow
        conversacionId={id}
        userId={user.id}
        mensajesIniciales={mensajesIniciales ?? []}
      />
    </div>
  )
}
