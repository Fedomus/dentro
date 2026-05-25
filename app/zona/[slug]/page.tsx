import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductoCard from '@/components/ProductoCard'
import Logo from '@/components/Logo'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ZonaPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: zona } = await supabase
    .from('zonas')
    .select('id, nombre')
    .eq('slug', slug)
    .single()

  if (!zona) notFound()

  const { data: disponibilidades } = await supabase
    .from('disponibilidad')
    .select(`
      id,
      activo,
      contacto_whatsapp,
      productos (
        id,
        nombre,
        descripcion,
        categorias ( nombre )
      )
    `)
    .eq('zona_id', zona.id)
    .eq('activo', true)

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-4">
          <a href="/" className="inline-block">
            <Logo size="sm" />
          </a>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-[#4A4A4A]">{zona.nombre}</h1>
            <div className="inline-flex items-center gap-2 text-sm font-bold text-[#4A4A4A] bg-[#EAF5CC] px-3 py-1 rounded-full w-fit">
              <span className="h-2 w-2 rounded-full bg-[#6DC200]" />
              Disponible DENTRO
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t-2 border-[#E5E5E5]" />

        {!disponibilidades || disponibilidades.length === 0 ? (
          <div className="rounded-2xl border-2 border-[#E5E5E5] p-10 text-center text-[#888] font-medium">
            Por ahora no hay productos disponibles en esta zona.
          </div>
        ) : (
          <div className="grid gap-4">
            {disponibilidades.map((d) => (
              <ProductoCard
                key={d.id}
                disponibilidadId={d.id}
                producto={d.productos as unknown as { id: string; nombre: string; descripcion: string; categorias: { nombre: string } }}
                whatsapp={d.contacto_whatsapp}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
