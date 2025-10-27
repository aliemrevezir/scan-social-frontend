'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  postAccountSearchPage,
  getAccountsUnified,
  getAccountSearchHistory,
  type AccountCard,
  type AccountSearchHistoryItem
} from '@/lib/api/search-accounts';

export default function InfluencersPage() {
  const [keyword, setKeyword] = useState<string>(''); // Initialize as empty string
  const [items, setItems] = useState<AccountCard[]>([]); // Start with empty array
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [searchId, setSearchId] = useState<number>(0);
  const [cursor, setCursor] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [history, setHistory] = useState<Array<{
    id: string;
    keyword: string;
    totalUsers: number;
    updatedAt: string;
    hasMore: boolean
  }>>([]);

  // Load history chips
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const r = await getAccountSearchHistory();
        setHistory(r);
      } catch (err) {
        console.error('Failed to load account search history:', err);
      }
    };
    void loadHistory();
  }, []);

  // Kick off: prefill unified + start a fresh page-1 session
  useEffect(() => {
    // Don't run automatic search - user must explicitly trigger search
    // This effect is kept for loading history on component mount
    let mounted = true;
    (async () => {
      try {
        // Load history chips
        const r = await getAccountSearchHistory();
        if (mounted) {
          setHistory(r);
        }
      } catch (err) {
        console.error('Failed to load account search history:', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Infinite scroll
  useEffect(() => {
    if (!loaderRef.current || error) return;
    const el = loaderRef.current;
    const io = new IntersectionObserver(([entry]) => {
      // Ensure we have a keyword, session, and other requirements before loading more
      if (entry.isIntersecting && hasMore && !loading && sessionId && keyword && keyword.trim()) {
        setLoading(true);
        postAccountSearchPage({
          keyword: keyword.trim(), // Ensure trimmed keyword
          cursor: cursor || 0,
          search_id: searchId || 0,
          sessionId
        })
          .then(page => {
            setItems(prev => dedupe(prev.concat(page.items)));
            setCursor(page.cursor);
            setHasMore(page.hasMore);
            setSearchId(page.searchId);
          })
          .catch(err => {
            const message = err instanceof Error ? err.message : 'Load more failed';
            setError(message);
          })
          .finally(() => setLoading(false));
      }
    }, { rootMargin: '800px' });
    io.observe(el);
    return () => io.disconnect();
  }, [loaderRef, hasMore, loading, cursor, sessionId, searchId, keyword, error]);

  const handleKeywordChange = (newKeyword: string) => {
    setKeyword(newKeyword);
    // Don't trigger search automatically - user must explicitly search
  };

  const performSearch = async () => {
    const term = keyword.trim();

    if (!term) {
      setItems([]);
      setSessionId(null);
      setSearchId(0);
      setCursor(0);
      setHasMore(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Load unified data first for instant display
      const unified = await getAccountsUnified({ keyword: term });
      const existingSessionId = unified.session?.id;

      if (unified.session) {
        setItems(unified.items);
        setSessionId(unified.session.id);
        setSearchId(unified.session.searchId);
        setCursor(unified.session.cursor);
        setHasMore(unified.session.hasMore);
      } else {
        setItems([]);
        setSessionId(null);
        setSearchId(0);
        setCursor(0);
        setHasMore(false);
      }

      // Start a new page-1 to ensure a live session (and DB persistence)
      const first = await postAccountSearchPage({
        keyword: term,
        cursor: 0,
        search_id: 0,
        sessionId: existingSessionId
      });

      setSessionId(first.sessionId);
      setItems(prev => dedupe(prev.concat(first.items)));
      setSearchId(first.searchId);
      setCursor(first.cursor);
      setHasMore(first.hasMore);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Only trigger search if keyword is not empty
    if (keyword && keyword.trim()) {
      performSearch();
    }
  };

  const handleRetry = () => {
    // Only retry if keyword exists
    if (keyword && keyword.trim()) {
      performSearch();
    }
  };

  const loadHistorySession = async (historyItem: AccountSearchHistoryItem) => {
    const term = historyItem.keyword?.trim() ?? '';
    setKeyword(historyItem.keyword);

    if (!term) {
      setItems([]);
      setSessionId(null);
      setSearchId(0);
      setCursor(0);
      setHasMore(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const unified = await getAccountsUnified({ sessionId: historyItem.id });

      if (unified.session) {
        setSessionId(unified.session.id);
        setSearchId(unified.session.searchId);
        setCursor(unified.session.cursor);
        setHasMore(unified.session.hasMore);
        setItems(unified.items);
      } else {
        // Fallback to keyword-based unified fetch if session lookup failed
        const fallback = await getAccountsUnified({ keyword: term });

        if (fallback.session) {
          setSessionId(fallback.session.id);
          setSearchId(fallback.session.searchId);
          setCursor(fallback.session.cursor);
          setHasMore(fallback.session.hasMore);
          setItems(fallback.items);
        } else {
          setSessionId(null);
          setSearchId(0);
          setCursor(0);
          setHasMore(false);
          setItems([]);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load saved results';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-with-header container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Discover Influencers</h1>
          <p className="text-gray-600">Search and explore TikTok creators for your campaigns</p>
        </div>
      </header>

      <div className="flex items-center gap-3 mb-6">
        <input
          className="flex-1 border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Search TikTok accounts (e.g., fitness, fashion, tech, food)…"
          value={keyword}
          onChange={(e) => handleKeywordChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(); // Use handleSearch instead of direct keyword change
            }
          }}
        />
        <button
          onClick={handleSearch} // Use handleSearch instead of direct keyword change
          disabled={loading || !keyword || !keyword.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="ml-4 px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <section className="mb-8">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Recent searches</h4>
          <div className="flex flex-wrap gap-2">
            {history.map(h => (
              <button
                key={h.id}
                className="px-4 py-2 rounded-full border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => {
                  void loadHistorySession(h);
                }}
              >
                {h.keyword} ({h.totalUsers})
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="space-y-6">
        {items.length > 0 && (
          <header>
            <h2 className="text-2xl font-semibold text-gray-900">
              {keyword ? `Results for "${keyword}"` : 'Discover Influencers'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {items.length} influencer{items.length !== 1 ? 's' : ''} found
            </p>
          </header>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((u, i) => (
            <InfluencerCard key={keyOf(u, i)} u={u} sessionId={sessionId} />
          ))}
        </div>

        {/* Empty State */}
        {!loading && !error && items.length === 0 && keyword && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No influencers found</h3>
            <p className="text-gray-600">Try adjusting your search terms or browse different keywords</p>
          </div>
        )}
      </section>

      {/* Loader / sentinel */}
      <div ref={loaderRef} className="h-12 flex items-center justify-center text-sm text-gray-500 mt-8">
        {loading ? 'Loading…' : hasMore ? 'Scroll to load more' : items.length > 0 ? 'No more accounts' : ''}
      </div>
    </main>
  );
}

function InfluencerCard({ u, sessionId }: { u: AccountCard; sessionId: string | null }) {
  const identifier = u.secUid || u.uniqueId || u.uid || null;
  const searchParams = new URLSearchParams();
  if (sessionId) searchParams.set('sessionId', sessionId);
  if (u.secUid) searchParams.set('secUid', u.secUid);
  if (u.uniqueId) searchParams.set('uniqueId', u.uniqueId);
  if (u.uid) searchParams.set('uid', u.uid);

  const href = identifier
    ? `/influencers/${encodeURIComponent(identifier)}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    : null;

  const content = (
    <article className="border rounded-xl p-4 bg-white hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 mb-3">
          {u.avatar ? (
            <Image
              src={u.avatar}
              alt={`${u.nickname || u.uniqueId || 'User'}'s avatar`}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>

        <div className="w-full truncate font-semibold text-gray-900 mb-1">
          {u.nickname || u.uniqueId || 'Unknown'}
        </div>

        <div className="w-full truncate text-xs text-gray-500 mb-2">
          @{u.uniqueId || '—'}
        </div>

        <div className="text-xs text-gray-600 mb-3">
          Followers: {fmt(u.followerCount)}
        </div>

        {u.signature && (
          <div className="w-full text-xs text-gray-500 line-clamp-3">
            {u.signature}
          </div>
        )}
      </div>
    </article>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl">
      {content}
    </Link>
  );
}

function keyOf(u: AccountCard, i: number) {
  return (u.secUid || u.uid || u.uniqueId || String(i))!;
}

function dedupe(list: AccountCard[]) {
  const m = new Map<string, AccountCard>();
  for (const u of list) {
    const key = u.secUid || u.uid || u.uniqueId;
    if (!key) continue;
    if (!m.has(key)) m.set(key, u);
  }
  return Array.from(m.values());
}

function fmt(n: number | null | undefined) {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}