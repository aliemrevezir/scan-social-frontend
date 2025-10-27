import { apiFetch } from '@/lib/fetcher';

export type AccountCard = {
  secUid: string | null;
  uid: string | null;
  uniqueId: string | null;
  nickname: string | null;
  avatar: string | null;
  followerCount: number | null;
  signature: string | null;
};

export type AccountSearchPageResult = {
  sessionId: string;
  keyword: string;
  searchId: number;
  cursor: number;
  hasMore: boolean;
  items: AccountCard[];
};

export type AccountUnifiedResponse = {
  session: {
    id: string;
    keyword: string;
    searchId: number;
    cursor: number;
    hasMore: boolean;
    totalUsers: number;
    updatedAt: string;
  } | null;
  items: AccountCard[];
};

export type AccountStats = {
  followerCount: number | null;
  followingCount: number | null;
  heartCount: number | null;
  videoCount: number | null;
} | null;

export type AccountSocialRecord = {
  id: string;
  username: string | null;
  secUid: string | null;
  platformUserId: string | null;
  followerCount: number | null;
  followingCount: number | null;
  heartCount: number | null;
  videoCount: number | null;
  createdAt: string;
  updatedAt: string;
} | null;

export type InfluencerResearchRecord = {
  id: string;
  secUid: string | null;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  profilePicture: string | null;
  followers: number | null;
  following: number | null;
  hearts: number | null;
  videos: number | null;
  avgViews: number | null;
  avgLikes: number | null;
  avgComments: number | null;
  avgShares: number | null;
  engagementRate: number | null;
  topCategories: string[];
  contentThemes: string[];
  language: string | null;
  tone: string | null;
  audience: unknown;
  brandFitScore: number | null;
  brandFitReasons: string | null;
  brandFitTags: string[];
  summary: string | null;
  lastAnalyzed: string | null;
  updatedAt: string;
  rawJson: unknown;
  metricsSource: string | null;
  metricsSampleSize: number | null;
  metricsNote: string | null;
} | null;

export type AccountProfileResponse = {
  source: 'database' | 'rapidapi';
  account: AccountCard | null;
  stats: AccountStats;
  socialAccount: AccountSocialRecord;
  research: InfluencerResearchRecord;
  tiktokInfluencerId: string | null;
};

export type AccountSearchHistoryItem = {
  id: string;
  keyword: string;
  totalUsers: number;
  updatedAt: string;
  hasMore: boolean;
};

export type AnalyzePopularPostsResponse = {
  cursor: number | null;
  hasMore: boolean;
  count: number;
  transcriptRequest: {
    requestId?: string;
    datasetId?: string;
    runId?: string;
    count?: number;
  } | null;
  items: Array<{
    canonicalUrl: string | null;
    authorUsername: string | null;
    authorSecUid: string | null;
    tiktokVideoId: string | null;
    videoDbId: string | null;
    transcript: {
      id: string;
      language: string | null;
      transcriptText: string | null;
      hasSpeech: boolean;
      labelingStatus: string | null;
      labelingJson: unknown;
    } | null;
    analysis: unknown;
    error?: string;
  }>;
};

export async function postAccountSearchPage(params: {
  keyword: string;
  cursor?: number;
  search_id?: number;
  sessionId?: string;
}): Promise<AccountSearchPageResult> {
  return apiFetch<AccountSearchPageResult>('/search/accounts', {
    method: 'POST',
    body: {
      keyword: params.keyword,
      cursor: params.cursor ?? 0,
      search_id: params.search_id ?? 0,
      sessionId: params.sessionId,
    },
  });
}

export async function getAccountsUnified(params: {
  sessionId?: string;
  keyword?: string;
}): Promise<AccountUnifiedResponse> {
  const searchParams = new URLSearchParams();
  if (params.sessionId) {
    searchParams.set('sessionId', params.sessionId);
  }
  if (params.keyword) {
    searchParams.set('keyword', params.keyword);
  }

  const query = searchParams.toString();
  return apiFetch<AccountUnifiedResponse>(`/search/accounts/unified${query ? `?${query}` : ''}`);
}

export async function getAccountSearchHistory(params?: {
  limit?: number;
}): Promise<AccountSearchHistoryItem[]> {
  const limit = Math.max(1, Math.min(params?.limit ?? 20, 100));
  const searchParams = new URLSearchParams();
  searchParams.set('limit', limit.toString());

  const query = searchParams.toString();
  const response = await apiFetch<{ data: AccountSearchHistoryItem[] }>(
    `/search/accounts/history${query ? `?${query}` : ''}`
  );
  return response.data ?? [];
}

export async function getAccountProfile(params: {
  sessionId?: string;
  uniqueId?: string;
  secUid?: string;
  uid?: string;
  refresh?: boolean;
}): Promise<AccountProfileResponse> {
  const searchParams = new URLSearchParams();
  if (params.sessionId) searchParams.set('sessionId', params.sessionId);
  if (params.uniqueId) searchParams.set('uniqueId', params.uniqueId);
  if (params.secUid) searchParams.set('secUid', params.secUid);
  if (params.uid) searchParams.set('uid', params.uid);
  if (typeof params.refresh === 'boolean') searchParams.set('refresh', String(params.refresh));

  const query = searchParams.toString();
  return apiFetch<AccountProfileResponse>(`/search/accounts/profile${query ? `?${query}` : ''}`);
}

export async function analyzePopularPostsForCreator(params: {
  secUid: string;
  count?: number;
  cursor?: number;
  limit?: number;
}): Promise<AnalyzePopularPostsResponse> {
  if (!params.secUid) {
    throw new Error('secUid is required to analyze popular posts');
  }

  const body: Record<string, unknown> = {
    sec_uid: params.secUid,
  };

  if (typeof params.count === 'number') body.count = params.count;
  if (typeof params.cursor === 'number') body.cursor = params.cursor;
  if (typeof params.limit === 'number') body.limit = params.limit;

  return apiFetch<AnalyzePopularPostsResponse>('/search/creators/popular-posts/analyze', {
    method: 'POST',
    body,
  });
}