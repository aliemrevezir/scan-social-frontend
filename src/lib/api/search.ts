import { apiFetch } from '@/lib/fetcher';

export type { VideoSummary } from '@/types/video';

export type SearchVideoItem = Record<string, unknown>;

export interface SearchVideosResponse {
  searchId: number;
  cursor: number;
  hasMore: number | boolean;
  items: SearchVideoItem[];
}

export interface CreatorResponse {
  user: unknown;
  stats: unknown;
  secUid: string | null;
}

export interface PopularPostsResponse {
  cursor: number;
  hasMore: boolean;
  items: SearchVideoItem[];
}

export interface RecentSearchItem {
  id: string;
  keyword: string;
  cursor: number | null;
  searchId: number | null;
  lastSearchedAt: string;
  latestResponse: {
    items: SearchVideoItem[];
    cursor: number | null;
    searchId: number | null;
    createdAt: string;
  } | null;
}

export async function searchVideos(params: {
  keyword: string;
  cursor?: number;
  searchId?: number;
}): Promise<SearchVideosResponse> {
  return apiFetch<SearchVideosResponse>('/search/videos', {
    method: 'POST',
    body: {
      keyword: params.keyword,
      cursor: params.cursor ?? 0,
      search_id: params.searchId ?? 0,
    },
  });
}

export async function getCreator(uniqueId: string): Promise<CreatorResponse> {
  return apiFetch<CreatorResponse>(`/search/creators/${encodeURIComponent(uniqueId)}`);
}

export async function getPopularPosts(params: {
  secUid: string;
  count?: number;
  cursor?: number;
}): Promise<PopularPostsResponse> {
  return apiFetch<PopularPostsResponse>(
    `/search/creators/${encodeURIComponent(params.secUid)}/popular-posts`,
    {
      method: 'POST',
      body: {
        sec_uid: params.secUid,
        count: params.count ?? 35,
        cursor: params.cursor ?? 0,
      },
    }
  );
}

export async function getRecentSearches(params?: { limit?: number }): Promise<RecentSearchItem[]> {
  const limit = Math.max(1, Math.min(params?.limit ?? 100, 100));
  const searchParams = new URLSearchParams();
  searchParams.set('limit', limit.toString());

  const query = searchParams.toString();
  const response = await apiFetch<{ items: RecentSearchItem[] }>(
    `/search/videos/recent${query ? `?${query}` : ''}`
  );
  return response.items ?? [];
}
