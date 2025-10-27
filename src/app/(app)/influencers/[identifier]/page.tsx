'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, RefreshCcw, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  getAccountProfile,
  type AccountProfileResponse,
  type InfluencerResearchRecord,
} from '@/lib/api/search-accounts';
import { labelInfluencerById } from '@/lib/api/influencer-labeling';
import { kFormatter } from '@/lib/ui';

const parseAudience = (value: unknown): unknown => {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

type AudienceDisplay = {
  summary: string | null;
  notes: string[];
};

const toAudienceDisplay = (value: unknown): AudienceDisplay => {
  if (!value) return { summary: null, notes: [] };
  if (typeof value === 'string') {
    const summary = value.trim();
    return summary ? { summary, notes: [] } : { summary: null, notes: [] };
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const summaryValue = record.summary;
    const summary = typeof summaryValue === 'string' ? summaryValue.trim() : null;
    const notesValue = record.notes;

    const notes: string[] = [];
    if (Array.isArray(notesValue)) {
      notesValue.forEach((entry) => {
        if (typeof entry === 'string') {
          const trimmed = entry.trim();
          if (trimmed) notes.push(trimmed);
        }
      });
    } else if (typeof notesValue === 'string') {
      const trimmed = notesValue.trim();
      if (trimmed) notes.push(trimmed);
    }

    return { summary, notes };
  }

  return { summary: null, notes: [] };
};

type RawResearch = Partial<InfluencerResearchRecord> & Record<string, unknown>;

const normalizeResearch = (raw: unknown): InfluencerResearchRecord => {
  const data = (raw ?? {}) as RawResearch;
  const rawJson = data.rawJson && typeof data.rawJson === 'object' ? (data.rawJson as Record<string, unknown>) : null;
  const averageMetrics = rawJson && typeof rawJson.averageMetrics === 'object' ? (rawJson.averageMetrics as Record<string, unknown>) : null;
  const metadata = rawJson && typeof rawJson.metadata === 'object' ? (rawJson.metadata as Record<string, unknown>) : null;

  const asNumber = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : null);
  return {
    id: typeof data.id === 'string' ? data.id : String(data.id ?? ''),
    secUid: typeof data.secUid === 'string' ? data.secUid : null,
    username: typeof data.username === 'string' ? data.username : null,
    displayName: typeof data.displayName === 'string' ? data.displayName : null,
    bio: typeof data.bio === 'string' ? data.bio : null,
    profilePicture: typeof data.profilePicture === 'string' ? data.profilePicture : null,
    followers: typeof data.followers === 'number' ? data.followers : null,
    following: typeof data.following === 'number' ? data.following : null,
    hearts: typeof data.hearts === 'number' ? data.hearts : null,
    videos: typeof data.videos === 'number' ? data.videos : null,
    avgViews: typeof data.avgViews === 'number' ? data.avgViews : asNumber(averageMetrics?.views),
    avgLikes: typeof data.avgLikes === 'number' ? data.avgLikes : asNumber(averageMetrics?.likes),
    avgComments: typeof data.avgComments === 'number' ? data.avgComments : asNumber(averageMetrics?.comments),
    avgShares: typeof data.avgShares === 'number' ? data.avgShares : asNumber(averageMetrics?.shares),
    engagementRate: typeof data.engagementRate === 'number' ? data.engagementRate : asNumber(metadata?.engagementRate ?? averageMetrics?.engagementRate),
    topCategories: Array.isArray(data.topCategories) ? (data.topCategories as string[]) : [],
    contentThemes: Array.isArray(data.contentThemes) ? (data.contentThemes as string[]) : [],
    language: typeof data.language === 'string' ? data.language : null,
    tone: typeof data.tone === 'string' ? data.tone : null,
    audience: parseAudience(data.audience ?? null),
    brandFitScore: typeof data.brandFitScore === 'number' ? data.brandFitScore : null,
    brandFitReasons: typeof data.brandFitReasons === 'string' ? data.brandFitReasons : null,
    brandFitTags: Array.isArray(data.brandFitTags) ? (data.brandFitTags as string[]) : [],
    summary: typeof data.summary === 'string' ? data.summary : null,
    lastAnalyzed: typeof data.lastAnalyzed === 'string' ? data.lastAnalyzed : null,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
    rawJson: data.rawJson ?? null,
    metricsSource:
      typeof data.metricsSource === 'string'
        ? data.metricsSource
        : typeof metadata?.metricsSource === 'string'
        ? (metadata.metricsSource as string)
        : null,
    metricsSampleSize:
      typeof data.metricsSampleSize === 'number'
        ? data.metricsSampleSize
        : asNumber(metadata?.metricsSampleSize),
    metricsNote:
      typeof data.metricsNote === 'string'
        ? data.metricsNote
        : typeof metadata?.metricsNote === 'string'
        ? (metadata.metricsNote as string)
        : null,
  };
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleString();
};

