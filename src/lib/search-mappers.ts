import { formatDistanceToNow } from 'date-fns';

import type { SearchVideoItem } from '@/lib/api/search';
import type { VideoStats } from '@/types/video';

const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export function extractCaption(item: SearchVideoItem): string {
  if (!item) return '';
  return (
    (item['desc'] as string | undefined) ||
    (item['description'] as string | undefined) ||
    (item['title'] as string | undefined) ||
    ''
  ).trim();
}

export function extractAuthor(item: SearchVideoItem) {
  const candidate =
    (item['author'] as Record<string, unknown> | undefined) ||
    (item['user'] as Record<string, unknown> | undefined) ||
    ((item['awemeInfo'] as Record<string, unknown> | undefined)?.['author'] as
      | Record<string, unknown>
      | undefined);

  const handle =
    (candidate?.['uniqueId'] as string | undefined) ||
    (candidate?.['username'] as string | undefined) ||
    (candidate?.['handle'] as string | undefined) ||
    '';

  const secUid =
    (candidate?.['secUid'] as string | undefined) ||
    (candidate?.['sec_uid'] as string | undefined) ||
    '';

  const displayName =
    (candidate?.['nickname'] as string | undefined) ||
    (candidate?.['displayName'] as string | undefined) ||
    '';

  return { handle, secUid, displayName };
}

export function extractHandle(item: SearchVideoItem): string {
  return extractAuthor(item).handle;
}

export function extractSecUid(item: SearchVideoItem): string {
  return extractAuthor(item).secUid;
}

export function extractVideoId(item: SearchVideoItem): string {
  if (!item) return '';
  return (
    (item['id'] as string | undefined) ||
    (item['video_id'] as string | undefined) ||
    (item['awemeId'] as string | undefined) ||
    (item['aweme_id'] as string | undefined) ||
    ''
  ).toString();
}

