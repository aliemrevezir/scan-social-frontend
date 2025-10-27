import type { ReactNode } from 'react';

interface SocialIconProps {
  href: string;
  label: string;
  icon: ReactNode;
}

export function SocialIcon({ href, label, icon }: SocialIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="social-icon"
    >
      {icon}
    </a>
  );
}
