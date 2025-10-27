export type VideoStats = {
  playCount?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  collectCount?: number;
};

export type VideoSummary = {
  id?: string;
  tiktokVideoId?: string;
  canonicalUrl: string;
  thumbUrl?: string;
  caption?: string;
  createdAtEpoch?: number;
  author: {
    username?: string;
    secUid?: string | null;
    avatarUrl?: string | null;
  };
  stats: VideoStats;
};

export type VideoDetail = {
  id: string;
  tiktokVideoId?: string;
  canonicalUrl: string;
  caption?: string;
  createdAtEpoch?: number;
  author: {
    username?: string;
    secUid?: string | null;
    avatarUrl?: string | null;
  };
  stats: VideoStats;
  music?: {
    title?: string;
    authorName?: string;
  };
  rawJson?: unknown;
};
