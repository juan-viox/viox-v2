export type PricingTab = 'os' | 'ai' | 'cinematic' | 'ongoing'

export interface PricingTier {
  tab: PricingTab
  name: string
  price: string
  unit?: string
  setup?: string
  blurb: string
  features: string[]
  cta: string
  ctaHref: string
  highlighted?: boolean
}

export const PRICING: PricingTier[] = [
  // === VioX OS — productized agent OS ===
  {
    tab: 'os',
    name: 'Pilot',
    price: '$497',
    unit: '/month managed',
    setup: '$997 one-time setup',
    blurb: 'White-glove setup. 24–48hr deployment. Limited to first 5 pilot customers.',
    features: [
      'Direct Slack support',
      'Custom agent configuration',
      'Managed hosting + onboarding',
      'Eight pre-built agents',
      'Federation + local-first storage',
    ],
    cta: 'Reserve a pilot seat',
    ctaHref: '/contact?plan=os-pilot',
  },
  {
    tab: 'os',
    name: 'Standard',
    price: '$697',
    unit: '/month managed',
    setup: '$1,497 one-time setup',
    blurb: 'Post-pilot pricing. Full platform with managed infrastructure.',
    features: [
      'Eight pre-built agents · 30+ skills · 75+ features',
      'Managed infrastructure',
      'Email + chat support',
      'Monthly platform updates',
      'SLA · 99.5% uptime',
    ],
    cta: 'Start Standard',
    ctaHref: '/contact?plan=os-standard',
    highlighted: true,
  },
  {
    tab: 'os',
    name: 'Enterprise',
    price: '$1,997+',
    unit: '/month',
    setup: 'Custom volume pricing',
    blurb: 'Multi-seat deployments, on-prem option, custom agent development.',
    features: [
      'Multi-seat deployments',
      'Custom agent development',
      'Priority support',
      'On-prem option available',
      'SLA · 99.9% uptime',
    ],
    cta: 'Talk to founders',
    ctaHref: '/contact?plan=os-enterprise',
  },

  // === Bespoke AI Services ===
  {
    tab: 'ai',
    name: 'Starter',
    price: '$7,500',
    unit: '— $20,000',
    blurb: 'Single agent or focused automation, shipped in 2–3 weeks.',
    features: [
      'One voice or chat agent',
      'CRM ingest + transcript logging',
      'Up to 3 integrations',
      'Launch + 30 days support',
    ],
    cta: 'Start a Starter project',
    ctaHref: '/contact?plan=starter',
  },
  {
    tab: 'ai',
    name: 'Growth',
    price: '$20,000',
    unit: '— $65,000',
    blurb: 'Multi-agent workflows + system integration. 4–8 weeks.',
    features: [
      'Up to 3 agents (voice + chat)',
      'Bi-directional CRM sync',
      'Up to 8 integrations',
      'Custom guardrails + escalation',
      'Launch + 60 days support',
    ],
    cta: 'Plan a Growth build',
    ctaHref: '/contact?plan=growth',
    highlighted: true,
  },
  {
    tab: 'ai',
    name: 'Enterprise',
    price: 'From $75,000',
    blurb: 'Multi-team rollouts, compliance, dedicated infra.',
    features: [
      'Unlimited agents',
      'SOC2-aligned infra patterns',
      'Custom evals + observability',
      'Dedicated AI engineer',
      'Quarterly business reviews',
    ],
    cta: 'Talk to founders',
    ctaHref: '/contact?plan=enterprise',
  },

  // === Cinematic / 3D Design ===
  {
    tab: 'cinematic',
    name: 'Cinematic Basic',
    price: '$25,000',
    blurb: 'Scroll-driven cinematic site with AI hero video. 3–4 weeks.',
    features: [
      'Scroll-driven video hero (Seedance / Kling)',
      '10+ AI-generated section images',
      '30+ cinematic interaction modules',
      'GSAP animations + voice agent ready',
      'SEO, schema.org, Vercel deploy',
    ],
    cta: 'Start Cinematic Basic',
    ctaHref: '/contact?plan=cinematic-basic',
  },
  {
    tab: 'cinematic',
    name: 'Cinematic Premium',
    price: '$75,000',
    blurb: 'Everything in Basic plus interactive 3D and design system export.',
    features: [
      'Everything in Cinematic Basic',
      'Interactive 3D hero (R3F / Three.js)',
      'Multi-shot storyboards + 4K video',
      'Full design system export',
      'Stitch / Figma handoff',
    ],
    cta: 'Plan Cinematic Premium',
    ctaHref: '/contact?plan=cinematic-premium',
    highlighted: true,
  },

  // === Ongoing ===
  {
    tab: 'ongoing',
    name: 'Agent Fleet',
    price: '$5,000',
    unit: '/month',
    blurb: 'Ongoing operations for live agent fleets.',
    features: [
      'Up to 5 agents managed',
      'Monthly evals + prompt tuning',
      'Transcript reviews + escalation',
      'Integration maintenance',
    ],
    cta: 'Get Agent Fleet pricing',
    ctaHref: '/contact?plan=agent-fleet',
  },
  {
    tab: 'ongoing',
    name: 'Retainer',
    price: 'From $3,500',
    unit: '/month',
    blurb: 'Continuous engineering for evolving workflows.',
    features: [
      'Dedicated weekly hours',
      'Roadmap + priority queue',
      'CRM + integration maintenance',
      'Quarterly strategy sessions',
    ],
    cta: 'Discuss a Retainer',
    ctaHref: '/contact?plan=retainer',
  },
]
