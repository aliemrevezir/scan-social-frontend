'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Link as LinkIcon, Music, RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getVideoDetail } from '@/lib/api/videos';
import type { SearchVideoItem } from '@/lib/api/search';
import { extractThumbnail } from '@/lib/search-mappers';
import { kFormatter, timeAgo } from '@/lib/ui';
import type { VideoDetail } from '@/types/video';

const fallbackGradient =
  'linear-gradient(135deg, rgba(20,121,81,0.28) 0%, rgba(33,175,115,0.35) 100%)';

const metricOrder: Array<{ label: string; access: (stats: VideoDetail['stats']) => number | undefined }> = [
  { label: 'Views', access: (stats) => stats.playCount },
  { label: 'Likes', access: (stats) => stats.likeCount },
  { label: 'Comments', access: (stats) => stats.commentCount },
  { label: 'Shares', access: (stats) => stats.shareCount },
  { label: 'Saves', access: (stats) => stats.collectCount },
];

function deriveThumbnail(detail: VideoDetail | null): string | null {
  if (!detail?.rawJson) {
    return null;
  }
  try {
    return extractThumbnail(detail.rawJson as SearchVideoItem);
  } catch {
    return null;
  }
}

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  const loadVideo = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const detail = await getVideoDetail(id);
      setVideo(detail);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load video';
      setError(message);
      setVideo(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadVideo();
    return () => {
      if (copyTimeoutRef.current) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, [loadVideo]);

  const handleCopyLink = useCallback(() => {
    if (!video?.canonicalUrl || !navigator.clipboard) return;

    navigator.clipboard
      .writeText(video.canonicalUrl)
      .then(() => {
        setCopied(true);
        if (copyTimeoutRef.current) {
          window.clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => setCopied(false));
  }, [video?.canonicalUrl]);

  const handleOpenTikTok = useCallback(() => {
    if (!video?.canonicalUrl) return;
    window.open(video.canonicalUrl, '_blank', 'noopener,noreferrer');
  }, [video?.canonicalUrl]);

  const publishedAtMs = video?.createdAtEpoch ? video.createdAtEpoch * 1000 : undefined;
  const publishedRelative = publishedAtMs ? timeAgo(publishedAtMs) : '';
  const publishedExact = publishedAtMs ? new Date(publishedAtMs).toLocaleString() : '';
  const thumbnail = deriveThumbnail(video);

  return (
    <main className="main-with-header container mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-sm text-text-secondary hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to results
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            disabled={loading}
            onClick={loadVideo}
            className="text-sm"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border-light bg-surface-elevated px-6 py-16 text-center text-text-secondary">
          Loading video details…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 px-6 py-8 text-sm text-destructive">
          <p className="font-medium">{error}</p>
          <p className="mt-2 text-destructive/80">Try refreshing or returning to the search page.</p>
        </div>
      ) : video ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-3xl bg-surface-elevated shadow-lg">
              <div
                className="relative w-full"
                style={{
                  backgroundImage: thumbnail ? `url(${thumbnail})` : fallbackGradient,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  aspectRatio: '9 / 16',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </div>
              <div className="space-y-3 px-6 py-6">
                <h1 className="text-2xl font-semibold text-text">{video.caption || 'Untitled video'}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                  <span>@{video.author.username || 'unknown'}</span>
                  {publishedRelative ? (
                    <>
                      <span aria-hidden="true">•</span>
                      <span title={publishedExact}>Posted {publishedRelative}</span>
                    </>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button 
                    variant="tiktok"
                    size="lg"
                    onClick={handleOpenTikTok}
                  >
                    <ExternalLink className="h-5 w-5" aria-hidden="true" />
                    View on TikTok
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCopyLink}
                    disabled={!video.canonicalUrl}
                    className="px-4 py-3"
                  >
                    <LinkIcon className="h-4 w-4" aria-hidden="true" />
                    {copied ? 'Link copied' : 'Copy link'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border-light bg-surface-elevated p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-text">Engagement metrics</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                {metricOrder.map(({ label, access }) => {
                  const value = access(video.stats);
                  if (value === undefined || value === null) {
                    return null;
                  }
                  return (
                    <div key={label} className="rounded-2xl bg-muted/40 px-4 py-3">
                      <dt className="text-xs uppercase tracking-wide text-text-secondary">{label}</dt>
                      <dd className="mt-1 text-xl font-semibold text-text">{kFormatter(value)}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border-light bg-surface-elevated p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-text">Video details</h2>
              <dl className="mt-4 space-y-3 text-sm text-text-secondary">
                <div>
                  <dt className="font-medium text-text">TikTok ID</dt>
                  <dd>{video.tiktokVideoId ?? 'Unavailable'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-text">Scan Social ID</dt>
                  <dd>{video.id}</dd>
                </div>
                {video.author.secUid ? (
                  <div>
                    <dt className="font-medium text-text">Author secUid</dt>
                    <dd>{video.author.secUid}</dd>
                  </div>
                ) : null}
                {publishedExact ? (
                  <div>
                    <dt className="font-medium text-text">Published</dt>
                    <dd title={publishedExact}>{publishedExact}</dd>
                  </div>
                ) : null}
              </dl>
            </div>

            {video.music?.title || video.music?.authorName ? (
              <div className="rounded-3xl border border-border-light bg-surface-elevated p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-text">Music</h2>
                <div className="mt-3 flex items-start gap-3 text-sm text-text-secondary">
                  <Music className="mt-0.5 h-5 w-5 text-text" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-text">{video.music?.title ?? 'Unknown track'}</p>
                    <p>{video.music?.authorName ? `by ${video.music.authorName}` : 'Artist unavailable'}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </main>
  );
}
