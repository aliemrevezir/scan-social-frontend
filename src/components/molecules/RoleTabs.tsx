'use client';

import { useCallback } from 'react';
import clsx from 'clsx';

export type RoleValue = 'brand' | 'influencer';

interface RoleTabsProps {
  value: RoleValue;
  onChange: (value: RoleValue) => void;
}

const items: { label: string; value: RoleValue }[] = [
  { label: 'Brand', value: 'brand' },
  { label: 'Influencer', value: 'influencer' },
];

export function RoleTabs({ value, onChange }: RoleTabsProps) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = items.findIndex((item) => item.value === value);
      if (currentIndex === -1) return;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        const next = items[(currentIndex + 1) % items.length];
        onChange(next.value);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        const next = items[(currentIndex - 1 + items.length) % items.length];
        onChange(next.value);
      }
    },
    [value, onChange],
  );

  return (
    <div className="tabs" role="tablist" aria-label="Select role" onKeyDown={handleKeyDown}>
      {items.map((item) => (
        <button
          key={item.value}
          id={`tab-${item.value}`}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          aria-controls={`signup-${item.value}`}
          className={clsx('tab', value === item.value && 'font-semibold')}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
