export interface CaseStudy {
  slug: string
  name: string
  industry: string
  location: string
  headline: string
  metric: string         // single quantitative outcome (Trust & Authority pattern)
  metricLabel: string    // what the number represents
  description: string
  services: string[]
  liveUrl?: string
  year: string
  featured?: boolean
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'dreamersjoy-floral-studio',
    name: 'DreamersJoy Floral Studio',
    industry: 'Boutique Floral Design',
    location: 'Wyckoff, NJ',
    headline: 'Cinematic site + brand system for a modern minimal florist',
    metric: '5',
    metricLabel: 'palettes shipped in brand system',
    description:
      "A refined editorial brand system and scroll-driven site for Sarah De Jesus' boutique studio — workshop booking, seasonal palette system, Instagram-forward gallery.",
    services: ['Cinematic Website', 'Brand System', 'Workshop Booking'],
    liveUrl: 'https://www.dreamersjoystudio.com',
    year: '2026',
    featured: true,
  },
  {
    slug: 'golden-plate-events',
    name: 'Golden Plate Events',
    industry: 'Corporate Catering',
    location: 'Bronx, NY',
    headline: 'AI voice agent + cinematic catering site',
    metric: '24/7',
    metricLabel: 'AI concierge handling inquiries',
    description:
      'Elevated dark-mode catering site and "Goldie" — an ElevenLabs voice agent acting as 24/7 concierge for corporate catering inquiries across all five boroughs.',
    services: ['Cinematic Website', 'Voice Agent', 'Inquiry Automation'],
    liveUrl: 'https://www.goldenplatee.com/',
    year: '2026',
    featured: true,
  },
  {
    slug: 'marisco-centro',
    name: 'Marisco Centro',
    industry: 'Latin Seafood Restaurant',
    location: 'Bronx, NY',
    headline: 'Restaurant + catering unified under one cinematic brand',
    metric: '2',
    metricLabel: 'business lines unified',
    description:
      'Warm cinematic site for a Latin seafood concept — full menu accordion, catering tray ordering, scroll-driven hero capturing "Where the Ocean Meets the Bronx."',
    services: ['Cinematic Website', 'Menu System', 'Catering Ordering'],
    year: '2026',
    featured: true,
  },
  {
    slug: 'occasions-box',
    name: 'Occasions Box',
    industry: 'Luxury Gifting',
    location: 'New Jersey',
    headline: 'E-commerce redesign for luxury gift curation',
    metric: '20+',
    metricLabel: 'competitors audited pre-build',
    description:
      'Full competitive audit, brand-forward redesign, and e-commerce architecture for a concierge gifting studio. Corporate gifting flows + custom curation intake.',
    services: ['Site Redesign', 'Competitive Analysis', 'E-commerce UX'],
    liveUrl: 'https://www.occasionsbox.com',
    year: '2026',
  },
  {
    slug: 'rypets',
    name: 'RyPets',
    industry: 'Pet Transportation',
    location: 'North NJ',
    headline: 'Premium pet taxi site + booking system',
    metric: '1st',
    metricLabel: 'class pet taxi positioning',
    description:
      "Cinematic site for New Jersey's premium pet transportation service — navy + gold brand, vet/grooming/airport booking, hero film with Tesla Model X pickup.",
    services: ['Cinematic Website', 'Booking System', 'Brand System'],
    liveUrl: 'https://www.rypets.net',
    year: '2026',
  },
  {
    slug: 'lino-press-nyc',
    name: 'Lino Press NY',
    industry: 'Commercial Printing',
    location: 'Washington Heights, NYC',
    headline: "Heritage site for NYC's largest Latino-owned printer",
    metric: '50K+',
    metricLabel: 'projects showcased',
    description:
      'Cinematic site honoring 30 years of family printing — Union Printer + MBE certified. Ink & paper macro hero, bilingual-ready copy, full services from digital to apparel to large format.',
    services: ['Cinematic Website', 'Brand System', 'Bilingual UX'],
    liveUrl: 'https://linopressny.com',
    year: '2026',
  },
  {
    slug: 'sidreria-la-casona',
    name: 'Sidrería La Casona',
    industry: 'Asturian Cider House',
    location: 'Madrid, Spain',
    headline: 'International restaurant site in Spanish',
    metric: '3',
    metricLabel: 'seasonal menus integrated',
    description:
      'Cinematic site for a traditional Asturian cider house near Atocha Station — warm amber brand, primavera/verano/otoño menus, voice rooted in escanciado tradition.',
    services: ['Cinematic Website', 'Seasonal Menu', 'Spanish UX'],
    year: '2026',
  },
  {
    slug: 'bronx-united-ipa',
    name: 'Bronx United IPA',
    industry: 'Healthcare / Physician Association',
    location: 'Bronx, NY',
    headline: 'Membership platform for independent physicians',
    metric: '6',
    metricLabel: 'NY counties served',
    description:
      'Professional association site and partnership platform for an IPA representing physicians across the Bronx, Manhattan, Brooklyn, Queens, Buffalo, and Rockland County.',
    services: ['Cinematic Website', 'Membership Platform', 'Voice Agent'],
    liveUrl: 'https://bronxunitedipa.com/',
    year: '2026',
  },
]

export const FEATURED_CASE_STUDIES = CASE_STUDIES.filter((c) => c.featured)
