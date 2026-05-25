import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Logo from '@/components/Logo'
import ToggleActivo from '@/components/oferente/ToggleActivo'

export default async function DashboardOferentePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nombre, rol')
    .eq('user_id', user.id)
    .single()

  if (profile?.rol !== 'oferente') redirect('/')

  const { data: misOfertas } = await supabase
    .from('disponibilidad')
    .select(`
      id,
      activo,
      zonas ( nombre ),
      productos (
        nombre,
        descripcion,
        categorias ( nombre )
      )
    `)
    .eq('oferente_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white px-6 py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <form action="/auth/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-[#888] hover:text-[#4A4A4A] transition-colors"
            >
              Salir
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-[#4A4A4A]">
            Hola, {profile?.nombre ?? 'oferente'} 👋
          </h1>
          <p className="text-sm text-[#888] font-medium">
            Gestioná tus productos disponibles DENTRO
          </p>
        </div>

        {/* Accesos rápidos */}
        <a
          href="/oferente/productos"
          className="rounded-2xl bg-[#EAF5CC] border-2 border-[#6DC200] px-5 py-4 flex items-center justify-between hover:bg-[#dff0b3] transition-colors"
        >
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-[#4A4A4A]">Administrar productos</span>
            <span className="text-xs text-[#888]">Publicar, activar o desactivar productos</span>
          </div>
          <span className="text-[#6DC200] font-bold text-lg">→</span>
        </a>

        {/* Lista de ofertas */}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-bold text-[#888] uppercase tracking-widest">
            Mis productos
          </h2>

          {!misOfertas || misOfertas.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#E5E5E5] p-8 text-center text-[#888] font-medium">
              Todavía no tenés productos publicados.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {misOfertas.map((oferta) => {
                const producto = oferta.productos as unknown as {
                  nombre: string
                  descripcion: string
                  categorias: { nombre: string }
                }
                const zona = oferta.zonas as unknown as { nombre: string }

                return (
                  <div
                    key={oferta.id}
                    className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-5 flex items-center justify-between gap-4"
                  >
                    <div className="flex flex-col gap-0.5 flex-1">
                      <span className="text-xs text-[#6DC200] font-bold uppercase tracking-widest">
                        {producto?.categorias?.nombre} · {zona?.nombre}
                      </span>
                      <span className="font-bold text-[#4A4A4A]">{producto?.nombre}</span>
                      {producto?.descripcion && (
                        <span className="text-sm text-[#888]">{producto.descripcion}</span>
                      )}
                    </div>

                    <ToggleActivo id={oferta.id} activo={oferta.activo} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Conversaciones recientes */}
        <ConversacionesRecientes userId={user.id} />
      </div>
    </div>
  )
}

async function ConversacionesRecientes({ userId }: { userId: string }) {
  const supabase = await createClient()

  const { data: conversaciones } = await supabase
    .from('conversaciones')
    .select(`
      id,
      created_at,
      disponibilidad (
        productos ( nombre )
      )
    `)
    .eq('oferente_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  if (!conversaciones || conversaciones.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs font-bold text-[#888] uppercase tracking-widest">
        Consultas recibidas
      </h2>
      <div className="flex flex-col gap-2">
        {conversaciones.map((c) => {
          const dis = c.disponibilidad as unknown as { productos: { nombre: string } }
          return (
            <a
              key={c.id}
              href={`/chat/${c.id}`}
              className="rounded-2xl border-2 border-[#E5E5E5] px-5 py-4 flex items-center justify-between hover:border-[#6DC200] transition-colors"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-[#4A4A4A] text-sm">
                  {dis?.productos?.nombre ?? 'Producto'}
                </span>
                <span className="text-xs text-[#888]">
                  {new Date(c.created_at).toLocaleDateString('es-AR', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })}
                </span>
              </div>
              <span className="text-[#6DC200] font-bold text-sm">Ver chat →</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
