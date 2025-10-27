import type { ReactNode } from 'react';

export function RoleGate({
  role,
  allow,
  children,
}: {
  role: 'BRAND' | 'INFLUENCER';
  allow: ('BRAND' | 'INFLUENCER')[];
  children: ReactNode;
}) {
  return allow.includes(role) ? <>{children}</> : null;
}