import type { ReactNode } from 'react';

import { Container } from '@/components/atoms/Container';
import { SocialIcon } from '@/components/atoms/SocialIcon';
import { FooterColumns } from '@/components/molecules/FooterColumns';

interface FooterProps {
  columns: {
    heading: string;
    links: { label: string; href: string }[];
  }[];
  social: {
    label: string;
    href: string;
    icon: ReactNode;
  }[];
}

export function Footer({ columns, social }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer id="resources" className="footer">
      <Container className="py-16 text-sm">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,340px)_1fr] xl:grid-cols-[minmax(0,380px)_1fr]">
          <div className="space-y-5 text-slate-200/90">
            <div>
              <h3 className="text-2xl font-semibold text-white">Scan Social</h3>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-200/80">
                The intelligence layer for TikTok collaborations. Discover creators, share briefs, and review AI-powered transcript insights in a single workflow.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {social.map((item) => (
                <SocialIcon key={item.href} {...item} />
              ))}
            </div>
          </div>
          <FooterColumns columns={columns} />
        </div>
        <div className="mt-12 flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Scan Social. All rights reserved.</span>
          <span>Built for data-driven creator marketing teams.</span>
        </div>
      </Container>
    </footer>
  );
}
