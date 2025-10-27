import { Key, ReactNode } from 'react';

import { VideoCard } from '@/components/search/VideoCard';
import type { VideoStats } from '@/types/video';

interface VideoGridProps<T> {
  items: T[];
  getKey: (item: T, index: number) => Key;
  getTitle: (item: T) => string;
  getHandle: (item: T) => string;
  getThumbnail: (item: T) => string | null | undefined;
  getMeta?: (item: T) => string | null | undefined;
  getStats?: (item: T) => VideoStats | undefined;
  onOpen: (item: T) => void;
  onOpenTikTok?: (item: T) => void;
  renderActions?: (item: T) => ReactNode;
}

export function VideoGrid<T>({
  items,
  getKey,
  getTitle,
  getHandle,
  getThumbnail,
  getMeta,
  getStats,
  onOpen,
  onOpenTikTok,
  renderActions,
}: VideoGridProps<T>) {
  if (!items?.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item, index) => {
        const key = getKey(item, index);
        return (
          <div key={key}>
            <VideoCard
              thumbnail={getThumbnail(item)}
              title={getTitle(item)}
              handle={getHandle(item)}
              meta={getMeta?.(item) ?? undefined}
              stats={getStats?.(item)}
              onOpen={() => onOpen(item)}
              onOpenTikTok={onOpenTikTok ? () => onOpenTikTok(item) : undefined}
              actions={renderActions?.(item)}
            />
          </div>
        );
      })}
    </div>
  );
}
