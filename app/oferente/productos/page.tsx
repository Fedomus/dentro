import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Logo from '@/components/Logo'
import ToggleActivo from '@/components/oferente/ToggleActivo'

export default async function ProductosOferentePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre, rol, zona_id')
    .eq('user_id', user.id)
    .single()

  if (profile?.rol !== 'oferente') redirect('/')

  const [{ data: categorias }, { data: misProductos }, { ok, error }] = await Promise.all([
    supabase.from('categorias').select('id, nombre, icono').order('nombre'),
    supabase
      .from('disponibilidad')
      .select(`
        id, activo, contacto_whatsapp,
        productos ( id, nombre, descripcion, categorias ( nombre, icono ) )
      `)
      .eq('oferente_id', user.id)
      .order('created_at', { ascending: false }),
    searchParams,
  ])

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <a href="/oferente/dashboard"><Logo size="sm" /></a>
          <a
            href="/oferente/dashboard"
            className="text-sm text-[#888] hover:text-[#4A4A4A] transition-colors"
          >
            ← Volver
          </a>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-[#4A4A4A]">Mis productos</h1>
          <p className="text-sm text-[#888] font-medium">
            Agregá y gestioná los productos que ofrecés en tu zona
          </p>
        </div>

        {/* Feedback */}
        {ok && (
          <div className="rounded-2xl bg-[#EAF5CC] border border-[#6DC200] px-4 py-3 text-sm text-[#3a6e00] font-semibold">
            ✓ Producto publicado correctamente
          </div>
        )}
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium">
            {decodeURIComponent(error)}
          </div>
        )}

        {/* Formulario nuevo producto */}
        <div className="rounded-2xl border-2 border-[#E5E5E5] p-6 flex flex-col gap-4">
          <h2 className="text-sm font-bold text-[#4A4A4A] uppercase tracking-widest">
            Publicar nuevo producto
          </h2>

          <form action="/oferente/productos/nuevo" method="POST" className="flex flex-col gap-3">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del producto (ej: Leña seca)"
              required
              className="rounded-2xl border-2 border-[#E5E5E5] px-4 py-3 text-[#4A4A4A] font-medium placeholder-[#BDBDBD] focus:outline-none focus:border-[#6DC200] transition-colors text-sm"
            />
            <textarea
              name="descripcion"
              placeholder="Descripción breve (opcional)"
              rows={2}
              className="rounded-2xl border-2 border-[#E5E5E5] px-4 py-3 text-[#4A4A4A] font-medium placeholder-[#BDBDBD] focus:outline-none focus:border-[#6DC200] transition-colors text-sm resize-none"
            />
            <select
              name="categoria_id"
              required
              className="rounded-2xl border-2 border-[#E5E5E5] px-4 py-3 text-[#4A4A4A] font-medium focus:outline-none focus:border-[#6DC200] transition-colors text-sm bg-white"
            >
              <option value="">Seleccioná una categoría</option>
              {(categorias ?? []).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icono} {cat.nombre}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="whatsapp"
              placeholder="WhatsApp de contacto (ej: 5491112345678)"
              className="rounded-2xl border-2 border-[#E5E5E5] px-4 py-3 text-[#4A4A4A] font-medium placeholder-[#BDBDBD] focus:outline-none focus:border-[#6DC200] transition-colors text-sm"
            />
            <button
              type="submit"
              className="rounded-2xl bg-[#6DC200] text-white font-bold py-3 hover:bg-[#5DAF00] active:scale-[0.98] transition-all text-sm"
            >
              Publicar producto
            </button>
          </form>
        </div>

        {/* Lista de productos actuales */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-bold text-[#888] uppercase tracking-widest">
            Publicados ({misProductos?.length ?? 0})
          </h2>

          {!misProductos || misProductos.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#E5E5E5] p-8 text-center text-[#888] font-medium text-sm">
              Todavía no publicaste ningún producto.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {misProductos.map((d) => {
                const p = d.productos as unknown as {
                  nombre: string
                  descripcion: string
                  categorias: { nombre: string; icono: string }
                }
                return (
                  <div
                    key={d.id}
                    className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex flex-col gap-0.5 flex-1">
                      <span className="text-xs text-[#6DC200] font-bold uppercase tracking-widest">
                        {p?.categorias?.icono} {p?.categorias?.nombre}
                      </span>
                      <span className="font-bold text-[#4A4A4A]">{p?.nombre}</span>
                      {p?.descripcion && (
                        <span className="text-sm text-[#888]">{p.descripcion}</span>
                      )}
                      {d.contacto_whatsapp && (
                        <span className="text-xs text-[#BDBDBD] mt-1">📱 {d.contacto_whatsapp}</span>
                      )}
                    </div>
                    <ToggleActivo id={d.id} activo={d.activo} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
