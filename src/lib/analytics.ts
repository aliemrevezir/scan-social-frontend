'use client';

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

export function track(event: string, payload?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window?.gtag?.('event', event, payload ?? {});
}
