'use client'

import { useRouter } from 'next/navigation'

interface ProductoCardProps {
  disponibilidadId: string
  producto: {
    id: string
    nombre: string
    descripcion: string
    categorias: { nombre: string }
  }
  whatsapp: string
}

export default function ProductoCard({ disponibilidadId, producto }: ProductoCardProps) {
  const router = useRouter()

  function handleConsultar() {
    router.push(`/consultar/${disponibilidadId}`)
  }

  return (
    <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-5 flex flex-col gap-4 hover:border-[#6DC200] transition-colors">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-[#6DC200] font-bold uppercase tracking-widest">
          {producto.categorias?.nombre}
        </span>
        <h2 className="text-lg font-bold text-[#4A4A4A]">{producto.nombre}</h2>
        {producto.descripcion && (
          <p className="text-[#888] text-sm font-medium">{producto.descripcion}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-bold text-[#4A4A4A] bg-[#EAF5CC] px-3 py-1.5 rounded-full">
          <span className="h-2 w-2 rounded-full bg-[#6DC200] animate-pulse" />
          Disponible DENTRO
        </span>

        <button
          onClick={handleConsultar}
          className="rounded-xl bg-[#6DC200] text-white text-sm font-bold px-5 py-2 hover:bg-[#5DAF00] active:scale-[0.97] transition-all"
        >
          Consultar
        </button>
      </div>
    </div>
  )
}
