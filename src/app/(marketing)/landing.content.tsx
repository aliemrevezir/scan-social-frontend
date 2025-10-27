import type { ReactNode } from 'react';
import { BarChart3, CheckSquare, Compass } from 'lucide-react';

import type { HeroPanelProps } from '@/components/molecules/HeroPanel';

const HERO_IMAGE_PLACEHOLDER =
  'https://placehold.co/1200x640/147951/FFFFFF?text=Scan+Social+Platform+Preview';

const HERO_CONTENT: HeroPanelProps = {
  title: 'Creator marketing intelligence for TikTok, Instagram, and X',
  subtitle:
    'Scan Social blends discovery, AI transcript analysis, and campaign workflows so growth teams can brief, collaborate, and learn from every creator partnership.',
  heroImageUrl: HERO_IMAGE_PLACEHOLDER,
  primaryCta: {
    label: 'Get started',
    href: '/signup',
    variant: 'primary',
    tracking: { event: 'cta_click', payload: { placement: 'hero', action: 'get_started' } },
  },
  secondaryCta: {
    label: 'Book a demo',
    href: '/demo',
    variant: 'ghost',
    tracking: { event: 'cta_click', payload: { placement: 'hero', action: 'book_demo' } },
  },
  highlights: [
    'Unified creator profiles across TikTok, Instagram, and X',
    'AI-powered transcript scoring for tone, sentiment, and brand fit',
    'Brief, approve, and monitor campaigns from one shared dashboard',
  ],
};

const FEATURES_CONTENT: { title: string; description: string; icon: ReactNode }[] = [
  {
    title: 'Multi-platform discovery',
    description:
      'Search millions of posts, filter audiences, and shortlist creators that already resonate with your customer segments.',
    icon: <Compass className="h-6 w-6" aria-hidden="true" />,
  },
  {
    title: 'Predictive analytics',
    description:
      'Blend performance metrics with transcript data to forecast brand fit, conversion potential, and campaign ROI before you brief.',
    icon: <BarChart3 className="h-6 w-6" aria-hidden="true" />,
  },
  {
    title: 'Workflow automation',
    description:
      'Move from brief to approval faster with role-aware tasks, content review checkpoints, and consolidated submission tracking.',
    icon: <CheckSquare className="h-6 w-6" aria-hidden="true" />,
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    stepNumber: 1,
    title: 'Find the right voices',
    text: 'Filter creators by platform, audience signals, and historical performance to build evidence-based shortlists in minutes.',
    imageUrl: 'https://placehold.co/640x420/147951/6DD5DE?text=Discovery+Workspace',
  },
  {
    stepNumber: 2,
    title: 'Validate every transcript',
    text: 'Let Scan Social auto-label tone, topics, and brand safety risks so your team can approve creators with confidence.',
    imageUrl: 'https://placehold.co/640x420/6DD5DE/147951?text=AI+Analysis',
  },
  {
    stepNumber: 3,
    title: 'Launch and optimise',
    text: 'Collaborate on briefs, track submissions, and monitor KPI dashboards that surface what content converts.',
    imageUrl: 'https://placehold.co/640x420/147951/FFFFFF?text=Campaign+Controls',
  },
];

const logos = [
  {
    name: 'Aurora Labs',
    logoUrl:
      'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Northwind',
    logoUrl:
      'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Celestial Media',
    logoUrl:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Pixel Pulse',
    logoUrl:
      'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Voyage Ventures',
    logoUrl:
      'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Studio Nimbus',
    logoUrl:
      'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=400&q=80',
  },
];

const footerColumns = [
  {
    heading: 'Product',
    links: [
      { label: 'Platform overview', href: '#product' },
      { label: 'Campaign workflows', href: '#how' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    heading: 'Solutions',
    links: [
      { label: 'Brands', href: '/solutions/brands' },
      { label: 'Agencies', href: '/solutions/agencies' },
      { label: 'Creator partners', href: '/solutions/creators' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Help center', href: '/help' },
      { label: 'Status', href: '/status' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Security', href: '/security' },
    ],
  },
];

const social = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 8.75h3.95V21H3zM9.75 8.75H13v1.68h.05c.45-.85 1.54-1.75 3.18-1.75 3.4 0 4.02 2.24 4.02 5.16V21h-3.95v-5.45c0-1.3-.03-2.97-1.81-2.97-1.81 0-2.09 1.42-2.09 2.88V21H9.75Z" />
      </svg>
    ),
  },
  {
    label: 'Twitter',
    href: 'https://twitter.com',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M20 6.58a5.8 5.8 0 0 1-1.65.46A2.88 2.88 0 0 0 19.45 5a5.78 5.78 0 0 1-1.82.7 2.89 2.89 0 0 0-4.92 2.64 8.2 8.2 0 0 1-5.96-3.02 2.89 2.89 0 0 0 .9 3.86 2.86 2.86 0 0 1-1.31-.36v.04a2.89 2.89 0 0 0 2.32 2.83 2.9 2.9 0 0 1-1.3.05 2.9 2.9 0 0 0 2.7 2 5.8 5.8 0 0 1-4.27 1.2A8.2 8.2 0 0 0 12 19c5.4 0 8.35-4.47 8.35-8.35 0-.13 0-.26-.01-.38A5.97 5.97 0 0 0 20 6.58Z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26.7 26.7 0 0 0 2 12a26.7 26.7 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.73 18.99 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26.7 26.7 0 0 0 22 12a26.7 26.7 0 0 0-.4-4.8ZM10 15.27V8.73L15.15 12Z" />
      </svg>
    ),
  },
];

// Explicitly type the hero object to ensure correct type inference
export const landingContent = {
  hero: HERO_CONTENT,
  features: FEATURES_CONTENT,
  steps: HOW_IT_WORKS_STEPS,
  logos,
  footerColumns,
  social,
  finalCta: {
    title: 'Ready to elevate your creator collaborations?',
    text: 'Join Scan Social today and orchestrate multi-platform creator campaigns with real-time intelligence.',
    cta: {
      label: 'Get started now',
      href: '/signup',
      tracking: { event: 'cta_click', payload: { placement: 'final-cta', action: 'get_started' } },
    },
  },
};
