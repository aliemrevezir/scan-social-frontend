'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { EmptyState } from '@/components/search/EmptyState';
import { FilterChips } from '@/components/search/FilterChips';
import { LatestSearches } from '@/components/search/LatestSearches';
import { SearchBar } from '@/components/search/SearchBar';
import { VideoGrid } from '@/components/search/VideoGrid';
import { Button } from '@/components/ui/button';
import {
  getRecentSearches,
  searchVideos,
  type RecentSearchItem,
  type SearchVideoItem,
} from '@/lib/api/search';
import {
  buildTikTokUrl,
  extractCaption,
  extractCanonicalUrl,
  extractCreatedAt,
  extractHandle,
  extractStats,
  extractThumbnail,
  extractVideoDbId,
  extractVideoId,
  extractViews,
  formatPublishedAgo,
  formatViews,
} from '@/lib/search-mappers';

export default function SearchPage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchVideoItem[]>([]);
  const [cursor, setCursor] = useState<number>(0);
  const [searchId, setSearchId] = useState<number>(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestSearches, setLatestSearches] = useState<RecentSearchItem[]>([]);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const lastRequestWasAppendRef = useRef(false);

  const hasResults = results.length > 0;
  const showEmptyState = !keyword && !hasResults && !loading && !error;

  const refreshRecentSearches = useCallback(async () => {
    try {
      const items = await getRecentSearches();
      setLatestSearches(items);
    } catch (err) {
      console.error('Failed to load recent searches', err);
    }
  }, []);

  useEffect(() => {
    void refreshRecentSearches();
  }, [refreshRecentSearches]);

  const handleSelectRecent = useCallback((item: RecentSearchItem) => {
    const cachedItems = item.latestResponse?.items ?? [];
    const cachedCursor = item.latestResponse?.cursor ?? item.cursor ?? 0;
    const cachedSearchId = item.latestResponse?.searchId ?? item.searchId ?? 0;

    setKeyword(item.keyword);
    setResults(cachedItems);
    setCursor(cachedCursor);
    setSearchId(cachedSearchId);
    setHasMore(false);
    setError(null);
    setLoading(false);
  }, []);

  const metaForItem = useCallback((item: SearchVideoItem) => {
    const viewsText = formatViews(extractViews(item));
    const publishedText = formatPublishedAgo(extractCreatedAt(item));
    return [viewsText, publishedText].filter(Boolean).join(' · ') || null;
  }, []);

  const handleSearch = useCallback(
    async (
      kw: string,
      options: { append?: boolean; cursorOverride?: number; searchIdOverride?: number } = {}
    ) => {
      if (!kw) return;

      setLoading(true);
      setError(null);
      const append = options.append ?? false;
      lastRequestWasAppendRef.current = append;
      const cursorValue = append ? options.cursorOverride ?? cursor : options.cursorOverride ?? 0;
    const searchIdValue = append ? options.searchIdOverride ?? searchId : options.searchIdOverride ?? 0;

      try {
        const response = await searchVideos({
          keyword: kw,
          cursor: cursorValue,
          searchId: searchIdValue,
        });

        const normalizedCursor = (() => {
          if (typeof response.cursor === 'string') {
            const parsed = Number(response.cursor);
            return Number.isFinite(parsed) ? parsed : 0;
          }
          return response.cursor ?? 0;
        })();

        const normalizedSearchId = (() => {
          if (typeof response.searchId === 'string') {
            const parsed = Number(response.searchId);
            return Number.isFinite(parsed) ? parsed : 0;
          }
          return response.searchId ?? 0;
        })();

        setResults((prev) => {
          const items = response.items ?? [];
          return append ? [...prev, ...items] : items;
        });

        setCursor(normalizedCursor);
        setSearchId(normalizedSearchId);
        setHasMore(Boolean(response.hasMore) && (response.items?.length ?? 0) > 0);

        if (!append) {
          void refreshRecentSearches();
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Search failed';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [cursor, searchId, refreshRecentSearches]
  );

  useEffect(() => {
    if (error) {
      return undefined;
    }

    const sentinel = loadMoreRef.current;
    if (!sentinel) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) {
          return;
        }
        if (!keyword || !hasMore || loading) {
          return;
        }
        void handleSearch(keyword, { append: true });
      },
      { rootMargin: '600px 0px' }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [error, handleSearch, hasMore, keyword, loading]);

  const onSubmit = (kw: string) => {
    setKeyword(kw);
    setCursor(0);
    setSearchId(0);
    setHasMore(false);
    setResults([]);
    void handleSearch(kw, { append: false, cursorOverride: 0, searchIdOverride: 0 });
  };

  const onClear = () => {
    setKeyword('');
    setCursor(0);
    setSearchId(0);
    setHasMore(false);
    setResults([]);
    setError(null);
  };

  const openOnTikTok = useCallback((item: SearchVideoItem) => {
    const directUrl = extractCanonicalUrl(item) ?? buildTikTokUrl(extractHandle(item), extractVideoId(item));
    if (directUrl) {
      window.open(directUrl, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const openDetails = useCallback(
    (item: SearchVideoItem) => {
      const dbId = extractVideoDbId(item);
      if (dbId) {
        router.push(`/videos/${dbId}`);
        return;
      }
      openOnTikTok(item);
    },
    [openOnTikTok, router]
  );

  return (
    <main className="main-with-header container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 space-y-2">
        <h1 className="text-3xl font-semibold text-text">Search</h1>
        <p className="text-text-secondary">
          Explore TikTok videos, discover creators, and build shortlists for your next campaign.
        </p>
      </header>

      <SearchBar defaultValue={keyword} onSubmit={onSubmit} onClear={onClear} loading={loading} />
      <FilterChips />
      <LatestSearches items={latestSearches} onSelect={handleSelectRecent} />

      {error ? (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{error}</span>
          <div>
            <Button
              variant="outline"
              disabled={loading || !keyword}
              onClick={() => {
                if (!keyword) return;
                const cursorOverride = lastRequestWasAppendRef.current ? cursor : 0;
                const searchIdOverride = lastRequestWasAppendRef.current ? searchId : 0;
                void handleSearch(keyword, {
                  append: lastRequestWasAppendRef.current,
                  cursorOverride,
                  searchIdOverride,
                });
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      ) : null}

      {showEmptyState ? (
        <EmptyState />
      ) : (
        <section className="space-y-8">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-text">Search Results</h2>
              {keyword ? (
                <p className="text-sm text-text-secondary">Showing videos for “{keyword}”</p>
              ) : null}
            </div>
          </header>

          {hasResults ? (
            <VideoGrid<SearchVideoItem>
              items={results}
              getKey={(item, index) =>
                extractVideoDbId(item) ??
                extractCanonicalUrl(item) ??
                extractVideoId(item) ??
                `${extractHandle(item)}-${index}`
              }
              getTitle={extractCaption}
              getHandle={extractHandle}
              getThumbnail={extractThumbnail}
              getMeta={metaForItem}
              getStats={extractStats}
              onOpen={openDetails}
              onOpenTikTok={openOnTikTok}
            />
          ) : (
            <div className="rounded-2xl border border-border-light bg-surface-elevated px-6 py-12 text-center text-text-secondary">
              {loading ? 'Fetching videos…' : `No results found for “${keyword}”. Try a different keyword.`}
            </div>
          )}

          {hasMore ? (
            <div className="flex flex-col items-center gap-2">
              <div
                ref={loadMoreRef}
                className="h-10 w-full max-w-sm animate-pulse rounded-full bg-muted/60"
                aria-hidden="true"
              />
              <span className="text-xs text-text-secondary">
                {loading ? 'Loading more videos…' : 'Scroll down to load more results'}
              </span>
            </div>
          ) : (
            hasResults && (
              <div className="text-center text-xs text-text-secondary">You have reached the end.</div>
            )
          )}
        </section>
      )}
    </main>
  );
}
