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
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="6" fill={inverted ? '#0F0A1E' : '#0F0A1E'} />
        <path d="M9 9 L23 23 M23 9 L9 23" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
        <path d="M9 9 L23 23 M23 9 L9 23" stroke="#06B6D4" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
      </svg>
      <span style={{ fontSize: size, fontWeight: 800, color: ink }}>
        Vio<span style={{ color: '#7C3AED' }}>X</span>
        <span style={{ color: ink, opacity: 0.55, fontWeight: 600, marginLeft: 4 }}>AI</span>
      </span>
    </span>
  )
}
