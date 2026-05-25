import Logo from '@/components/Logo'
import ZonaSelector from '@/components/ZonaSelector'

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen px-6 bg-white">
      <main className="flex flex-col items-center gap-10 w-full max-w-md text-center">

        {/* Logo */}
        <div className="flex flex-col items-center gap-6">
          <Logo size="lg" />
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-[#4A4A4A] leading-snug">
              Todo lo que necesitás,{' '}
              <span className="text-[#6DC200]">DENTRO.</span>
            </h1>
            <p className="text-[#888] text-sm font-medium">
              Productos y servicios disponibles en tu comunidad,<br />sin salir del barrio.
            </p>
          </div>
        </div>

        <ZonaSelector />

        {/* Divisor */}
        <div className="w-full border-t border-[#E5E5E5]" />

        <p className="text-[#888] text-xs">
          ¿Querés ofrecer productos?{' '}
          <a href="/login" className="text-[#6DC200] font-semibold hover:underline underline-offset-2">
            Ingresá acá
          </a>
        </p>
      </main>

      {/* Footer mínimo */}
      <footer className="absolute bottom-6 text-[10px] text-[#BDBDBD] tracking-widest uppercase">
        dentro.ar
      </footer>
    </div>
  )
}
