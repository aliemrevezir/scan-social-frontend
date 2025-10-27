import { ApiError, apiFetch } from '@/lib/fetcher';
import type { UserType } from './auth';

export interface Kpis {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  engagementRate: number; // 0..1
}

export interface PerformancePoint {
  date: string; // ISO date
  views: number;
  likes: number;
  comments: number;
  engagement: number; // %
}

export interface CampaignSummary {
  id: string;
  slug: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  coverUrl?: string;
  kpis?: Partial<Kpis>;
}

export interface DashboardPayload {
  role: UserType;
  kpis: Kpis | null;
  performance: PerformancePoint[];
  campaigns: CampaignSummary[];
  isEmpty: boolean;
}

// Prefer fetcher utility which respects configured API base
export async function fetchDashboard(): Promise<DashboardPayload> {
  try {
    // Backend base usually points to `/api` already; pass versioned path only
    return await apiFetch<DashboardPayload>('/dashboard', { cache: 'no-store' as RequestCache });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      // Fallback to a safe empty payload so the UI can render even if the backend route is missing
      return {
        role: 'BRAND',
        kpis: null,
        performance: [],
        campaigns: [],
        isEmpty: true,
      };
    }
    throw err;      
  }
}

export async function createCampaign(payload: { name: string }): Promise<{ id: string }> {
  return apiFetch<{ id: string }>('/campaigns', {
    method: 'POST',
    body: payload,
  });
}