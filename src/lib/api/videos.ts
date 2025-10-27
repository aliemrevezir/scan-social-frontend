import { apiFetch } from '@/lib/fetcher';
import type { VideoDetail } from '@/types/video';

export async function getVideoDetail(id: string, token?: string): Promise<VideoDetail> {
  return apiFetch<VideoDetail>(`/videos/${encodeURIComponent(id)}`, {
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });
}
