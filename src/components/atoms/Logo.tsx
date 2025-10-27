import Link from 'next/link';

interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({ href = '/', className }: LogoProps) {
  return (
    <Link
      href={href}
      aria-label="Scan Social home"
      className={`inline-flex items-center gap-2 text-lg font-semibold text-primary ${className ?? ''}`.trim()}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-base font-bold text-primary">
        SS
      </span>
      <span className="text-lg font-semibold tracking-tight text-dark">
        Scan Social
      </span>
    </Link>
  );
}
