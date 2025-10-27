import clsx from 'clsx';

interface StepCardProps {
  title: string;
  text: string;
  imageUrl: string;
  className?: string;
}

export function StepCard({ title, text, imageUrl, className }: StepCardProps) {
  const classes = clsx('card flex h-full flex-col overflow-hidden', className);

  return (
    <article className={classes}>
      <div
        className="aspect-video w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
        aria-label={`${title} illustration`}
        role="img"
      />
      <div className="flex flex-col gap-4 p-6">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
          {title}
        </h3>
        <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
          {text}
        </p>
      </div>
    </article>
  );
}
