import { Boxes, Bot, Cloud, Workflow, Layers } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface Solution {
  slug: string
  icon: LucideIcon
  name: string
  outcome: string
  description: string
  bullets: string[]
  stat: string
  statLabel: string
  badge?: string  // e.g. "Flagship", "New"
}

export const SOLUTIONS: Solution[] = [
  {
    slug: 'viox-os',
    icon: Boxes,
    name: 'VioX OS',
    badge: 'Flagship · Productized',
    outcome: 'Your AI team, deployed in 24–48 hours.',
    description:
      'Self-hosted AI agent operating system. Eight Claude-native agents — Closer, Voice, Controller, Steward, Chief of Staff, People Ops, Operator, Builder — handling 90% of SMB operations. Federation-signed, local-first, runs on your own Claude Max subscription with zero API markup.',
    bullets: [
      '08 pre-built agents · 30+ skills · 75+ features',
      'Federation protocol (Ed25519 inter-instance hand-off)',
      '5-layer memory · encrypted vault · scheduled autonomy',
      'Self-hosted or fully managed deployment',
    ],
    stat: '08',
    statLabel: 'agents in production',
  },
  {
    slug: 'agents',
    icon: Bot,
    name: 'Agentic Systems',
    outcome: 'Custom agents that reason, act, and ship outcomes.',
    description:
      'Bespoke multi-step reasoning agents with tool use, memory, and orchestration. ElevenLabs voice. Anthropic + OpenAI reasoning. Twilio phone lines. Built with evals from day zero.',
    bullets: [
      'Tool-using reasoning agents (Claude, GPT-4o, custom)',
      'Voice + chat + async background agents',
      'Memory, observability, eval loops, guardrails',
    ],
    stat: '24/7',
    statLabel: 'always-on coverage',
  },
  {
    slug: 'cloud',
    icon: Cloud,
    name: 'AI-First Cloud Platforms',
    outcome: 'Cloud platforms architected around AI from day zero.',
    description:
      'Serverless-first infrastructure on Vercel, Cloudflare, AWS. Vector stores, streaming, RAG pipelines, structured output. We build the platform agents run on — not just the agent.',
    bullets: [
      'Vercel / Cloudflare / AWS architectures',
      'Vector + RAG pipelines, structured output',
      'SOC2-aligned patterns, audit trails',
    ],
    stat: 'Edge',
    statLabel: 'native deployment',
  },
  {
    slug: 'workflows',
    icon: Workflow,
    name: 'Workflow Automation',
    outcome: 'Connect every system you already run.',
    description:
      'n8n, custom Node services, and bespoke pipelines wired into Salesforce, HubSpot, SAP, Zoho. We integrate, we don\'t replace — and we make the integrations agent-aware.',
    bullets: [
      'Bi-directional CRM + ERP sync',
      'Document + email automation pipelines',
      'Agent-aware integration surfaces',
    ],
    stat: '6+',
    statLabel: 'platforms per project',
  },
  {
    slug: 'cinematic',
    icon: Layers,
    name: 'AI-First Web',
    outcome: 'Sites that ship with motion, agents, and AI-generated assets.',
    description:
      'Cinematic React + GSAP + Three.js websites. Embedded voice agents. AI-generated hero video, imagery, and copy. The site is the product surface — and the product is intelligent.',
    bullets: [
      'Scroll-driven hero with AI-generated video',
      '30+ cinematic interaction modules',
      'Embedded voice agents + structured ingest',
    ],
    stat: '08',
    statLabel: 'cinematic builds shipped',
  },
]