export function extractViews(item: SearchVideoItem): number | null {
  if (!item) return null;

  const statsCandidates: Array<Record<string, unknown> | undefined> = [
    item['stats'] as Record<string, unknown> | undefined,
    item['authorStats'] as Record<string, unknown> | undefined,
    item['stats_data'] as Record<string, unknown> | undefined,
    item['engagement'] as Record<string, unknown> | undefined,
  ];

  for (const stats of statsCandidates) {
    if (!stats) continue;
    const value =
      (stats['playCount'] as number | undefined) ??
      (stats['viewCount'] as number | undefined) ??
      (stats['views'] as number | undefined) ??
      (stats['plays'] as number | undefined);
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  const flatCandidates: Array<number | string | undefined> = [
    item['playCount'] as number | string | undefined,
    item['viewCount'] as number | string | undefined,
  ];

  for (const candidate of flatCandidates) {
    const numeric = typeof candidate === 'string' ? Number(candidate) : candidate;
    if (typeof numeric === 'number' && Number.isFinite(numeric)) {
      return numeric;
    }
  }

  return null;
}

export function extractCreatedAt(item: SearchVideoItem): Date | null {
  if (!item) return null;

  const rawValue =
    (item['createTime'] as string | number | undefined) ??
    (item['created_time'] as string | number | undefined) ??
    (item['create_time'] as string | number | undefined) ??
    (item['createdAtEpoch'] as string | number | undefined);

  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return null;
  }

  const numeric = typeof rawValue === 'string' ? Number(rawValue) : rawValue;
  if (!Number.isFinite(numeric)) {
    return null;
  }

  // RapidAPI values are usually seconds. If it's already in milliseconds keep as-is.
  const milliseconds = numeric > 10_000_000_000 ? numeric : numeric * 1000;
  const date = new Date(milliseconds);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function extractThumbnail(item: SearchVideoItem): string | null {
  if (!item) return null;

  const potential =
    (item['video'] as Record<string, unknown> | undefined) ??
    (item['coverData'] as Record<string, unknown> | undefined);

  const nestedCover = potential?.['cover'] as string | undefined;
  const nestedOriginCover = potential?.['originCover'] as string | undefined;
  const nestedDynamic = potential?.['dynamicCover'] as string | undefined;

  const directCover =
    (item['cover'] as string | undefined) ||
    (item['image'] as string | undefined) ||
    (item['thumbnail'] as string | undefined) ||
    (item['coverUrl'] as string | undefined) ||
    (item['thumb_image'] as string | undefined);

  return nestedCover || nestedOriginCover || nestedDynamic || directCover || null;
}


const parseStatValue = (value: unknown): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

export function extractStats(item: SearchVideoItem): VideoStats {
  const statsSources: Array<Record<string, unknown> | undefined> = [
    item?.['stats'] as Record<string, unknown> | undefined,
    item?.['authorStats'] as Record<string, unknown> | undefined,
    item?.['stats_data'] as Record<string, unknown> | undefined,
    item?.['engagement'] as Record<string, unknown> | undefined,
    item?.['videoStats'] as Record<string, unknown> | undefined,
  ];

  const summary: VideoStats = {};

  const pickValue = (keys: string[]): number | undefined => {
    for (const stats of statsSources) {
      if (!stats) continue;
      for (const key of keys) {
        const value = parseStatValue(stats[key]);
        if (value !== undefined) {
          return value;
        }
      }
    }

    for (const key of keys) {
      const value = parseStatValue((item as Record<string, unknown>)?.[key]);
      if (value !== undefined) {
        return value;
      }
    }

    return undefined;
  };

  summary.playCount = pickValue(['playCount', 'viewCount', 'views', 'plays']);
  summary.likeCount = pickValue(['diggCount', 'likeCount', 'likes', 'hearts']);
  summary.commentCount = pickValue(['commentCount', 'comments']);
  summary.shareCount = pickValue(['shareCount', 'shares']);
  summary.collectCount = pickValue(['collectCount', 'saves', 'favoriteCount']);

  return summary;
}

const isUuid = (value: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
};

export function extractVideoDbId(item: SearchVideoItem): string | null {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const directKeys = ['scanSocialId', 'scan_social_id', 'scanSocialID', 'scan_socialID', 'videoDbId', 'video_db_id'];
  for (const key of directKeys) {
    const value = (item as Record<string, unknown>)[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  for (const [key, value] of Object.entries(item)) {
    if (typeof value !== 'string' || !value.trim()) {
      continue;
    }
    const normalizedKey = key.replace(/[^a-z]/gi, '').toLowerCase();
    if (normalizedKey === 'scansocialid' || normalizedKey === 'videodbid') {
      return value.trim();
    }
  }

  const idValue = (item as Record<string, unknown>)['id'];
  if (typeof idValue === 'string' && isUuid(idValue)) {
    return idValue.trim();
  }

  return null;
}

export function extractCanonicalUrl(item: SearchVideoItem): string | null {
  const canonical =
    (item?.['canonicalUrl'] as string | undefined) ||
    (item?.['canonical_url'] as string | undefined) ||
    (item?.['shareUrl'] as string | undefined) ||
    (item?.['share_url'] as string | undefined);
  if (canonical) {
    return canonical;
  }

  const handle = extractHandle(item);
  const videoId = extractVideoId(item);
  return buildTikTokUrl(handle, videoId);
}

export function extractCreatedAtEpoch(item: SearchVideoItem): number | undefined {
  const date = extractCreatedAt(item);
  if (!date) {
    return undefined;
  }
  return Math.floor(date.getTime() / 1000);
}

export function buildTikTokUrl(authorHandle: string, videoId: string | null | undefined) {
  const handle = authorHandle?.trim();
  const id = videoId?.toString().trim();
  if (!handle || !id) {
    return null;
  }
  return `https://www.tiktok.com/@${handle}/video/${id}`;
}

export function formatViews(value: number | null): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  return `${compactFormatter.format(value)} views`;
}

export function formatPublishedAgo(date: Date | null): string | null {
  if (!date) {
    return null;
  }
  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return null;
  }
}
