'use client'

import { useRouter } from 'next/navigation'

const ZONAS = [
  { nombre: 'Estancias del Pilar', slug: 'estancias-pilar' },
  { nombre: 'Los Castores', slug: 'los-castores' },
  { nombre: 'Santa María', slug: 'santa-maria' },
]

export default function ZonaSelector() {
  const router = useRouter()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value) {
      router.push(`/zona/${e.target.value}`)
    }
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <label htmlFor="zona" className="text-sm font-semibold text-[#4A4A4A]">
        Seleccioná tu comunidad
      </label>
      <select
        id="zona"
        onChange={handleChange}
        defaultValue=""
        className="w-full rounded-2xl bg-white border-2 border-[#E5E5E5] px-4 py-3 text-[#4A4A4A] text-base font-semibold focus:outline-none focus:border-[#6DC200] cursor-pointer transition-colors"
      >
        <option value="" disabled>
          — Elegí tu barrio —
        </option>
        {ZONAS.map((z) => (
          <option key={z.slug} value={z.slug}>
            {z.nombre}
          </option>
        ))}
      </select>

      <button
        onClick={() => {
          const sel = document.getElementById('zona') as HTMLSelectElement
          if (sel?.value) router.push(`/zona/${sel.value}`)
        }}
        className="w-full rounded-2xl bg-[#6DC200] text-white font-bold py-3 text-base hover:bg-[#5DAF00] active:scale-[0.98] transition-all shadow-sm"
      >
        Ver disponibilidad
      </button>
    </div>
  )
}
