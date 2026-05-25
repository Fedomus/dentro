'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Mensaje {
  id: string
  autor_id: string
  contenido: string
  created_at: string
}

interface Props {
  conversacionId: string
  userId: string
  mensajesIniciales: Mensaje[]
}

export default function ChatWindow({ conversacionId, userId, mensajesIniciales }: Props) {
  const [mensajes, setMensajes] = useState<Mensaje[]>(mensajesIniciales)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  // Suscripción Realtime
  useEffect(() => {
    const channel = supabase
      .channel(`chat-${conversacionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `conversacion_id=eq.${conversacionId}`,
        },
        (payload) => {
          const nuevo = payload.new as Mensaje
          // Evitar duplicado si el mensaje lo envió este cliente
          setMensajes((prev) =>
            prev.some((m) => m.id === nuevo.id) ? prev : [...prev, nuevo]
          )
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversacionId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function enviarMensaje(e: React.FormEvent) {
    e.preventDefault()
    const contenido = texto.trim()
    if (!contenido || enviando) return

    setEnviando(true)
    setTexto('')

    const { error } = await supabase.from('mensajes').insert({
      conversacion_id: conversacionId,
      autor_id: userId,
      contenido,
    })

    if (error) {
      setTexto(contenido) // devolver texto si falló
    }

    setEnviando(false)
  }

  return (
    <div className="flex flex-col flex-1">

      {/* Lista de mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-3">
        {mensajes.length === 0 && (
          <div className="text-center text-[#BDBDBD] text-sm font-medium py-8">
            Comenzá la conversación
          </div>
        )}

        {mensajes.map((m) => {
          const esMio = m.autor_id === userId
          return (
            <div
              key={m.id}
              className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed
                  ${esMio
                    ? 'bg-[#6DC200] text-white rounded-br-sm'
                    : 'bg-[#F5F5F5] text-[#4A4A4A] rounded-bl-sm'
                  }
                `}
              >
                {m.contenido}
                <div className={`text-[10px] mt-1 ${esMio ? 'text-white/70' : 'text-[#BDBDBD]'}`}>
                  {new Date(m.created_at).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t-2 border-[#E5E5E5] px-4 py-3">
        <form onSubmit={enviarMensaje} className="flex gap-3 items-center">
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribí un mensaje..."
            disabled={enviando}
            className="flex-1 rounded-2xl border-2 border-[#E5E5E5] px-4 py-2.5 text-sm text-[#4A4A4A] font-medium placeholder-[#BDBDBD] focus:outline-none focus:border-[#6DC200] transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!texto.trim() || enviando}
            className="rounded-2xl bg-[#6DC200] text-white font-bold px-5 py-2.5 text-sm hover:bg-[#5DAF00] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}
