import { apiFetch } from '@/lib/fetcher';
import type { InfluencerResearchRecord } from './search-accounts';

export type LabelInfluencerResponse = {
  ok: boolean;
  data?: InfluencerResearchRecord | null;
  error?: string;
};

export type LabelInfluencerRequestBody = {
  uniqueId?: string | null;
  secUid?: string | null;
  profile?: {
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    followerCount?: number | null;
    followingCount?: number | null;
    heartCount?: number | null;
    videoCount?: number | null;
  };
};

const sanitizePayload = (payload?: LabelInfluencerRequestBody) => {
  if (!payload) return undefined;

  const body: Record<string, unknown> = {};

  if (payload.uniqueId) {
    body.uniqueId = payload.uniqueId;
  }

  if (payload.secUid) {
    body.secUid = payload.secUid;
  }

  if (payload.profile) {
    const profile: Record<string, unknown> = {};

    if (payload.profile.displayName) profile.displayName = payload.profile.displayName;
    if (payload.profile.bio) profile.bio = payload.profile.bio;
    if (payload.profile.avatarUrl) profile.avatarUrl = payload.profile.avatarUrl;
    if (payload.profile.followerCount != null) profile.followerCount = payload.profile.followerCount;
    if (payload.profile.followingCount != null) profile.followingCount = payload.profile.followingCount;
    if (payload.profile.heartCount != null) profile.heartCount = payload.profile.heartCount;
    if (payload.profile.videoCount != null) profile.videoCount = payload.profile.videoCount;

    if (Object.keys(profile).length > 0) {
      body.profile = profile;
    }
  }

  return Object.keys(body).length > 0 ? body : undefined;
};

export async function labelInfluencerById(
  tiktokInfluencerId: string,
  payload?: LabelInfluencerRequestBody,
): Promise<LabelInfluencerResponse> {
  if (!tiktokInfluencerId) {
    throw new Error('TikTok influencer ID is required');
  }

  const body = sanitizePayload(payload);

  return apiFetch<LabelInfluencerResponse>(`/influencer-label/label/${encodeURIComponent(tiktokInfluencerId)}`, {
    method: 'POST',
    body,
  });
}
