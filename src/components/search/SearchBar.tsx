'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
  loading?: boolean;
  onSubmit: (keyword: string) => void;
  onClear?: () => void;
}

export function SearchBar({
  defaultValue = '',
  placeholder = 'Search for keywords, #hashtags, or creators',
  loading = false,
  onSubmit,
  onClear,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only update the value if the input is not focused and the defaultValue actually differs
    if (
      inputRef.current !== document.activeElement &&
      defaultValue !== value
    ) {
      setValue(defaultValue);
    }
  }, [defaultValue, value]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      onClear?.();
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="relative flex items-center gap-3 rounded-2xl border border-border-light bg-white p-2 shadow-card focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 dark:bg-surface-elevated">
        <span className="material-symbols-outlined pointer-events-none ml-3 text-2xl text-muted-foreground">
          search
        </span>
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className={cn(
            'flex-1 border-none bg-transparent text-base outline-none placeholder:text-muted-foreground/70',
            'min-w-0 py-3'
          )}
          aria-label="Search keyword"
        />
        {value && !loading && (
          <button
            type="button"
            onClick={() => {
              setValue('');
              onClear?.();
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-all duration-200 hover:bg-muted/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-95"
            aria-label="Clear search"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
        <Button 
          type="submit" 
          size="lg" 
          disabled={loading} 
          className="min-w-[110px] bg-primary text-primary-foreground font-medium shadow-sm hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary transition-all duration-200"
        >
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </div>
    </form>
  );
}
