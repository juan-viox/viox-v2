import { useEffect, useRef, useState } from 'react'
import { Link } from 'wouter'
import { ArrowRight } from 'lucide-react'
import { CASE_STUDIES } from '@/config/case-studies'

const STATUS_ITEMS = [
  { label: 'Agents online', value: '12' },
  { label: 'Tasks today', value: '847' },
  { label: 'Median latency', value: '420ms' },
]

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onCanPlay = () => setVideoReady(true)
    v.addEventListener('canplay', onCanPlay)
    // Try to play (browsers allow muted autoplay)
    v.play().catch(() => {})
    return () => v.removeEventListener('canplay', onCanPlay)
  }, [])

  const names = CASE_STUDIES.map((c) => c.name.toUpperCase())
  const doubled = [...names, ...names]

  return (
    <section
      className="on-dark surface-inverted"
      style={{ position: 'relative', minHeight: '100dvh', overflow: 'hidden' }}
      aria-label="Hero"
    >
      {/* Autoplay looped video — instant, no scroll dependency */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/assets/frames-agents/frame-001.webp"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          opacity: videoReady ? 1 : 0,
          transition: 'opacity 600ms var(--ease-out)',
        }}
      >
        <source src="/assets/hero-agents.mp4" type="video/mp4" />
        <source src="/assets/hero.mp4" type="video/mp4" />
      </video>

      {/* Poster fallback while video loads */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(/assets/frames-agents/frame-001.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: videoReady ? 0 : 1,
          transition: 'opacity 600ms var(--ease-out)',
          zIndex: 0,
        }}
      />

      {/* Readability scrim */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background:
            'linear-gradient(180deg, rgba(8,5,18,0.65) 0%, rgba(8,5,18,0.40) 35%, rgba(8,5,18,0.92) 100%)',
        }}
      />

      {/* Right vertical rule */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 0, right: 'clamp(1.5rem, 5vw, 4rem)',
          bottom: 0, width: 1,
          background: 'rgba(244,242,247,0.10)',
          zIndex: 2,
        }}
      />

      <div
        className="container-page"
        style={{
          position: 'relative', zIndex: 3,
          minHeight: '100dvh',
          display: 'flex', flexDirection: 'column',
          paddingTop: 'calc(64px + var(--sp-12))',
          paddingBottom: 'var(--sp-8)',
        }}
      >
        {/* Top status bar — live system feeling */}
        <div
          className="flex items-center justify-between flex-wrap"
          style={{ gap: 'var(--sp-6)' }}
        >
          <div className="flex items-center" style={{ gap: 'var(--sp-3)' }}>
            <StatusDot />
            <span className="t-mono" style={{
              fontSize: 'var(--fs-xs)',
              color: 'rgba(244,242,247,0.85)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 600,
            }}>
              VioX Live · Agentic Systems · NYC
            </span>
          </div>
          <div className="hidden md:flex items-center" style={{ gap: 'var(--sp-6)' }}>
            {STATUS_ITEMS.map((s) => (
              <div key={s.label} className="t-mono" style={{
                fontSize: 'var(--fs-xs)',
                color: 'rgba(244,242,247,0.65)',
              }}>
                <span style={{ color: '#67E8F9', marginRight: 6 }}>{s.value}</span>
                <span style={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mega editorial headline */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1
            className="t-mega"
            style={{ color: '#FFFFFF', maxWidth: '15ch' }}
          >
            <span style={{ display: 'block' }}>Agentic</span>
            <span style={{ display: 'block', color: '#A78BFA' }}>by design.</span>
            <span className="t-outline" style={{ display: 'block', color: '#FFFFFF' }}>
              AI-first.
            </span>
            <span style={{ display: 'block' }}>
              Cloud-first<span style={{ color: '#67E8F9' }}>.</span>
            </span>
          </h1>

          <div
            className="grid"
            style={{
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
              gap: 'var(--sp-12)',
              marginTop: 'var(--sp-12)',
              alignItems: 'end',
            }}
          >
            <p
              style={{
                maxWidth: 520,
                color: 'rgba(255,255,255,0.82)',
                fontSize: 'var(--fs-md)',
                lineHeight: 1.5,
              }}
            >
              We architect agentic systems and AI-first cloud platforms for ambitious teams.
              Reasoning models, tool use, memory, orchestration — engineered into your operations,
              not bolted on top.
            </p>

            <div className="flex flex-wrap" style={{ gap: 'var(--sp-3)', justifySelf: 'end' }}>
              <Link href="/contact" className="btn btn-primary btn-lg">
                Book a strategy call
                <ArrowRight size={16} />
              </Link>
              <Link href="/work" className="btn btn-secondary btn-lg">
                See the work
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom client marquee */}
        <div
          style={{
            marginTop: 'var(--sp-12)',
            borderTop: '1px solid rgba(244,242,247,0.10)',
            paddingTop: 'var(--sp-4)',
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          <div
            className="animate-marquee-fast flex"
            style={{
              gap: 'var(--sp-12)',
              whiteSpace: 'nowrap',
              fontFamily: 'var(--font-sans)',
              fontWeight: 700,
              fontSize: 'clamp(20px, 2.4vw, 32px)',
              letterSpacing: '-0.02em',
              color: 'rgba(244,242,247,0.32)',
            }}
          >
            {doubled.map((n, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
                {n}
                <span style={{ color: '#A78BFA', opacity: 0.6 }}>×</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function StatusDot() {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 8, height: 8,
      }}
    >
      <span style={{
        position: 'absolute', inset: 0,
        background: '#22D3EE',
        borderRadius: 999,
      }} />
      <span style={{
        position: 'absolute', inset: 0,
        background: '#22D3EE',
        borderRadius: 999,
        animation: 'pulse-dot 1.6s var(--ease-out) infinite',
      }} />
      <style>{`
        @keyframes pulse-dot {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes pulse-dot { 0%,100% { transform: scale(1); opacity: 0.7; } }
        }
      `}</style>
    </span>
  )
}
