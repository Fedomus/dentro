import Logo from '@/components/Logo'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-white">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4">
          <Logo size="md" />
          <p className="text-[#888] text-sm font-medium text-center">
            Necesitás una cuenta para contactar a un proveedor.
          </p>
        </div>

        <form action="/auth/login" method="POST" className="flex flex-col gap-4">
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
            className="rounded-2xl bg-white border-2 border-[#E5E5E5] px-4 py-3 text-[#4A4A4A] font-semibold placeholder-[#BDBDBD] focus:outline-none focus:border-[#6DC200] transition-colors"
          />
          <button
            type="submit"
            className="rounded-2xl bg-[#6DC200] text-white font-bold py-3 hover:bg-[#5DAF00] active:scale-[0.98] transition-all"
          >
            Ingresar
          </button>
        </form>

        <p className="text-center text-sm text-[#888]">
          ¿No tenés cuenta?{' '}
          <a href="/registro" className="text-[#6DC200] font-bold hover:underline underline-offset-2">
            Registrate
          </a>
        </p>
        <p className="text-center text-sm">
          <a href="/" className="text-[#BDBDBD] hover:text-[#888] transition-colors">
            ← Volver al inicio
          </a>
        </p>
      </div>
    </div>
  )
}
