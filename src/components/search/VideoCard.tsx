import { FocusEvent, KeyboardEvent, MouseEvent, PointerEvent, ReactNode, useState } from 'react';
import { Eye, Heart, MessageCircle, Share2 } from 'lucide-react';

import { cn, kFormatter } from '@/lib/ui';
import type { VideoStats } from '@/types/video';

interface VideoCardProps {
  thumbnail?: string | null;
  title: string;
  handle: string;
  meta?: string | null;
  stats?: VideoStats;
  onOpen: () => void;
  onOpenTikTok?: () => void;
  actions?: ReactNode;
}

const fallbackGradient =
  'linear-gradient(135deg, rgba(20,121,81,0.28) 0%, rgba(33,175,115,0.35) 100%)';

export function VideoCard({
  thumbnail,
  title,
  handle,
  meta,
  stats,
  onOpen,
  onOpenTikTok,
  actions,
}: VideoCardProps) {
  const [actionsVisible, setActionsVisible] = useState(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActionsVisible(false);
      onOpen();
    }
  };

  const handleCardClick = () => {
    setActionsVisible(false);
    onOpen();
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' && !actionsVisible) {
      setActionsVisible(true);
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleCardBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setActionsVisible(false);
    }
  };

  const statEntries: Array<{ icon: typeof Eye; value: number; label: string }> = [];

  if (typeof stats?.playCount === 'number' && Number.isFinite(stats.playCount) && stats.playCount > 0) {
    statEntries.push({ icon: Eye, value: stats.playCount, label: 'Views' });
  }
  if (typeof stats?.likeCount === 'number' && Number.isFinite(stats.likeCount) && stats.likeCount > 0) {
    statEntries.push({ icon: Heart, value: stats.likeCount, label: 'Likes' });
  }
  if (typeof stats?.commentCount === 'number' && Number.isFinite(stats.commentCount) && stats.commentCount > 0) {
    statEntries.push({ icon: MessageCircle, value: stats.commentCount, label: 'Comments' });
  }
  if (typeof stats?.shareCount === 'number' && Number.isFinite(stats.shareCount) && stats.shareCount > 0) {
    statEntries.push({ icon: Share2, value: stats.shareCount, label: 'Shares' });
  }

  const handleTikTokClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setActionsVisible(false);
    if (onOpenTikTok) {
      onOpenTikTok();
      return;
    }
    onOpen();
  };

  const handleDetailClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setActionsVisible(false);
    onOpen();
  };

  return (
    <article className="group relative">
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
        onBlur={handleCardBlur}
        className="relative block w-full overflow-hidden rounded-2xl shadow-card outline-none transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-focus"
        style={{
          backgroundImage: thumbnail ? `url(${thumbnail})` : fallbackGradient,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          aspectRatio: '9 / 16',
        }}
        aria-label={`Open video by ${handle || 'unknown'}`}
      >
        <div
          className={cn(
            'absolute inset-0 bg-black/0 transition',
            'group-hover:bg-black/45 group-focus-within:bg-black/45',
            actionsVisible && 'bg-black/45'
          )}
        />

        {statEntries.length > 0 ? (
          <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-2">
            {statEntries.slice(0, 3).map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white shadow backdrop-blur"
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{kFormatter(value)}</span>
                <span className="sr-only">{label}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            'absolute inset-0 flex flex-col justify-end gap-2 p-4 opacity-0 transition',
            'group-hover:opacity-100',
            'group-focus-within:opacity-100',
            actionsVisible && 'opacity-100'
          )}
        >
          <button
            type="button"
            onClick={handleDetailClick}
            className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 relative z-10"
          >
            View details
          </button>
          <button
            type="button"
            onClick={handleTikTokClick}
            className="w-full rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-sm font-semibold text-gray-900 backdrop-blur-md transition hover:bg-white relative z-10"
          >
            Open on TikTok
          </button>
          {actions ? <div className="relative z-10">{actions}</div> : null}
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="truncate text-sm font-semibold text-text">{title || 'Untitled video'}</h3>
        <p className="text-xs text-text-secondary">@{handle || 'unknown'}</p>
        {meta ? <p className="text-xs text-text-secondary">{meta}</p> : null}
      </div>
    </article>
  );
}
