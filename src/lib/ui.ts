export { cn } from './utils';

export function kFormatter(value?: number | null): string {
  if (value === null || value === undefined) {
    return '0';
  }

  const absolute = Math.abs(value);

  if (absolute >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  }

  if (absolute >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }

  if (absolute >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }

  return `${value}`;
}

export function timeAgo(timestampMs?: number | null): string {
  if (!timestampMs) {
    return '';
  }

  const now = Date.now();
  const diffMs = Math.max(0, now - timestampMs);
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) {
    return 'just now';
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  }

  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  }

  const years = Math.floor(days / 365);
  return `${years}y ago`;
}