const metricItems: Array<{ key: keyof NonNullable<AccountProfileResponse['stats']>; label: string }> = [
  { key: 'followerCount', label: 'Followers' },
  { key: 'followingCount', label: 'Following' },
  { key: 'heartCount', label: 'Likes' },
  { key: 'videoCount', label: 'Videos' },
];

export default function InfluencerProfilePage() {
  const { identifier } = useParams<{ identifier: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionIdParam = searchParams.get('sessionId') ?? undefined;
  const secUidParam = searchParams.get('secUid') ?? undefined;
  const uniqueIdParam = searchParams.get('uniqueId') ?? undefined;
  const uidParam = searchParams.get('uid') ?? undefined;

  const [profile, setProfile] = useState<AccountProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [labelLoading, setLabelLoading] = useState(false);
  const [labelError, setLabelError] = useState<string | null>(null);
  const [labelSuccess, setLabelSuccess] = useState<string | null>(null);

  const loadProfile = useCallback(
    async (options?: { refresh?: boolean }) => {
      if (!identifier) return;

      setLoading(true);
      setError(null);
      try {
        const request: Parameters<typeof getAccountProfile>[0] = {
          sessionId: sessionIdParam,
          refresh: options?.refresh,
        };

        if (secUidParam) request.secUid = secUidParam;
        if (uniqueIdParam) request.uniqueId = uniqueIdParam;
        if (uidParam) request.uid = uidParam;
        if (!request.secUid && !request.uniqueId) {
          request.secUid = identifier;
          if (!request.uniqueId) request.uniqueId = identifier;
        }

        const data = await getAccountProfile(request);
        setProfile(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load account';
        setError(message);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    },
    [identifier, sessionIdParam, secUidParam, uniqueIdParam, uidParam],
  );

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleRefresh = useCallback(() => {
    void loadProfile({ refresh: true });
  }, [loadProfile]);

  const account = profile?.account;
  const stats = profile?.stats;
  const research = profile?.research ?? null;
  const secUidForAnalysis = account?.secUid ?? research?.secUid ?? null;
  const audienceInfo = toAudienceDisplay(research?.audience);

  const toNumberOrNull = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    return null;
  };

  const popularMetricItems = [
    { label: 'Avg views', value: toNumberOrNull(research?.avgViews) },
    { label: 'Avg likes', value: toNumberOrNull(research?.avgLikes) },
    { label: 'Avg comments', value: toNumberOrNull(research?.avgComments) },
    { label: 'Avg shares', value: toNumberOrNull(research?.avgShares) },
  ];

  const hasPopularMetrics =
    popularMetricItems.some((item) => item.value !== null) ||
    (typeof research?.metricsSampleSize === 'number' && research.metricsSampleSize > 0) ||
    toNumberOrNull(research?.engagementRate) !== null;

  const popularMetricsNote = research?.metricsSource === 'popular_posts'
    ? research.metricsNote ?? (research?.metricsSampleSize ? `Averages based on ${research.metricsSampleSize} recent popular posts.` : 'Averages based on recent popular posts.')
    : research?.metricsSource
    ? `Metrics source: ${research.metricsSource}`
    : null;

  const popularEngagementRate = toNumberOrNull(research?.engagementRate);

  const formatAverageValue = (value: number | null) => (value === null ? '—' : kFormatter(value));

  const resolvedDisplayName = account?.nickname || research?.displayName || account?.uniqueId || null;
  const displayName = resolvedDisplayName ?? 'Unknown creator';
  const username = account?.uniqueId || research?.username || 'unknown';
  const avatar = account?.avatar || research?.profilePicture || null;

  const handleLabel = useCallback(async () => {
    if (!profile?.tiktokInfluencerId) {
      setLabelError('TikTok influencer ID not available for this account.');
      return;
    }

    const effectiveSecUid = secUidForAnalysis ?? account?.secUid ?? undefined;
    if (!effectiveSecUid) {
      setLabelError('TikTok secUid not available; unable to analyze popular posts.');
      return;
    }

    setLabelLoading(true);
    setLabelError(null);
    setLabelSuccess(null);

    try {
      const payload = {
        uniqueId: account?.uniqueId ?? research?.username ?? undefined,
        secUid: account?.secUid ?? research?.secUid ?? undefined,
        profile: {
          displayName: resolvedDisplayName ?? undefined,
          bio: account?.signature ?? research?.bio ?? undefined,
          avatarUrl: avatar ?? undefined,
          followerCount: stats?.followerCount ?? research?.followers ?? undefined,
          followingCount: stats?.followingCount ?? research?.following ?? undefined,
          heartCount: stats?.heartCount ?? research?.hearts ?? undefined,
          videoCount: stats?.videoCount ?? research?.videos ?? undefined,
        },
      } as const;

      const response = await labelInfluencerById(profile.tiktokInfluencerId, payload);
      if (response.ok && response.data) {
        setProfile((current) =>
          current
            ? {
                ...current,
                research: normalizeResearch(response.data),
              }
            : current,
        );
        setLabelSuccess('AI analysis completed successfully.');
      } else {
        setLabelError(response.error || 'AI analysis failed.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to run AI analysis';
      setLabelError(message);
    } finally {
      setLabelLoading(false);
    }
  }, [
    profile?.tiktokInfluencerId,
    account?.uniqueId,
    account?.secUid,
    account?.signature,
    stats?.followerCount,
    stats?.followingCount,
    stats?.heartCount,
    stats?.videoCount,
    research?.username,
    research?.secUid,
    research?.bio,
    research?.followers,
    research?.following,
    research?.hearts,
    research?.videos,
    resolvedDisplayName,
    avatar,
    secUidForAnalysis,
  ]);

  return (
    <main className="main-with-header container mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="ghost" onClick={() => router.back()} className="text-sm text-text-secondary hover:text-text">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to influencers
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" disabled={loading} onClick={handleRefresh} className="text-sm">
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
          <Button variant="secondary" disabled={labelLoading || !profile?.tiktokInfluencerId} onClick={handleLabel} className="text-sm">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {labelLoading ? 'Analyzing…' : 'Run AI analysis'}
          </Button>
        </div>
      </div>

      {labelError ? (
        <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {labelError}
        </div>
      ) : null}

      {labelSuccess ? (
        <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {labelSuccess}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-border-light bg-surface-elevated px-6 py-16 text-center text-text-secondary">
          Loading account details…
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-destructive/40 bg-destructive/10 px-6 py-12 text-center text-sm text-destructive">
          {error}
        </div>
      ) : profile && account ? (
        <div className="space-y-6">
          <section className="flex flex-col gap-6 rounded-3xl border border-border-light bg-surface-elevated px-6 py-6 sm:flex-row sm:items-center">
            <div className="mx-auto h-28 w-28 overflow-hidden rounded-full bg-muted sm:mx-0">
              {avatar ? (
                <Image src={avatar} alt={`${displayName} avatar`} width={112} height={112} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-muted-foreground">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <h1 className="text-3xl font-semibold text-text">{displayName}</h1>
                <p className="text-sm text-text-secondary">@{username}</p>
              </div>
              {account?.signature ? <p className="text-sm text-text-secondary">{account.signature}</p> : null}
              <div className="text-xs text-text-tertiary">
                Data source: {profile.source === 'rapidapi' ? 'TikTok API (fresh)' : 'Database cache'}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-border-light bg-surface-elevated p-6">
            <h2 className="text-lg font-semibold text-text">Audience metrics</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metricItems.map(({ key, label }) => {
                const value = stats ? stats[key] ?? null : null;
                return (
                  <div key={key} className="rounded-2xl bg-muted/40 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-text-secondary">{label}</p>
                    <p className="mt-1 text-xl font-semibold text-text">{kFormatter(value)}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-border-light bg-surface-elevated p-6">
            <h2 className="text-lg font-semibold text-text">AI influencer insights</h2>
            {research ? (
              <div className="mt-4 space-y-4 text-sm text-text-secondary">
                {research.summary ? <p className="text-text">{research.summary}</p> : null}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Top categories</h3>
                    {research.topCategories.length ? (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {research.topCategories.map((item) => (
                          <li key={item} className="rounded-full bg-muted px-3 py-1 text-xs text-text">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-text-tertiary">Not available</p>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Content themes</h3>
                    {research.contentThemes.length ? (
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {research.contentThemes.map((item) => (
                          <li key={item} className="rounded-full bg-muted px-3 py-1 text-xs text-text">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-xs text-text-tertiary">Not available</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-muted/30 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-text-tertiary">Avg engagement (popular posts)</p>
                    <p className="mt-1 text-lg font-semibold text-text">
                      {popularEngagementRate != null ? `${(popularEngagementRate * 100).toFixed(1)}%` : '—'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-muted/30 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-text-tertiary">Brand fit score</p>
                    <p className="mt-1 text-lg font-semibold text-text">{research.brandFitScore ?? '—'}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/30 px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-text-tertiary">Language</p>
                    <p className="mt-1 text-lg font-semibold text-text">{research.language ?? '—'}</p>
                  </div>
                </div>

                {hasPopularMetrics ? (
                  <div className="rounded-2xl bg-muted/30 px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Popular post averages</h3>
                      {typeof research?.metricsSampleSize === 'number' && research.metricsSampleSize > 0 ? (
                        <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-text-secondary">
                          {research.metricsSampleSize} posts
                        </span>
                      ) : null}
                    </div>
                    {popularMetricsNote ? (
                      <p className="mt-2 text-xs text-text-tertiary">{popularMetricsNote}</p>
                    ) : null}
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {popularMetricItems.map((item) => (
                        <div key={item.label} className="rounded-2xl bg-background px-3 py-3">
                          <p className="text-xs uppercase tracking-wide text-text-tertiary">{item.label}</p>
                          <p className="mt-1 text-lg font-semibold text-text">{formatAverageValue(item.value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {audienceInfo.summary || audienceInfo.notes.length ? (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Audience insight</h3>
                    {audienceInfo.summary ? (
                      <p className="mt-2 text-sm text-text">{audienceInfo.summary}</p>
                    ) : null}
                    {audienceInfo.notes.length ? (
                      <ul className="mt-2 space-y-1 text-xs text-text-tertiary">
                        {audienceInfo.notes.map((note, index) => (
                          <li key={`${note}-${index}`} className="leading-relaxed">
                            {note}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}

                {research.brandFitReasons ? (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Brand fit notes</h3>
                    <p className="mt-2 whitespace-pre-line text-sm text-text-secondary">{research.brandFitReasons}</p>
                  </div>
                ) : null}

                {research.brandFitTags.length ? (
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Brand fit tags</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {research.brandFitTags.map((tag) => (
                        <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs text-text">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="text-xs text-text-tertiary">
                  Last analyzed: {formatDate(research.lastAnalyzed ?? research.updatedAt)}
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-border-light px-6 py-10 text-center text-sm text-text-secondary">
                AI insights have not been generated yet. Run the analysis above to populate this section.
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="rounded-3xl border border-border-light bg-surface-elevated px-6 py-16 text-center text-sm text-text-secondary">
          Account details are unavailable.
        </div>
      )}
    </main>
  );
}
