// Logo DENTRO — reproduce el isotipo: DENTR + círculo con punto verde
export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const scales = {
    sm: { text: 28, circle: 32, gap: 4 },
    md: { text: 42, circle: 48, gap: 6 },
    lg: { text: 56, circle: 64, gap: 8 },
  }
  const s = scales[size]

  // Ancho total aproximado del texto "DENTR" + ícono
  const textWidth = s.text * 3.0   // aprox para 5 letras en bold
  const totalWidth = textWidth + s.gap + s.circle
  const height = s.circle

  return (
    <svg
      width={totalWidth}
      height={height}
      viewBox={`0 0 ${totalWidth} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DENTRO"
      role="img"
    >
      {/* Texto DENTR */}
      <text
        x="0"
        y={height * 0.82}
        fontFamily="'Nunito', 'Arial Rounded MT Bold', Arial, sans-serif"
        fontWeight="800"
        fontSize={s.text}
        fill="#4A4A4A"
        letterSpacing="-0.5"
      >
        DENTR
      </text>

      {/* Ícono O — círculo exterior */}
      <circle
        cx={textWidth + s.gap + s.circle / 2}
        cy={height / 2}
        r={s.circle / 2 - 2}
        fill="none"
        stroke="#6DC200"
        strokeWidth={s.circle * 0.095}
      />
      {/* Ícono O — punto interior */}
      <circle
        cx={textWidth + s.gap + s.circle / 2}
        cy={height / 2}
        r={s.circle * 0.285}
        fill="#6DC200"
      />
    </svg>
  )
}
