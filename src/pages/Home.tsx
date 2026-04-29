import SEO from '@/components/SEO'
import Hero from '@/components/Hero'
import ProofBar from '@/components/ProofBar'
import SolutionsGrid from '@/components/SolutionsGrid'
import AgenticStack from '@/components/AgenticStack'
import BigStatement from '@/components/BigStatement'
import CaseStudiesGrid from '@/components/CaseStudiesGrid'
import CTABanner from '@/components/CTABanner'
import NewsletterSignup from '@/components/NewsletterSignup'
import { homeGraph, breadcrumbs } from '@/lib/jsonld'

export default function Home() {
  return (
    <>
      <SEO
        title="VioX AI — Agentic by design. AI-first. Cloud-first."
        description="VioX AI architects agentic systems and AI-first cloud platforms. Reasoning models, tool use, memory, orchestration — engineered into your operations."
        path="/"
        image="/og/home.png"
        jsonLd={[homeGraph(), { '@context': 'https://schema.org', ...breadcrumbs([{ name: 'Home', path: '/' }]) }]}
      />
      <Hero />
      <ProofBar />
      <SolutionsGrid />
      <AgenticStack />
      <BigStatement num="/ 04" eyebrow="Position">
        We don't sell pilots. We architect systems that run.
      </BigStatement>
      <CaseStudiesGrid featuredOnly={false} limit={6} heading="Selected work." bento />
      <section className="section">
        <div className="container-narrow">
          <NewsletterSignup />
        </div>
      </section>
      <CTABanner />
    </>
  )
}
