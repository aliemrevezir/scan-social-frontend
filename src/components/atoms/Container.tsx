import type { PropsWithChildren, HTMLAttributes } from 'react';

export function Container({ children, className, ...rest }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={['container-app', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
}
