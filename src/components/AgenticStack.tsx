import { Brain, Wrench, Database, GitBranch, Activity, Cloud } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Layer {
  num: string
  name: string
  desc: string
  icon: LucideIcon
  detail: string
}

const LAYERS: Layer[] = [
  {
    num: '06',
    name: 'Cloud Infrastructure',
    desc: 'Edge-native serverless. Vercel · Cloudflare · AWS · Supabase.',
    icon: Cloud,
    detail: 'Edge functions, queues, vector stores, durable execution.',
  },
  {
    num: '05',
    name: 'Observability',
    desc: 'Traces, evals, prompt versioning, cost telemetry.',
    icon: Activity,
    detail: 'LangSmith / Arize / Helicone integration. Custom evals.',
  },
  {
    num: '04',
    name: 'Orchestration',
    desc: 'Multi-agent graphs, retries, fallbacks, hand-off.',
    icon: GitBranch,
    detail: 'LangGraph, AutoGen patterns, n8n workflow surfaces.',
  },
  {
    num: '03',
    name: 'Memory',
    desc: 'Vector + episodic memory. RAG, semantic cache, audit log.',
    icon: Database,
    detail: 'pgvector, Pinecone, Redis. Per-agent and per-tenant scopes.',
  },
  {
    num: '02',
    name: 'Tool Use',
    desc: 'Function calling, code execution, browser, MCP servers.',
    icon: Wrench,
    detail: 'CRM tools, search tools, computer use, custom MCP servers.',
  },
  {
    num: '01',
    name: 'Reasoning',
    desc: 'Frontier models with structured output and grounding.',
    icon: Brain,
    detail: 'Claude Sonnet/Opus, GPT-4o, Gemini, fine-tuned smaller models.',
  },
]

export default function AgenticStack() {
  return (
    <section className="section surface-inverted on-dark" aria-labelledby="stack-h">
      <div className="container-page">
        <div
          className="flex items-baseline justify-between flex-wrap"
          style={{ gap: 'var(--sp-6)', marginBottom: 'var(--sp-12)' }}
        >
          <span className="section-num section-num-on-dark">/ 03 — Stack</span>
          <span className="t-mono" style={{
            fontSize: 'var(--fs-xs)',
            color: 'rgba(244,242,247,0.50)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}>
            06 layers · agentic-by-default
          </span>
        </div>

        <h2
          id="stack-h"
          style={{
            fontWeight: 800,
            fontSize: 'clamp(40px, 6vw, 96px)',
            lineHeight: 0.96,
            letterSpacing: '-0.04em',
            color: '#FFFFFF',
            maxWidth: '14ch',
          }}
        >
          The agentic stack we build on.
        </h2>
        <p style={{
          marginTop: 'var(--sp-6)',
          fontSize: 'var(--fs-md)',
          color: 'rgba(255,255,255,0.72)',
          maxWidth: 580,
        }}>
          Every system we ship is engineered through these six layers. Reasoning at the bottom,
          your business outcomes at the top. Nothing is glued on.
        </p>

        <div
          style={{
            marginTop: 'var(--sp-16)',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            background: 'rgba(244,242,247,0.10)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          {LAYERS.map((l) => {
            const Icon = l.icon
            return (
              <article
                key={l.num}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 1.5fr auto',
                  alignItems: 'center',
                  gap: 'var(--sp-6)',
                  padding: 'var(--sp-6) clamp(var(--sp-6), 3vw, var(--sp-12))',
                  background: 'oklch(0.10 0.015 290)',
                  transition: 'background var(--dur-base) var(--ease-out)',
                }}
                className="stack-row"
              >
                <span className="t-mono" style={{
                  fontSize: 'var(--fs-xs)',
                  color: '#67E8F9',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                }}>
                  {l.num}
                </span>
                <div className="flex items-center" style={{ gap: 'var(--sp-3)', minWidth: 0 }}>
                  <span style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                    background: 'rgba(124,58,237,0.18)',
                    color: '#A78BFA',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }} aria-hidden="true">
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span style={{
                    fontSize: 'var(--fs-md)',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    letterSpacing: '-0.01em',
                  }}>
                    {l.name}
                  </span>
                </div>
                <p style={{
                  fontSize: 'var(--fs-sm)',
                  color: 'rgba(255,255,255,0.72)',
                  margin: 0,
                }}>
                  {l.desc}
                </p>
                <span className="t-mono hidden lg:inline" style={{
                  fontSize: 'var(--fs-xs)',
                  color: 'rgba(244,242,247,0.40)',
                  textAlign: 'right',
                  letterSpacing: '0.05em',
                }}>
                  {l.detail}
                </span>
              </article>
            )
          })}
        </div>
      </div>

      <style>{`
        .stack-row:hover { background: oklch(0.13 0.02 290) !important; }
        @media (max-width: 768px) {
          .stack-row { grid-template-columns: 60px 1fr !important; }
          .stack-row > p, .stack-row > .t-mono.hidden { display: none !important; }
        }
      `}</style>
    </section>
  )
}
