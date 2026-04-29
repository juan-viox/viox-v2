import SEO from '@/components/SEO'
import PageHeader from '@/components/PageHeader'
import CTABanner from '@/components/CTABanner'
import { aboutGraph, breadcrumbs } from '@/lib/jsonld'

const PRINCIPLES = [
  { n: '01', title: 'Agentic by design.', body: 'Every system we ship is built around reasoning agents from layer zero — not bolted onto a CRUD app.' },
  { n: '02', title: 'Cloud-first, edge-native.', body: 'We deploy on Vercel, Cloudflare, AWS. Edge runtimes, durable execution, vector stores. The platform is the product.' },
  { n: '03', title: 'Integrate, do not replace.', body: 'Salesforce, HubSpot, SAP, Zoho — we make existing systems agent-aware. The stack you already trust gets smarter.' },
  { n: '04', title: 'Evals from day one.', body: 'No agent goes to production without an eval suite. We measure quality, ship improvements, and you see the curve.' },
  { n: '05', title: 'Cinematic, not decorative.', body: 'Motion serves meaning. AI-generated hero video, scroll-driven reveals, embedded voice agents — they earn their place.' },
  { n: '06', title: 'Ship over pilot.', body: 'Voice line live by Friday. Agent posting to CRM. Site shipped to the live domain. We optimize for the thing that matters.' },
]

export default function About() {
  return (
    <>
      <SEO
        title="About — VioX AI"
        description="A frontier AI agency. Architecting agentic systems and AI-first cloud platforms. Founded 2018."
        path="/about"
        image="/og/about.png"
        jsonLd={[
          aboutGraph(),
          { '@context': 'https://schema.org', ...breadcrumbs([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]) },
        ]}
      />
      <PageHeader
        eyebrow="About"
        title="A frontier AI agency obsessed with shipping."
        subtitle="VioX AI architects agentic systems and AI-first cloud platforms for ambitious teams. Founded 2018, based in NYC. We work with operators who need reasoning systems live in production — not in slideware."
      />

      <section className="section">
        <div className="container-page">
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-6)' }}>
            {PRINCIPLES.map((p) => (
              <article key={p.n} className="card">
                <span className="t-mono" style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-brand)', fontWeight: 600, letterSpacing: '0.1em' }}>{p.n}</span>
                <h3 className="t-h3" style={{ marginTop: 'var(--sp-3)' }}>{p.title}</h3>
                <p className="t-body" style={{ marginTop: 'var(--sp-3)', fontSize: 'var(--fs-sm)' }}>{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  )
}
