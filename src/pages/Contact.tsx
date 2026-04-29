import SEO from '@/components/SEO'
import PageHeader from '@/components/PageHeader'
import ContactForm from '@/components/ContactForm'
import { contactGraph, breadcrumbs } from '@/lib/jsonld'

export default function Contact() {
  return (
    <>
      <SEO
        title="Contact — VioX AI"
        description="Tell us what you want to ship. We respond within one business day."
        path="/contact"
        image="/og/contact.png"
        jsonLd={[
          contactGraph(),
          { '@context': 'https://schema.org', ...breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Contact', path: '/contact' }]) },
        ]}
      />
      <PageHeader
        eyebrow="Contact"
        title="Tell us what you want to ship."
        subtitle="A few sentences is enough. We respond within one business day with a short proposal and a calendar link."
      />

      <section className="section-tight" style={{ paddingTop: 0 }}>
        <div className="container-page">
          <div
            className="grid"
            style={{
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)',
              gap: 'var(--sp-16)',
              alignItems: 'start',
            }}
          >
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-8)' }}>
              <ContactBlock label="Email" value="hello@viox.ai" href="mailto:hello@viox.ai" />
              <ContactBlock label="Response time" value="One business day" />
              <ContactBlock label="Working with" value="US, EU, LATAM clients" />
              <ContactBlock label="Based in" value="New York City" />
            </aside>
            <div><ContactForm /></div>
          </div>
        </div>
      </section>
    </>
  )
}

function ContactBlock({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <div className="t-eyebrow">{label}</div>
      {href ? (
        <a href={href} style={{ marginTop: 'var(--sp-2)', display: 'inline-block', fontSize: 'var(--fs-md)', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>{value}</a>
      ) : (
        <div style={{ marginTop: 'var(--sp-2)', fontSize: 'var(--fs-md)', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
      )}
    </div>
  )
}
