import clsx from 'clsx';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, children, ...props }: LabelProps) {
  return (
    <label
      className={clsx(
        'text-sm font-semibold text-slate-800 dark:text-slate-200',
        className,
      )}
      {...props}
    >
      {children}
    </label>
  );
}
