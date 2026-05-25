'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ToggleActivo({ id, activo }: { id: string; activo: boolean }) {
  const [estado, setEstado] = useState(activo)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('disponibilidad')
      .update({ activo: !estado })
      .eq('id', id)

    if (!error) setEstado(!estado)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`
        relative inline-flex h-7 w-12 items-center rounded-full transition-colors
        ${estado ? 'bg-[#6DC200]' : 'bg-[#E5E5E5]'}
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={estado ? 'Desactivar' : 'Activar'}
    >
      <span
        className={`
          inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform
          ${estado ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  )
}
