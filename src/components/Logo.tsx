interface Props {
  size?: number
  inverted?: boolean
}

export default function Logo({ size = 22, inverted = false }: Props) {
  const ink = inverted ? '#FFFFFF' : 'var(--text-primary)'
  return (
    <span
      className="inline-flex items-center gap-2 select-none"
      style={{ lineHeight: 1, letterSpacing: '-0.03em' }}
      aria-label="VioX AI"
    >
      <img
        src="/logo-mark-256.png"
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        style={{ borderRadius: 6, display: 'block' }}
      />
      <span style={{ fontSize: size, fontWeight: 800, color: ink }}>
        Vio<span style={{ color: '#7C3AED' }}>X</span>
        <span style={{ color: ink, opacity: 0.55, fontWeight: 600, marginLeft: 4 }}>AI</span>
      </span>
    </span>
  )
}
