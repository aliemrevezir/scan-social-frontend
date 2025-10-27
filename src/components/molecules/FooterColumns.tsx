interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

interface FooterColumnsProps {
  columns: FooterColumn[];
}

export function FooterColumns({ columns }: FooterColumnsProps) {
  return (
    <div className="grid w-full gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {columns.map((column) => (
        <div key={column.heading} className="space-y-3 text-slate-200/80">
          <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-200/60">
            {column.heading}
          </h4>
          <ul className="space-y-2 text-sm leading-relaxed">
            {column.links.map((link) => (
              <li key={`${column.heading}-${link.label}`}>
                <a className="transition-colors duration-150 hover:text-white" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
