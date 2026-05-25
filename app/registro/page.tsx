import Logo from '@/components/Logo'

export default function RegistroPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <Logo size="md" />
          <p className="text-[#888] text-sm font-medium text-center">
            Registrate para conectar con proveedores DENTRO de tu barrio.
          </p>
        </div>

        <form action="/auth/registro" method="POST" className="flex flex-col gap-4">
          <input
            type="text"
            name="nombre"
            placeholder="Tu nombre"
            required
            className="rounded-2xl bg-white border-2 border-[#E5E5E5] px-4 py-3 text-[#4A4A4A] font-semibold placeholder-[#BDBDBD] focus:outline-none focus:border-[#6DC200] transition-colors"
          />
          <input
            type="email"
            name="email"
            placeholder="Tu email"
            required
            className="rounded-2xl bg-white border-2 border-[#E5E5E5] px-4 py-3 text-[#4A4A4A] font-semibold placeholder-[#BDBDBD] focus:outline-none focus:border-[#6DC200] transition-colors"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            minLength={6}
            className="rounded-2xl bg-white border-2 border-[#E5E5E5] px-4 py-3 text-[#4A4A4A] font-semibold placeholder-[#BDBDBD] focus:outline-none focus:border-[#6DC200] transition-colors"
          />

          <input type="hidden" name="rol" value="demandante" />

          <button
            type="submit"
            className="rounded-2xl bg-[#6DC200] text-white font-bold py-3 hover:bg-[#5DAF00] active:scale-[0.98] transition-all"
          >
            Crear cuenta
          </button>
        </form>

        <p className="text-center text-sm text-[#888]">
          ¿Ya tenés cuenta?{' '}
          <a href="/login" className="text-[#6DC200] font-bold hover:underline underline-offset-2">
            Ingresá
          </a>
        </p>
      </div>
    </div>
  )
}
