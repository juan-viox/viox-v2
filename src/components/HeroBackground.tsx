import { useEffect, useRef } from 'react'

/**
 * Animated agentic constellation — canvas particle field with brand accents.
 *
 * Replaces the previous autoplay video. Lighter (no MB download), distinctive,
 * scales to any viewport, respects prefers-reduced-motion (renders a static
 * snapshot instead of animating).
 *
 * Visual: ~120 particles drifting slowly on a deep-violet gradient. Faint white
 * lines between nearby particles. ~10% of particles glow brand purple or cyan.
 * Subtle pulse on the accent particles.
 */
export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let w = 0, h = 0, dpr = 1
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = Math.max(window.innerHeight, 700)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    // ---------- Particles ----------

    type P = {
      x: number; y: number
      vx: number; vy: number
      r: number
      kind: 'dot' | 'purple' | 'cyan'
      pulse: number
    }
    const COUNT = Math.max(60, Math.min(140, Math.floor((w * h) / 14000)))
    const particles: P[] = []
    for (let i = 0; i < COUNT; i++) {
      const r = 0.6 + Math.random() * 1.6
      const roll = Math.random()
      const kind: P['kind'] = roll < 0.05 ? 'cyan' : roll < 0.12 ? 'purple' : 'dot'
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r,
        kind,
        pulse: Math.random() * Math.PI * 2,
      })
    }

    const LINE_DIST = 140    // px — connect particles closer than this
    const LINE_DIST_SQ = LINE_DIST * LINE_DIST

    let raf = 0
    let t0 = performance.now()

    function render(now: number) {
      const dt = Math.min(50, now - t0)
      t0 = now
      ctx!.clearRect(0, 0, w, h)

      // Base gradient — adds depth even without motion
      const grad = ctx!.createLinearGradient(0, 0, w, h)
      grad.addColorStop(0, 'rgba(15, 10, 30, 0)')        // hero-bg already provides base; layer subtle gloss
      grad.addColorStop(0.6, 'rgba(45, 20, 80, 0.15)')
      grad.addColorStop(1, 'rgba(8, 5, 18, 0)')
      ctx!.fillStyle = grad
      ctx!.fillRect(0, 0, w, h)

      // Connecting lines (drawn first, behind particles)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < LINE_DIST_SQ) {
            const alpha = (1 - d2 / LINE_DIST_SQ) * 0.12
            ctx!.strokeStyle = `rgba(244, 242, 247, ${alpha})`
            ctx!.lineWidth = 0.6
            ctx!.beginPath()
            ctx!.moveTo(a.x, a.y)
            ctx!.lineTo(b.x, b.y)
            ctx!.stroke()
          }
        }
      }

      // Particles
      for (const p of particles) {
        if (!reduce) {
          p.x += p.vx * (dt / 16)
          p.y += p.vy * (dt / 16)
          // wrap
          if (p.x < -10) p.x = w + 10
          if (p.x > w + 10) p.x = -10
          if (p.y < -10) p.y = h + 10
          if (p.y > h + 10) p.y = -10
          p.pulse += 0.015
        }

        if (p.kind === 'purple') {
          const glow = 0.45 + Math.sin(p.pulse) * 0.15
          // glow halo
          ctx!.fillStyle = `rgba(167, 139, 250, ${glow * 0.30})`
          ctx!.beginPath()
          ctx!.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2)
          ctx!.fill()
          // core
          ctx!.fillStyle = `rgba(167, 139, 250, ${0.85})`
          ctx!.beginPath()
          ctx!.arc(p.x, p.y, p.r * 1.4, 0, Math.PI * 2)
          ctx!.fill()
        } else if (p.kind === 'cyan') {
          const glow = 0.45 + Math.sin(p.pulse + 1.5) * 0.15
          ctx!.fillStyle = `rgba(103, 232, 249, ${glow * 0.30})`
          ctx!.beginPath()
          ctx!.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2)
          ctx!.fill()
          ctx!.fillStyle = `rgba(103, 232, 249, 0.90)`
          ctx!.beginPath()
          ctx!.arc(p.x, p.y, p.r * 1.4, 0, Math.PI * 2)
          ctx!.fill()
        } else {
          ctx!.fillStyle = `rgba(244, 242, 247, 0.55)`
          ctx!.beginPath()
          ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx!.fill()
        }
      }

      if (!reduce) raf = requestAnimationFrame(render)
    }

    if (reduce) {
      // Render one static frame
      render(performance.now())
    } else {
      raf = requestAnimationFrame(render)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        // Deep gradient base behind the canvas
        background:
          'radial-gradient(ellipse at 30% 20%, rgba(45, 20, 80, 0.55) 0%, transparent 50%), ' +
          'radial-gradient(ellipse at 70% 80%, rgba(15, 60, 90, 0.35) 0%, transparent 50%), ' +
          'linear-gradient(180deg, #0A0814 0%, #0F0A1E 50%, #050309 100%)',
      }}
    />
  )
}
